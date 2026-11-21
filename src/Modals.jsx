import { useEffect, useRef, useState } from 'react';
import { CATS, DAYS, api, dayDate, fmtDate, fmtDur, fmtMin, toMin } from './lib.js';
import { useApp } from './ctx.js';

function ActivityForm({ act }) {
  const { day, trip, setActs, setDay, setModal, toast } = useApp();
  const isNew = !act;
  const a = act || { day, time: '09:00', duration: 90, title: '', place: '', category: 'playa', notes: '' };
  const [dur, setDur] = useState(a.duration);
  const [time, setTime] = useState(a.time);

  const submit = async (e) => {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const row = await api(isNew ? '/api/activities' : `/api/activities/${a.id}`, { method: isNew ? 'POST' : 'PATCH', body });
      setActs((x) => x.filter((y) => y.id !== row.id).concat(row));
      setDay(row.day);
      setModal(null);
      toast(isNew ? '¡Plan agregado para todos! 🎉' : 'Cambios guardados');
    } catch (err) { toast(err.message); }
  };

  return (
    <form className="sheet" id="actForm" method="dialog" onSubmit={submit}>
      <div className="sheet-head"><h2>{isNew ? 'Nueva aventura' : 'Editar plan'}</h2><button type="button" className="x" onClick={() => setModal(null)} aria-label="Cerrar">✕</button></div>
      <label>¿Qué vamos a hacer?<input name="title" required maxLength={120} defaultValue={a.title} placeholder="Ej: Subir al Pão de Açúcar" /></label>
      <fieldset className="cats"><legend>Tipo de plan</legend>{Object.entries(CATS).map(([k, c]) => (
        <label key={k} style={{ '--c': c.color }}><input type="radio" name="category" value={k} defaultChecked={a.category === k} /><span>{c.emoji}<small>{c.label}</small></span></label>
      ))}</fieldset>
      <div className="row">
        <label>Día<select name="day" defaultValue={a.day}>{Array.from({ length: DAYS }, (_, i) => {
          const dt = dayDate(trip.start_date, i + 1);
          return <option key={i} value={i + 1}>Día {i + 1}{dt ? ' · ' + fmtDate(dt) : ''}</option>;
        })}</select></label>
        <label>Hora<input type="time" name="time" required value={time} onChange={(e) => setTime(e.target.value)} /></label>
      </div>
      <label>Duración aproximada: <b id="durLbl">{fmtDur(dur)}</b>
        <input type="range" name="duration" min="15" max="720" step="15" value={dur} onChange={(e) => setDur(Number(e.target.value))} style={{ '--p': `${((dur - 15) / (720 - 15)) * 100}%` }} />
      </label>
      <div className="quick">{[30, 60, 90, 120, 180, 240, 360].map((m) => <button type="button" key={m} onClick={() => setDur(m)}>{fmtDur(m)}</button>)}</div>
      <p className="ends" id="endsLbl">{time ? <>Termina cerca de las <b>{fmtMin(toMin(time) + dur)}</b></> : ''}</p>
      <label>Lugar (opcional)<input name="place" maxLength={120} defaultValue={a.place} placeholder="Ej: Praia de Ipanema, posto 9" /></label>
      <label>Notas (opcional)<textarea name="notes" maxLength={500} rows={2} defaultValue={a.notes} placeholder="Llevar efectivo, reservar antes…" /></label>
      <button className="btn big" type="submit">{isNew ? 'Agregar al itinerario 🌴' : 'Guardar cambios'}</button>
    </form>
  );
}

function CopySheet() {
  const { w, outfits, updateOutfits, saveOutfit, setModal } = useApp();
  const [copied, setCopied] = useState({});
  const copy = (to) => {
    updateOutfits((s) => ({ ...s, [to]: structuredClone(s[w.wDay] || {}) }));
    saveOutfit(to);
    setCopied((c) => ({ ...c, [to]: true }));
  };
  return (
    <div className="sheet small">
      <div className="sheet-head"><h2>Copiar look del día {w.wDay}</h2><button className="x" onClick={() => setModal(null)} aria-label="Cerrar">✕</button></div>
      <p className="hint">Elige a qué días copiarlo:</p>
      <div className="copy-days">{Array.from({ length: DAYS }, (_, i) => i + 1).filter((d) => d !== w.wDay).map((d) => (
        <button key={d} className={copied[d] ? 'on' : ''} onClick={() => copy(d)}>Día {d}{copied[d] ? ' ✓' : ''}</button>
      ))}</div>
    </div>
  );
}

export default function Modals() {
  const { modal, setModal } = useApp();
  const ref = useRef();
  const [shown, setShown] = useState(null); // mantiene el contenido mientras la hoja se desliza al cerrar
  useEffect(() => {
    const dlg = ref.current;
    if (modal) {
      setShown(modal);
      dlg.getAnimations().forEach((a) => a.cancel());
      if (!dlg.open) { dlg.showModal(); dlg.querySelector('[name=title]')?.focus(); }
    } else if (dlg.open) {
      const from = getComputedStyle(dlg).transform; // continúa desde donde lo soltó el dedo
      dlg.animate([{ opacity: 1, transform: from }, { opacity: 0, transform: 'translateY(40px) scale(.96)' }], { duration: 250, easing: 'ease-in' })
        .onfinish = () => { dlg.style.transform = ''; dlg.close(); setShown(null); };
    }
  }, [modal]);
  const m = modal ?? shown;

  // móvil: arrastrar la hoja hacia abajo desde su cabecera para cerrarla
  const drag = useRef(null);
  const onTouchStart = (e) => {
    const t = e.touches[0], dlg = ref.current;
    drag.current = matchMedia('(max-width: 640px)').matches && t.clientY - dlg.getBoundingClientRect().top < 72 ? { y: t.clientY, dy: 0 } : null;
  };
  const onTouchMove = (e) => {
    const d = drag.current;
    if (!d) return;
    d.dy = Math.max(0, e.touches[0].clientY - d.y);
    ref.current.style.transition = 'none';
    ref.current.style.transform = `translateY(${d.dy}px)`;
  };
  const onTouchEnd = () => {
    const d = drag.current, dlg = ref.current;
    drag.current = null;
    if (!d || !d.dy) return;
    dlg.style.transition = '';
    if (d.dy > 110) return setModal(null);
    dlg.style.transition = 'transform .4s cubic-bezier(.34,1.56,.64,1)';
    dlg.style.transform = '';
    setTimeout(() => { dlg.style.transition = ''; }, 450);
  };
  return (
    <dialog id="modal" ref={ref} onCancel={(e) => { e.preventDefault(); setModal(null); }} onClose={() => setModal(null)} onClick={(e) => e.target === ref.current && setModal(null)} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      {m?.type === 'act' && <ActivityForm key={m.act?.id ?? 'new'} act={m.act} />}
      {m?.type === 'copy' && <CopySheet />}
    </dialog>
  );
}
