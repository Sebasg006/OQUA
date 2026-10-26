import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts } from '../lib/theme';

const fire = require('../assets/icons3d/fire.png');

// Pastilla de la racha junto al saludo (como Fitia): fuego + número. El fuego está gris mientras hoy no cuenta
// y da un saltico cuando hoy empieza a contar. Al tocarla vuelve a bajar la notificación con el detalle.
export default function StreakCard({ dias, hoyCumplido, onPress }: { dias: number; hoyCumplido: boolean; onPress: () => void }) {
  const pop = useRef(new Animated.Value(1)).current;
  const prev = useRef(hoyCumplido);
  useEffect(() => {
    if (hoyCumplido && !prev.current) {
      pop.setValue(1.35);
      Animated.spring(pop, { toValue: 1, friction: 4, tension: 140, useNativeDriver: true }).start();
    }
    prev.current = hoyCumplido;
  }, [hoyCumplido, pop]);

  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.pill, hoyCumplido && styles.pillOn, pressed && { opacity: 0.75 }]}
      accessibilityRole="button"
      accessibilityLabel={`Racha de ${dias} ${dias === 1 ? 'día' : 'días'}`}
    >
      <Animated.Image
        source={fire}
        style={[styles.icon, !hoyCumplido && styles.iconOff, { transform: [{ scale: pop }] }]}
        accessibilityIgnoresInvertColors
      />
      <Text style={[styles.count, hoyCumplido && { color: colors.chalk }]}>{dias}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 40,
    paddingLeft: 8,
    paddingRight: 12,
    borderRadius: 20,
    backgroundColor: colors.graphite,
    borderWidth: 1,
    borderColor: colors.graphite3,
  },
  pillOn: { borderColor: 'rgba(255,150,50,0.45)' },
  icon: { width: 26, height: 26 },
  iconOff: { opacity: 0.35 },
  count: { color: colors.dim, fontFamily: fonts.display, fontSize: 22, lineHeight: 26 },
});
