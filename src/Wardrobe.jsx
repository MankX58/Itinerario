import { useEffect, useLayoutEffect, useRef } from 'react';
import { useFlip } from './flip.js';
import { GARMENTS, COLORS, PATTERNS, DESIGNS, SLOTS, SKINS, HAIRS, thumbSVG, figureSVG, garmentById, slotOf } from './wardrobe.js';
import { DAYS, dayDate, fmtDate } from './lib.js';
import { useApp } from './ctx.js';
import { DayStrip } from './Itinerary.jsx';

const DESIGN_SLOTS = ['top', 'swim'];
const PATTERN_SLOTS = ['top', 'bottom', 'full', 'swim', 'hat']; // calzado, gafas y extras solo cambian de color
const TORSO = '52 74 96 104'; // recorte del pecho para ver bien los diseños
const PANEL_LABEL = { pattern: '🌺 Estampado', design: '✍️ Diseño' };
const colorName = (c) => COLORS.find((x) => x[1] === c)?.[0] || 'Personalizado';
const chipName = (v) => (garmentById(v.g)?.name || '') + (v.t ? ` · “${v.t.slice(0, 14)}”` : '');
let lastSlot = null; // slot recién puesto: solo anima en el render que lo provoca

// las prendas se dibujan como cadenas SVG (wardrobe.js); `contents` evita un contenedor extra en el layout
export const Svg = ({ html }) => <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: html }} />;

// Al cambiar el look, el dibujo anterior se desvanece encima del nuevo (en vez de cambiar de golpe);
// el vaivén (.bob) sigue el reloj global para no reiniciarse en cada cambio.
function Mannequin({ html }) {
  const ref = useRef();
  const prev = useRef(null);
  useLayoutEffect(() => {
    const el = ref.current;
    const sync = (root) => root.querySelectorAll('.bob').forEach((b) => { b.style.animationDelay = `-${performance.now() % 4000}ms`; });
    sync(el);
    if (prev.current !== null && prev.current !== html) {
      const ghost = document.createElement('div');
      Object.assign(ghost.style, { position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none' });
      ghost.innerHTML = prev.current;
      sync(ghost);
      el.appendChild(ghost);
      ghost.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 350, easing: 'ease-out' }).onfinish = () => ghost.remove();
    }
    prev.current = html;
  }, [html]);
  return <div className="mannequin" ref={ref} dangerouslySetInnerHTML={{ __html: html }} />;
}

// el selector nativo dispara `change` al confirmar el color (React onChange dispararía al arrastrar)
function ColorInput({ onCommit, ...props }) {
  const ref = useRef();
  const cb = useRef(onCommit);
  cb.current = onCommit;
  useEffect(() => {
    const el = ref.current, h = (e) => cb.current(e.target.value);
    el.addEventListener('change', h);
    return () => el.removeEventListener('change', h);
  }, []);
  return <input type="color" ref={ref} {...props} />;
}

