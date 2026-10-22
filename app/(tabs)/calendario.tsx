import Feather from '@expo/vector-icons/Feather';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTabBarClearance } from '../../components/FloatingTabBar';
import Glow from '../../components/Glow';
import { aguaDelMes, ML_POR_VASO, metaVasos } from '../../lib/agua';
import { useAuth } from '../../lib/authContext';
import { formatDate, localDateOf, miles } from '../../lib/format';
import { shared } from '../../lib/sharedStyles';
import { colors, fonts } from '../../lib/theme';

const droplet = require('../../assets/icons3d/droplet.png');
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']; // en Colombia la semana empieza el lunes

const pad = (n: number) => String(n).padStart(2, '0');
const isoOf = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;

// Calendario: por ahora muestra el agua de cada día. Calorías y fotos se suman cuando existan.
export default function CalendarioScreen() {
  const { session, profile } = useAuth();
  const tabBarClearance = useTabBarClearance();
  const today = localDateOf(new Date().toISOString());
  const [year, setYear] = useState(() => Number(today.slice(0, 4)));
  const [month, setMonth] = useState(() => Number(today.slice(5, 7)));
  const [selected, setSelected] = useState(today);
  const [agua, setAgua] = useState<Record<string, number>>({});

  // Se vuelve a leer cada vez que se abre la pestaña, para ver los vasos recién sumados en Inicio
  useFocusEffect(
    useCallback(() => {
      if (!session) return;
      let active = true;
      aguaDelMes(session.id, year, month).then((data) => active && setAgua(data));
      return () => {
        active = false;
      };
    }, [session, year, month])
  );

  if (!session || !profile) return null;
  const meta = metaVasos(profile.weight_kg);

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstWeekday = (new Date(year, month - 1, 1).getDay() + 6) % 7; // lunes = 0
  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const isCurrentMonth = isoOf(year, month, 1).slice(0, 7) === today.slice(0, 7);

  function changeMonth(delta: number) {
    const d = new Date(year, month - 1 + delta, 1);
    const first = isoOf(d.getFullYear(), d.getMonth() + 1, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth() + 1);
    // El día marcado sigue al mes: hoy si es el mes actual, si no el día 1
    setSelected(first.slice(0, 7) === today.slice(0, 7) ? today : first);
  }

  const selectedVasos = agua[selected] ?? 0;
  const daysWithGoal = Object.values(agua).filter((v) => v >= meta).length;

  return (
    <SafeAreaView style={shared.screen}>
      <Glow />
      <ScrollView contentContainerStyle={[shared.scrollContent, { paddingBottom: tabBarClearance }]}>
        <Text style={shared.title}>Calendario</Text>

        <View style={styles.card}>
          <View style={styles.monthRow}>
            <Pressable onPress={() => changeMonth(-1)} hitSlop={12} accessibilityRole="button" accessibilityLabel="Mes anterior">
              <Feather name="chevron-left" size={22} color={colors.chalk} />
            </Pressable>
            <Text style={styles.monthLabel}>
              {MONTHS[month - 1]} {year}
            </Text>
            <Pressable
              onPress={() => changeMonth(1)}
              disabled={isCurrentMonth}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Mes siguiente"
              style={isCurrentMonth && { opacity: 0.25 }}
            >
              <Feather name="chevron-right" size={22} color={colors.chalk} />
            </Pressable>
          </View>

          <View style={styles.grid}>
            {WEEKDAYS.map((w, i) => (
              <Text key={i} style={styles.weekday}>
                {w}
              </Text>
            ))}
            {cells.map((day, i) => {
              if (day === null) return <View key={`e${i}`} style={styles.cell} />;
              const iso = isoOf(year, month, day);
              const future = iso > today;
              const vasos = agua[iso] ?? 0;
              const pct = Math.min(1, vasos / meta);
              const done = pct >= 1;
              const isSelected = iso === selected;
              return (
                <Pressable
                  key={iso}
                  style={styles.cell}
                  disabled={future}
                  onPress={() => setSelected(iso)}
                  accessibilityRole="button"
                  accessibilityLabel={`${day} de ${MONTHS[month - 1]}, ${vasos} vasos`}
                >
                  <View
                    style={[
                      styles.day,
                      vasos > 0 && !done && { backgroundColor: `rgba(62,183,255,${0.15 + pct * 0.35})` },
                      done && styles.dayDone,
                      iso === today && styles.dayToday,
                      isSelected && styles.daySelected,
                    ]}
                  >
                    <Text style={[styles.dayText, future && { color: colors.graphite3 }, done && { color: colors.accentInk }]}>{day}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.legend}>
            <View style={[styles.legendDot, { backgroundColor: 'rgba(62,183,255,0.35)' }]} />
            <Text style={styles.legendText}>Algo de agua</Text>
            <View style={[styles.legendDot, { backgroundColor: colors.accent, marginLeft: 14 }]} />
            <Text style={styles.legendText}>Meta cumplida</Text>
          </View>
        </View>

        <Text style={styles.summary}>
          {daysWithGoal === 0
            ? 'Este mes aún no has cumplido tu meta de agua.'
            : `Cumpliste tu meta de agua ${daysWithGoal} ${daysWithGoal === 1 ? 'día' : 'días'} este mes.`}
        </Text>

        <Text style={shared.sectionTitle}>{selected === today ? 'Hoy' : formatDate(selected)}</Text>
        <View style={styles.card}>
          <View style={styles.dayRow}>
            <Image source={droplet} style={styles.dayIcon} accessibilityIgnoresInvertColors />
            <View style={{ flex: 1 }}>
              <Text style={styles.dayTitle}>Agua</Text>
              <Text style={styles.daySub}>
                {selectedVasos === 0 ? 'Sin registro' : `${miles(selectedVasos * ML_POR_VASO)} ml`}
              </Text>
            </View>
            <Text style={[styles.dayCount, selectedVasos >= meta && { color: colors.accent }]}>
              {selectedVasos}
              <Text style={styles.dayCountGoal}> / {meta}</Text>
            </Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${Math.min(1, selectedVasos / meta) * 100}%` }]} />
          </View>
        </View>

        <Text style={styles.soon}>Pronto también verás aquí tus calorías y tus fotos de progreso.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const CELL = `${100 / 7}%` as const;

const styles = StyleSheet.create({
  card: { backgroundColor: colors.graphite, borderRadius: 20, padding: 16 },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  monthLabel: { color: colors.chalk, fontFamily: fonts.bodySemi, fontSize: 16, textTransform: 'capitalize' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  weekday: { width: CELL, textAlign: 'center', color: colors.dim, fontFamily: fonts.bodyMedium, fontSize: 12, marginBottom: 6 },
  cell: { width: CELL, aspectRatio: 1, padding: 3 },
  day: { flex: 1, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  dayDone: { backgroundColor: colors.accent },
  dayToday: { borderWidth: 1.5, borderColor: colors.accent },
  daySelected: { borderWidth: 2, borderColor: colors.chalk },
  dayText: { color: colors.chalk, fontFamily: fonts.bodyMedium, fontSize: 14 },
  legend: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  legendText: { color: colors.dim, fontFamily: fonts.body, fontSize: 12 },
  summary: { color: colors.dim, fontFamily: fonts.body, fontSize: 13, marginTop: 12 },
  dayRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dayIcon: { width: 40, height: 40 },
  dayTitle: { color: colors.chalk, fontFamily: fonts.bodySemi, fontSize: 16 },
  daySub: { color: colors.dim, fontFamily: fonts.body, fontSize: 13, marginTop: 2 },
  dayCount: { color: colors.chalk, fontFamily: fonts.display, fontSize: 30 },
  dayCountGoal: { color: colors.dim, fontFamily: fonts.displaySemi, fontSize: 20 },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.graphite3, overflow: 'hidden', marginTop: 14 },
  fill: { height: 8, borderRadius: 4, backgroundColor: colors.accent },
  soon: { color: colors.dim, fontFamily: fonts.body, fontSize: 12, lineHeight: 17, marginTop: 14, textAlign: 'center' },
});
