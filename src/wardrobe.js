// Biblioteca de ropa dibujada en SVG. Prenda = forma × color × estampado × diseño gráfico.
// Cuerpo (viewBox 200×420): hombros 66/134 en y86, brazos bajan hasta y216, cadera 62/138 en y226, pies en y394.

export const COLORS = [
  ['Blanco', '#ffffff'], ['Blanco roto', '#f7f3ea'], ['Hueso', '#ece4d4'], ['Crema', '#fff1cc'],
  ['Beige', '#d8c3a5'], ['Arena', '#c8ad85'], ['Amarillo Brasil', '#ffd60a'], ['Mango', '#ffa62b'],
  ['Coral', '#ff6f61'], ['Rojo samba', '#e63946'], ['Vino', '#7b2d3b'], ['Rosa chicle', '#ff8fab'],
  ['Fucsia', '#e5007e'], ['Lila', '#b79ced'], ['Morado', '#6a4c93'], ['Azul cielo', '#8ecae6'],
  ['Turquesa', '#2ec4b6'], ['Azul mar', '#0077b6'], ['Marino', '#14213d'], ['Jean claro', '#9fbad8'],
  ['Jean medio', '#5b7fae'], ['Jean oscuro', '#2b3f63'], ['Jean negro', '#33343a'], ['Verde mata', '#2d6a4f'],
  ['Verde lima', '#a7c957'], ['Menta', '#b7e4c7'], ['Oliva', '#6b705c'], ['Terracota', '#c4663b'],
  ['Café', '#6f4e37'], ['Gris claro', '#d3d6da'], ['Gris', '#9aa1a8'], ['Carbón', '#343a40'], ['Negro', '#151515'],
];

export const PATTERNS = [
  ['solid', 'Liso'], ['stripes', 'Rayas'], ['vstripes', 'Rayas verticales'], ['dots', 'Lunares'],
  ['gingham', 'Cuadros vichy'], ['flowers', 'Flores'], ['leaves', 'Hojas tropicales'],
  ['waves', 'Ondas Copacabana'], ['zigzag', 'Zigzag'], ['tiedye', 'Tie-dye'], ['faded', 'Desgastado'],
];

// Diseños gráficos (sólo camisetas): ayudan a distinguir dos camisetas blancas parecidas.
export const DESIGNS = [
  ['none', 'Sin diseño'], ['chest', 'Logo en el pecho'], ['center', 'Texto al centro'], ['big', 'Gráfico grande'],
  ['text', 'Frase en bloque'], ['script', 'Firma cursiva'], ['pocket', 'Bolsillo'], ['band', 'Franja'],
  ['skull', 'Calavera'], ['smile', 'Carita feliz'], ['sun', 'Sol'], ['palm', 'Palmera'],
  ['number', 'Número deportivo'], ['flames', 'Llamas'], ['stars', 'Estrellas'],
];

export const SLOTS = [
  ['top', 'Arriba', '👕'], ['bottom', 'Abajo', '🩳'], ['full', 'Vestidos', '👗'],
  ['swim', 'Playa', '👙'], ['shoes', 'Calzado', '👟'], ['hat', 'Sombreros', '🧢'],
  ['glasses', 'Gafas', '🕶️'], ['extra', 'Extras', '👜'], ['me', 'Mi muñeco', '🧍'],
];

export const SKINS = ['#fbdcc8', '#eebb99', '#d9a173', '#b97c50', '#8d5a36', '#5c3a21'];
export const HAIR_STYLES = [
  ['curly', 'Rizos con volumen'], ['curlyfade', 'Rizos con degradado'], ['curlylong', 'Rizos largos'],
  ['short', 'Corto'], ['buzz', 'Rapado'], ['long', 'Largo liso'], ['bun', 'Moño'],
];
export const HAIRS = ['#1b1035', '#4a2c1a', '#8b5a2b', '#d4a24c', '#b33a1e', '#9aa0a6', '#f6dcb0', '#f8d995', '#ffddb7'];

export const INK = '#4a1d3d'; // contorno ciruela de todo el dibujo
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const lum = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
};
export const shade = (hex, k) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => Math.max(0, Math.min(255, Math.round(v * k)));
  return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => f(v).toString(16).padStart(2, '0')).join('');
};
export const autoPrint = (c) => (lum(c) > 0.62 ? '#1b1035' : '#ffffff');
export const mix = (a, b, t) => {
  const p = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const [x, y] = [p(a), p(b)];
  return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('');
};
const ribOf = (c) => (lum(c) > 0.6 ? mix(c, '#8f8f9c', 0.55) : mix(c, '#ffffff', 0.32));
const accentOf = (c) => (lum(c) > 0.62 ? ['#1b1035', 0.45] : ['#ffffff', 0.6]);

function patternDef(id, kind, c) {
  const [a, op] = accentOf(c);
  const A = `fill="${a}" fill-opacity="${op}"`;
  const S = `stroke="${a}" stroke-opacity="${op}"`;
  const P = (w, h, body, extra = '') =>
    `<pattern id="${id}" width="${w}" height="${h}" patternUnits="userSpaceOnUse" ${extra}><rect width="${w}" height="${h}" fill="${c}"/>${body}</pattern>`;
  const petals = `${[0, 72, 144, 216, 288].map((r) => `<ellipse cx="8" cy="4" rx="2.6" ry="4" transform="rotate(${r} 8 8)"/>`).join('')}`;
  switch (kind) {
    case 'stripes': return P(10, 10, `<rect width="10" height="4" ${A}/>`);
    case 'vstripes': return P(10, 10, `<rect width="3.5" height="10" ${A}/>`);
    case 'dots': return P(12, 12, `<circle cx="3" cy="3" r="2.2" ${A}/><circle cx="9" cy="9" r="2.2" ${A}/>`);
    case 'gingham': return P(12, 12, `<rect width="6" height="12" ${A} fill-opacity="${op * 0.55}"/><rect width="12" height="6" ${A} fill-opacity="${op * 0.55}"/>`);
    case 'flowers': return P(26, 26, `<g ${A}>${petals}</g><circle cx="8" cy="8" r="2" fill="#ffd60a"/><g ${A} transform="translate(13 13) scale(.7)">${petals}</g>`);
    case 'leaves': return P(32, 32, `<g ${A}><path d="M4 26 Q4 8 20 4 Q18 20 4 26Z"/><path d="M20 30 Q24 18 32 16 Q30 28 20 30Z"/></g><path d="M4 26 L18 6" ${S} stroke-width="1" fill="none"/>`, 'patternTransform="rotate(12)"');
    case 'waves': return P(20, 10, `<path d="M0 6 Q5 0 10 6 T20 6" fill="none" ${S} stroke-width="2.6"/>`);
    case 'zigzag': return P(12, 10, `<path d="M0 8 L6 2 L12 8" fill="none" ${S} stroke-width="2.4"/>`);
    case 'tiedye': return P(34, 34, `<g fill="none" ${S} stroke-width="3"><circle cx="17" cy="17" r="5"/><circle cx="17" cy="17" r="11" stroke-opacity="${op * 0.7}"/><circle cx="17" cy="17" r="16" stroke-opacity="${op * 0.4}"/></g>`);
    case 'faded': return P(40, 60,
      `<g stroke="#fff" stroke-linecap="round" fill="none"><path d="M6 10 Q14 6 22 9" stroke-opacity=".35" stroke-width="2"/><path d="M8 16 Q16 13 24 15" stroke-opacity=".25" stroke-width="1.6"/><path d="M24 40 L30 44 M10 48 L18 47" stroke-opacity=".45" stroke-width="1.2"/></g><rect x="0" y="22" width="40" height="14" fill="#fff" fill-opacity=".12"/>`);
    default: return '';
  }
}

