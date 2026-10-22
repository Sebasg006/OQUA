import { ACC_PATHS } from './accesorios.data';
import { GORRO_PATHS } from './gorros.data';
import { PELO_PATHS } from './pelo.data';

// Capas del muñeco OQUA (lienzo 500x500 de la base; gorros y ropa se salen un poco, por eso el viewBox es más grande).
// Base, caras y gorra con gota: dibujadas a mano calcando la mascota. Pelo, gorros, accesorios y ropa: calcados de ChatGPT.
// Fuente y herramientas en design/muneco/.

const INK = '#262626';
// Trazo negro redondeado. Cada capa lo arma con su grosor para no repetir atributos (el lector de SVG del teléfono es estricto).
const L = (w = 13, color = INK) => `stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
const NARIZ = `<path d="M312,266 C322,282 326,298 298,310" fill="none" ${L()}/>`;

export const VIEWBOX = '-30 -45 560 560';

export const BASE = `
  <path d="M140,372 L136,434 C176,474 258,476 304,458 L302,420" fill="#fff" ${L()}/>
  <path d="M150,346 C106,348 66,324 64,288 C62,250 96,226 134,238 C120,150 170,58 262,55 C352,52 392,120 386,196 C390,258 404,330 378,374 C350,424 280,440 222,418 C186,404 162,378 150,346 Z" fill="#fff" ${L()}/>
  <path d="M92,272 C106,274 118,284 122,298" fill="none" ${L()}/>
  <path d="M106,284 L98,304" fill="none" ${L()}/>`;

export const CARAS = {
  feliz: `
    <path d="M214,240 C232,228 262,228 280,236" fill="none" ${L(14)}/>
    <path d="M318,234 C332,224 354,224 366,230" fill="none" ${L(14)}/>
    <path d="M234,270 C238,252 258,252 262,270" fill="none" ${L()}/>
    <path d="M326,266 C330,248 350,248 354,266" fill="none" ${L()}/>
    ${NARIZ}
    <path d="M256,334 C268,378 322,380 336,330 C310,342 282,342 256,334 Z" fill="${INK}" ${L()}/>
    <path d="M276,360 C288,368 304,368 316,358 C306,352 286,352 276,360 Z" fill="#FF8A8A"/>`,
  serio: `
    <path d="M214,238 C236,236 262,236 280,238" fill="none" ${L(14)}/>
    <path d="M318,236 C336,234 352,232 366,232" fill="none" ${L(14)}/>
    <ellipse cx="248" cy="264" rx="9" ry="16" fill="${INK}"/>
    <ellipse cx="339" cy="260" rx="9" ry="16" fill="${INK}"/>
    ${NARIZ}
    <path d="M268,350 C284,348 304,348 320,350" fill="none" ${L()}/>`,
  enojado: `
    <path d="M212,232 C232,230 262,234 280,238" fill="none" ${L(14)}/>
    <path d="M316,242 C334,234 352,228 366,224" fill="none" ${L(14)}/>
    <ellipse cx="248" cy="263" rx="9" ry="17" fill="${INK}"/>
    <ellipse cx="339" cy="259" rx="9" ry="17" fill="${INK}"/>
    ${NARIZ}
    <path d="M262,356 C282,340 310,336 326,352" fill="none" ${L()}/>`,
  sorprendido: `
    <path d="M216,238 C230,224 260,224 276,232" fill="none" ${L(14)}/>
    <path d="M320,232 C334,220 354,220 366,226" fill="none" ${L(14)}/>
    <circle cx="248" cy="266" r="12" fill="${INK}"/><circle cx="252" cy="262" r="3.5" fill="#fff"/>
    <circle cx="339" cy="262" r="12" fill="${INK}"/><circle cx="343" cy="258" r="3.5" fill="#fff"/>
    ${NARIZ}
    <ellipse cx="294" cy="354" rx="14" ry="19" fill="${INK}" ${L()}/>`,
};

// Gorra de béisbol con gota (la de la mascota), dibujada a mano
const gorraConGota = (color: string) => `
  <path d="M95,220 C88,128 158,56 262,48 C342,42 384,92 390,156 L392,186 C362,190 340,198 320,206 C276,224 204,226 150,200 C128,206 110,212 95,220 Z" fill="${color}" ${L()}/>
  <path d="M174,76 C150,112 142,158 150,194" fill="none" ${L()}/>
  <rect x="236" y="28" width="30" height="20" rx="9" fill="${INK}"/>
  <path d="M272,74 C262,92 252,108 252,122 C252,135 261,144 272,144 C283,144 292,135 292,122 C292,108 282,92 272,74 Z" fill="${color}" ${L()}/>
  <path d="M150,190 C230,160 320,150 392,160 C430,165 456,174 458,186 C460,198 432,208 392,214 C370,214 350,208 336,203 C280,224 200,224 150,198 Z" fill="${color}" ${L()}/>
  <path d="M97,218 C120,214 150,206 162,206 L158,262 C150,270 142,262 138,252 C134,240 118,226 97,218 Z" fill="${INK}"/>`;

export type Gorro = 'gorra' | keyof typeof GORRO_PATHS;
export type Pelo = keyof typeof PELO_PATHS;
export type Cara = keyof typeof CARAS;
export type Accesorio = 'gafas' | 'audifonos' | 'arete';
export type Ropa = 'hoodie' | 'camiseta' | 'chaqueta';

function gorroSvg(g: Gorro, color: string) {
  if (g === 'gorra') return gorraConGota(color);
  const h = GORRO_PATHS[g];
  return (
    `<path d="${h.fill}" fill="${color}" fill-rule="evenodd"/>` +
    (h.shade ? `<path d="${h.shade}" fill="#000" fill-opacity="0.16" fill-rule="evenodd"/>` : '') +
    `<path d="${h.lines}" fill="${INK}" fill-rule="evenodd"/>`
  );
}

// Zona donde puede verse el pelo con cada gorro (lo que asoma por debajo y por los lados). La bandana no recorta.
function zonaPelo(g: Gorro): string | null {
  if (g === 'gorra') {
    return '<path d="M95,220 C88,128 158,56 262,48 C342,42 384,92 390,156 L392,186 L458,186 L458,214 L95,220 Z"/><rect x="-30" y="214" width="560" height="400"/>';
  }
  const clip = GORRO_PATHS[g].hairClip;
  return clip ? `<path d="${clip}"/>` : null;
}

function peloSvg(p: Pelo, gorro: Gorro | null) {
  const path = `<path d="${PELO_PATHS[p]}" fill="${INK}" fill-rule="evenodd"/>`;
  const zona = gorro && zonaPelo(gorro);
  if (!zona) return path;
  return `<defs><clipPath id="zonaPelo">${zona}</clipPath></defs><g clip-path="url(#zonaPelo)">${path}</g>`;
}

const rellenoYLineas = (fill: string, lines: string, color: string) =>
  `<path d="${fill}" fill="${color}" fill-rule="evenodd"/><path d="${lines}" fill="${INK}" fill-rule="evenodd"/>`;

export type Capas = {
  gorro: Gorro | null;
  gorroColor: string;
  pelo: Pelo;
  cara: Cara;
  accesorio: Accesorio | null;
  accesorioColor: string;
  ropa: Ropa | null;
  ropaColor: string;
};

// SVG completo del muñeco. Orden: detrás (auricular derecho) · base · ropa · pelo · cara · accesorio · gorro.
export function armarSvg(m: Capas) {
  const a = ACC_PATHS;
  const capas = [
    m.accesorio === 'audifonos' ? rellenoYLineas(a.audifonos.backFill, a.audifonos.backLines, m.accesorioColor) : '',
    BASE,
    m.ropa ? rellenoYLineas(a[m.ropa].fill, a[m.ropa].lines, m.ropaColor) : '',
    peloSvg(m.pelo, m.gorro),
    CARAS[m.cara],
    m.accesorio === 'gafas' ? `<path d="${a.gafas.lines}" fill="${INK}" fill-rule="evenodd"/>` : '',
    m.accesorio === 'audifonos' ? rellenoYLineas(a.audifonos.fill, a.audifonos.lines, m.accesorioColor) : '',
    m.accesorio === 'arete' ? `<path d="${a.arete.fill}" fill="#9A9A9A" fill-rule="evenodd" stroke="${INK}" stroke-width="2"/>` : '',
    m.gorro ? gorroSvg(m.gorro, m.gorroColor) : '',
  ];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX}">${capas.join('')}</svg>`;
}
