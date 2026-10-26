import Feather from '@expo/vector-icons/Feather';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { localDateOf } from '../lib/format';
import { colors, fonts } from '../lib/theme';

const fire = require('../assets/icons3d/fire.png');
const LETTERS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']; // en Colombia la semana empieza el lunes
const MAX_WEEKS_BACK = 52;

const isoOf = (d: Date) => localDateOf(d.toISOString());
const addDays = (iso: string, n: number) => {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + n);
  return isoOf(d);
};
const mondayOf = (iso: string) => {
  const d = new Date(`${iso}T12:00:00`);
  return addDays(iso, -((d.getDay() + 6) % 7));
};

// Semana en Inicio: tocar un día muestra lo que se comió y deja anotar lo que se olvidó. El fuego marca los días
// que contaron para la racha. Flechas para semanas anteriores; no se puede ir al futuro.
export default function WeekStrip({
  today,
  selected,
  onSelect,
  cuenta,
}: {
  today: string;
  selected: string;
  onSelect: (day: string) => void;
  cuenta: (day: string) => boolean;
}) {
  const thisMonday = mondayOf(today);
  const [monday, setMonday] = useState(() => mondayOf(selected));
  const weeksBack = Math.round((new Date(`${thisMonday}T12:00:00`).getTime() - new Date(`${monday}T12:00:00`).getTime()) / (7 * 864e5));
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => setMonday(addDays(monday, -7))}
        disabled={weeksBack >= MAX_WEEKS_BACK}
        hitSlop={6}
        style={({ pressed }) => [styles.arrow, pressed && { opacity: 0.6 }]}
        accessibilityRole="button"
        accessibilityLabel="Semana anterior"
      >
        <Feather name="chevron-left" size={18} color={colors.dim} />
      </Pressable>

      {days.map((day, i) => {
        const future = day > today;
        const isSelected = day === selected;
        const counted = !future && cuenta(day);
        return (
          <Pressable
            key={day}
            onPress={() => onSelect(day)}
            disabled={future}
            style={({ pressed }) => [styles.day, isSelected && styles.daySelected, future && { opacity: 0.3 }, pressed && { opacity: 0.7 }]}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected, disabled: future }}
            accessibilityLabel={`${day === today ? 'Hoy' : day}${counted ? ', contó para la racha' : ''}`}
          >
            <Text style={[styles.letter, isSelected && styles.textSelected]}>{LETTERS[i]}</Text>
            <Text style={[styles.number, isSelected && styles.textSelected, day === today && !isSelected && { color: colors.accent }]}>
              {Number(day.slice(8))}
            </Text>
            {counted ? <Image source={fire} style={styles.fire} /> : <View style={styles.fireSpace} />}
          </Pressable>
        );
      })}

      <Pressable
        onPress={() => setMonday(addDays(monday, 7))}
        disabled={monday >= thisMonday}
        hitSlop={6}
        style={({ pressed }) => [styles.arrow, monday >= thisMonday && { opacity: 0.25 }, pressed && { opacity: 0.6 }]}
        accessibilityRole="button"
        accessibilityLabel="Semana siguiente"
      >
        <Feather name="chevron-right" size={18} color={colors.dim} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.graphite, borderRadius: 18, paddingVertical: 6, marginBottom: 8 },
  arrow: { width: 26, height: 56, alignItems: 'center', justifyContent: 'center' },
  day: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 64, borderRadius: 14, gap: 2 },
  daySelected: { backgroundColor: colors.accent },
  letter: { color: colors.dim, fontFamily: fonts.bodyMedium, fontSize: 11 },
  number: { color: colors.chalk, fontFamily: fonts.bodySemi, fontSize: 16 },
  textSelected: { color: colors.accentInk },
  fire: { width: 14, height: 14 },
  fireSpace: { width: 14, height: 14 },
});