// ---------- geometría ----------
// sym(): dibuja la mitad izquierda (desde el centro arriba hasta el centro abajo) y la refleja.
function sym(start, rawSegs) {
  const segs = rawSegs.map((s) => (s[0] === 'Q' ? s.slice(1) : s)); // ['Q',cx,cy,x,y] → curva
  let d = `M${start[0]} ${start[1]}`;
  const pts = [start];
  for (const s of segs) {
    if (s.length === 2) d += ` L${s[0]} ${s[1]}`;
    else d += ` Q${s[0]} ${s[1]} ${s[2]} ${s[3]}`;
    pts.push(s.length === 2 ? s : [s[2], s[3]]);
  }
  for (let i = segs.length - 1; i >= 0; i--) {
    const s = segs[i], p = pts[i];
    if (s.length === 2) d += ` L${200 - p[0]} ${p[1]}`;
    else d += ` Q${200 - s[0]} ${s[1]} ${200 - p[0]} ${p[1]}`;
  }
  return d + ' Z';
}
const NECK = [[100, 88], ['Q', 92, 88, 88, 80]];
const VNECK = [[100, 101], [88, 79]];
const MOCK = [[100, 84], ['Q', 94, 84, 90, 78]];
const SLEEVE = [[66, 84], ['Q', 52, 87, 49, 102], [45, 133], [62, 136], [65, 118]];          // manga corta ajustada
const SLEEVE_S = [[66, 84], ['Q', 53, 87, 50, 100], [48, 118], [63, 121], [65, 112]];       // manguita
const BOXY = [[63, 85], ['Q', 49, 90, 45, 110], [40, 155], [60, 158], [62, 128]];         // hombro caído, manga al codo
const LONG = [[66, 84], ['Q', 52, 87, 49, 102], [41, 200], [56, 206], [64, 122]];
const BOXY_LONG = [[63, 85], ['Q', 49, 90, 45, 110], [37, 198], [55, 206], [62, 128]];
const top = (neck, sleeve, hem) => sym(neck[0], [...neck.slice(1), ...sleeve, ...hem]);
const FIT_HEM = [[66, 206], [100, 207]];
const BOXY_HEM = [[60, 222], [100, 223]];

const VB = { top: '28 68 144 160', bottom: '36 196 128 202', full: '30 72 140 326', swim: '34 72 132 196', shoes: '60 376 80 30', hat: '40 2 120 48', glasses: '74 32 52 22' };
const ln = (d, s, w = 1.2, extra = '') => `<path d="${d}" fill="none" stroke="${s}" stroke-width="${w}" stroke-linecap="round" ${extra}/>`;
const seams = () => ln('M66 87 Q63 104 66 121', INK, 1.3) + ln('M134 87 Q137 104 134 121', INK, 1.3);
const band = (d, c, w) => ln(d, INK, w + 2.2) + ln(d, ribOf(c), w);
const collarRib = ({ c }) => band('M88.5 80 Q100 91 111.5 80', c, 2.6) + seams();
const mockRib = ({ c }) => band('M90 78.5 Q100 86 110 78.5', c, 3.2) + seams();
const lapels = ({ s }) => ln('M88 79 L94 96 L100 101 L106 96 L112 79', s, 1.5);
const buttons = (s, y0, y1) => {
  let o = ln(`M100 ${y0} V${y1}`, s, 1);
  for (let y = y0 + 8; y < y1; y += 18) o += `<circle cx="102.5" cy="${y}" r="1.6" fill="${s}"/>`;
  return o;
};
const sleeveHems = (s, l, r) => ln(l, s, 1) + ln(r, s, 1);
const polo = ({ f, s }) => `<path d="M86 79 L95 95 L100 87 L105 95 L114 79 L106 77 L100 85 L94 77Z" fill="${f}" stroke="${s}" stroke-width="1.4"/>${buttons(s, 87, 112)}`;
// polo con cuello, botones y puños del color contrario (oscuro sobre claro, blanco sobre oscuro)
const poloContrast = (cuffs) => ({ f, c }) => {
  const k = lum(c) > 0.55 ? '#14141a' : '#ffffff', sk = lum(k) > 0.5 ? '#9aa0a6' : '#000000';
  return `<path d="M86 79 L95 95 L100 87 L105 95 L114 79 L106 77 L100 85 L94 77Z" fill="${k}" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/>${buttons(sk, 87, 112)}${ln(cuffs[0], k, 3.4)}${ln(cuffs[1], k, 3.4)}${ln(cuffs[0], INK, 0.8)}${ln(cuffs[1], INK, 0.8)}`;
};
const waist = (s) => ln('M64 212 H136', s, 1.2);
const draw = (s) => ln('M96 210 q-2 14 -6 24 M104 210 q2 14 6 24', '#fff', 1.6) + `<path d="M64 204 H136 V214 H64 Z" fill="none" stroke="${s}" stroke-width="1.2"/>`;

