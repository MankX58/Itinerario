// Función serverless de Vercel (vercel.json enruta /api/* hasta aquí) y middleware de `npm run dev`: misma lógica y rutas que el antiguo server.js.
import { neon } from '@neondatabase/serverless';

const DAYS = 11;
const CATEGORIES = ['playa', 'comida', 'cultura', 'fiesta', 'naturaleza', 'traslado', 'compras', 'descanso'];
const UPSTREAM_COOKIE = '__Secure-neon-auth.session_token';
const CHALLENGE_COOKIE = '__Secure-neon-auth.session_challenge';

let sql, AUTH, AUTH_ORIGIN, ready;
const init = () => (ready ??= (async () => {
  const { DATABASE_URL, NEON_AUTH_URL } = process.env;
  if (!DATABASE_URL || !NEON_AUTH_URL) throw new Error('Faltan DATABASE_URL o NEON_AUTH_URL');
  AUTH = NEON_AUTH_URL;
  AUTH_ORIGIN = new URL(NEON_AUTH_URL).origin;
  sql = neon(DATABASE_URL);
  await sql`CREATE TABLE IF NOT EXISTS activities (
    id serial PRIMARY KEY, day int NOT NULL CHECK (day BETWEEN 1 AND 11),
    time text NOT NULL, duration int NOT NULL, title text NOT NULL, place text DEFAULT '',
    category text NOT NULL, notes text DEFAULT '', done boolean DEFAULT false,
    created_by text, created_by_name text, updated_at timestamptz DEFAULT now())`;
  await sql`CREATE TABLE IF NOT EXISTS outfits (
    user_id text NOT NULL, day int NOT NULL, data jsonb NOT NULL, PRIMARY KEY (user_id, day))`;
  await sql`CREATE TABLE IF NOT EXISTS trip (id int PRIMARY KEY, start_date date)`;
})().catch((e) => { ready = undefined; throw e; }));

// --- auth: proxy a Neon Auth y guardamos el token como cookie propia (first-party) ---
const sessions = new Map(); // ponytail: caché en memoria 5 min por instancia; Neon Auth es la fuente de verdad
async function currentUser(req) {
  const sid = cookies(req).sid;
  if (!sid) return null;
  const hit = sessions.get(sid);
  if (hit && hit.exp > Date.now()) return hit.user;
  const r = await fetch(`${AUTH}/get-session`, {
    headers: { Cookie: `${UPSTREAM_COOKIE}=${sid}`, Origin: AUTH_ORIGIN },
  });
  const body = r.ok ? await r.json() : null;
  const user = body?.user ? { id: body.user.id, name: body.user.name, email: body.user.email, image: body.user.image } : null;
  sessions.set(sid, { user, exp: Date.now() + 5 * 60_000 });
  return user;
}

// Google OAuth: Neon Auth devuelve una cookie "challenge" que guardamos en nuestro dominio;
// al volver con ?neon_auth_session_verifier=… la canjeamos por la sesión.
const cookieValue = (r, name) => r.headers.getSetCookie().find((c) => c.startsWith(name + '='))?.split(';')[0].slice(name.length + 1);
const appOrigin = (req) => `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}`;
const redirect = (res, to, cookies = []) => { res.writeHead(302, { Location: to, 'Set-Cookie': cookies }).end(); };
const secure = (req) => (appOrigin(req).startsWith('https') ? '; Secure' : '');

async function startGoogle(req, res) {
  const r = await fetch(`${AUTH}/sign-in/social`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: appOrigin(req) },
    // el verifier vuelve a una ruta /api para que Vercel lo enrute a esta función (la raíz es estática)
    body: JSON.stringify({ provider: 'google', callbackURL: appOrigin(req) + '/api/google/callback' }),
  });
  const body = await r.json().catch(() => ({}));
  const chal = cookieValue(r, CHALLENGE_COOKIE);
  if (!r.ok || !body.url || !chal) return redirect(res, '/?error=google');
  redirect(res, body.url, [`chal=${chal}; HttpOnly; Path=/; SameSite=Lax; Max-Age=600${secure(req)}`]);
}

async function finishGoogle(req, res, verifier) {
  const chal = cookies(req).chal;
  const clear = 'chal=; Path=/; Max-Age=0';
  if (!chal) return redirect(res, '/?error=google', [clear]);
  const r = await fetch(`${AUTH}/get-session?neon_auth_session_verifier=${encodeURIComponent(verifier)}`, {
    headers: { Cookie: `${CHALLENGE_COOKIE}=${chal}`, Origin: appOrigin(req), 'User-Agent': req.headers['user-agent'] || '' },
  });
  const sid = r.ok && cookieValue(r, UPSTREAM_COOKIE);
  if (!sid) return redirect(res, '/?error=google', [clear]);
  redirect(res, '/', [clear, `sid=${sid}; HttpOnly; Path=/; SameSite=Lax; Max-Age=604800${secure(req)}`]);
}

