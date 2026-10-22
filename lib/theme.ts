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
  display: 'BigShouldersDisplay_800ExtraBold',
  displayBold: 'BigShouldersDisplay_700Bold',
  displaySemi: 'BigShouldersDisplay_600SemiBold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemi: 'Inter_600SemiBold',
  // Cifras. Antes era IBM Plex Mono (letra de máquina); se cambió a Inter para que la app no se vea tan técnica.
  mono: 'Inter_500Medium',
} as const;

