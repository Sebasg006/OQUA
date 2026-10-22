import numpy as np, json, sys
from PIL import Image
from scipy import ndimage as ndi
import potrace
D, OUT = sys.argv[1], sys.argv[2]
im = np.array(Image.open(f'{D}/grid.png').convert('RGB')).astype(int)
r, g, b = im[..., 0], im[..., 1], im[..., 2]
gray = (r + g + b) / 3
W = im.shape[1] // 3; H = im.shape[0] // 2
def cell(m, i): rr, cc = divmod(i, 3); return m[rr*H:(rr+1)*H, cc*W:(cc+1)*W]
BLK = gray < 110
BLUE = (b - r > 40)
GREY = (gray > 90) & (gray < 210) & (np.abs(r - b) < 25) & (np.abs(r - g) < 25)
# referencia: la cabeza del arete (cuadro 3), sin el arete
ref = cell(BLK, 2).copy()
# medidas de la cabeza de referencia -> lienzo 500x500 de nuestra base (escala uniforme)
ys, xs = np.nonzero(ref)
top = ys.min(); left = xs[ys < top + 300].min(); right = xs[ys < top + 260].max()
OUR_LEFT, OUR_TOP, OUR_RIGHT = 58, 49, 399
s = (OUR_RIGHT - OUR_LEFT) / (right - left)
T = lambda x, y: (OUR_LEFT + (x - left) * s, OUR_TOP + (y - top) * s)
def shift_to(a, bimg):
    # alinear por la cabeza (oreja y contorno de la cara), filas de la parte media
    y0, y1 = top + 60, top + 260
    ra = a[y0:y1].astype(float); rb = bimg[y0:y1].astype(float)
    best = (0, 0, -1)
    for dy in range(-80, 81, 1):
        sb = np.roll(bimg, dy, 0)[y0:y1].astype(float)
        c = np.fft.ifft2(np.fft.fft2(ra) * np.conj(np.fft.fft2(sb))).real
        dx = int(np.argmax(c.max(0))); sc = c.max()
        if dx > c.shape[1] // 2: dx -= c.shape[1]
        if sc > best[2]: best = (dy, dx, sc)
    return best[0], best[1]
def sh(m, dy, dx): return np.roll(np.roll(m, dy, 0), dx, 1)
def to_path(mask, TT=None):
    TT = TT or T
    plist = potrace.Bitmap(~mask).trace(turdsize=8, alphamax=1.0, opticurve=True, opttolerance=0.3)
    f = lambda p: '%.1f,%.1f' % TT(p.x, p.y) if hasattr(p, 'x') else '%.1f,%.1f' % TT(*p)
    d = []
    for curve in plist:
        d.append('M' + f(curve.start_point))
        for seg in curve.segments:
            d.append(('L' + f(seg.c) + ' L' + f(seg.end_point)) if seg.is_corner else ('C' + f(seg.c1) + ' ' + f(seg.c2) + ' ' + f(seg.end_point)))
        d.append('Z')
    return ' '.join(d)
def clean(m, n):
    lab, k = ndi.label(m)
    if not k: return m
    sz = ndi.sum(m, lab, range(1, k + 1))
    return np.isin(lab, [j + 1 for j, v in enumerate(sz) if v >= n])
cut = ndi.binary_dilation(ref, iterations=5)
out = {}
names = ['gafas', 'audifonos', 'arete', 'hoodie', 'camiseta', 'chaqueta']
for i, n in enumerate(names):
    blk, blue, grey = cell(BLK, i), cell(BLUE, i), cell(GREY, i)
    dy, dx = (0, 0) if i == 2 else shift_to(ref, blk)
    blk, blue, grey = sh(blk, dy, dx), sh(blue, dy, dx), sh(grey, dy, dx)
    if n == 'gafas':
        m = clean(blk & ~cut, 40)
        m |= blk & cut & ndi.binary_dilation(m, iterations=6)
        m = clean(ndi.binary_closing(m, iterations=2), 40)
        # centrar cada lente sobre un ojo de nuestro muñeco (ojos en 248,264 y 339,260)
        lab, k = ndi.label(m)
        sz = ndi.sum(m, lab, range(1, k + 1))
        big = sorted(range(k), key=lambda j: -sz[j])[:2]
        cs = sorted([ndi.center_of_mass(m, lab, j + 1)[::-1] for j in big])  # (x, y), izquierda primero
        (c1x, c1y), (c2x, c2y) = cs
        E1, E2 = (248, 264), (339, 260)
        gs = (E2[0] - E1[0]) / (c2x - c1x)
        gx = E1[0] - c1x * gs
        gy = ((E1[1] - c1y * gs) + (E2[1] - c2y * gs)) / 2
        out[n] = {'lines': to_path(m, lambda x, y: (gx + x * gs, gy + y * gs)), 'shift': [dy, dx]}
        print('gafas escala', round(gs / s, 2))
    elif n == 'arete':
        ring = clean(grey & ndi.binary_dilation(clean(grey, 30), iterations=3), 20)
        out[n] = {'fill': to_path(ndi.binary_dilation(ring, iterations=1)), 'shift': [dy, dx]}
    else:
        blue = ndi.binary_closing(blue, iterations=2)
        lines = blk & ndi.binary_dilation(blue, iterations=14) & ~cut
        lines |= blk & cut & ndi.binary_dilation(blue, iterations=7)
        lines = clean(ndi.binary_closing(lines, iterations=2), 60)
        sil = ndi.binary_closing(ndi.binary_fill_holes(blue | lines), iterations=3)
        entry = {'shift': [dy, dx]}
        if n == 'audifonos':
            # el auricular derecho (componente a la derecha de la cara) va detrás de la cabeza
            lab, k = ndi.label(sil)
            back = np.zeros_like(sil)
            for j in range(1, k + 1):
                comp = lab == j
                if comp.sum() > 200 and np.nonzero(comp)[1].mean() > right - 40: back |= comp
            front = sil & ~back
            entry.update({'fill': to_path(front), 'lines': to_path(lines & front),
                          'backFill': to_path(back), 'backLines': to_path(lines & back)})
        else:
            entry.update({'fill': to_path(sil), 'lines': to_path(lines)})
        out[n] = entry
    print(n, out[n]['shift'], {k: len(v) for k, v in out[n].items() if isinstance(v, str)})
with open(OUT, 'w') as fh:
    fh.write('// Accesorios y ropa calcados a vector desde la cuadrícula hecha en ChatGPT (2026-10-22), ajustados al lienzo de la base.\n')
    fh.write('// fill: se pinta del color elegido (audífonos y ropa) · lines: contorno negro · back*: va detrás de la cabeza.\n')
    fh.write('export const accPaths = ' + json.dumps({k: {kk: vv for kk, vv in v.items() if kk != 'shift'} for k, v in out.items()}, indent=2) + ';\n')
