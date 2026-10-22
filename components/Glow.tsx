import { useWindowDimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { colors } from '../lib/theme';

const HEIGHT = 420;

// Resplandor dorado difuso detrás del encabezado de una pantalla, para que el fondo no se vea plano.
// Va como primer hijo de la pantalla (queda detrás del contenido) y no recibe toques.
export default function Glow() {
  const { width } = useWindowDimensions();
  return (
    <Svg width={width} height={HEIGHT} style={{ position: 'absolute', top: 0, left: 0 }} pointerEvents="none">
      <Defs>
        <RadialGradient id="glow" cx={width * 0.85} cy={0} rx={width * 0.95} ry={HEIGHT * 0.85} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={colors.accent} stopOpacity={0.3} />
          <Stop offset="0.45" stopColor={colors.accent} stopOpacity={0.1} />
          <Stop offset="1" stopColor={colors.accent} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect width={width} height={HEIGHT} fill="url(#glow)" />
    </Svg>
  );
}
