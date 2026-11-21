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
];

export const SLOTS = [
  ['top', 'Arriba', '👕'], ['bottom', 'Abajo', '🩳'], ['full', 'Vestidos', '👗'],
  ['swim', 'Playa', '👙'], ['shoes', 'Calzado', '👟'], ['hat', 'Sombreros', '🧢'],
  ['glasses', 'Gafas', '🕶️'], ['extra', 'Extras', '👜'], ['me', 'Mi muñeco', '🧍'],
];

export const SKINS = ['#f9d7c0', '#eebb99', '#d9a173', '#b97c50', '#8d5a36', '#5c3a21'];
export const HAIRS = ['#1b1035', '#4a2c1a', '#8b5a2b', '#d4a24c', '#b33a1e', '#9aa0a6'];

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
const collarRib = ({ s }) => ln('M88 80 Q100 91 112 80', s, 2.6);
const mockRib = ({ s }) => ln('M90 78 Q100 86 110 78', s, 3.2);
const lapels = ({ s }) => ln('M88 79 L94 96 L100 101 L106 96 L112 79', s, 1.5);
const buttons = (s, y0, y1) => {
  let o = ln(`M100 ${y0} V${y1}`, s, 1);
  for (let y = y0 + 8; y < y1; y += 18) o += `<circle cx="102.5" cy="${y}" r="1.6" fill="${s}"/>`;
  return o;
};
const sleeveHems = (s, l, r) => ln(l, s, 1) + ln(r, s, 1);
const polo = ({ f, s }) => `<path d="M86 79 L95 95 L100 87 L105 95 L114 79 L106 77 L100 85 L94 77Z" fill="${f}" stroke="${s}" stroke-width="1.4"/>${buttons(s, 87, 112)}`;
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
  { id: 'vtee', name: 'Camiseta cuello V', slot: 'top', g: 'u', pr: true, d: top(VNECK, SLEEVE, FIT_HEM), x: ({ s }) => ln('M88 79 L100 101 L112 79', s, 2) },
  { id: 'longtee', name: 'Manga larga', slot: 'top', g: 'u', pr: true, d: top(NECK, LONG, FIT_HEM), x: collarRib },
  { id: 'sweat', name: 'Buzo (para el avión)', slot: 'top', g: 'u', pr: true, d: top(NECK, BOXY_LONG, [[61, 216], [100, 217]]),
    x: (o) => collarRib(o) + `<path d="M61 207 H139 V216 H61Z" fill="none" stroke="${o.s}" stroke-width="1.2"/>` + sleeveHems(o.s, 'M38 192 L56 199', 'M162 192 L144 199') },
  { id: 'polo', name: 'Polo', slot: 'top', g: 'u', pr: true, d: top(NECK, SLEEVE, FIT_HEM), x: polo },
  { id: 'polobox', name: 'Polo oversize', slot: 'top', g: 'u', pr: true, d: top(NECK, BOXY, BOXY_HEM), x: polo },
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
  { id: 'pants', name: 'Pantalón de lino', slot: 'bottom', g: 'u', d: sym([100, 204], [[63, 204], [60, 240], [62, 392], [97, 392], [100, 248]]),
    x: ({ s }) => waist(s) + ln('M80 252 L80 388 M120 252 L120 388', s, 1, 'opacity=".5"') },
  { id: 'baggyjeans', name: 'Jeans baggy', slot: 'bottom', g: 'u', d: sym([100, 204], [[63, 204], ['Q', 57, 240, 56, 300], [54, 396], [98, 396], [100, 248]]),
    x: ({ s }) => waist(s) + ln('M100 212 V244 M70 214 Q76 228 64 234 M130 214 Q124 228 136 234', '#e9b44c', 1, 'stroke-dasharray="2 2"') + ln('M56 380 Q76 386 97 382 M103 382 Q124 386 144 380', s, 1) },
  { id: 'jeans', name: 'Jeans rectos', slot: 'bottom', g: 'u', d: sym([100, 204], [[64, 204], [64, 300], [72, 392], [97, 392], [100, 246]]),
    x: ({ s }) => waist(s) + ln('M100 212 V242 M70 214 Q76 228 64 234 M130 214 Q124 228 136 234', '#e9b44c', 1, 'stroke-dasharray="2 2"') },
  { id: 'wshorts', name: 'Short de jean', slot: 'bottom', g: 'f', d: sym([100, 204], [[63, 204], [59, 230], [58, 248], [97, 250], [100, 230]]),
    x: () => ln('M58 248 l3 4 l3 -4 l3 4 l3 -4 l3 4 l3 -4 l3 4 l3 -4 l3 4 l3 -4 l3 4 l3 -4 M103 250 l3 4 l3 -4 l3 4 l3 -4 l3 4 l3 -4 l3 4 l3 -4 l3 4 l3 -4 l3 4 l3 -4', '#fff', 1) },
  { id: 'miniskirt', name: 'Falda corta', slot: 'bottom', g: 'f', d: sym([100, 204], [[64, 204], [50, 268], ['Q', 75, 276, 100, 278]]),
    x: ({ s }) => ln('M80 210 L72 270 M100 210 V276 M120 210 L128 270', s, 1, 'opacity=".5"') },
  { id: 'maxiskirt', name: 'Falda larga', slot: 'bottom', g: 'f', d: sym([100, 204], [[64, 204], [44, 382], ['Q', 72, 392, 100, 393]]),
    x: ({ s }) => ln('M80 212 L64 384 M100 212 V390 M120 212 L136 384', s, 1, 'opacity=".45"') },
  { id: 'wrap', name: 'Falda pareo', slot: 'bottom', g: 'f', d: 'M64 204 L136 204 L150 330 Q110 350 52 300 Z',
    x: ({ f, s }) => `<circle cx="130" cy="214" r="6" fill="${f}" stroke="${s}"/>` + ln('M128 218 L122 250 M134 218 L140 248', s, 3) },
  { id: 'culotte', name: 'Pantalón palazzo', slot: 'bottom', g: 'f', d: sym([100, 204], [[64, 204], [50, 392], [97, 392], [100, 250]]), x: ({ s }) => ln('M64 214 H136', s, 2) },

  // ---- VESTIDOS ----
  { id: 'sundress', name: 'Vestido corto', slot: 'full', g: 'f', d: sym([100, 92], [['Q', 86, 90, 72, 96], [68, 150], ['Q', 72, 172, 68, 200], [46, 280], ['Q', 72, 290, 100, 292]]),
    x: ({ s }) => ln('M80 95 L82 80 M120 95 L118 80', s, 2.4) + ln('M68 172 Q100 180 132 172', s) },
  { id: 'maxidress', name: 'Vestido largo', slot: 'full', g: 'f', d: sym([100, 92], [['Q', 86, 90, 72, 96], [68, 150], ['Q', 72, 172, 68, 200], [40, 384], ['Q', 70, 396, 100, 397]]),
    x: ({ s }) => ln('M80 95 L82 80 M120 95 L118 80', s, 2.4) + ln('M86 210 L70 386 M114 210 L130 386', s, 1, 'opacity=".4"') },
  { id: 'shirtdress', name: 'Vestido camisero', slot: 'full', g: 'f', d: sym([100, 101], [[88, 79], ...SLEEVE, [66, 200], [56, 296], [100, 300]]),
    x: (o) => lapels(o) + buttons(o.s, 101, 292) + ln('M66 180 H134', o.s, 3) },
  { id: 'jumpsuit', name: 'Enterizo', slot: 'full', g: 'f', d: sym([100, 98], [['Q', 86, 96, 74, 92], [66, 200], [58, 382], [97, 384], [100, 252]]),
    x: ({ s }) => ln('M80 93 L84 80 M120 93 L116 80', s, 2.4) + ln('M68 186 H132', s, 3) },
  { id: 'romper', name: 'Mono corto', slot: 'full', g: 'f', d: sym([100, 88], [['Q', 92, 88, 88, 80], ...SLEEVE_S, [66, 200], [60, 256], [97, 258], [100, 232]]),
    x: ({ s }) => ln('M66 184 H134', s, 2.4) },
  { id: 'linenset', name: 'Conjunto de lino', slot: 'full', g: 'm', d: sym([100, 101], [[88, 79], ...BOXY, [61, 214], [60, 240], [62, 392], [97, 392], [100, 248]]),
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
  { id: 'havaianas', name: 'Chanclas', slot: 'shoes', g: 'u', d: 'M70 398 a14 5 0 1 0 28 0 a14 5 0 1 0 -28 0 Z M102 398 a14 5 0 1 0 28 0 a14 5 0 1 0 -28 0 Z',
    x: ({ s }) => ln('M76 397 L84 388 L92 397 M108 397 L116 388 L124 397', s, 3) },
  { id: 'slides', name: 'Slides', slot: 'shoes', g: 'u', d: 'M70 398 a14 5 0 1 0 28 0 a14 5 0 1 0 -28 0 Z M102 398 a14 5 0 1 0 28 0 a14 5 0 1 0 -28 0 Z',
    x: ({ f, s }) => `<path d="M73 386 H95 V395 H73 Z M105 386 H127 V395 H105 Z" fill="${f}" stroke="${s}" stroke-width="1.2"/>` },
  { id: 'sneakers', name: 'Tenis', slot: 'shoes', g: 'u', d: 'M72 384 L94 384 Q100 392 98 400 L68 400 Q66 390 72 384 Z M106 384 L128 384 Q134 390 132 400 L102 400 Q100 392 106 384 Z',
    x: () => ln('M68 397 H98 M102 397 H132', '#fff', 3) + ln('M76 386 l4 4 M82 386 l4 4 M112 386 l4 4 M118 386 l4 4', '#fff', 1.2) },
  { id: 'chunky', name: 'Tenis gruesos', slot: 'shoes', g: 'u', d: 'M70 380 L94 380 Q102 390 100 396 L66 396 Q64 386 70 380 Z M106 380 L130 380 Q136 386 134 396 L100 396 Q98 390 106 380 Z',
    x: () => `<path d="M64 396 H101 V404 H64 Z M99 396 H136 V404 H99 Z" fill="#fff" stroke="#1b1035" stroke-width="1"/>` },
  { id: 'sandals', name: 'Sandalias', slot: 'shoes', g: 'f', d: 'M70 398 a14 4 0 1 0 28 0 a14 4 0 1 0 -28 0 Z M102 398 a14 4 0 1 0 28 0 a14 4 0 1 0 -28 0 Z',
    x: ({ f }) => ln('M74 394 L94 388 M74 388 L94 394 M106 394 L126 388 M106 388 L126 394 M78 382 H92 M108 382 H122', f, 3) },
  { id: 'espadrilles', name: 'Alpargatas', slot: 'shoes', g: 'u', d: 'M72 384 L94 384 Q100 390 98 396 L68 396 Q66 388 72 384 Z M106 384 L128 384 Q134 388 132 396 L102 396 Q100 390 106 384 Z',
    x: () => `<path d="M68 396 H98 L98 401 H68 Z M102 396 H132 L132 401 H102 Z" fill="#d8b98a" stroke="#a07c4a" stroke-width=".8"/>` },
  { id: 'loafers', name: 'Mocasines', slot: 'shoes', g: 'm', d: 'M72 386 L94 386 Q100 392 98 400 L68 400 Q66 392 72 386 Z M106 386 L128 386 Q134 392 132 400 L102 400 Q100 392 106 386 Z',
    x: ({ s }) => ln('M76 389 H88 M112 389 H124', s, 2) },
  { id: 'wedges', name: 'Cuñas', slot: 'shoes', g: 'f', d: 'M68 400 L98 392 L98 402 L68 402 Z M102 392 L132 400 L132 402 L102 402 Z',
    x: ({ f, s }) => ln('M76 392 L92 384 M108 384 L124 392', f, 3) + ln('M68 402 H98 M102 402 H132', s, 2) },

  // ---- SOMBREROS ----
  { id: 'cap', name: 'Gorra', slot: 'hat', g: 'u', d: 'M78 34 Q80 12 100 12 Q120 12 122 34 Z M100 30 L138 33 Q132 40 100 37 Z', x: ({ s }) => `<circle cx="100" cy="12" r="2.4" fill="${s}"/>` },
  { id: 'panama', name: 'Sombrero panamá', slot: 'hat', g: 'u', d: 'M60 32 a40 7 0 1 0 80 0 a40 7 0 1 0 -80 0 Z M80 32 Q80 10 100 10 Q120 10 120 32 Z', x: () => `<path d="M80.5 26 H119.5 V31 H80.5 Z" fill="#1b1035"/>` },
  { id: 'floppy', name: 'Pamela', slot: 'hat', g: 'f', d: 'M46 34 a54 9 0 1 0 108 0 a54 9 0 1 0 -108 0 Z M80 33 Q80 12 100 12 Q120 12 120 33 Z', x: () => `<path d="M80.5 27 H119.5 V32 H80.5 Z" fill="#ff6f61"/>` },
  { id: 'bucket', name: 'Bucket hat', slot: 'hat', g: 'u', d: 'M80 30 Q82 12 100 12 Q118 12 120 30 L130 42 Q100 48 70 42 Z' },
  { id: 'beanie', name: 'Gorro (avión)', slot: 'hat', g: 'u', d: 'M77 34 Q77 10 100 10 Q123 10 123 34 Z', x: ({ s }) => ln('M77 30 H123', s, 3) },
  { id: 'bandana', name: 'Pañuelo turbante', slot: 'hat', g: 'f', d: 'M76 36 Q76 12 100 12 Q124 12 124 36 Q100 28 76 36 Z' },
  { id: 'visor', name: 'Visera', slot: 'hat', g: 'u', d: 'M78 30 Q100 24 122 30 L122 35 Q100 30 78 35 Z M88 33 L136 36 Q130 44 92 40 Z' },

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
  { id: 'tote', name: 'Bolso de playa', slot: 'extra', g: 'u', vb: '120 150 70 90', d: 'M140 190 L178 190 L182 234 L136 234 Z', x: ({ s }) => ln('M146 190 Q159 160 172 190', s, 3) },
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
  const s = shade(c, lum(c) > 0.85 ? 0.72 : 0.62);
  let defs = '', f = c;
  if (item.p && item.p !== 'solid') {
    const id = `pt${RUN}${++uid}`;
    defs = patternDef(id, item.p, c);
    f = `url(#${id})`;
  }
  let body;
  if (g.lens && g.clear) { // cristal transparente: el color es el del marco (blanco = marco oscuro)
    const fr = lum(c) > 0.85 ? '#1b1035' : c;
    body = `<path d="${g.d}" fill="#dff3fb" fill-opacity=".28" stroke="${fr}" stroke-width="2"/>${ln('M98 44 Q100 41 102 44', fr, 2)}${ln('M82 41 L77 40 M118 41 L123 40', fr, 1.6)}`;
  } else if (g.lens) body = `<path d="${g.d}" fill="${c}" fill-opacity=".85" stroke="#1b1035" stroke-width="2"/>${ln('M98 44 Q100 41 102 44', '#1b1035', 2)}`;
  else if (g.stroke) body = `<path d="${g.d}" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`;
  else body = `<path d="${g.d}" fill="${f}" stroke="${s}" stroke-width="1.5" stroke-linejoin="round"/>`;
  if (g.x) body += g.x({ f, s, c });
  if (g.pr) body += printSVG(item);
  return { defs, body: `<g class="${cls}">${body}</g>` };
}

