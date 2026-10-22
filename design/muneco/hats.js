import { hatPaths } from './hatPaths.js';
// Sombreros calcados de ChatGPT: relleno del color elegido + sombra suave + contorno negro.
export function hatLayer(name, color = '#82C6FF') {
  const h = hatPaths[name];
  if (!h) return '';
  return `<path d="${h.fill}" fill="${color}" fill-rule="evenodd"/>` +
    (h.shade ? `<path d="${h.shade}" fill="#000" opacity=".16" fill-rule="evenodd"/>` : '') +
    `<path d="${h.lines}" fill="#262626" fill-rule="evenodd"/>`;
}
// Zona donde puede verse el pelo con cada gorro puesto (la gorra de béisbol está dibujada a mano en parts.js).
export const hatClips = {
  gorra: '<path d="M95,220 C88,128 158,56 262,48 C342,42 384,92 390,156 L392,186 L458,186 L458,214 L95,220 Z"/><rect x="0" y="214" width="500" height="300"/>',
  ...Object.fromEntries(Object.entries(hatPaths).filter(([, v]) => v.hairClip).map(([k, v]) => [k, `<path d="${v.hairClip}" fill-rule="evenodd"/>`])),
};
