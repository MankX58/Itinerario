import { useApp } from './ctx.js';

export default function Auth() {
  const { authErr } = useApp();
  return (
    <main id="auth" className="auth">
      <div className="pass" id="authForm">
        <div className="pass-top">
          <span className="airline">✈ VOO SAUDADE</span>
          <span className="gate">PORTÃO 11</span>
        </div>
        <div className="route">
          <div><small>Desde</small><b>CASA</b></div>
          <svg viewBox="0 0 120 30" aria-hidden="true"><path d="M5 25 Q60 -10 115 25" fill="none" stroke="currentColor" strokeDasharray="4 5" strokeWidth="2" /><text x="52" y="14" fontSize="16">✈</text></svg>
          <div><small>Hacia</small><b>GIG</b></div>
        </div>
        <div className="pass-info">
          <div><small>Pasajero</small><b>Tú + la tripulación</b></div>
          <div><small>Duración</small><b>11 días</b></div>
          <div><small>Clase</small><b>Sol ☀️</b></div>
        </div>
        <p className="auth-err" id="authErr" role="alert">{authErr}</p>
        <div className="perforation"></div>
        <a className="btn-google" href="/api/google">
          <svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" /><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" /><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" /><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" /></svg>
          Embarcar con Google
        </a>
        <p className="pass-fine">Tu cuenta de Google es tu pasaje. El itinerario lo comparte toda la tripulación; tu ropa es solo tuya.</p>
        <div className="barcode" aria-hidden="true"></div>
      </div>
    </main>
  );
}
