import skyline from './skyline.js';
import { DAYS, api, todayIndex } from './lib.js';
import { useApp } from './ctx.js';

function Me() {
  const { user } = useApp();
  const img = /^https:\/\//.test(user.image || '');
  const logout = async () => { await api('/api/signout', { method: 'POST' }); location.reload(); };
  return (
    <div className="me" id="me">
      {img ? <img className="avatar" src={user.image} alt="" referrerPolicy="no-referrer" /> : <span className="avatar">{user.name?.[0] || '?'}</span>}
      <span className="me-name">{user.name}</span>
      <button className="link" onClick={logout}>Salir</button>
    </div>
  );
}

function TripChip() {
  const { trip, setTrip, toast } = useApp();
  const ti = todayIndex(trip.start_date);
  let msg;
  if (!trip.start_date) msg = '📅 ¿Cuándo salimos?';
  else if (ti < 1) msg = <>⏳ Faltan <b>{1 - ti}</b> {1 - ti === 1 ? 'día' : 'días'}</>;
  else if (ti <= DAYS) msg = <>☀️ ¡Día <b>{ti}</b> de {DAYS}!</>;
  else msg = '💛 Saudade… viaje terminado';
  const save = async (e) => {
    try {
      setTrip(await api('/api/trip', { method: 'PUT', body: { start_date: e.target.value || null } }));
      toast('Fecha guardada para todos ✈');
    } catch (err) { toast(err.message); }
  };
  return (
    <div className="trip-chip" id="tripChip">
      <span>{msg}</span>
      <label className="date-pick" title="Fecha de salida">✈ <input type="date" id="startDate" key={trip.start_date || ''} defaultValue={trip.start_date || ''} onChange={save} aria-label="Fecha de salida" /></label>
    </div>
  );
}

export default function Hero() {
  const { phase } = useApp();
  return (
    <>
      <header className="hero" id="hero">
        <svg className="skyline" viewBox="0 0 1200 420" preserveAspectRatio="xMidYMax slice" aria-hidden="true" dangerouslySetInnerHTML={{ __html: skyline }} />
        {phase === 'app' && <Me />}
        <div className="hero-text">
          <h1>Rio</h1>
          {phase === 'app' && <TripChip />}
        </div>
      </header>
      <div className="calcadao" aria-hidden="true"></div>
    </>
  );
}