// --- helpers ---
function cookies(req) {
  return Object.fromEntries((req.headers.cookie || '').split(';').filter(Boolean).map((c) => {
    const i = c.indexOf('=');
    return [c.slice(0, i).trim(), c.slice(i + 1).trim()];
  }));
}
function send(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}
async function readJson(req) {
  let b = req.body; // Vercel (y Vite dev no) ya puede traer el body parseado
  if (b === undefined) {
    let s = '';
    for await (const chunk of req) {
      s += chunk;
      if (s.length > 50_000) throw new Error('payload muy grande');
    }
    b = s ? JSON.parse(s) : {};
  } else if (typeof b === 'string') b = b ? JSON.parse(b) : {};
  b ??= {};
  if (JSON.stringify(b).length > 50_000) throw new Error('payload muy grande');
  return b;
}
const str = (v, max) => String(v ?? '').trim().slice(0, max);
function validActivity(b) {
  const a = {
    day: Number(b.day), time: str(b.time, 5), duration: Math.round(Number(b.duration)),
    title: str(b.title, 120), place: str(b.place, 120), category: str(b.category, 20), notes: str(b.notes, 500),
  };
  if (!(a.day >= 1 && a.day <= DAYS)) return null;
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(a.time)) return null;
  if (!(a.duration >= 5 && a.duration <= 1440)) return null;
  if (!a.title || !CATEGORIES.includes(a.category)) return null;
  return a;
}

// --- rutas ---
async function api(req, res, path) {
  const m = req.method;
  if (m === 'GET' && path === '/api/google') return startGoogle(req, res);
  if (m === 'POST' && path === '/api/signout') {
    sessions.delete(cookies(req).sid);
    res.setHeader('Set-Cookie', 'sid=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0');
    return send(res, 200, { ok: true });
  }

  const user = await currentUser(req);
  if (!user) return send(res, 401, { error: 'Inicia sesión' });
  if (m === 'GET' && path === '/api/me') return send(res, 200, { user });

  // compartido: viaje
  if (path === '/api/trip') {
    if (m === 'PUT') {
      const { start_date } = await readJson(req);
      if (start_date && !/^\d{4}-\d{2}-\d{2}$/.test(start_date)) return send(res, 400, { error: 'fecha inválida' });
      await sql`INSERT INTO trip (id, start_date) VALUES (1, ${start_date || null})
                ON CONFLICT (id) DO UPDATE SET start_date = EXCLUDED.start_date`;
    }
    const [row] = await sql`SELECT to_char(start_date, 'YYYY-MM-DD') AS start_date FROM trip WHERE id = 1`;
    return send(res, 200, { start_date: row?.start_date || null });
  }

  // compartido: actividades
  if (path === '/api/activities' && m === 'GET') {
    return send(res, 200, await sql`SELECT * FROM activities ORDER BY day, time`);
  }
  if (path === '/api/activities' && m === 'POST') {
    const a = validActivity(await readJson(req));
    if (!a) return send(res, 400, { error: 'Datos inválidos' });
    const [row] = await sql`INSERT INTO activities (day, time, duration, title, place, category, notes, created_by, created_by_name)
      VALUES (${a.day}, ${a.time}, ${a.duration}, ${a.title}, ${a.place}, ${a.category}, ${a.notes}, ${user.id}, ${user.name})
      RETURNING *`;
    return send(res, 201, row);
  }
  const am = path.match(/^\/api\/activities\/(\d+)$/);
  if (am && m === 'PATCH') {
    const b = await readJson(req);
    const id = Number(am[1]);
    if ('done' in b && Object.keys(b).length === 1) {
      const [row] = await sql`UPDATE activities SET done = ${!!b.done}, updated_at = now() WHERE id = ${id} RETURNING *`;
      return row ? send(res, 200, row) : send(res, 404, { error: 'No existe' });
    }
    const a = validActivity(b);
    if (!a) return send(res, 400, { error: 'Datos inválidos' });
    const [row] = await sql`UPDATE activities SET day=${a.day}, time=${a.time}, duration=${a.duration}, title=${a.title},
      place=${a.place}, category=${a.category}, notes=${a.notes}, updated_at=now() WHERE id=${id} RETURNING *`;
    return row ? send(res, 200, row) : send(res, 404, { error: 'No existe' });
  }
  if (am && m === 'DELETE') {
    await sql`DELETE FROM activities WHERE id = ${Number(am[1])}`;
    return send(res, 200, { ok: true });
  }

  // por usuario: ropa (day 0 = perfil del maniquí)
  if (path === '/api/outfits' && m === 'GET') {
    const rows = await sql`SELECT day, data FROM outfits WHERE user_id = ${user.id}`;
    return send(res, 200, Object.fromEntries(rows.map((r) => [r.day, r.data])));
  }
  const om = path.match(/^\/api\/outfits\/(\d+)$/);
  if (om && m === 'PUT') {
    const day = Number(om[1]);
    if (!(day >= 0 && day <= DAYS)) return send(res, 400, { error: 'día inválido' });
    const data = await readJson(req);
    if (typeof data !== 'object' || JSON.stringify(data).length > 8000) return send(res, 400, { error: 'datos inválidos' });
    await sql`INSERT INTO outfits (user_id, day, data) VALUES (${user.id}, ${day}, ${JSON.stringify(data)}::jsonb)
              ON CONFLICT (user_id, day) DO UPDATE SET data = EXCLUDED.data`;
    return send(res, 200, { ok: true });
  }
  send(res, 404, { error: 'No encontrado' });
}

export default async function handler(req, res) {
  const url = new URL(req.url, 'http://x');
  try {
    await init();
    const verifier = url.searchParams.get('neon_auth_session_verifier');
    if (verifier) await finishGoogle(req, res, verifier);
    else await api(req, res, url.searchParams.has('__p') ? '/api/' + url.searchParams.get('__p') : url.pathname); // __p: ruta original tras el rewrite de vercel.json
  } catch (e) {
    console.error(e);
    // la falta de variables de entorno se dice claramente; el resto de errores solo va al log de Vercel
    if (!res.headersSent) send(res, 500, { error: e.message?.startsWith('Faltan') ? e.message : 'Error del servidor' });
  }
}
