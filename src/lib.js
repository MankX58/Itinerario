export const DAYS = 11;

export const CATS = {
  playa: { label: 'Playa', emoji: '🏖️', color: '#00b4d8' },
  comida: { label: 'Comida', emoji: '🍤', color: '#ff7b00' },
  cultura: { label: 'Cultura', emoji: '🏛️', color: '#9b5de5' },
  fiesta: { label: 'Fiesta', emoji: '🎉', color: '#f15bb5' },
  naturaleza: { label: 'Naturaleza', emoji: '🌿', color: '#2a9d4b' },
  traslado: { label: 'Traslado', emoji: '🚕', color: '#577590' },
  compras: { label: 'Compras', emoji: '🛍️', color: '#e0a800' },
  descanso: { label: 'Descanso', emoji: '😴', color: '#6c8ebf' },
};
export const DAY_THEMES = ['🌅', '🏖️', '🗿', '🚠', '🥥', '⚽', '🎶', '🌿', '🦜', '🍹', '💛'];
export const TIPS = [
  'En la playa la gente se ubica por <b>postos</b> (puestos de salvavidas numerados). "Nos vemos en el posto 9" es una cita clásica de Ipanema.',
  'El Cristo Redentor mide <b>30 m</b>, más 8 m de pedestal. Ve temprano: las nubes suelen taparlo a mediodía.',
  'El Pão de Açúcar tiene <b>396 m</b>. El teleférico hace dos tramos: primero al Morro da Urca y luego a la cima.',
  'El índice UV en Rio puede pasar de <b>11 (extremo)</b>. Protector cada 2 horas y agua de coco para hidratarse.',
  'Los domingos y feriados la avenida frente a la playa (la <b>Orla</b>) se cierra a los autos: ideal para bici o patines.',
  'La Escadaria Selarón tiene más de <b>200 escalones</b> cubiertos con azulejos de decenas de países.',
  'En la arena verás vendedores de <b>mate gelado</b> con limón y <b>biscoito Globo</b>: el combo carioca por excelencia.',
  'El aplauso al atardecer en la <b>Pedra do Arpoador</b> es tradición: la gente aplaude cuando el sol se esconde.',
  'Pide el <b>açaí na tigela</b> con granola y banana. Allá se come frío y espeso, casi como helado.',
  'En los bares, la cerveza se sirve <b>"estupidamente gelada"</b> y en vasos pequeños para que no se caliente.',
  'Último día: guarda un tiempo para una <b>caipirinha de despedida</b> y comprar unas Havaianas de recuerdo.',
];
export const PHRASES = [
  ['Tudo bem?', '¿Todo bien? (saludo universal)'], ['Bom dia!', '¡Buenos días!'], ['Quanto custa?', '¿Cuánto cuesta?'],
  ['Uma água de coco, por favor', 'Un agua de coco, por favor'], ['Onde fica a praia?', '¿Dónde queda la playa?'],
  ['A conta, por favor', 'La cuenta, por favor'], ['Saúde!', '¡Salud! (al brindar)'], ['Que legal!', '¡Qué chévere!'],
  ['Com licença', 'Con permiso / disculpe'], ['Valeu!', '¡Gracias! (informal carioca)'], ['Tchau, Rio! Até logo', '¡Chao, Rio! Hasta pronto'],
];

// ---------- api ----------
let signedIn = false;
export const setSignedIn = (v) => { signedIn = v; };
export async function api(path, { method = 'GET', body } = {}) {
  const r = await fetch(path, { method, headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined });
  const d = await r.json().catch(() => ({}));
  if (r.status === 401 && signedIn) location.reload();
  if (!r.ok) throw new Error(d.error || 'Algo salió mal');
  return d;
}

// ---------- tiempo ----------
export const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
export const fmtMin = (m) => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
export const fmtDur = (m) => (m < 60 ? `${m} min` : `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ''}`);
export function dayDate(start, day) {
  if (!start) return null;
  const d = new Date(start + 'T12:00:00');
  d.setDate(d.getDate() + day - 1);
  return d;
}
export const fmtDate = (d, opts = { weekday: 'short', day: 'numeric', month: 'short' }) => d.toLocaleDateString('es', opts);
export function todayIndex(start) {
  if (!start) return null;
  const s = new Date(start + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((now - s) / 864e5) + 1;
}
export const actsOf = (acts, day) => acts.filter((a) => a.day === day).sort((a, b) => a.time.localeCompare(b.time));

export function confetti(x, y) {
  const em = ['🎉', '🌴', '☀️', '🥥', '💛', '💚', '🦜'];
  for (let i = 0; i < 14; i++) {
    const s = document.createElement('span');
    s.className = 'confetti';
    s.textContent = em[i % em.length];
    s.style.left = x + 'px';
    s.style.top = y + 'px';
    s.style.setProperty('--dx', `${(Math.random() - 0.5) * 260}px`);
    s.style.setProperty('--dy', `${-80 - Math.random() * 160}px`);
    s.style.setProperty('--r', `${(Math.random() - 0.5) * 720}deg`);
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 1100);
  }
}
