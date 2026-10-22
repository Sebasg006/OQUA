import { hairPaths } from './hairPaths.js';
import { hatClips } from './hats.js';
// Capa de pelo. Con un gorro puesto, se recorta a lo que asoma por debajo y por los lados (el gorro tapa el resto).
export function hairLayer(name, hat) {
  const d = hairPaths[name];
  if (!d) return '';
  const path = `<path d="${d}" fill="#262626" fill-rule="evenodd"/>`;
  const clip = hat && hatClips[hat];
  if (!clip) return path;
  const id = `bajo-${hat}`;
  return `<clipPath id="${id}">${clip}</clipPath><g clip-path="url(#${id})">${path}</g>`;
}
