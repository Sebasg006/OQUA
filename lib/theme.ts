export const colors = {
  ink: '#0A0A0B',
  graphite: '#1D1D1F',
  graphite2: '#2A2A2D',
  graphite3: '#333336',
  chalk: '#F5F5F7',
  accent: '#3EB7FF', // azul OQUA
  accentInk: '#0A0A0B', // texto sobre el azul (negro: se lee mejor que blanco)
  red: '#C6432E',
  redBg: 'rgba(198,67,46,0.16)',
  redTag: '#FBE4DE',
  green: '#7FBF8E',
  dim: '#86868B',
  tick: '#333336',
  tickMajor: '#3F3F43',
} as const;

export const fonts = {
  // Letras propias de OQUA (2026-10-25): antes eran las de Coatrack (Big Shoulders + Inter). Fredoka es redonda
  // y gruesa como la mascota; Figtree es limpia como Inter pero menos vista. Las dos de Google Fonts (OFL).
  display: 'Fredoka_600SemiBold',
  displayBold: 'Fredoka_700Bold',
  displaySemi: 'Fredoka_500Medium',
  body: 'Figtree_400Regular',
  bodyMedium: 'Figtree_500Medium',
  bodySemi: 'Figtree_600SemiBold',
  // Cifras.
  mono: 'Figtree_500Medium',
} as const;