export const GARMENTS = [
  // ---- ARRIBA ----
  { id: 'tee', name: 'Camiseta clásica', slot: 'top', g: 'u', pr: true, d: top(NECK, SLEEVE, FIT_HEM), x: collarRib },
  { id: 'boxy', name: 'Camiseta oversize', slot: 'top', g: 'u', pr: true, d: top(NECK, BOXY, BOXY_HEM),
    x: (o) => collarRib(o) + sleeveHems(o.s, 'M41 150 L60 153', 'M159 150 L140 153') },
  { id: 'boxymock', name: 'Oversize cuello alto', slot: 'top', g: 'u', pr: true, d: top(MOCK, BOXY, BOXY_HEM), x: mockRib },
  { id: 'heavy', name: 'Oversize peso pesado', slot: 'top', g: 'u', pr: true, d: top(NECK, BOXY, [[59, 214], [100, 215]]),
    x: (o) => collarRib(o) + ln('M60 207 H140', o.s, 1) + sleeveHems(o.s, 'M41 148 L60 151', 'M159 148 L140 151') },
  { id: 'vtee', name: 'Camiseta cuello V', slot: 'top', g: 'u', pr: true, d: top(VNECK, SLEEVE, FIT_HEM), x: ({ c }) => band('M88 79 L100 101 L112 79', c, 2) + seams() },
  { id: 'longtee', name: 'Manga larga', slot: 'top', g: 'u', pr: true, d: top(NECK, LONG, FIT_HEM), x: collarRib },
  { id: 'sweat', name: 'Buzo (para el avión)', slot: 'top', g: 'u', pr: true, d: top(NECK, BOXY_LONG, [[61, 216], [100, 217]]),
    x: (o) => collarRib(o) + `<path d="M61 207 H139 V216 H61Z" fill="none" stroke="${o.s}" stroke-width="1.2"/>` + sleeveHems(o.s, 'M38 192 L56 199', 'M162 192 L144 199') },
  { id: 'polo', name: 'Polo', slot: 'top', g: 'u', pr: true, d: top(NECK, SLEEVE, FIT_HEM), x: polo },
  { id: 'polobox', name: 'Polo oversize', slot: 'top', g: 'u', pr: true, d: top(NECK, BOXY, BOXY_HEM), x: polo },
  { id: 'polocon', name: 'Polo cuello contrario', slot: 'top', g: 'u', pr: true, d: top(NECK, SLEEVE, FIT_HEM), x: poloContrast(['M45.6 128 L63.3 131', 'M154.4 128 L136.7 131']) },
  { id: 'poloboxcon', name: 'Polo oversize cuello contrario', slot: 'top', g: 'u', pr: true, d: top(NECK, BOXY, BOXY_HEM), x: poloContrast(['M41.3 150 L60.5 153', 'M158.7 150 L139.5 153']) },
  { id: 'jersey', name: 'Camiseta deportiva', slot: 'top', g: 'u', pr: true, d: top(VNECK, SLEEVE, FIT_HEM),
    x: ({ s }) => ln('M88 80 L100 100 L112 80', '#ffd60a', 4) + ln('M68 120 V204 M132 120 V204', '#2d6a4f', 5) },
  { id: 'hawaii', name: 'Camisa de botones', slot: 'top', g: 'u', d: top(VNECK, BOXY, [[60, 220], [100, 221]]),
    x: (o) => lapels(o) + buttons(o.s, 101, 220) },
  { id: 'linen', name: 'Camisa lino manga larga', slot: 'top', g: 'u', d: top(VNECK, LONG, [[64, 210], [100, 211]]),
    x: (o) => lapels(o) + buttons(o.s, 101, 210) + sleeveHems(o.s, 'M42 195 L56 200', 'M158 195 L144 200') },
  { id: 'cuban', name: 'Guayabera', slot: 'top', g: 'm', d: top(VNECK, BOXY, [[60, 220], [100, 221]]),
    x: (o) => lapels(o) + buttons(o.s, 101, 220) + ln('M78 112 V214 M122 112 V214', o.s, 1, 'stroke-dasharray="2 3"') + `<rect x="69" y="150" width="14" height="12" fill="none" stroke="${o.s}"/><rect x="117" y="150" width="14" height="12" fill="none" stroke="${o.s}"/>` },
  { id: 'tank', name: 'Esqueleto', slot: 'top', g: 'u', pr: true, d: sym([100, 96], [['Q', 90, 96, 84, 82], [76, 82], ['Q', 74, 102, 66, 114], [66, 206], [100, 207]]) },
  { id: 'babytee', name: 'Baby tee', slot: 'top', g: 'f', pr: true, d: top(NECK, SLEEVE_S, [[67, 172], [100, 173]]), x: collarRib },
  { id: 'crop', name: 'Crop top', slot: 'top', g: 'f', pr: true, d: sym([100, 90], [['Q', 90, 90, 86, 82], [74, 82], ['Q', 72, 100, 66, 110], [67, 158], [100, 159]]) },
  { id: 'blouse', name: 'Blusa mangas globo', slot: 'top', g: 'f', d: top(NECK, [[66, 84]], [[66, 194], [100, 195]]),
    x: ({ f, s }) => `<ellipse cx="55" cy="101" rx="12" ry="14" fill="${f}" stroke="${s}" stroke-width="1.4"/><ellipse cx="145" cy="101" rx="12" ry="14" fill="${f}" stroke="${s}" stroke-width="1.4"/><path d="M63 190 L137 190 L141 206 Q131 214 121 206 Q110 214 100 206 Q90 214 79 206 Q69 214 59 206 Z" fill="${f}" stroke="${s}" stroke-width="1.4"/>` },
  { id: 'cami', name: 'Top de tirantes', slot: 'top', g: 'f', d: sym([100, 98], [['Q', 85, 95, 70, 100], [66, 196], [100, 197]]),
    x: ({ s }) => ln('M80 99 L84 80 M120 99 L116 80', s, 2.4) },
  { id: 'offsh', name: 'Hombros descubiertos', slot: 'top', g: 'f', d: sym([100, 106], [['Q', 78, 102, 58, 97], [50, 104], [47, 124], [62, 127], [65, 118], [66, 192], [100, 193]]),
    x: ({ f, s }) => `<path d="M50 94 Q100 108 150 94 L150 106 Q100 120 50 106 Z" fill="${f}" stroke="${s}" stroke-width="1.4"/>` },
  { id: 'halter', name: 'Top halter', slot: 'top', g: 'f', d: sym([100, 92], [[94, 80], [70, 108], [68, 170], [100, 171]]),
    x: ({ s }) => ln('M94 80 Q100 70 106 80', s, 2.5) },
  { id: 'kimono', name: 'Kimono playero', slot: 'top', g: 'f',
    d: 'M86 80 L64 84 Q50 88 46 106 L36 172 L56 176 L62 140 L60 232 L88 234 L92 120 Z M114 80 L136 84 Q150 88 154 106 L164 172 L144 176 L138 140 L140 232 L112 234 L108 120 Z' },

  // ---- ABAJO ----
  { id: 'shorts', name: 'Shorts', slot: 'bottom', g: 'u', d: sym([100, 204], [[64, 204], [61, 226], [59, 268], [97, 270], [100, 238]]), x: ({ s }) => waist(s) },
  { id: 'sweatshorts', name: 'Short de sudadera', slot: 'bottom', g: 'u', d: sym([100, 204], [[64, 204], ['Q', 58, 232, 57, 262], [56, 296], [98, 298], [100, 242]]),
    x: ({ s }) => draw(s) + ln('M60 288 H97 M103 288 H140', s, 1) },
  { id: 'jorts', name: 'Jorts baggy', slot: 'bottom', g: 'u', d: sym([100, 204], [[63, 204], ['Q', 58, 232, 56, 262], [54, 308], [98, 310], [100, 244]]),
    x: ({ s }) => waist(s) + ln('M100 212 V240 M70 214 Q76 228 64 234 M130 214 Q124 228 136 234', '#e9b44c', 1, 'stroke-dasharray="2 2"') + ln('M56 300 L98 302 M102 302 L144 300', '#fff', 1, 'stroke-opacity=".6" stroke-dasharray="1 2"') },
  { id: 'cargojorts', name: 'Jorts cargo', slot: 'bottom', g: 'u', d: sym([100, 204], [[63, 204], ['Q', 58, 232, 56, 262], [54, 308], [98, 310], [100, 244]]),
    x: ({ f, s }) => waist(s) + ln('M100 212 V240', s) + `<path d="M55 256 H72 V288 H54 Z M145 256 H128 V288 H146 Z" fill="${f}" stroke="${s}" stroke-width="1.3"/>` + ln('M55 264 H72 M128 264 H145', s, 1) },
  { id: 'chino', name: 'Bermuda chino', slot: 'bottom', g: 'u', d: sym([100, 204], [[64, 204], [61, 230], [60, 288], [97, 289], [100, 240]]),
    x: ({ s }) => waist(s) + ln('M70 214 Q74 226 66 232 M130 214 Q126 226 134 232', s) },
  { id: 'cargo', name: 'Bermuda cargo', slot: 'bottom', g: 'm', d: sym([100, 204], [[63, 204], [60, 232], [58, 300], [97, 301], [100, 242]]),
    x: ({ f, s }) => waist(s) + `<path d="M58 250 H74 V276 H58 Z M142 250 H126 V276 H142 Z" fill="${f}" stroke="${s}" stroke-width="1.3"/>` },
  { id: 'pants', name: 'Pantalón de lino', slot: 'bottom', g: 'u', d: sym([100, 204], [[63, 204], [60, 240], [62, 378], [97, 378], [100, 248]]),
    x: ({ s }) => waist(s) + ln('M80 252 L80 374 M120 252 L120 374', s, 1, 'opacity=".5"') },
  { id: 'baggyjeans', name: 'Jeans baggy', slot: 'bottom', g: 'u', d: sym([100, 204], [[63, 204], ['Q', 57, 240, 56, 300], [54, 380], [98, 380], [100, 248]]),
    x: ({ s }) => waist(s) + ln('M100 212 V244 M70 214 Q76 228 64 234 M130 214 Q124 228 136 234', '#e9b44c', 1, 'stroke-dasharray="2 2"') + ln('M56 366 Q76 372 97 368 M103 368 Q124 372 144 366', s, 1) },
  { id: 'jeans', name: 'Jeans rectos', slot: 'bottom', g: 'u', d: sym([100, 204], [[64, 204], [64, 300], [72, 378], [97, 378], [100, 246]]),
    x: ({ s }) => waist(s) + ln('M100 212 V242 M70 214 Q76 228 64 234 M130 214 Q124 228 136 234', '#e9b44c', 1, 'stroke-dasharray="2 2"') },
  { id: 'wshorts', name: 'Short de jean', slot: 'bottom', g: 'f', d: sym([100, 204], [[63, 204], [59, 230], [58, 248], [97, 250], [100, 230]]),
    x: () => ln('M58 248 l3 4 l3 -4 l3 4 l3 -4 l3 4 l3 -4 l3 4 l3 -4 l3 4 l3 -4 l3 4 l3 -4 M103 250 l3 4 l3 -4 l3 4 l3 -4 l3 4 l3 -4 l3 4 l3 -4 l3 4 l3 -4 l3 4 l3 -4', '#fff', 1) },
  { id: 'miniskirt', name: 'Falda corta', slot: 'bottom', g: 'f', d: sym([100, 204], [[64, 204], [50, 268], ['Q', 75, 276, 100, 278]]),
    x: ({ s }) => ln('M80 210 L72 270 M100 210 V276 M120 210 L128 270', s, 1, 'opacity=".5"') },
  { id: 'maxiskirt', name: 'Falda larga', slot: 'bottom', g: 'f', d: sym([100, 204], [[64, 204], [44, 370], ['Q', 72, 378, 100, 379]]),
    x: ({ s }) => ln('M80 212 L64 372 M100 212 V376 M120 212 L136 372', s, 1, 'opacity=".45"') },
  { id: 'wrap', name: 'Falda pareo', slot: 'bottom', g: 'f', d: 'M64 204 L136 204 L150 330 Q110 350 52 300 Z',
    x: ({ f, s }) => `<circle cx="130" cy="214" r="6" fill="${f}" stroke="${s}"/>` + ln('M128 218 L122 250 M134 218 L140 248', s, 3) },
  { id: 'culotte', name: 'Pantalón palazzo', slot: 'bottom', g: 'f', d: sym([100, 204], [[64, 204], [50, 378], [97, 378], [100, 250]]), x: ({ s }) => ln('M64 214 H136', s, 2) },

  // ---- VESTIDOS ----
  { id: 'sundress', name: 'Vestido corto', slot: 'full', g: 'f', d: sym([100, 92], [['Q', 86, 90, 72, 96], [68, 150], ['Q', 72, 172, 68, 200], [46, 280], ['Q', 72, 290, 100, 292]]),
    x: ({ s }) => ln('M80 95 L82 80 M120 95 L118 80', s, 2.4) + ln('M68 172 Q100 180 132 172', s) },
  { id: 'maxidress', name: 'Vestido largo', slot: 'full', g: 'f', d: sym([100, 92], [['Q', 86, 90, 72, 96], [68, 150], ['Q', 72, 172, 68, 200], [40, 370], ['Q', 70, 380, 100, 381]]),
    x: ({ s }) => ln('M80 95 L82 80 M120 95 L118 80', s, 2.4) + ln('M86 210 L70 372 M114 210 L130 372', s, 1, 'opacity=".4"') },
  { id: 'shirtdress', name: 'Vestido camisero', slot: 'full', g: 'f', d: sym([100, 101], [[88, 79], ...SLEEVE, [66, 200], [56, 296], [100, 300]]),
    x: (o) => lapels(o) + buttons(o.s, 101, 292) + ln('M66 180 H134', o.s, 3) },
  { id: 'jumpsuit', name: 'Enterizo', slot: 'full', g: 'f', d: sym([100, 98], [['Q', 86, 96, 74, 92], [66, 200], [58, 372], [97, 374], [100, 252]]),
    x: ({ s }) => ln('M80 93 L84 80 M120 93 L116 80', s, 2.4) + ln('M68 186 H132', s, 3) },
  { id: 'romper', name: 'Mono corto', slot: 'full', g: 'f', d: sym([100, 88], [['Q', 92, 88, 88, 80], ...SLEEVE_S, [66, 200], [60, 256], [97, 258], [100, 232]]),
    x: ({ s }) => ln('M66 184 H134', s, 2.4) },
  { id: 'linenset', name: 'Conjunto de lino', slot: 'full', g: 'm', d: sym([100, 101], [[88, 79], ...BOXY, [61, 214], [60, 240], [62, 378], [97, 378], [100, 248]]),
    x: (o) => lapels(o) + buttons(o.s, 101, 206) + ln('M61 210 H139', o.s, 1.4) },

  // ---- PLAYA ----
  { id: 'bikinitop', name: 'Top de bikini', slot: 'swim', as: 'top', g: 'f', d: 'M78 104 Q86 96 98 108 L96 120 Q86 124 76 118 Z M122 104 Q114 96 102 108 L104 120 Q114 124 124 118 Z',
    x: ({ s }) => ln('M86 99 L94 80 M114 99 L106 80 M76 116 L67 114 M124 116 L133 114', s, 1.6) },
  { id: 'bandeau', name: 'Top bandeau', slot: 'swim', as: 'top', g: 'f', d: 'M68 102 Q100 96 132 102 L132 122 Q100 128 68 122 Z', x: ({ s }) => ln('M100 98 V126', s, 2) },
  { id: 'bikinibot', name: 'Bikini (abajo)', slot: 'swim', as: 'bottom', g: 'f', d: 'M64 212 L136 212 L126 226 Q108 232 100 252 Q92 232 74 226 Z' },
  { id: 'onepiece', name: 'Traje de baño entero', slot: 'swim', as: 'full', g: 'f', d: 'M70 96 Q84 112 100 112 Q116 112 130 96 L134 196 L136 220 Q112 226 100 250 Q88 226 64 220 L66 196 Z',
    x: ({ s }) => ln('M76 98 L82 80 M124 98 L118 80', s, 2.4) },
  { id: 'sunga', name: 'Sunga', slot: 'swim', as: 'bottom', g: 'm', d: 'M62 210 L138 210 L136 228 Q112 232 100 250 Q88 232 64 228 Z' },
  { id: 'trunks', name: 'Pantaloneta de baño', slot: 'swim', as: 'bottom', g: 'm', d: sym([100, 206], [[63, 206], [60, 226], [58, 262], [97, 264], [100, 236]]),
    x: () => ln('M96 208 q-2 14 -6 20 M104 208 q2 14 6 20', '#fff', 1.6) },
  { id: 'volley', name: 'Short de playa largo', slot: 'swim', as: 'bottom', g: 'u', d: sym([100, 204], [[63, 204], ['Q', 58, 232, 56, 262], [55, 292], [98, 294], [100, 240]]),
    x: ({ s }) => draw(s) },
  { id: 'rashguard', name: 'Camiseta UV', slot: 'swim', as: 'top', g: 'u', pr: true, d: top([[100, 86], ['Q', 93, 86, 89, 80]], LONG, FIT_HEM),
    x: ({ s }) => ln('M50 118 L64 128 M150 118 L136 128', s, 3) },

  // ---- CALZADO ----
  { id: 'havaianas', open: true, name: 'Chanclas', slot: 'shoes', g: 'u', d: 'M70 398 a14 5 0 1 0 28 0 a14 5 0 1 0 -28 0 Z M102 398 a14 5 0 1 0 28 0 a14 5 0 1 0 -28 0 Z',
    x: ({ s }) => ln('M76 397 L84 388 L92 397 M108 397 L116 388 L124 397', s, 3) },
  { id: 'slides', open: true, name: 'Slides', slot: 'shoes', g: 'u', d: 'M70 398 a14 5 0 1 0 28 0 a14 5 0 1 0 -28 0 Z M102 398 a14 5 0 1 0 28 0 a14 5 0 1 0 -28 0 Z',
    x: ({ f, s }) => `<path d="M73 386 H95 V395 H73 Z M105 386 H127 V395 H105 Z" fill="${f}" stroke="${s}" stroke-width="1.2"/>` },
  { id: 'sneakers', name: 'Tenis', slot: 'shoes', g: 'u', d: 'M72 384 L94 384 Q100 392 98 400 L68 400 Q66 390 72 384 Z M106 384 L128 384 Q134 390 132 400 L102 400 Q100 392 106 384 Z',
    x: () => ln('M68 397 H98 M102 397 H132', '#fff', 3) + ln('M76 386 l4 4 M82 386 l4 4 M112 386 l4 4 M118 386 l4 4', '#fff', 1.2) },
  { id: 'chunky', name: 'Tenis gruesos', slot: 'shoes', g: 'u', d: 'M70 380 L94 380 Q102 390 100 396 L66 396 Q64 386 70 380 Z M106 380 L130 380 Q136 386 134 396 L100 396 Q98 390 106 380 Z',
    x: () => `<path d="M64 396 H101 V404 H64 Z M99 396 H136 V404 H99 Z" fill="#fff" stroke="#1b1035" stroke-width="1"/>` },
  { id: 'sandals', open: true, name: 'Sandalias', slot: 'shoes', g: 'f', d: 'M70 398 a14 4 0 1 0 28 0 a14 4 0 1 0 -28 0 Z M102 398 a14 4 0 1 0 28 0 a14 4 0 1 0 -28 0 Z',
    x: ({ f }) => ln('M74 394 L94 388 M74 388 L94 394 M106 394 L126 388 M106 388 L126 394 M78 382 H92 M108 382 H122', f, 3) },
  { id: 'espadrilles', name: 'Alpargatas', slot: 'shoes', g: 'u', d: 'M72 384 L94 384 Q100 390 98 396 L68 396 Q66 388 72 384 Z M106 384 L128 384 Q134 388 132 396 L102 396 Q100 390 106 384 Z',
    x: () => `<path d="M68 396 H98 L98 401 H68 Z M102 396 H132 L132 401 H102 Z" fill="#d8b98a" stroke="#a07c4a" stroke-width=".8"/>` },
  { id: 'loafers', name: 'Mocasines', slot: 'shoes', g: 'm', d: 'M72 386 L94 386 Q100 392 98 400 L68 400 Q66 392 72 386 Z M106 386 L128 386 Q134 392 132 400 L102 400 Q100 392 106 386 Z',
    x: ({ s }) => ln('M76 389 H88 M112 389 H124', s, 2) },
  { id: 'wedges', open: true, name: 'Cuñas', slot: 'shoes', g: 'f', d: 'M68 400 L98 392 L98 402 L68 402 Z M102 392 L132 400 L132 402 L102 402 Z',
    x: ({ f, s }) => ln('M76 392 L92 384 M108 384 L124 392', f, 3) + ln('M68 402 H98 M102 402 H132', s, 2) },

  // ---- SOMBREROS ----
  { id: 'cap', name: 'Gorra', slot: 'hat', g: 'u', d: 'M78 34 Q80 12 100 12 Q120 12 122 34 Z M100 30 L138 33 Q132 40 100 37 Z', x: ({ s }) => `<circle cx="100" cy="12" r="2.4" fill="${s}"/>` },
  { id: 'panama', name: 'Sombrero panamá', slot: 'hat', g: 'u', d: 'M60 32 a40 7 0 1 0 80 0 a40 7 0 1 0 -80 0 Z M80 32 Q80 10 100 10 Q120 10 120 32 Z', x: () => `<path d="M80.5 26 H119.5 V31 H80.5 Z" fill="#1b1035"/>` },
  { id: 'floppy', name: 'Pamela', slot: 'hat', g: 'f', d: 'M46 31 a54 7.5 0 1 0 108 0 a54 7.5 0 1 0 -108 0 Z M80 31 Q80 12 100 12 Q120 12 120 31 Z', x: () => `<path d="M80.5 25 H119.5 V30 H80.5 Z" fill="#ff6f61"/>` },
  { id: 'bucket', name: 'Bucket hat', slot: 'hat', g: 'u', d: 'M80 28 Q82 12 100 12 Q118 12 120 28 L130 35 Q100 40 70 35 Z' },
  { id: 'beanie', name: 'Gorro (avión)', slot: 'hat', g: 'u', d: 'M77 34 Q77 10 100 10 Q123 10 123 34 Z', x: ({ s }) => ln('M77 30 H123', s, 3) },
  { id: 'bandana', name: 'Pañuelo turbante', slot: 'hat', g: 'f', d: 'M76 36 Q76 12 100 12 Q124 12 124 36 Q100 28 76 36 Z' },
  { id: 'visor', open: true, name: 'Visera', slot: 'hat', g: 'u', d: 'M78 30 Q100 24 122 30 L122 35 Q100 30 78 35 Z M88 33 L136 36 Q130 44 92 40 Z' },

  // ---- GAFAS ----
  { id: 'round', name: 'Redondas', slot: 'glasses', g: 'u', lens: true, d: 'M84 44 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0 Z M102 44 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0 Z' },
  { id: 'aviator', name: 'Aviador', slot: 'glasses', g: 'u', lens: true, d: 'M82 40 H98 Q98 52 90 52 Q82 52 82 40 Z M102 40 H118 Q118 52 110 52 Q102 52 102 40 Z' },
  { id: 'cateye', name: 'Ojo de gato', slot: 'glasses', g: 'f', lens: true, d: 'M80 38 L98 41 Q98 50 90 50 Q83 49 80 38 Z M120 38 L102 41 Q102 50 110 50 Q117 49 120 38 Z' },
  { id: 'square', name: 'Retro cuadradas', slot: 'glasses', g: 'u', lens: true, d: 'M82 39 H98 V49 H82 Z M102 39 H118 V49 H102 Z' },
  { id: 'shield', name: 'Deportivas', slot: 'glasses', g: 'u', lens: true, d: 'M80 40 Q100 36 120 40 Q118 51 108 50 Q100 47 92 50 Q82 51 80 40 Z' },
  { id: 'clearround', name: 'Transparentes redondas', slot: 'glasses', g: 'u', lens: true, clear: true, d: 'M84 44 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0 Z M102 44 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0 Z' },
  { id: 'clearsq', name: 'Transparentes cuadradas', slot: 'glasses', g: 'u', lens: true, clear: true, d: 'M82 39 H98 V49 H82 Z M102 39 H118 V49 H102 Z' },
  { id: 'clearcat', name: 'Transparentes ojo de gato', slot: 'glasses', g: 'f', lens: true, clear: true, d: 'M80 38 L98 41 Q98 50 90 50 Q83 49 80 38 Z M120 38 L102 41 Q102 50 110 50 Q117 49 120 38 Z' },
  { id: 'heart', name: 'Corazón', slot: 'glasses', g: 'f', lens: true, d: 'M90 50 L83 43 Q81 37 86 37 Q89 37 90 40 Q91 37 94 37 Q99 37 97 43 Z M110 50 L103 43 Q101 37 106 37 Q109 37 110 40 Q111 37 114 37 Q119 37 117 43 Z' },

  // ---- EXTRAS ----
  { id: 'tote', name: 'Bolso de playa', slot: 'extra', g: 'u', vb: '115 190 72 82', d: 'M131 224 L169 224 L173 268 L127 268 Z', x: ({ s }) => ln('M137 224 Q150 190 163 224', s, 3) },
  { id: 'fanny', name: 'Riñonera', slot: 'extra', g: 'u', vb: '56 186 88 40', d: 'M84 198 Q100 192 116 198 L118 214 Q100 220 82 214 Z', x: ({ s }) => ln('M64 200 Q74 202 84 202 M116 202 Q126 202 136 200', s, 3) },
  { id: 'crossbag', name: 'Bolso cruzado', slot: 'extra', g: 'u', vb: '60 76 90 150', d: 'M118 190 H140 V210 H118 Z', x: ({ s }) => ln('M80 84 L128 190', s, 2.5) },
  { id: 'camera', name: 'Cámara turista', slot: 'extra', g: 'u', vb: '70 76 60 100', d: 'M88 146 H112 V164 H88 Z',
    x: ({ s }) => ln('M84 84 L92 146 M116 84 L108 146', s, 2) + `<circle cx="100" cy="155" r="6" fill="#1b1035" stroke="#fff"/>` },
  { id: 'chain', name: 'Cadena', slot: 'extra', g: 'u', vb: '78 76 44 40', d: 'M88 82 Q100 106 112 82', stroke: true },
  { id: 'shells', name: 'Collar de conchas', slot: 'extra', g: 'u', vb: '78 76 44 40', d: 'M86 84 Q100 112 114 84', stroke: true,
    x: ({ f }) => [[89, 94], [94, 102], [100, 105], [106, 102], [111, 94]].map(([x, y]) => `<path d="M${x - 3} ${y} Q${x} ${y - 6} ${x + 3} ${y} Q${x} ${y + 3} ${x - 3} ${y}Z" fill="${f}" stroke="#1b1035" stroke-width=".6"/>`).join('') },
  { id: 'backpack', name: 'Mochila', slot: 'extra', g: 'u', vb: '56 76 88 140', d: 'M74 84 L78 210 M126 84 L122 210', stroke: true },
];

