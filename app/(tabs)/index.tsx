import Feather from '@expo/vector-icons/Feather';
import { useFocusEffect } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Glow from '../../components/Glow';
import HeaderEyebrow from '../../components/HeaderEyebrow';
import ProgressRing from '../../components/ProgressRing';
import WaterCard from '../../components/WaterCard';
import MunecoView from '../../components/MunecoView';
import { useMuneco } from '../../lib/muneco';
import { useTabBarClearance } from '../../components/FloatingTabBar';
import { useAuth } from '../../lib/authContext';
import { ACTIVIDAD, meta } from '../../lib/calorias';
import { miles, todayLabel } from '../../lib/format';
import { router } from '../../lib/router';
import { shared } from '../../lib/sharedStyles';
import { colors, fonts } from '../../lib/theme';

const RING = 220;

// Hoy: cuánto queda del día. Por ahora no se anotan comidas (siguiente paso), así que lo comido es 0.
export default function HoyScreen() {
  const { session, profile } = useAuth();
  const tabBarClearance = useTabBarClearance();
  const { muneco, saved: munecoSaved, loaded: munecoLoaded, reload: reloadMuneco } = useMuneco(session?.id);
  useFocusEffect(reloadMuneco);
  if (!profile) return null;
  const m = meta(profile);
  const eaten = { kcal: 0, proteina: 0, carbos: 0, grasa: 0 };
  const left = m.kcal - eaten.kcal;
  const firstName = session?.name.split(' ')[0] ?? '';

  return (
    <SafeAreaView style={shared.screen}>
      <Glow />
      <ScrollView contentContainerStyle={[shared.scrollContent, { paddingBottom: tabBarClearance }]}>
        <HeaderEyebrow text={todayLabel()} />
        <Text style={shared.title}>
          Hola, <Text style={{ color: colors.accent }}>{firstName}</Text>
        </Text>

        {munecoLoaded && !munecoSaved && (
          <Pressable
            style={({ pressed }) => [styles.munecoCard, pressed && { opacity: 0.85 }]}
            onPress={() => router.push('/muneco')}
            accessibilityRole="button"
          >
            <MunecoView muneco={muneco} size={56} />
            <View style={{ flex: 1 }}>
              <Text style={styles.munecoTitle}>Crea tu muñeco</Text>
              <Text style={styles.munecoText}>Elige su pelo, su cara y sus gafas.</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.accent} />
          </Pressable>
        )}

        <View style={styles.ringWrap}>
          <ProgressRing progress={eaten.kcal / m.kcal} size={RING} stroke={16} />
          <View style={styles.ringCenter} pointerEvents="none">
            <Text style={styles.ringValue}>{miles(Math.max(0, left))}</Text>
            <Text style={styles.ringLabel}>kcal te quedan</Text>
          </View>
        </View>

        <View style={styles.totals}>
          <Total label="Meta" value={miles(m.kcal)} />
          <View style={styles.totalsDivider} />
          <Total label="Comido" value={miles(eaten.kcal)} />
        </View>

        {session && <WaterCard userId={session.id} weightKg={profile.weight_kg} />}

        <View style={styles.card}>
          <Macro label="Proteína" eaten={eaten.proteina} goal={m.proteina} />
          <Macro label="Carbohidratos" eaten={eaten.carbos} goal={m.carbos} />
          <Macro label="Grasa" eaten={eaten.grasa} goal={m.grasa} last />
        </View>

        <Text style={shared.sectionTitle}>Cómo se calcula tu meta</Text>
        <View style={styles.card}>
          <Line label="Gastas en reposo" value={`${miles(m.basal)} kcal`} />
          <Line label={`Con tu actividad (${ACTIVIDAD[profile.activity_level].label.toLowerCase()})`} value={`${miles(m.gasto)} kcal`} />
          <Line
            label={profile.deficit_pct > 0 ? `Menos ${profile.deficit_pct} % para bajar` : 'Sin déficit (mantener)'}
            value={`${miles(m.kcal)} kcal`}
            strong
          />
          {profile.deficit_pct > 0 && (
            <Text style={styles.note}>Unos {m.kgPorSemana.toFixed(1).replace('.', ',')} kg menos por semana si la cumples.</Text>
          )}
          {m.conPiso && <Text style={[styles.note, { color: colors.accent }]}>Tu meta quedó en el mínimo recomendado sin acompañamiento médico.</Text>}
        </View>

        <Pressable
          style={({ pressed }) => [styles.editRow, pressed && { opacity: 0.75 }]}
          onPress={() => router.push('/perfil')}
          accessibilityRole="button"
        >
          <Feather name="sliders" size={18} color={colors.dim} />
          <Text style={styles.editText}>Cambiar mis datos o mi ritmo</Text>
          <Feather name="chevron-right" size={18} color={colors.dim} />
        </Pressable>

        <Text style={styles.disclaimer}>Es una estimación con fórmulas de uso general. No reemplaza la consulta con un nutricionista o médico.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Total({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.total}>
      <Text style={styles.totalValue}>{value}</Text>
      <Text style={styles.totalLabel}>{label}</Text>
    </View>
  );
}

