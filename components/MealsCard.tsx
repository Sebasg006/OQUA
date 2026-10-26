import Feather from '@expo/vector-icons/Feather';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Meal } from '../lib/comidas';
import { miles, todayLabel } from '../lib/format';
import { router } from '../lib/router';
import { colors, fonts } from '../lib/theme';

const plate = require('../assets/icons3d/plate.png');

const grams = (n: number | null) => (n == null ? null : `${String(Math.round(n * 10) / 10).replace('.', ',')} g`);

// "P 12 g · C 40 g": solo los gramos que se anotaron.
function macrosLine(m: Meal) {
  return [
    ['P', grams(m.protein_g)],
    ['C', grams(m.carbs_g)],
    ['G', grams(m.fat_g)],
  ]
    .filter(([, v]) => v)
    .map(([k, v]) => `${k} ${v}`)
    .join(' · ');
}

// Tarjeta de comidas de hoy en Inicio: lista con lo anotado (se borra con la basura) y botón para anotar otra.
export default function MealsCard({
  day,
  isToday,
  meals,
  loaded,
  error,
  onRemove,
}: {
  day: string;
  isToday: boolean;
  meals: Meal[];
  loaded: boolean;
  error: string | null;
  onRemove: (id: string) => Promise<void>;
}) {
  const [removing, setRemoving] = useState<string | null>(null);

  function confirmRemove(m: Meal) {
    Alert.alert('¿Borrar esta comida?', `${m.name} · ${miles(m.kcal)} kcal`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Borrar',
        style: 'destructive',
        onPress: async () => {
          setRemoving(m.id);
          try {
            await onRemove(m.id);
          } catch (e) {
            Alert.alert('No se pudo borrar', (e as Error).message);
          } finally {
            setRemoving(null);
          }
        },
      },
    ]);
  }

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Image source={plate} style={styles.icon} accessibilityIgnoresInvertColors />
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{isToday ? 'Comidas de hoy' : `Comidas del ${todayLabel(new Date(`${day}T12:00:00`))}`}</Text>
          <Text style={styles.sub}>
            {meals.length === 0 ? 'Aún no has anotado nada' : `${meals.length} ${meals.length === 1 ? 'comida' : 'comidas'}`}
          </Text>
        </View>
      </View>

      {!loaded && <ActivityIndicator color={colors.accent} style={{ marginTop: 16 }} />}
      {loaded && error && meals.length === 0 && <Text style={styles.error}>{error}</Text>}

      {meals.length > 0 && (
        <View style={styles.list}>
          {meals.map((m, i) => {
            const amount = m.grams == null ? null : m.portion ? `${m.portion} · ${grams(m.grams)}` : grams(m.grams);
            const macros = [amount, macrosLine(m)].filter(Boolean).join('\n');
            return (
              <View key={m.id} style={[styles.row, i > 0 && styles.rowDivider]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name} numberOfLines={2}>
                    {m.name}
                  </Text>
                  {!!macros && <Text style={styles.macros}>{macros}</Text>}
                </View>
                <Text style={styles.kcal}>
                  {miles(m.kcal)} <Text style={styles.kcalUnit}>kcal</Text>
                </Text>
                <Pressable
                  onPress={() => confirmRemove(m)}
                  disabled={removing === m.id}
                  style={({ pressed }) => [styles.trash, pressed && { opacity: 0.6 }]}
                  accessibilityRole="button"
                  accessibilityLabel={`Borrar ${m.name}`}
                  hitSlop={6}
                >
                  {removing === m.id ? (
                    <ActivityIndicator size="small" color={colors.dim} />
                  ) : (
                    <Feather name="trash-2" size={17} color={colors.dim} />
                  )}
                </Pressable>
              </View>
            );
          })}
        </View>
      )}

      <Pressable
        onPress={() => router.push(isToday ? '/comida' : { pathname: '/comida', params: { fecha: day } })}
        style={({ pressed }) => [styles.add, pressed && styles.pressed]}
        accessibilityRole="button"
      >
        <Feather name="plus" size={18} color={colors.accentInk} />
        <Text style={styles.addText}>{isToday ? 'Anotar comida' : 'Anotar en este día'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.graphite, borderRadius: 20, padding: 16, marginBottom: 12 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 44, height: 44 },
  title: { color: colors.chalk, fontFamily: fonts.bodySemi, fontSize: 16 },
  sub: { color: colors.dim, fontFamily: fonts.body, fontSize: 13, marginTop: 2 },
  error: { color: colors.dim, fontFamily: fonts.body, fontSize: 13, lineHeight: 18, marginTop: 12 },
  list: { marginTop: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 52, paddingVertical: 8 },
  rowDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.graphite3 },
  name: { color: colors.chalk, fontFamily: fonts.bodyMedium, fontSize: 15 },
  macros: { color: colors.dim, fontFamily: fonts.body, fontSize: 12, marginTop: 2 },
  kcal: { color: colors.chalk, fontFamily: fonts.bodySemi, fontSize: 15 },
  kcalUnit: { color: colors.dim, fontFamily: fonts.body, fontSize: 12 },
  trash: { width: 36, height: 44, alignItems: 'center', justifyContent: 'center', marginRight: -6 },
  add: {
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
  },
  addText: { color: colors.accentInk, fontFamily: fonts.bodySemi, fontSize: 15 },
  pressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },
});