// ---------- diseños gráficos ----------
const fit = (t, fs, max) => {
  const w = Math.min(max, t.length * fs * 0.58);
  return t.length * fs * 0.58 > max ? `textLength="${w}" lengthAdjust="spacingAndGlyphs"` : '';
};
function wrap(t, n) {
  const words = t.split(/\s+/).filter(Boolean), lines = [];
  for (const w of words) {
    if (lines.length && (lines.at(-1) + ' ' + w).length <= n) lines[lines.length - 1] += ' ' + w;
    else lines.push(w);
  }
  return lines.slice(0, 6);
}
function printSVG(item) {
  if (!item.d || item.d === 'none') return '';
  const pc = item.pc || autoPrint(item.c || '#ffffff');
  const raw = (item.t || '').trim();
  const T = (def) => esc(raw || def);
  const F = 'font-family="Outfit, sans-serif" font-weight="800"';
  switch (item.d) {
    case 'chest': {
      const t = T('RIO');
      return `<g fill="${pc}"><circle cx="76" cy="108" r="4.5" fill="none" stroke="${pc}" stroke-width="1.4"/><path d="M73 109 q1.5 -2 3 0 t3 0" fill="none" stroke="${pc}" stroke-width="1"/>
        <text x="83" y="110.5" font-size="6" ${F} ${fit(raw || 'RIO', 6, 26)}>${t}</text></g>`;
    }
    case 'center': return `<text x="100" y="118" font-size="9" text-anchor="middle" fill="${pc}" ${F} letter-spacing=".5" ${fit(raw || 'COPACABANA', 9, 54)}>${T('COPACABANA')}</text>`;
    case 'big': {
      const t = raw || 'RIO DE JANEIRO';
      return `<g><rect x="76" y="112" width="48" height="44" rx="4" fill="none" stroke="${pc}" stroke-width="1.6"/>
        <circle cx="108" cy="126" r="7" fill="${pc}" opacity=".85"/>
        <path d="M78 154 L78 146 Q86 132 94 140 Q98 128 106 132 Q114 136 122 150 L122 154 Z" fill="${pc}"/>
        <text x="100" y="170" font-size="9" text-anchor="middle" fill="${pc}" font-family="Shrikhand, serif" ${fit(t, 9, 56)}>${esc(t)}</text></g>`;
    }
    case 'text': {
      const lines = wrap((raw || 'Playa, samba y caos bonito cada fin de semana').toUpperCase(), 13);
      return `<g fill="${pc}" font-size="6.4" ${F} text-anchor="end">${lines.map((l, i) => `<text x="124" y="${118 + i * 8}" ${fit(l, 6.4, 50)}>${esc(l)}</text>`).join('')}</g>`;
    }
    case 'script': return `<text x="100" y="118" font-size="13" text-anchor="middle" fill="${pc}" font-family="Caveat, cursive" ${fit(raw || 'Saudade', 13, 50)}>${T('Saudade')}</text>`;
    case 'pocket': return `<path d="M78 106 H92 V120 Q85 124 78 120 Z" fill="none" stroke="${pc}" stroke-width="1.4"/>${raw ? `<text x="85" y="102" font-size="4.5" text-anchor="middle" fill="${pc}" ${F} ${fit(raw, 4.5, 22)}>${esc(raw)}</text>` : ''}`;
    case 'band': return `<rect x="64" y="124" width="72" height="12" fill="${pc}"/>${raw ? `<text x="100" y="133" font-size="7" text-anchor="middle" fill="${autoPrint(pc)}" ${F} ${fit(raw, 7, 64)}>${esc(raw)}</text>` : ''}`;
    case 'skull': return `<g fill="${pc}"><path d="M100 108 a13 13 0 0 1 13 13 v6 q0 4 -4 5 v6 h-18 v-6 q-4 -1 -4 -5 v-6 a13 13 0 0 1 13 -13Z"/></g><g fill="${autoPrint(pc)}"><circle cx="94.5" cy="122" r="3.4"/><circle cx="105.5" cy="122" r="3.4"/><path d="M100 126 l-2 4 h4Z"/></g>${ln('M95 133 V138 M100 133 V138 M105 133 V138', autoPrint(pc), 1)}${raw ? `<text x="100" y="152" font-size="6" text-anchor="middle" fill="${pc}" ${F} ${fit(raw, 6, 50)}>${esc(raw)}</text>` : ''}`;
    case 'smile': return `<circle cx="100" cy="128" r="14" fill="${pc}"/><g fill="${autoPrint(pc)}"><circle cx="95" cy="123" r="1.9"/><circle cx="105" cy="123" r="1.9"/></g>${ln('M92 131 Q100 140 108 131', autoPrint(pc), 1.8)}`;
    case 'sun': return `<circle cx="100" cy="128" r="8" fill="${pc}"/>${ln([...Array(12)].map((_, i) => { const a = i * Math.PI / 6; return `M${(100 + 11.5 * Math.cos(a)).toFixed(1)} ${(128 + 11.5 * Math.sin(a)).toFixed(1)} L${(100 + 16 * Math.cos(a)).toFixed(1)} ${(128 + 16 * Math.sin(a)).toFixed(1)}`; }).join(' '), pc, 2)}`;
    case 'palm': return `${ln('M98 156 Q103 140 100 124', pc, 2.6)}<g fill="${pc}"><path d="M100 124 Q88 110 74 122 Q90 118 100 124Z"/><path d="M100 124 Q112 110 126 122 Q110 118 100 124Z"/><path d="M100 124 Q92 108 98 98 Q106 112 100 124Z"/><path d="M100 124 Q84 124 78 140 Q92 132 100 124Z"/><path d="M100 124 Q116 124 122 140 Q108 132 100 124Z"/></g>`;
    case 'number': return `<text x="100" y="142" font-size="34" text-anchor="middle" fill="${pc}" ${F} ${fit(raw || '10', 34, 52)}>${T('10')}</text>`;
    case 'flames': return `<path d="M70 168 Q72 154 80 158 Q80 144 90 149 Q94 134 100 145 Q106 134 110 149 Q120 144 120 158 Q128 154 130 168Z" fill="${pc}"/>`;
    case 'stars': {
      const star = (cx, cy, r) => `<path d="${[...Array(10)].map((_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r * 0.45 : r; return `${i ? 'L' : 'M'}${(cx + q * Math.cos(a)).toFixed(1)} ${(cy + q * Math.sin(a)).toFixed(1)}`; }).join(' ')}Z"/>`;
      return `<g fill="${pc}">${star(100, 124, 9)}${star(80, 114, 5)}${star(120, 114, 5)}${star(86, 142, 4)}${star(114, 142, 4)}</g>`;
    }
    default: return '';
  }
}

