# Cómo se calcaron los peinados

1. `fuente/peinados-chatgpt.png`: cuadrícula 2x2 hecha en ChatGPT (corto, rizado, largo, rapado) sobre la misma cabeza.
2. `step1.py <carpeta>`: separa los 4 cuadros, los alinea por el cuello (correlación FFT) y mide la caja de la cabeza calva y la de nuestra base (`our-base.png`, la base renderizada a 500x500).
3. `step2.py <carpeta> hairPaths.js`: saca el pelo (cuadro menos la cabeza calva), rellena la franja del contorno, lo calca con `potracer` y lo lleva al lienzo 500x500 de la base.

Dependencias (en un venv aparte, no en la app): `pillow numpy scipy potracer`.

## Gorros

`fuente/gorros-chatgpt.png` (lana, bucket, gorra hacia atrás, bandana, todos en azul plano). `hats_step.py <carpeta-gorros> <carpeta-peinados> hatPaths.js` separa cada gorro en relleno (se pinta del color elegido), sombra bajo el ala, contorno negro y la zona donde puede verse el pelo (`hairClip`; la bandana no recorta el pelo). Usa la cabeza calva de la cuadrícula de peinados como referencia de posición.

Los gorros de ChatGPT son más grandes que el lienzo 500x500: el muñeco se dibuja con `viewBox="-30 -50 560 560"`. No ofrecer negro como color de gorro (se pierde el contorno).

## Accesorios y ropa

`fuente/accesorios-ropa-chatgpt.png` (3x2: gafas, audífonos, arete / hoodie, camiseta, chaqueta). `acc_step.py <carpeta> accPaths.js`: referencia = la cabeza del arete; escala uniforme por el ancho oreja-cara. Las gafas se centran aparte sobre los ojos del muñeco (248,264 y 339,260). El auricular derecho queda en `backFill`/`backLines` (va detrás de la base). La ropa llega más abajo del lienzo: dibujar con `viewBox="-30 -40 560 600"`.

Orden de capas: detrás (auricular derecho) · base · ropa · pelo · cara · accesorios · gorro.
