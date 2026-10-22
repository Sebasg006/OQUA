// Capas del muñeco OQUA, todas en un lienzo 500x500. Línea #262626 de 11 px.
const L = 'stroke="#262626" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"';
export const parts = {
  // cuello + cabeza calva + oreja
  base: `
    <path d="M140,372 L136,434 C176,474 258,476 304,458 L302,420" fill="#fff" ${L}/>
    <path d="M150,346 C106,348 66,324 64,288 C62,250 96,226 134,238
             C120,150 170,58 262,55 C352,52 392,120 386,196
             C390,258 404,330 378,374 C350,424 280,440 222,418 C186,404 162,378 150,346 Z" fill="#fff" ${L}/>
    <path d="M92,272 C106,274 118,284 122,298" fill="none" ${L}/>
    <path d="M106,284 L98,304" fill="none" ${L}/>`,
  // pelo de la mascota (patilla y mechones de la nuca)
  hairMascota: `
    <path d="M132,238 C138,226 150,214 162,210 L158,262 C150,272 140,262 136,252 Z" fill="#262626" ${L}/>
    <path d="M142,338 C120,352 92,360 68,366 C86,378 112,378 134,370 Z" fill="#262626" ${L}/>
    <path d="M140,372 C122,386 104,396 94,404 C112,408 130,404 142,396 Z" fill="#262626" ${L}/>`,

  // cara de enojado de la mascota
  enojado: `
    <path d="M212,232 C232,230 262,234 280,238" fill="none" ${L} stroke-width="14"/>
    <path d="M316,242 C334,234 352,228 366,224" fill="none" ${L} stroke-width="14"/>
    <ellipse cx="248" cy="263" rx="9" ry="17" fill="#262626"/>
    <ellipse cx="339" cy="259" rx="9" ry="17" fill="#262626"/>
    <path d="M312,266 C322,282 326,298 298,310" fill="none" ${L}/>
    <path d="M262,356 C282,340 310,336 326,352" fill="none" ${L}/>`,
  // la nariz es igual en todas las caras
  serio: `
    <path d="M214,238 C236,236 262,236 280,238" fill="none" ${L} stroke-width="14"/>
    <path d="M318,236 C336,234 352,232 366,232" fill="none" ${L} stroke-width="14"/>
    <ellipse cx="248" cy="264" rx="9" ry="16" fill="#262626"/>
    <ellipse cx="339" cy="260" rx="9" ry="16" fill="#262626"/>
    <path d="M312,266 C322,282 326,298 298,310" fill="none" ${L}/>
    <path d="M268,350 C284,348 304,348 320,350" fill="none" ${L}/>`,
  feliz: `
    <path d="M214,240 C232,228 262,228 280,236" fill="none" ${L} stroke-width="14"/>
    <path d="M318,234 C332,224 354,224 366,230" fill="none" ${L} stroke-width="14"/>
    <path d="M234,270 C238,252 258,252 262,270" fill="none" ${L}/>
    <path d="M326,266 C330,248 350,248 354,266" fill="none" ${L}/>
    <path d="M312,266 C322,282 326,298 298,310" fill="none" ${L}/>
    <path d="M256,334 C268,378 322,380 336,330 C310,342 282,342 256,334 Z" fill="#262626" ${L}/>
    <path d="M276,360 C288,368 304,368 316,358 C306,352 286,352 276,360 Z" fill="#FF8A8A"/>`,
  sorprendido: `
    <path d="M216,238 C230,224 260,224 276,232" fill="none" ${L} stroke-width="14"/>
    <path d="M320,232 C334,220 354,220 366,226" fill="none" ${L} stroke-width="14"/>
    <circle cx="248" cy="266" r="12" fill="#262626"/><circle cx="252" cy="262" r="3.5" fill="#fff"/>
    <circle cx="339" cy="262" r="12" fill="#262626"/><circle cx="343" cy="258" r="3.5" fill="#fff"/>
    <path d="M312,266 C322,282 326,298 298,310" fill="none" ${L}/>
    <ellipse cx="294" cy="354" rx="14" ry="19" fill="#262626" ${L}/>`,
  // gorra de béisbol con gota (color cambiable)
  gorra: (color = '#82C6FF', dark = false) => `
    <path d="M95,220 C88,128 158,56 262,48 C342,42 384,92 390,156 L392,186
             C362,190 340,198 320,206 C276,224 204,226 150,200 C128,206 110,212 95,220 Z" fill="${color}" ${L}/>
    <path d="M174,76 C150,112 142,158 150,194" fill="none" ${L} stroke="${dark ? '#5a5a5a' : '#262626'}"/>
    <rect x="236" y="28" width="30" height="20" rx="9" fill="#262626"/>
    <path d="M272,74 C262,92 252,108 252,122 C252,135 261,144 272,144 C283,144 292,135 292,122 C292,108 282,92 272,74 Z" fill="${dark ? '#ffffff' : color}" ${L}/>
    <path d="M150,190 C230,160 320,150 392,160 C430,165 456,174 458,186 C460,198 432,208 392,214
             C370,214 350,208 336,203 C280,224 200,224 150,198 Z" fill="${color}" ${L}/>
    <path d="M97,218 C120,214 150,206 162,206 L158,262 C150,270 142,262 138,252 C134,240 118,226 97,218 Z" fill="#262626"/>`,
};