// ---------- dibujo ----------
let uid = 0;
const RUN = Math.random().toString(36).slice(2, 6); // evita choques de id entre instancias
function garmentSVG(item, cls = '') {
  const g = GARMENTS.find((x) => x.id === item?.g);
  if (!g) return { defs: '', body: '' };
  const c = item.c || '#ffffff';
  const dark = lum(c) < 0.28, OL = dark ? '#07070b' : INK;
  const s = dark ? mix(c, '#ffffff', 0.22) : mix(c, INK, lum(c) > 0.85 ? 0.62 : 0.5);
  let defs = '', f = c;
  if (item.p && item.p !== 'solid' && !['shoes', 'glasses', 'extra'].includes(g.slot)) { // también limpia looks guardados con estampado en calzado
    const id = `pt${RUN}${++uid}`;
    defs = patternDef(id, item.p, c);
    f = `url(#${id})`;
  }
  let body;
  if (g.lens && g.clear) { // cristal transparente: el color es el del marco (blanco = marco oscuro)
    const fr = lum(c) > 0.85 ? '#1b1035' : c;
    body = `<path d="${g.d}" fill="#dff3fb" fill-opacity=".28" stroke="${fr}" stroke-width="2"/>${ln('M98 44 Q100 41 102 44', fr, 2)}${ln('M82 41 L77 40 M118 41 L123 40', fr, 1.6)}`;
  } else if (g.lens) body = `<path d="${g.d}" fill="${c}" fill-opacity=".85" stroke="${INK}" stroke-width="2"/>${ln('M98 44 Q100 41 102 44', INK, 2)}`;
  else if (g.stroke) body = `<path d="${g.d}" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`;
  else body = `<path d="${g.d}" fill="${f}" stroke="${OL}" stroke-width="1.4" stroke-linejoin="round"/>`;
  if (g.x) body += g.x({ f, s, c });
  if (g.pr) body += printSVG(item);
  if (dark) body = body.replaceAll(INK, OL); // costuras y cuello también casi negros (el ciruela se ve rosa sobre negro)
  return { defs, body: `<g class="${cls}">${body}</g>` };
}

