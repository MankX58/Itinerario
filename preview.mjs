import { figureSVG } from './src/wardrobe.js';
import { writeFileSync } from 'fs';
const svg = figureSVG({ figure: 'm', hair: '#1b1035', style: 'curly', skin: '#fbdcc8' });
writeFileSync('preview.svg', svg);
console.log('SVG written');