export const garmentById = (id) => GARMENTS.find((x) => x.id === id);
export const slotOf = (g) => g.as || g.slot;

export function thumbSVG(item, vb) { // vb: recorte opcional (acercar a una zona de la prenda)
  const g = garmentById(item.g);
  const { defs, body } = garmentSVG(item);
  return `<svg viewBox="${vb || g.vb || VB[g.slot]}" aria-hidden="true"><defs>${defs}</defs>${body}</svg>`;
}

const ORDER = ['shoes', 'bottom', 'full', 'top', 'extra', 'glasses', 'hat'];
export function figureSVG(outfit = {}, profile = {}, { animate } = {}) {
  const skin = profile.skin || SKINS[1];
  const hair = profile.hair || HAIRS[0];
  const fem = profile.figure === 'f';
  const sk = shade(skin, 0.82);
  let defs = '', clothes = '';
  for (const slot of ORDER) {
    if (!outfit[slot]) continue;
    const r = garmentSVG(outfit[slot], animate === slot ? 'pop' : '');
    defs += r.defs;
    clothes += r.body;
  }
  const hairBack = fem ? `<path d="M76 40 Q74 14 100 14 Q126 14 124 40 L130 104 Q116 110 108 94 L108 62 L92 62 L92 94 Q84 110 70 104 Z" fill="${hair}"/>` : '';
  const hairFront = fem
    ? `<path d="M78 40 Q80 16 100 16 Q122 16 122 40 Q112 24 96 30 Q86 34 78 40Z" fill="${hair}"/>`
    : `<path d="M78 42 Q76 16 100 16 Q124 16 122 42 Q118 28 100 27 Q86 27 78 42Z" fill="${hair}"/>`;
  return `<svg viewBox="0 0 200 420" class="figure" role="img" aria-label="Muñeco con el look del día">
  <defs>${defs}</defs>
  <ellipse cx="100" cy="404" rx="54" ry="8" fill="#1b1035" opacity=".12"/>
  <g class="bob">
  ${hairBack}
  <g fill="${skin}" stroke="${sk}" stroke-width="1.2">
    <path d="M62 226 L100 226 L98 300 L95 390 L77 390 L70 300 Z"/><path d="M100 226 L138 226 L130 300 L123 390 L105 390 L102 300 Z"/>
    <ellipse cx="84" cy="394" rx="12" ry="6"/><ellipse cx="116" cy="394" rx="12" ry="6"/>
    <path d="M66 86 Q52 88 50 104 L42 196 Q40 214 48 216 Q55 217 56 204 L66 118Z"/><path d="M134 86 Q148 88 150 104 L158 196 Q160 214 152 216 Q145 217 144 204 L134 118Z"/>
    <path d="M66 86 Q100 78 134 86 L132 150 Q130 190 138 228 L62 228 Q70 190 68 150 Z"/>
    <path d="M92 58 L92 82 L108 82 L108 58Z"/>
    <ellipse cx="100" cy="44" rx="21" ry="24"/>
  </g>
  <circle cx="92" cy="44" r="2.2" fill="#1b1035"/><circle cx="108" cy="44" r="2.2" fill="#1b1035"/>
  <circle cx="88" cy="52" r="3.5" fill="#ff6f61" opacity=".3"/><circle cx="112" cy="52" r="3.5" fill="#ff6f61" opacity=".3"/>
  <path d="M93 54 Q100 60 107 54" fill="none" stroke="#1b1035" stroke-width="1.6" stroke-linecap="round"/>
  ${fem ? '<path d="M88 40 l-3 -2 M112 40 l3 -2" stroke="#1b1035" stroke-width="1.2"/>' : ''}
  ${hairFront}
  ${clothes}
  </g></svg>`;
}
