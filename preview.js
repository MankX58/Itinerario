const { figureSVG } = require('./src/wardrobe.js');
const fs = require('fs');
const svg = figureSVG({ figure: 'm', hair: '#1b1035', style: 'curly', skin: '#fbdcc8' });
fs.writeFileSync('preview.svg', svg);
console.log('SVG written');