export const garmentById = (id) => GARMENTS.find((x) => x.id === id);
export const slotOf = (g) => g.as || g.slot;

export function thumbSVG(item, vb) { // vb: recorte opcional (acercar a una zona de la prenda)
  const g = garmentById(item.g);
  const { defs, body } = garmentSVG(item);
  return `<svg viewBox="${vb || g.vb || VB[g.slot]}" aria-hidden="true"><defs>${defs}</defs>${body}</svg>`;
}

const ORDER = ['bottom', 'full', 'top', 'shoes', 'extra', 'glasses', 'hat'];

// Pelo estilo ilustración, calcado de la referencia: relleno liso, contorno ciruela fino, ondas suaves con pequeños remolinos
// (flicks) en las puntas, patillas puntiagudas y mechones junto a las orejas. Los trazados están en las coordenadas de la
// imagen de referencia (recorte 1080×1000); T las lleva al espacio local de la cabeza (centro x=100, ojos y=46.5).
const T = 'translate(53.1 -8.3) scale(.0898)';
const OW = 11; // grosor del contorno en esas unidades (≈1 en la cabeza)
const mirX = (g) => `<g transform="translate(1044 0) scale(-1 1)">${g}</g>`;
const tr = (inner) => `<g transform="${T}" stroke-linejoin="round" stroke-linecap="round">${inner}</g>`;
const blob = (d, h) => `<path d="${d}" fill="${h}" stroke="${INK}" stroke-width="${OW}"/>`;
const line = (d, c = INK, w = 10) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}"/>`;
// curva suave cerrada que pasa por los puntos (Catmull-Rom → Bézier)
function smooth(p) {
  const n = p.length, f = (v) => Math.round(v);
  let d = `M${f(p[0][0])} ${f(p[0][1])}`;
  for (let i = 0; i < n; i++) {
    const a = p[(i - 1 + n) % n], b = p[i], c = p[(i + 1) % n], e = p[(i + 2) % n];
    d += ` C${f(b[0] + (c[0] - a[0]) / 6)} ${f(b[1] + (c[1] - a[1]) / 6)} ${f(c[0] - (e[0] - b[0]) / 6)} ${f(c[1] - (e[1] - b[1]) / 6)} ${f(c[0])} ${f(c[1])}`;
  }
  return d + 'Z';
}