function Macro({ label, eaten, goal, last }: { label: string; eaten: number; goal: number; last?: boolean }) {
  const pct = goal > 0 ? Math.min(1, eaten / goal) : 0;
  return (
    <View style={[styles.macro, !last && { marginBottom: 14 }]}>
      <View style={styles.macroHead}>
        <Text style={styles.macroLabel}>{label}</Text>
        <Text style={styles.macroValue}>
          {eaten} <Text style={{ color: colors.dim }}>/ {goal} g</Text>
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct * 100}%` }]} />
      </View>
    </View>
  );
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.line}>
      <Text style={[styles.lineLabel, strong && { color: colors.chalk }]}>{label}</Text>
      <Text style={[styles.lineValue, strong && { color: colors.accent }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  munecoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.graphite,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(62,183,255,0.3)',
    marginBottom: 8,
  },
  munecoTitle: { color: colors.chalk, fontFamily: fonts.bodySemi, fontSize: 16 },
  munecoText: { color: colors.dim, fontFamily: fonts.body, fontSize: 13, marginTop: 2 },
  ringWrap: { alignSelf: 'center', width: RING, height: RING, marginTop: 8 },
  ringCenter: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center' },
  ringValue: { color: colors.chalk, fontFamily: fonts.display, fontSize: 56, lineHeight: 62 },
  ringLabel: { color: colors.dim, fontFamily: fonts.body, fontSize: 14 },
  totals: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16, marginBottom: 20 },
  totalsDivider: { width: StyleSheet.hairlineWidth, height: 32, backgroundColor: colors.graphite3, marginHorizontal: 28 },
  total: { alignItems: 'center' },
  totalValue: { color: colors.chalk, fontFamily: fonts.bodySemi, fontSize: 18 },
  totalLabel: { color: colors.dim, fontFamily: fonts.body, fontSize: 12, marginTop: 2 },
  card: { backgroundColor: colors.graphite, borderRadius: 20, padding: 16 },
  macro: {},
  macroHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  macroLabel: { color: colors.chalk, fontFamily: fonts.bodyMedium, fontSize: 14 },
  macroValue: { color: colors.chalk, fontFamily: fonts.mono, fontSize: 14 },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.graphite3, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4, backgroundColor: colors.accent },
  line: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 8 },
  lineLabel: { color: colors.dim, fontFamily: fonts.body, fontSize: 14, flexShrink: 1 },
  lineValue: { color: colors.chalk, fontFamily: fonts.mono, fontSize: 14 },
  note: { color: colors.dim, fontFamily: fonts.body, fontSize: 13, lineHeight: 18, marginTop: 6 },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.graphite,
    borderRadius: 16,
    minHeight: 56,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  editText: { flex: 1, color: colors.chalk, fontSize: 15, fontFamily: fonts.body },
  disclaimer: { color: colors.dim, fontFamily: fonts.body, fontSize: 12, lineHeight: 17, marginTop: 16, marginBottom: 8 },
});