export default function Wardrobe() {
  const { trip, outfits, updateOutfits, saveOutfit, w, patchW, setModal } = useApp();
  const { wDay: d, wSlot, wGender, wColor, wPattern, wDesign, wText, wPrint, editSlot } = w;
  useEffect(() => { lastSlot = null; });
  const wornRef = useRef(), garmentsRef = useRef();
  useFlip(wornRef);
  useFlip(garmentsRef);

  const profile = { figure: 'm', skin: SKINS[1], hair: HAIRS[0], custom: [], ...(outfits[0] || {}) };
  const o = outfits[d] || {};

  // prenda con los ajustes actuales del editor (ww = ajustes ya modificados en este mismo evento)
  const itemFor = (g, ww = w) => {
    const it = { g: g.id, c: ww.wColor, p: ww.wPattern };
    if (g.pr && ww.wDesign !== 'none') Object.assign(it, { d: ww.wDesign, t: ww.wText.slice(0, 40) }, ww.wPrint ? { pc: ww.wPrint } : {});
    return it;
  };
  const setOutfit = (no, slot) => {
    lastSlot = slot;
    updateOutfits((s) => ({ ...s, [d]: no }));
    saveOutfit(d);
  };
  const setProfile = (patch) => {
    updateOutfits((s) => ({ ...s, 0: { ...profile, ...patch } }));
    saveOutfit(0);
  };
  const loadItem = (slot, day = d) => {
    const it = (outfits[day] || {})[slot];
    return it ? { editSlot: slot, wColor: it.c, wPattern: it.p || 'solid', wDesign: it.d || 'none', wText: it.t || '', wPrint: it.pc || '' } : { editSlot: null };
  };
  // cambia color/estampado/diseño de la prenda que se está editando
  const applyEdit = (patch) => {
    patchW(patch);
    const cur = editSlot && o[editSlot];
    if (cur) setOutfit({ ...o, [editSlot]: itemFor(garmentById(cur.g), { ...w, ...patch }) }, null);
  };

  const wear = (id) => {
    const g = garmentById(id), slot = slotOf(g);
    const no = { ...o };
    const it = itemFor(g);
    let edit;
    if (no[slot] && JSON.stringify(no[slot]) === JSON.stringify(it)) { delete no[slot]; edit = null; }
    else {
      no[slot] = it;
      if (slot === 'full') { delete no.top; delete no.bottom; }
      if (slot === 'top' || slot === 'bottom') delete no.full;
      edit = slot;
    }
    patchW({ editSlot: edit });
    setOutfit(no, slot);
    navigator.vibrate?.(8); // pequeño toque háptico en móviles Android
  };
  const randomOutfit = () => {
    const pick = (a) => a[Math.floor(Math.random() * a.length)];
    const ok = (g) => g.g === 'u' || g.g === profile.figure;
    const of = (slot) => GARMENTS.filter((g) => slotOf(g) === slot && ok(g) && g.slot !== 'swim');
    const item = (g) => {
      const it = { g: g.id, c: pick(COLORS)[1], p: Math.random() < 0.3 ? pick(PATTERNS)[0] : 'solid' };
      if (g.pr && Math.random() < 0.6) it.d = pick(DESIGNS.slice(1))[0];
      return it;
    };
    const no = {};
    if (profile.figure === 'f' && Math.random() < 0.4) no.full = item(pick(of('full')));
    else { no.top = item(pick(of('top'))); no.bottom = item(pick(of('bottom'))); }
    no.shoes = item(pick(of('shoes')));
    if (Math.random() < 0.5) no.hat = item(pick(of('hat')));
    if (Math.random() < 0.6) no.glasses = item(pick(of('glasses')));
    if (Math.random() < 0.3) no.extra = item(pick(of('extra')));
    patchW({ editSlot: null });
    setOutfit(no, 'top');
  };
  const pickSlot = (k) => patchW({ wSlot: k, ...(k !== 'swim' && k !== 'me' ? loadItem(k) : { editSlot: null }) });
  const editChip = (k) => {
    patchW({ ...loadItem(k), wSlot: garmentById(o[k].g).slot });
    setTimeout(() => document.querySelector('.editor')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
  };
  const unwear = (k) => {
    const no = { ...o };
    delete no[k];
    if (editSlot === k) patchW({ editSlot: null });
    setOutfit(no, null);
  };
  const addCustom = (kind, value) => {
    const c = value.toLowerCase();
    setProfile({ custom: [c, ...profile.custom.filter((x) => x !== c)].slice(0, 12) });
    applyEdit(kind === 'print' ? { wPrint: c } : { wColor: c });
  };

  const swatches = (key, current, { auto } = {}) => {
    const set = (c) => applyEdit(key === 'print' ? { wPrint: c } : { wColor: c });
    return (
      <>
        {auto && <button className={`sw auto ${!current ? 'on' : ''}`} onClick={() => set('')} title="Automático" aria-label="Color automático">A</button>}
        {COLORS.map(([n, c]) => <button key={c} className={`sw ${c === current ? 'on' : ''}`} style={{ '--c': c }} onClick={() => set(c)} title={n} aria-label={n}></button>)}
        {profile.custom.map((c) => <button key={'m' + c} className={`sw mine ${c === current ? 'on' : ''}`} style={{ '--c': c }} onClick={() => set(c)} title={`Mi color ${c}`} aria-label={`Mi color ${c}`}></button>)}
        <label className="sw add" title="Crear color personalizado" aria-label="Crear color personalizado"><ColorInput key={current || wColor} defaultValue={current || wColor} data-custom={key} onCommit={(v) => addCustom(key, v)} />＋</label>
      </>
    );
  };

  // ---- editor ----
  const edit = editSlot && o[editSlot];
  const panels = ['color', ...(PATTERN_SLOTS.includes(wSlot) ? ['pattern'] : []), ...(DESIGN_SLOTS.includes(wSlot) ? ['design'] : [])];
  const panel = panels.includes(w.wPanel) ? w.wPanel : 'color';
  // las muestras usan la prenda "base" que estás editando o llevando en esta categoría (no siempre una camiseta)
  const genderOk = (g) => wGender === 'all' || g.g === 'u' || g.g === wGender;
  const refG = garmentById((edit || o[wSlot])?.g);
  const sampleG = (needPr) => (refG && refG.slot === wSlot && (!needPr || refG.pr) ? refG : GARMENTS.find((g) => g.slot === wSlot && genderOk(g) && (!needPr || g.pr)))?.id || 'tee';
  const preview = { g: sampleG(true), c: wColor, p: wPattern };
  let body = null;
  if (panel === 'color') body = <><p className="mini-title">Color · {colorName(wColor)}</p><div className="colors">{swatches('color', wColor)}</div></>;
  if (panel === 'pattern') body = <div className={`patterns ${wSlot === 'hat' ? 'wide' : ''}`}>{PATTERNS.map(([k, n]) => <button key={k} className={k === wPattern ? 'on' : ''} onClick={() => applyEdit({ wPattern: k })} title={n}><Svg html={thumbSVG({ g: sampleG(false), c: wColor, p: k })} /><small>{n}</small></button>)}</div>;
  if (panel === 'design') body = (
    <>
      <div className="patterns designs">{DESIGNS.map(([k, n]) => <button key={k} className={k === wDesign ? 'on' : ''} onClick={() => applyEdit({ wDesign: k })} title={n}><Svg html={thumbSVG({ ...preview, d: k, t: wText, pc: wPrint }, TORSO)} /><small>{n}</small></button>)}</div>
      <label className="txt">Texto del estampado <small>(para distinguir camisetas parecidas)</small>
        <input id="printText" maxLength={40} value={wText} onChange={(e) => applyEdit({ wText: e.target.value })} placeholder="Ej: Gorillaz, Soho Champions…" /></label>
      <p className="mini-title">Color del estampado · {wPrint ? colorName(wPrint) : 'automático'}</p>
      <div className="colors small">{swatches('print', wPrint, { auto: true })}</div>
    </>
  );
  const editor = (
    <div className="editor">
      <p className="editing">{edit ? <>✏️ Editando <b>{chipName(edit)}</b>: los cambios se aplican al instante</> : ''}</p>
      {panels.length > 1 && (
        <div className="seg" role="tablist" style={{ gridTemplateColumns: `repeat(${panels.length}, 1fr)` }}>
          {panels.map((k) => <button key={k} className={panel === k ? 'on' : ''} onClick={() => patchW({ wPanel: k })}>{k === 'color' ? <><i style={{ '--c': wColor }}></i>Color</> : PANEL_LABEL[k]}</button>)}
        </div>
      )}
      <div className="panel-body" key={panel}>{body}</div>
    </div>
  );

  const me = (
    <div className="me-panel">
      <div className="prow"><span>Figura</span><button className={profile.figure !== 'f' ? 'on' : ''} onClick={() => { patchW({ wGender: 'm' }); setProfile({ figure: 'm' }); }}>🙋‍♂️ Él</button><button className={profile.figure === 'f' ? 'on' : ''} onClick={() => { patchW({ wGender: 'f' }); setProfile({ figure: 'f' }); }}>🙋‍♀️ Ella</button></div>
      <div className="prow"><span>Piel</span>{SKINS.map((s) => <button key={s} className={`sw ${profile.skin === s ? 'on' : ''}`} style={{ '--c': s }} onClick={() => setProfile({ skin: s })} aria-label="Tono de piel"></button>)}</div>
      <div className="prow"><span>Pelo</span>{HAIRS.map((s) => <button key={s} className={`sw ${profile.hair === s ? 'on' : ''}`} style={{ '--c': s }} onClick={() => setProfile({ hair: s })} aria-label="Color de pelo"></button>)}</div>
      <div className="prow"><span>Mis colores</span>{profile.custom.length ? profile.custom.map((c) => <span key={c} className="mycolor" style={{ '--c': c }}>{c}<button onClick={() => setProfile({ custom: profile.custom.filter((x) => x !== c) })} aria-label="Borrar color">✕</button></span>) : <em className="muted">Crea colores con el botón ＋ en la paleta.</em>}</div>
    </div>
  );

  const date = dayDate(trip.start_date, d);
  const worn = Object.entries(o).filter(([, v]) => v?.g);
  const garments = GARMENTS.filter((g) => g.slot === wSlot && (wGender === 'all' || g.g === 'u' || g.g === wGender));
  const pickDay = (day) => patchW({ wDay: day, editSlot: null });

  return (
    <>
      <DayStrip sel={d} onPick={pickDay} />
      <div className="wardrobe">
        <div className="stage" id="stage">
          <div className="stage-sky"><div className="stage-sun"></div></div>
          <div className="stage-title"><b>Look del día {d}</b><span>{date ? fmtDate(date, { weekday: 'long', day: 'numeric', month: 'short' }) : <em className="swipe-hint">Desliza para cambiar de día</em>}</span></div>
          <div className="stage-nav">
            <button onClick={() => pickDay(d - 1)} disabled={d === 1} aria-label="Día anterior">‹</button>
            <span>Día {d} de {DAYS}</span>
            <button onClick={() => pickDay(d + 1)} disabled={d === DAYS} aria-label="Día siguiente">›</button>
          </div>
          <Mannequin html={figureSVG(o, profile, { animate: lastSlot })} />
          <div className="worn" ref={wornRef}>{worn.length ? worn.map(([k, v]) => (
            <span key={k} data-flip={k} className={`chip ${k === editSlot ? 'edit' : ''}`} style={{ '--c': v.c }}><button className="chip-name" onClick={() => editChip(k)} title="Editar">{chipName(v)}</button><button onClick={() => unwear(k)} aria-label="Quitar">✕</button></span>
          )) : null}</div>
          <div className="stage-tools">
            <button className="btn ghost" onClick={randomOutfit}>🎲<span> Sorpréndeme</span></button>
            <button className="btn ghost" onClick={() => setModal({ type: 'copy' })}>📋<span> Copiar a…</span></button>
            <button className="btn ghost" onClick={() => { patchW({ editSlot: null }); setOutfit({}, null); }}>🧹<span> Limpiar</span></button>
          </div>
        </div>
        <div className="catalog">
          <div className="slots">{SLOTS.map(([k, label, em]) => <button key={k} className={k === wSlot ? 'on' : ''} onClick={() => pickSlot(k)}><span>{em}</span>{label}</button>)}</div>
          {wSlot === 'me' ? me : (
            <>
              {editor}
              <div className="grid-head"><p className="mini-title">{garments.length} modelos</p>
                <div className="gender">{[['all', 'Todo'], ['m', 'Él'], ['f', 'Ella']].map(([k, l]) => <button key={k} className={k === wGender ? 'on' : ''} onClick={() => patchW({ wGender: k })}>{l}</button>)}</div></div>
              <div className="garments" ref={garmentsRef}>{garments.map((g, i) => {
                const on = o[slotOf(g)]?.g === g.id;
                return <button key={g.id} data-flip={g.id} className={`garment ${on ? 'on' : ''}`} onClick={() => wear(g.id)} style={{ '--i': i }}><Svg html={thumbSVG(on ? o[slotOf(g)] : itemFor(g))} /><span>{g.name}</span></button>;
              })}</div>
            </>
          )}
        </div>
      </div>
      <div className="panel week"><h3>Mi maleta: looks de los 11 días</h3><div className="minis">{Array.from({ length: DAYS }, (_, i) => (
        <button key={i} className={`mini ${i + 1 === d ? 'on' : ''}`} onClick={() => pickDay(i + 1)}><Svg html={figureSVG(outfits[i + 1] || {}, profile)} /><span>Día {i + 1}</span></button>
      ))}</div></div>
    </>
  );
}
