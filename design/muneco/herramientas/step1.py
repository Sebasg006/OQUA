import numpy as np
from PIL import Image
from scipy import ndimage as ndi
import sys, json
D = sys.argv[1]
g = np.array(Image.open(f'{D}/grid.png').convert('L')).astype(float)
blk = g < 128
H = blk.shape[0] // 2
cells = [blk[:H, :H], blk[:H, H:2*H], blk[H:2*H, :H], blk[H:2*H, H:2*H]]
names = ['corto', 'rizado', 'largo', 'rapado']
# Alinear por traslación usando la parte baja (cuello y mentón), igual en todos
def shift_to(ref, img):
    # correlación por FFT sobre la franja del cuello (filas 430-620)
    r = ref[430:620, :].astype(float); i = img[430:620, :].astype(float)
    F = np.fft.fft2(r) * np.conj(np.fft.fft2(i))
    c = np.fft.ifft2(F).real
    dy, dx = np.unravel_index(np.argmax(c), c.shape)
    if dy > c.shape[0] // 2: dy -= c.shape[0]
    if dx > c.shape[1] // 2: dx -= c.shape[1]
    return dy, dx
ref = cells[3]
info = {}
for n, c in zip(names, cells):
    dy, dx = shift_to(ref, c)
    info[n] = [int(dy), int(dx)]
    np.save(f'{D}/cell_{n}.npy', np.roll(np.roll(c, dy, 0), dx, 1))
# bbox de la cabeza calva (sin los puntitos del rapado)
lab, k = ndi.label(ref)
sizes = ndi.sum(ref, lab, range(1, k + 1))
head = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s > 400])
ys, xs = np.nonzero(head)
info['theirBBox'] = [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())]
np.save(f'{D}/bald_head.npy', head)
ob = np.array(Image.open(f'{D}/our-base.png').convert('L')) < 128
ys, xs = np.nonzero(ob)
info['ourBBox'] = [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())]
print(json.dumps(info))
json.dump(info, open(f'{D}/info.json', 'w'))
