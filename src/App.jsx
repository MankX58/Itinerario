import { useEffect, useRef, useState } from 'react';
import { Ctx } from './ctx.js';
import { DAYS, api, setSignedIn, todayIndex } from './lib.js';
import Hero from './Hero.jsx';
import Auth from './Auth.jsx';
import Itinerary from './Itinerary.jsx';
import Wardrobe from './Wardrobe.jsx';
import Panorama from './Panorama.jsx';
import Modals from './Modals.jsx';

const TABS = [['itin', '🗓️', 'Itinerario'], ['ropa', '👕', 'Mi ropa'], ['pano', '📊', 'Panorama']];
const W0 = { wDay: 1, wSlot: 'top', wGender: 'all', wColor: '#ffffff', wPattern: 'solid', wDesign: 'none', wText: '', wPrint: '', wPanel: 'color', editSlot: null };

export default function App() {
  const [phase, setPhase] = useState('loading'); // loading | auth | app
  const [authErr, setAuthErr] = useState('');
  const [user, setUser] = useState(null);
  const [trip, setTrip] = useState({ start_date: null });
  const [acts, setActs] = useState([]);
  const [outfits, setOutfits] = useState({});
  const [tab, setTab] = useState('itin');
  const [day, setDay] = useState(1);
  const [w, setW] = useState(W0);
  const [modal, setModal] = useState(null);
  const [toastState, setToastState] = useState({ msg: '', on: false });

  // refs: valores vigentes para timers y listeners que viven fuera del render
  const R = useRef({});
  R.current = { tab, day, wDay: w.wDay, acts, modal };
  const outfitsRef = useRef({});
  const saveTimers = useRef({});
  const toastTimer = useRef();
  const scrollPostcard = useRef(false);

  const toast = (msg) => {
    setToastState({ msg, on: true });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastState((t) => ({ ...t, on: false })), 2400);
  };
  const updateOutfits = (fn) => { outfitsRef.current = fn(outfitsRef.current); setOutfits(outfitsRef.current); };
  const saveOutfit = (d) => {
    clearTimeout(saveTimers.current[d]);
    saveTimers.current[d] = setTimeout(() => api(`/api/outfits/${d}`, { method: 'PUT', body: outfitsRef.current[d] || {} }).catch((e) => toast(e.message)), 500);
  };
  const patchW = (p) => setW((s) => ({ ...s, ...p }));
  const pickDay = (d) => { scrollPostcard.current = true; setDay(d); };
  const goDay = (d) => { setDay(d); setTab('itin'); };

  // arranque: sesión -> datos; si algo falla se muestra el pasaje de embarque
  useEffect(() => {
    (async () => {
      try {
        const { user } = await api('/api/me');
        setUser(user);
        setSignedIn(true);
        const [trip, acts, outs] = await Promise.all([api('/api/trip'), api('/api/activities'), api('/api/outfits')]);
        const ti = todayIndex(trip.start_date);
        setTrip(trip);
        setActs(acts);
        outfitsRef.current = outs;
        setOutfits(outs);
        if (ti >= 1 && ti <= DAYS) { setDay(ti); patchW({ wDay: ti }); }
        if (outs[0]?.figure === 'f') patchW({ wGender: 'f' });
        setPhase('app');
      } catch {
        if (new URLSearchParams(location.search).has('error')) {
          setAuthErr('No pudimos embarcarte con Google. Inténtalo de nuevo.');
          history.replaceState(null, '', '/');
        }
        setPhase('auth');
      }
    })();
  }, []);

  useEffect(() => { document.body.classList.toggle('logged', phase === 'app'); }, [phase]);

  // sondeo: actividades compartidas
  useEffect(() => {
    if (phase !== 'app') return;
    const id = setInterval(async () => {
      if (document.hidden || R.current.modal) return;
      try {
        const next = await api('/api/activities');
        const cur = R.current.acts.slice().sort((x, y) => x.day - y.day || x.time.localeCompare(y.time));
        if (JSON.stringify(next) !== JSON.stringify(cur)) setActs(next);
      } catch { /* sin conexión: reintenta en el próximo ciclo */ }
    }, 8000);
    return () => clearInterval(id);
  }, [phase]);

  // deslizar para cambiar de día (itinerario y probador)
  useEffect(() => {
    let touch = null;
    const start = (e) => {
      const zone = e.target.closest('.view-itin .day-head, .view-itin .timeline, .view-itin .empty, #stage');
      touch = zone ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null;
    };
    const end = (e) => {
      if (!touch) return;
      const dx = e.changedTouches[0].clientX - touch.x, dy = e.changedTouches[0].clientY - touch.y;
      touch = null;
      if (Math.abs(dx) < 60 || Math.abs(dy) > Math.abs(dx) * 0.6) return;
      const ropa = R.current.tab === 'ropa';
      const next = (ropa ? R.current.wDay : R.current.day) + (dx < 0 ? 1 : -1);
      if (next < 1 || next > DAYS) return;
      scrollPostcard.current = true;
      if (ropa) patchW({ wDay: next, editSlot: null });
      else { setDay(next); patchW({ editSlot: null }); }
    };
    document.addEventListener('touchstart', start, { passive: true });
    document.addEventListener('touchend', end, { passive: true });
    return () => { document.removeEventListener('touchstart', start); document.removeEventListener('touchend', end); };
  }, []);

  useEffect(() => {
    if (!scrollPostcard.current) return;
    scrollPostcard.current = false;
    document.querySelector('.postcard.on')?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  });

  const openTab = (t) => { setTab(t); window.scrollTo({ top: document.getElementById('app').offsetTop - 10, behavior: 'smooth' }); };

  const ctx = { phase, authErr, user, trip, setTrip, acts, setActs, outfits, updateOutfits, saveOutfit, tab, day, setDay, pickDay, goDay, w, patchW, modal, setModal, toast };
  return (
    <Ctx.Provider value={ctx}>
      <Hero />
      {phase === 'auth' && <Auth />}
      {phase === 'app' && (
        <main id="app">
          <nav className="tabs" id="tabs">
            {TABS.map(([k, em, label]) => <button key={k} data-tab={k} className={tab === k ? 'on' : ''} onClick={() => openTab(k)}><span>{em}</span> {label}</button>)}
          </nav>
          <section id="view" key={tab} className={'view-' + tab}>
            {tab === 'itin' ? <Itinerary /> : tab === 'ropa' ? <Wardrobe /> : <Panorama />}
          </section>
        </main>
      )}
      <Modals />
      <div className={'toast' + (toastState.on ? ' show' : '')} id="toast" role="status">{toastState.msg}</div>
    </Ctx.Provider>
  );
}