const BACK_CURLY = 'M170 612 L102 566 Q125 556 148 546 Q92 520 82 470 Q80 450 100 430 Q150 410 190 380 Q140 330 152 290 Q158 240 200 210 Q250 190 306 180 Q270 150 280 110 Q284 88 298 78 Q310 92 322 112 Q352 130 392 120 Q470 100 520 72 Q580 40 640 70 Q668 90 684 152 Q720 126 780 138 Q824 152 836 234 Q900 236 936 286 Q950 320 918 350 Q960 372 986 430 Q1000 470 972 520 Q962 548 970 568 L986 584 Q960 608 930 614 Q900 600 888 592 L850 640 L520 700 L190 640 Z';
const TUFT = 'M272 742 L212 773 Q252 776 272 790 Q290 802 286 836 Q304 856 348 868 L392 884 L392 742Z';
const SHORT_BACK = 'M200 612 L150 572 Q132 520 160 470 Q150 380 190 320 Q214 244 290 214 Q268 176 282 132 Q290 120 302 128 Q320 156 372 160 Q460 104 540 96 Q620 86 680 132 Q760 122 810 182 Q872 214 882 300 Q916 380 890 450 Q900 520 876 572 L850 612 L520 700 L200 640 Z';
const FADE_BACK = 'M236 470 Q176 420 194 354 Q144 318 160 268 Q172 226 210 212 Q250 192 306 182 Q270 150 280 110 Q284 88 298 78 Q310 92 322 112 Q352 130 392 120 Q470 100 520 72 Q580 40 640 70 Q668 90 684 152 Q720 126 780 138 Q824 152 836 234 Q892 238 922 290 Q938 330 906 360 Q930 404 884 450 L850 520 L520 640 L240 520 Z';
const CURLY_HALF = [[522, 74], [420, 108], [318, 168], [236, 198], [170, 262], [142, 340], [112, 408], [96, 480], [104, 560], [84, 650], [116, 730], [82, 820], [120, 900], [92, 990], [150, 1052], [232, 1030], [292, 1084], [362, 1052], [430, 1076]];
const LONG_CURLY = smooth([...CURLY_HALF, [522, 1062], ...CURLY_HALF.slice(1).reverse().map(([x, y]) => [1044 - x, y])]);
const CURL_WAVES = 'M170 700 Q214 760 170 830 M200 900 Q250 960 210 1010 M874 700 Q830 760 874 830 M844 900 Q794 960 834 1010';
const LOCK_L = 'M170 560 Q90 640 120 740 Q66 800 120 880 Q88 960 150 1012 Q220 1044 252 984 Q304 930 282 860 Q314 790 292 720 Q300 640 270 580Z';
const BUN = 'M446 142 Q418 70 462 26 Q470 8 492 12 Q520 -6 566 14 Q612 40 600 142Z';
const LONG_HALF = [[522, 74], [420, 108], [318, 168], [236, 198], [170, 262], [142, 340], [112, 408], [96, 480], [112, 560], [100, 690], [116, 840], [92, 990], [110, 1110], [190, 1150], [300, 1112], [420, 1096]];
const LONG_BACK = smooth([...LONG_HALF, [522, 1090], ...LONG_HALF.slice(1).reverse().map(([x, y]) => [1044 - x, y])]);

const HL = {
  curly: 'M805 598 L742 606 Q768 578 772 548 L782 518 Q760 505 738 492 Q760 482 770 462 Q745 456 722 446 Q716 410 700 382 Q680 350 652 346 Q640 356 640 362 Q634 330 612 295 Q596 268 578 276 Q555 290 560 335 Q568 380 584 400 Q586 440 548 462 Q512 478 484 462 Q466 448 472 400 Q452 438 410 444 Q366 448 338 430 Q310 470 296 508 L254 524 Q285 530 302 548 Q292 570 292 590 Q300 604 312 612 L262 604',
  sweep: 'M805 598 L742 606 Q770 572 774 530 Q776 480 744 452 Q700 424 650 410 Q604 392 584 346 Q566 410 520 436 Q450 470 384 472 Q334 482 304 522 L258 538 Q288 556 296 590 Q300 604 312 612 L262 604',
  fade: 'M776 478 Q770 462 770 462 Q745 456 722 446 Q716 410 700 382 Q680 350 652 346 Q640 356 640 362 Q634 330 612 295 Q596 268 578 276 Q555 290 560 335 Q568 380 584 400 Q586 440 548 462 Q512 478 484 462 Q466 448 472 400 Q452 438 410 444 Q366 448 338 430 Q310 450 290 478',
  part: 'M805 598 L742 606 Q776 540 770 478 Q740 478 690 462 Q600 446 540 404 Q530 396 522 392 Q514 396 504 404 Q444 446 354 462 Q304 478 274 478 Q268 540 302 606 L240 598',
};
const CLOSE = ' L215 560 L215 260 Q520 150 850 260 L850 560 Z';
const CLOSE_FADE = ' L236 440 L236 300 Q520 150 830 300 L830 440 Z';
const HOOK = 'M326 410 Q316 384 336 372 Q352 364 364 372';
function front(kind, h, extra = '') {
  return tr(`<path d="${HL[kind]}${kind === 'fade' ? CLOSE_FADE : CLOSE}" fill="${h}"/>${line(HL[kind], INK, OW)}${extra}`);
}

function hairOf(style, h, skin = '#fbdcc8') {
  const hook = line(HOOK, INK, 10);
  const tufts = blob(TUFT, h) + mirX(blob(TUFT, h));
  const buzz = 'M300 470 Q268 380 330 320 Q400 262 522 262 Q644 262 714 320 Q776 380 744 470 Q700 410 640 395 Q580 380 522 380 Q464 380 404 395 Q344 410 300 470Z';
  return ({
    curly: [tr(tufts + blob(BACK_CURLY, h)), front('curly', h, hook)],
    curlylong: [tr(blob(LONG_CURLY, h) + line(CURL_WAVES, INK, 8) + blob(BACK_CURLY, h)), front('curly', h, hook)],
    curlyfade: [tr(blob(FADE_BACK, h)),
      tr(`<path d="M292 478 Q258 520 268 580 L312 560 Q300 520 318 490Z M752 478 Q786 520 776 580 L732 560 Q744 520 726 490Z" fill="${h}" fill-opacity=".45"/>`) + front('fade', h, hook)],
    short: [tr(blob(SHORT_BACK, h)), front('sweep', h)],
    bun: [tr(blob(BUN, h) + blob(SHORT_BACK, h)), front('sweep', h)],
    long: [tr(blob(LONG_BACK, h)), front('part', h)],
    buzz: ['', tr(`<path d="${buzz}" fill="${h}" fill-opacity=".88"/>${line(buzz, INK, 8)}`)],
  })[style] || ['', ''];
}

