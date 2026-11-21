import { useRef, useState } from 'react';
import { useFlip } from './flip.js';
import { CATS, DAYS, actsOf, api, confetti, dayDate, fmtDate, fmtDur, fmtMin, todayIndex, toMin } from './lib.js';
import { useApp } from './ctx.js';

export function Ring({ pct, size = 34 }) {
  const r = size / 2 - 3, c = 2 * Math.PI * r, h = size / 2;
  return (
    <svg className="ring" viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      <circle cx={h} cy={h} r={r} />
      <circle className="fg" cx={h} cy={h} r={r} strokeDasharray={`${c * pct} ${c}`} transform={`rotate(-90 ${h} ${h})`} />
    </svg>
  );
}

export function DayStrip({ sel, onPick }) {
  const { acts, trip } = useApp();
  const ti = todayIndex(trip.start_date);
  return (
    <div className="daystrip" role="tablist">
      {Array.from({ length: DAYS }, (_, i) => {
        const d = i + 1;
        const list = actsOf(acts, d);
        const done = list.filter((a) => a.done).length;
        const date = dayDate(trip.start_date, d);
        return (
          <button key={d} className={`postcard ${d === sel ? 'on' : ''} ${d === ti ? 'today' : ''}`} onClick={() => onPick(d)} style={{ '--i': d }} role="tab" aria-selected={d === sel}>
            <span className="pc-day">Día {d}</span>
            <span className="pc-date">{date ? fmtDate(date) : '—'}</span>
            <span className="pc-foot"><Ring pct={list.length ? done / list.length : 0} size={26} /><span>{list.length} {list.length === 1 ? 'plan' : 'planes'}</span></span>
          </button>
        );
      })}
    </div>
  );
}

function Activity({ a, i, clash, leaving, onEdit, onDelete, onDone }) {
  const c = CATS[a.category], en = toMin(a.time) + a.duration;
  return (
    <article data-flip={a.id} className={`act ${a.done ? 'done' : ''} ${leaving ? 'leaving' : ''}`} style={{ '--c': c.color, '--i': i }}>
      <div className="act-time"><b>{a.time}</b><small>{fmtMin(en)}</small></div>
      <div className="act-dot">{c.emoji}</div>
      <div className="act-card">
        <div className="act-top">
          <span className="cat">{c.label}</span>
          <div className="act-tools"><button onClick={onEdit} aria-label="Editar">✏️</button><button onClick={onDelete} aria-label="Eliminar">🗑️</button></div>
        </div>
        <h3>{a.title}</h3>
        {a.place && <a className="place" target="_blank" rel="noopener noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a.place + ', Rio de Janeiro')}`}>📍 {a.place}</a>}
        {a.notes && <p className="notes">{a.notes}</p>}
        <div className="dur"><div className="dur-bar"><i style={{ width: `${Math.min(100, (a.duration / 240) * 100)}%` }} /></div><span>{fmtDur(a.duration)}</span></div>
        {clash && <p className="clash">⚠️ Se cruza con “{clash.title}”</p>}
        <div className="act-foot">
          <label className="check"><input type="checkbox" checked={!!a.done} onChange={onDone} /><span className="box"></span></label>
          {a.created_by_name && <span className="by" title={`Agregado por ${a.created_by_name}`}>{a.created_by_name[0]}</span>}
        </div>
      </div>
    </article>
  );
}

export default function Itinerary() {
  const { acts, setActs, trip, day, pickDay, setModal, toast } = useApp();
  const [leaving, setLeaving] = useState(null);
  const timeline = useRef();
  useFlip(timeline);
  const d = day;
  const list = actsOf(acts, d);
  const date = dayDate(trip.start_date, d);
  const planned = list.reduce((s, a) => s + a.duration, 0);
  const done = list.filter((a) => a.done).length;

  const remove = async (a) => {
    if (!confirm(`¿Eliminar “${a.title}” para todos?`)) return;
    setLeaving(a.id);
    try {
      await api(`/api/activities/${a.id}`, { method: 'DELETE' });
      setTimeout(() => setActs((x) => x.filter((y) => y.id !== a.id)), 250);
    } catch (err) { setLeaving(null); toast(err.message); }
  };
  const toggle = async (a, e) => {
    const checked = e.target.checked;
    navigator.vibrate?.(checked ? [10, 30, 10] : 8);
    if (checked) { const r = e.target.getBoundingClientRect(); confetti(r.left + 10, r.top); }
    const patch = (v) => setActs((x) => x.map((y) => (y.id === a.id ? { ...y, ...v } : y)));
    patch({ done: checked });
    try { patch(await api(`/api/activities/${a.id}`, { method: 'PATCH', body: { done: checked } })); }
    catch (err) { patch({ done: !checked }); toast(err.message); }
  };

  const items = list.map((a, i) => {
    const st = toMin(a.time), en = st + a.duration;
    const clash = list.find((b) => b !== a && toMin(b.time) < en && toMin(b.time) + b.duration > st);
    return <Activity key={a.id} a={a} i={i} clash={clash} leaving={leaving === a.id} onEdit={() => setModal({ type: 'act', act: a })} onDelete={() => remove(a)} onDone={(e) => toggle(a, e)} />;
  });

  return (
    <>
      <DayStrip sel={d} onPick={pickDay} />
      <div className="day-head" key={`h${d}`}>
        <div>
          <p className="kicker">{date ? fmtDate(date, { weekday: 'long', day: 'numeric', month: 'long' }) : ''}</p>
          <div className="day-nav"><button className="arrow" onClick={() => pickDay(d - 1)} disabled={d === 1} aria-label="Día anterior">‹</button><h2>Día {d}</h2><button className="arrow" onClick={() => pickDay(d + 1)} disabled={d === DAYS} aria-label="Día siguiente">›</button></div>
          <p className="day-sum">{list.length ? <><b>{done}</b>/{list.length} · {fmtDur(planned)}</> : ''}</p>
        </div>
      </div>
      <div className="timeline" ref={timeline}>
        {list.length ? items : (
          <div className="empty"><div className="empty-art">🏝️</div><button className="btn" onClick={() => setModal({ type: 'act' })}>+ Agregar actividad</button></div>
        )}
      </div>
      <button className="fab" onClick={() => setModal({ type: 'act' })} aria-label="Agregar actividad"><span>+</span></button>
    </>
  );
}
