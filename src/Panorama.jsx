import { CATS, DAYS, DAY_THEMES, actsOf, fmtDur } from './lib.js';
import { useApp } from './ctx.js';
import { Ring } from './Itinerary.jsx';

export default function Panorama() {
  const { acts, goDay } = useApp();
  const total = acts.length;
  const mins = acts.reduce((s, a) => s + a.duration, 0);
  const done = acts.filter((a) => a.done).length;
  const keys = Object.keys(CATS);
  const byCat = keys.map((k) => [k, acts.filter((a) => a.category === k).reduce((s, a) => s + a.duration, 0)]);
  const maxCat = Math.max(1, ...byCat.map((x) => x[1]));
  const perDay = Array.from({ length: DAYS }, (_, i) => actsOf(acts, i + 1));
  const maxDay = Math.max(60, ...perDay.map((l) => l.reduce((s, a) => s + a.duration, 0)));
  return (
    <div className="pano">
      <div className="stats">
        <div className="stat" style={{ '--c': '#00b4d8' }}><b>{total}</b><span>planes en total</span></div>
        <div className="stat" style={{ '--c': '#ff7b00' }}><b>{Math.round(mins / 60)}<small>h</small></b><span>de aventuras planeadas</span></div>
        <div className="stat" style={{ '--c': '#2a9d4b' }}><b>{total ? Math.round((done / total) * 100) : 0}<small>%</small></b><span>ya vividos</span><Ring pct={total ? done / total : 0} size={44} /></div>
        <div className="stat" style={{ '--c': '#f15bb5' }}><b>{perDay.filter((l) => !l.length).length}</b><span>días aún en blanco</span></div>
      </div>
      <div className="panel"><h3>¿Cómo se reparte el viaje?</h3>
        <div className="cols">
          {perDay.map((list, i) => (
            <button key={i} className="col" onClick={() => goDay(i + 1)} title={`Ver día ${i + 1}`}>
              <div className="stack">
                {keys.map((k) => {
                  const m = list.filter((a) => a.category === k).reduce((s, a) => s + a.duration, 0);
                  return m ? <i key={k} style={{ height: `${(m / maxDay) * 100}%`, background: CATS[k].color }} title={`${CATS[k].label}: ${fmtDur(m)}`} /> : null;
                })}
              </div>
              <span>D{i + 1}</span><small>{DAY_THEMES[i]}</small>
            </button>
          ))}
        </div>
        <div className="legend">{Object.values(CATS).map((c) => <span key={c.label}><i style={{ background: c.color }}></i>{c.emoji} {c.label}</span>)}</div>
      </div>
      <div className="panel"><h3>Nuestro estilo de viaje</h3>
        {byCat.map(([k, m]) => (
          <div className="hbar" key={k}><span>{CATS[k].emoji} {CATS[k].label}</span><div><i style={{ width: `${(m / maxCat) * 100}%`, background: CATS[k].color }}></i></div><b>{m ? fmtDur(m) : '—'}</b></div>
        ))}
      </div>
    </div>
  );
}
