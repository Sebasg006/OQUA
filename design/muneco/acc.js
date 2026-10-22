import { accPaths } from './accPaths.js';
// Accesorios y ropa calcados de ChatGPT. `back` va antes de la base (detrás de la cabeza), `front` encima.
const fillLines = (fill, lines, color) =>
  (fill ? `<path d="${fill}" fill="${color}" fill-rule="evenodd"/>` : '') + (lines ? `<path d="${lines}" fill="#262626" fill-rule="evenodd"/>` : '');
export const acc = {
  gafas: { front: () => `<path d="${accPaths.gafas.lines}" fill="#262626" fill-rule="evenodd"/>` },
  arete: { front: () => `<path d="${accPaths.arete.fill}" fill="#9A9A9A" stroke="#262626" stroke-width="2" fill-rule="evenodd"/>` },
  audifonos: {
    back: (c = '#82C6FF') => fillLines(accPaths.audifonos.backFill, accPaths.audifonos.backLines, c),
    front: (c = '#82C6FF') => fillLines(accPaths.audifonos.fill, accPaths.audifonos.lines, c),
  },
};
export const ropa = Object.fromEntries(
  ['hoodie', 'camiseta', 'chaqueta'].map((k) => [k, (c = '#82C6FF') => fillLines(accPaths[k].fill, accPaths[k].lines, c)])
);
