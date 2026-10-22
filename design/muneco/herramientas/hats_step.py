import numpy as np, json, sys
from PIL import Image
from scipy import ndimage as ndi
import potrace
D, HAIR, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
info = json.load(open(f'{HAIR}/info.json'))
tx0, ty0, tx1, ty1 = info['theirBBox']; ox0, oy0, ox1, oy1 = info['ourBBox']
sx = (ox1 - ox0) / (tx1 - tx0); sy = (oy1 - oy0) / (ty1 - ty0)
T = lambda x, y: (ox0 + (x - tx0) * sx, oy0 + (y - ty0) * sy)
bald_ref = np.load(f'{HAIR}/cell_rapado.npy')   # celda calva de la cuadrícula de peinados (referencia de posición)
bald_head = np.load(f'{HAIR}/bald_head.npy')
im = np.array(Image.open(f'{D}/grid.png').convert('RGB')).astype(int)
r, g, b = im[..., 0], im[..., 1], im[..., 2]
gray = (r + g + b) / 3
H = im.shape[0] // 2
def cells(m): return [m[:H, :H], m[:H, H:2*H], m[H:2*H, :H], m[H:2*H, H:2*H]]
BLK, BLUE, SHADE = cells(gray < 110), cells(b - r > 40), cells((b - r > 40) & (g < 170))
def shift_to(ref, img):
    rr = ref[430:620, :].astype(float); ii = img[430:620, :].astype(float)
    c = np.fft.ifft2(np.fft.fft2(rr) * np.conj(np.fft.fft2(ii))).real
    dy, dx = np.unravel_index(np.argmax(c), c.shape)
    if dy > c.shape[0] // 2: dy -= c.shape[0]
    if dx > c.shape[1] // 2: dx -= c.shape[1]
    return dy, dx
def sh(m, dy, dx): return np.roll(np.roll(m, dy, 0), dx, 1)
def to_path(mask):
    plist = potrace.Bitmap(~mask).trace(turdsize=12, alphamax=1.0, opticurve=True, opttolerance=0.3)
    f = lambda p: '%.1f,%.1f' % T(p.x, p.y) if hasattr(p, 'x') else '%.1f,%.1f' % T(*p)
    d = []
    for curve in plist:
        d.append('M' + f(curve.start_point))
        for seg in curve.segments:
            d.append(('L' + f(seg.c) + ' L' + f(seg.end_point)) if seg.is_corner else ('C' + f(seg.c1) + ' ' + f(seg.c2) + ' ' + f(seg.end_point)))
        d.append('Z')
    return ' '.join(d)
cut = ndi.binary_dilation(bald_head, iterations=5)
names = ['lana', 'bucket', 'gorraAtras', 'bandana']
out = {}
for i, n in enumerate(names):
    dy, dx = shift_to(bald_ref, BLK[i])
    blk, blue, shade = sh(BLK[i], dy, dx), sh(BLUE[i], dy, dx), sh(SHADE[i], dy, dx)
    blue = ndi.binary_closing(blue, iterations=2)
    near = ndi.binary_dilation(blue, iterations=16)
    lines = blk & near & ~cut
    lines |= blk & cut & ndi.binary_dilation(blue, iterations=7)   # bordes del sombrero que caen sobre el contorno de la cabeza
    lines = ndi.binary_closing(lines, iterations=2)
    lab, k = ndi.label(lines)
    if k:
        sizes = ndi.sum(lines, lab, range(1, k + 1))
        lines = np.isin(lab, [j + 1 for j, s_ in enumerate(sizes) if s_ >= 80])
    sil = ndi.binary_fill_holes(blue | lines)
    sil = ndi.binary_closing(sil, iterations=3)
    # zona donde el pelo puede verse: dentro del sombrero o por debajo de su borde inferior
    allowed = np.ones_like(sil)
    cols = np.where(sil.any(0))[0]
    for x in cols:
        bottom = np.where(sil[:, x])[0].max()
        allowed[:bottom - 4, x] = False
    allowed |= sil
    out[n] = {
        'fill': to_path(sil),
        'shade': to_path(shade & sil) if shade.sum() > 50 else '',
        'lines': to_path(lines),
        'hairClip': '' if n == 'bandana' else to_path(allowed),
        'shift': [int(dy), int(dx)],
    }
    print(n, out[n]['shift'], {k: len(v) for k, v in out[n].items() if isinstance(v, str)})
with open(OUT, 'w') as fh:
    fh.write('// Sombreros calcados a vector desde la cuadrícula hecha en ChatGPT (2026-10-22), ajustados al lienzo 500x500 de la base.\n')
    fh.write('// fill: silueta (se pinta del color elegido) · shade: sombra bajo el ala · lines: contorno negro · hairClip: zona donde puede verse el pelo.\n')
    fh.write('export const hatPaths = ' + json.dumps({k: {kk: vv for kk, vv in v.items() if kk != 'shift'} for k, v in out.items()}, indent=2) + ';\n')
