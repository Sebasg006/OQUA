import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../lib/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Anillo de avance (0 a 1) que se llena con una animación corta al aparecer o al cambiar el valor.
export default function ProgressRing({ progress, size = 104, stroke = 11 }: { progress: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const length = 2 * Math.PI * r;
  const fill = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fill, {
      toValue: Math.min(1, Math.max(0, progress)),
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // strokeDashoffset no se puede animar en el hilo nativo
    }).start();
  }, [progress, fill]);

  return (
    <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
      <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.graphite3} strokeWidth={stroke} fill="none" />
      <AnimatedCircle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={colors.accent}
        strokeWidth={stroke}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={`${length} ${length}`}
        strokeDashoffset={fill.interpolate({ inputRange: [0, 1], outputRange: [length, 0] })}
      />
    </Svg>
  );
}
