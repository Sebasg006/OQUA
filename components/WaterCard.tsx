import Feather from '@expo/vector-icons/Feather';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { MAX_VASOS, ML_POR_VASO, metaVasos, useAguaHoy } from '../lib/agua';
import { miles } from '../lib/format';
import { colors, fonts } from '../lib/theme';

const droplet = require('../assets/icons3d/droplet.png');

// Barrita de un vaso: se llena de izquierda a derecha con un pequeño rebote, y se vacía suave.
function Glass({ full }: { full: boolean }) {
  const fill = useRef(new Animated.Value(full ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(fill, { toValue: full ? 1 : 0, friction: 7, tension: 80, useNativeDriver: true }).start();
  }, [full, fill]);
  return (
    <View style={styles.glass}>
      <Animated.View style={[styles.glassFill, { transform: [{ scaleX: fill }] }]} />
    </View>
  );
}

// Tarjeta de agua del día: vasos tomados contra la meta, con botón para sumar uno y otro para corregir.
export default function WaterCard({ userId, weightKg }: { userId: string; weightKg: number }) {
  const { vasos, agregar, quitar } = useAguaHoy(userId);
  const meta = metaVasos(weightKg);
  const done = vasos >= meta;
  const extra = vasos - meta;
  const atMax = vasos >= MAX_VASOS;

  // Al sumar un vaso, la gota da un saltico y el número late
  const hop = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(1)).current;
  const sumar = () => {
    if (atMax) return;
    agregar();
    hop.setValue(0);
    Animated.sequence([
      Animated.timing(hop, { toValue: 1, duration: 140, useNativeDriver: true }),
      Animated.spring(hop, { toValue: 0, friction: 4, tension: 120, useNativeDriver: true }),
    ]).start();
    pop.setValue(1.25);
    Animated.spring(pop, { toValue: 1, friction: 4, tension: 140, useNativeDriver: true }).start();
  };
  const dropStyle = {
    transform: [
      { translateY: hop.interpolate({ inputRange: [0, 1], outputRange: [0, -8] }) },
      { scale: hop.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }) },
    ],
  };

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Animated.Image source={droplet} style={[styles.icon, dropStyle]} accessibilityIgnoresInvertColors />
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Agua</Text>
          <Text style={styles.sub}>
            {done
              ? `¡Meta cumplida!${extra > 0 ? ` +${extra} extra` : ''}`
              : `${miles(vasos * ML_POR_VASO)} de ${miles(meta * ML_POR_VASO)} ml`}
          </Text>
        </View>
        <Animated.Text style={[styles.count, done && { color: colors.accent }, { transform: [{ scale: pop }] }]}>
          {vasos}
          <Text style={styles.countGoal}> / {meta}</Text>
        </Animated.Text>
      </View>

      <View style={styles.glasses} accessibilityLabel={`${vasos} de ${meta} vasos`}>
        {Array.from({ length: meta }, (_, i) => (
          <Glass key={i} full={i < vasos} />
        ))}
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={quitar}
          disabled={vasos === 0}
          style={({ pressed }) => [styles.minus, vasos === 0 && { opacity: 0.35 }, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Quitar un vaso"
        >
          <Feather name="minus" size={20} color={colors.chalk} />
        </Pressable>
        <Pressable
          onPress={sumar}
          disabled={atMax}
          style={({ pressed }) => [styles.add, atMax && styles.addDisabled, pressed && styles.pressed]}
          accessibilityRole="button"
        >
          {!atMax && <Feather name="plus" size={18} color={colors.accentInk} />}
          <Text style={[styles.addText, atMax && { color: colors.dim }]}>{atMax ? 'Máximo del día' : '1 vaso'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.graphite, borderRadius: 20, padding: 16, marginBottom: 12 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 44, height: 44 },
  title: { color: colors.chalk, fontFamily: fonts.bodySemi, fontSize: 16 },
  sub: { color: colors.dim, fontFamily: fonts.body, fontSize: 13, marginTop: 2 },
  count: { color: colors.chalk, fontFamily: fonts.display, fontSize: 34 },
  countGoal: { color: colors.dim, fontFamily: fonts.displaySemi, fontSize: 22 },
  glasses: { flexDirection: 'row', gap: 6, marginTop: 16 },
  glass: { flex: 1, height: 10, borderRadius: 5, backgroundColor: colors.graphite3, overflow: 'hidden' },
  glassFill: { flex: 1, borderRadius: 5, backgroundColor: colors.accent, transformOrigin: 'left' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  minus: {
    width: 52,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.graphite2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  add: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addDisabled: { backgroundColor: colors.graphite2 },
  addText: { color: colors.accentInk, fontFamily: fonts.bodySemi, fontSize: 15 },
  pressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },
});
