import { useRef, useState } from 'react';
import { useFlip } from './flip.js';
import { CATS, DAYS, DAY_THEMES, PHRASES, TIPS, actsOf, api, confetti, dayDate, fmtDate, fmtDur, fmtMin, todayIndex, toMin } from './lib.js';
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
            <span className="pc-stamp">{DAY_THEMES[i]}</span>
            <span className="pc-day">Día {d}</span>
            <span className="pc-date">{date ? fmtDate(date) : '—'}</span>
            <span className="pc-foot"><Ring pct={list.length ? done / list.length : 0} size={26} /><span>{list.length} {list.length === 1 ? 'plan' : 'planes'}</span></span>
          </button>
        );
      })}
    </div>
  );
}

function Phrase({ pt, es }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <button className={`phrase ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped(!flipped)} aria-label="Frase del día, toca para traducir">
      <span className="ph-front"><small>🇧🇷 Frase do dia</small><b>{pt}</b><em>toca para traducir</em></span>
      <span className="ph-back"><small>🇪🇸 Significa</small><b>{es}</b></span>
    </button>
  );
}

function Ribbon({ list, isToday }) {
  const S = 6 * 60, E = 24 * 60, span = E - S;
  const ticks = [];
  for (let h = 6; h <= 24; h += 3) ticks.push(<span key={h} style={{ left: `${((h * 60 - S) / span) * 100}%` }}>{h}h</span>);
  let now = null;
  if (isToday) {
    const n = new Date(), m = n.getHours() * 60 + n.getMinutes();
    if (m >= S) now = <div className="now" style={{ left: `${((m - S) / span) * 100}%` }}><span>ahora</span></div>;
  }
  return (
    <div className="ribbon-wrap">
      <p className="mini-title">Mapa del día · de 6h a medianoche</p>
      <div className="ribbon">
        {list.map((a) => {
          const st = Math.max(S, toMin(a.time)), en = Math.min(E, toMin(a.time) + a.duration);
          if (en <= S) return null;
          const c = CATS[a.category];
          return <div key={a.id} className={`rb ${a.done ? 'done' : ''}`} style={{ left: `${((st - S) / span) * 100}%`, width: `${Math.max(1.2, ((en - st) / span) * 100)}%`, '--c': c.color }} title={`${a.title} · ${a.time}`}>{c.emoji}</div>;
        })}
        {now}
      </div>
      <div className="ticks">{ticks}</div>
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
          <label className="check"><input type="checkbox" checked={!!a.done} onChange={onDone} /><span className="box"></span><span>{a.done ? '¡Hecho!' : 'Marcar hecho'}</span></label>
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
  const [pt, es] = PHRASES[d - 1];
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
    if (checked) { const r = e.target.getBoundingClientRect(); confetti(r.left + 10, r.top); }
    const patch = (v) => setActs((x) => x.map((y) => (y.id === a.id ? { ...y, ...v } : y)));
    patch({ done: checked });
    try { patch(await api(`/api/activities/${a.id}`, { method: 'PATCH', body: { done: checked } })); }
    catch (err) { patch({ done: !checked }); toast(err.message); }
  };

  let prevEnd = null;
  const items = [];
  list.forEach((a, i) => {
    const st = toMin(a.time), en = st + a.duration;
    if (prevEnd !== null && st - prevEnd >= 30) items.push(<div key={`gap${a.id}`} data-flip={`gap${a.id}`} className="gap">⏳ {fmtDur(st - prevEnd)} libres · ¿un açaí?</div>);
    const clash = list.find((b) => b !== a && toMin(b.time) < en && toMin(b.time) + b.duration > st);
    items.push(<Activity key={a.id} a={a} i={i} clash={clash} leaving={leaving === a.id} onEdit={() => setModal({ type: 'act', act: a })} onDelete={() => remove(a)} onDone={(e) => toggle(a, e)} />);
    prevEnd = Math.max(prevEnd ?? 0, en);
  });

  return (
    <>
      <DayStrip sel={d} onPick={pickDay} />
      <div className="day-head" key={`h${d}`}>
        <div>
          <p className="kicker">{DAY_THEMES[d - 1]} {date ? fmtDate(date, { weekday: 'long', day: 'numeric', month: 'long' }) : 'Elige la fecha de salida arriba'}</p>
          <div className="day-nav"><button className="arrow" onClick={() => pickDay(d - 1)} disabled={d === 1} aria-label="Día anterior">‹</button><h2>Día {d}</h2><button className="arrow" onClick={() => pickDay(d + 1)} disabled={d === DAYS} aria-label="Día siguiente">›</button></div>
          <p className="day-sum">{list.length ? <><b>{list.length}</b> planes · <b>{fmtDur(planned)}</b> planeadas · <b>{done}</b> hechos</> : 'Día en blanco, ¡a soñar!'}</p>
        </div>
        <div className="cards-side">
          <div className="tip"><b>💡 Dica carioca</b><p dangerouslySetInnerHTML={{ __html: TIPS[d - 1] }} /></div>
          <Phrase key={d} pt={pt} es={es} />
        </div>
      </div>
      <Ribbon key={`r${d}`} list={list} isToday={todayIndex(trip.start_date) === d} />
      <div className="timeline" ref={timeline}>
        {list.length ? items : (
          <div className="empty"><div className="empty-art">🏝️</div><h3>Nada planeado todavía</h3><p>Un día libre en Rio también es plan, pero si quieres, agrega la primera actividad.</p><button className="btn" onClick={() => setModal({ type: 'act' })}>+ Agregar actividad</button></div>
        )}
      </div>
      <button className="fab" onClick={() => setModal({ type: 'act' })} aria-label="Agregar actividad"><span>+</span></button>
    </>
  );
}
