// node tests/wardrobe.test.mjs — verifica que todas las prendas generen trazos SVG válidos y simétricos
import assert from 'node:assert';
import { GARMENTS, figureSVG, thumbSVG, DESIGNS } from '../src/wardrobe.js';

for (const g of GARMENTS) {
  assert.ok(!/NaN|undefined|Q[A-Za-z]/.test(g.d), `trazo inválido en ${g.id}`);
  for (const [d] of DESIGNS) assert.ok(!thumbSVG({ g: g.id, c: '#ffffff', p: 'faded', d, t: '<b>x</b>' }).includes('<b>'), `texto sin escapar en ${g.id}`);
}
const tee = GARMENTS.find((g) => g.id === 'tee').d;
const xs = [...tee.matchAll(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g)].map((m) => +m[1]);
assert.equal(Math.min(...xs) + Math.max(...xs), 200, 'la camiseta debe ser simétrica respecto a x=100');
assert.ok(figureSVG({ top: { g: 'boxy', c: '#000000', d: 'big', t: 'RIO' } }).includes('RIO'));
console.log(`ok · ${GARMENTS.length} prendas`);
