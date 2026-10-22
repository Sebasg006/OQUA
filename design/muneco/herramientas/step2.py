import numpy as np, json, sys
from scipy import ndimage as ndi
import potrace
D = sys.argv[1]; OUT = sys.argv[2]
info = json.load(open(f'{D}/info.json'))
tx0, ty0, tx1, ty1 = info['theirBBox']; ox0, oy0, ox1, oy1 = info['ourBBox']
sx = (ox1 - ox0) / (tx1 - tx0); sy = (oy1 - oy0) / (ty1 - ty0)
def T(p):  # coordenadas de la cuadrícula -> lienzo 500x500 de nuestra base
    return (ox0 + (p[0] - tx0) * sx, oy0 + (p[1] - ty0) * sy)
bald = np.load(f'{D}/bald_head.npy')
cut = ndi.binary_dilation(bald, iterations=5)
def clean(m, min_size):
    lab, k = ndi.label(m)
    if k == 0: return m
    sizes = ndi.sum(m, lab, range(1, k + 1))
    return np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s >= min_size])
def to_path(mask):
    # potracer toma como "tinta" los valores bajos: el pelo va en 0 y el fondo en 1
    bm = potrace.Bitmap(~mask)
    plist = bm.trace(turdsize=12, alphamax=1.0, opticurve=True, opttolerance=0.3)
    f = lambda p: '%.1f,%.1f' % T((p.x, p.y)) if hasattr(p, 'x') else '%.1f,%.1f' % T(p)
    d = []
    for curve in plist:
        d.append('M' + f(curve.start_point))
        for seg in curve.segments:
            if seg.is_corner:
                d.append('L' + f(seg.c) + ' L' + f(seg.end_point))
            else:
                d.append('C' + f(seg.c1) + ' ' + f(seg.c2) + ' ' + f(seg.end_point))
        d.append('Z')
    return ' '.join(d)
result = {}
for n in ['corto', 'rizado', 'largo']:
    c = np.load(f'{D}/cell_{n}.npy')
    hairm = clean(c & ~cut, 60)
    # rellenar la franja donde estaba el contorno de la cabeza, solo donde hay pelo a los dos lados
    hairm = hairm | (cut & ndi.binary_dilation(hairm, iterations=14))
    hairm = ndi.binary_closing(hairm, iterations=3)
    hairm = clean(hairm, 60)
    result[n] = to_path(hairm)
# rapado: solo los puntitos (componentes pequeñas de la celda calva)
c = np.load(f'{D}/cell_rapado.npy')
lab, k = ndi.label(c)
sizes = ndi.sum(c, lab, range(1, k + 1))
dots = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if 3 <= s < 400])
result['rapado'] = to_path(dots)
with open(OUT, 'w') as fh:
    fh.write('// Peinados calcados a vector desde la cuadrícula hecha en ChatGPT (2026-10-22), ya ajustados al lienzo 500x500 de la base.\n')
    fh.write('export const hairPaths = ' + json.dumps(result, indent=2) + ';\n')
print({k: len(v) for k, v in result.items()})