// ---------- muñeco ----------
// Estilo "ilustración": contorno ciruela fino, cabeza grande y redonda, cuello en sombra, brazos separados del torso,
// manos en círculo, piernas rectas con espacio entre ellas y ropa interior base. Cuerpo en viewBox 200×420.
// La cabeza (pelo, cara, gafas y sombreros) comparte una sola transformación: lo que se dibuja en las coordenadas
// "antiguas" de la cabeza (prendas de hat/glasses incluidas) se ajusta solo a la cabeza nueva.
const HEAD_T = 'translate(100 70) scale(1.18 1.12) translate(-100 -70)';
const BODY_SLOTS = ['bottom', 'full', 'top', 'shoes', 'extra'];
const HEAD_SLOTS = ['glasses', 'hat'];
const UNDER = '#e4e5ea', UNDER_BAND = '#cfd0d8';
const BOXERS = `<path d="${sym([100, 204], [[64, 204], [62, 228], [61, 262], [96.5, 264], [100, 241]])}" fill="${UNDER}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
  <path d="M63.4 204 H136.6 V212 H63.4Z" fill="${UNDER_BAND}" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>
  <path d="M95 232 Q99.5 230 100.5 238" fill="none" stroke="${INK}" stroke-width="1.2" stroke-linecap="round"/>`;
const SPORT_TOP = `<path d="M69 104 Q100 98 131 104 L131 122 Q100 128 69 122 Z" fill="${UNDER}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>`;

export function figureSVG(outfit = {}, profile = {}, { animate } = {}) {
  const skin = profile.skin || SKINS[1];
  const hair = profile.hair || HAIRS[0];
  const fem = profile.figure === 'f';
  const sk = shade(skin, 0.82);
  let defs = '', clothes = '', headWear = '';
  const hatClip = outfit.hat && !garmentById(outfit.hat.g)?.open; // la visera deja el pelo al aire
  for (const slot of [...BODY_SLOTS, ...HEAD_SLOTS]) {
    if (!outfit[slot]) continue;
    const r = garmentSVG(outfit[slot], animate === slot ? 'pop' : '');
    defs += r.defs;
    if (HEAD_SLOTS.includes(slot)) headWear += r.body; else clothes += r.body;
  }
  // ropa interior base: solo se ve donde no hay otra prenda encima
  const under = (outfit.bottom || outfit.full ? '' : BOXERS) + (fem && !outfit.top && !outfit.full ? SPORT_TOP : '');
  const clip = hatClip ? 'transform="translate(100 50) scale(.92 .7) translate(-100 -50)"' : ''; // con sombrero el pelo se aplasta debajo (no se recorta)
  const [hairBack, hairFront] = hairOf(profile.style || (fem ? 'long' : 'curly'), hair, skin);
  // silueta única: primero todo con trazo grueso (contorno exterior), luego el relleno encima (sin líneas internas)
  const closedShoes = outfit.shoes && !garmentById(outfit.shoes.g)?.open; // el calzado cerrado sustituye al pie desnudo
  const shapes = `<path d="M64 226 L100 226 L100 248 Q95.5 250 95.5 262 Q96.5 300 96.5 332 Q97.5 360 95 386 L77 386 Q75 358 75 334 Q69 300 64 226Z"/><path d="M136 226 L100 226 L100 248 Q104.5 250 104.5 262 Q103.5 300 103.5 332 Q102.5 360 105 386 L123 386 Q125 358 125 334 Q131 300 136 226Z"/>
    ${closedShoes ? '' : '<path d="M77 383 L95 383 Q100 390 98.5 397 Q95.5 402 84 402 Q72 402 68.5 397 Q67 391 75 385Z"/><path d="M123 383 L105 383 Q100 390 101.5 397 Q104.5 402 116 402 Q128 402 131.5 397 Q133 391 125 385Z"/>'}
    <path d="M66 86 Q52 88 50 104 L42 198 L43 207 L56 208 L57 200 L66 118Z"/><path d="M134 86 Q148 88 150 104 L158 198 L157 207 L144 208 L143 200 L134 118Z"/>
    <circle cx="49.5" cy="215" r="9.5"/><circle cx="150.5" cy="215" r="9.5"/>
    <path d="M66 86 Q100 78 134 86 L133 150 Q132 190 136 228 L64 228 Q68 190 67 150 Z"/>
    <path d="M91 58 L90 82 Q100 90 110 82 L109 58Z"/>`;
  const headShapes = `<ellipse cx="74.5" cy="49.5" rx="5" ry="8"/><ellipse cx="125.5" cy="49.5" rx="5" ry="8"/>
    <path d="M78 42 Q76 15.5 100 15.5 Q124 15.5 122 42 Q126 60 112 68 Q106 72 100 72 Q94 72 88 68 Q74 60 78 42Z"/>`;
  const blush = (x) => `<ellipse cx="${x}" cy="54.6" rx="6" ry="3.8" fill="#ff9a8a" opacity=".42"/><path d="M${x - 3} 57 l1.4 -3 M${x} 57 l1.4 -3 M${x + 3} 57 l1.4 -3" stroke="#ec7f70" stroke-width=".6" stroke-linecap="round" opacity=".7"/>`;
  return `<svg viewBox="0 -22 200 444" class="figure" role="img" aria-label="Muñeco con el look del día">
  <defs>${defs}</defs>
  <ellipse cx="100" cy="405" rx="56" ry="8" fill="${INK}" opacity=".12"/>
  <g class="bob">
  <g transform="${HEAD_T}"><g ${clip}>${hairBack}</g></g>
  <g fill="${INK}" stroke="${INK}" stroke-width="2.8" stroke-linejoin="round">${shapes}</g>
  <g fill="${skin}" stroke="${skin}" stroke-width=".8" stroke-linejoin="round">${shapes}</g>
  <path d="M90 60 L89.4 82 Q100 92 110.6 82 L110 60Z" fill="${INK}"/>
  ${under}
  ${clothes}
  <g transform="${HEAD_T}">
  <g fill="${INK}" stroke="${INK}" stroke-width="2.8" stroke-linejoin="round">${headShapes}</g>
  <g fill="${skin}" stroke="${skin}" stroke-width=".8" stroke-linejoin="round">${headShapes}</g>
  <ellipse cx="72.5" cy="45.5" rx="2.8" ry="3.4" fill="#f7a893" opacity=".75"/><ellipse cx="127.5" cy="45.5" rx="2.8" ry="3.4" fill="#f7a893" opacity=".75"/>
  <path d="M71.5 47 Q75 45 76 48.5 Q75 52.5 71.5 52 M128.5 47 Q125 45 124 48.5 Q125 52.5 128.5 52" fill="none" stroke="${INK}" stroke-width=".9" stroke-linecap="round"/>
  ${blush(86.5)}${blush(113.5)}
  <ellipse cx="89.5" cy="46.5" rx="3.1" ry="5.3" fill="${INK}"/><ellipse cx="110.5" cy="46.5" rx="3.1" ry="5.3" fill="${INK}"/>
  <ellipse cx="90.4" cy="36.2" rx="3.1" ry="2" fill="${INK}"/><ellipse cx="109.6" cy="36.2" rx="3.1" ry="2" fill="${INK}"/>
  <ellipse cx="99.8" cy="51.9" rx="2.1" ry="1.7" fill="#f7a98f" opacity=".85"/><path d="M98.2 55.2 l1.4 1.6" stroke="${INK}" stroke-width=".7" stroke-linecap="round" opacity=".7"/>
  <path d="M94.5 61.2 Q100.5 66 106.2 60.4" fill="none" stroke="${INK}" stroke-width="1.5" stroke-linecap="round"/>
  ${fem ? `<path d="M86.6 42 l-3 -2 M113.4 42 l3 -2" stroke="${INK}" stroke-width="1.2" stroke-linecap="round"/>` : ''}
  <g ${clip}>${hairFront}</g>
  <g transform="translate(100 36) scale(1.12) translate(-100 -36)">${headWear}</g>
  </g>
  </g></svg>`;
}
