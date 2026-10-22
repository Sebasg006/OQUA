import Feather from '@expo/vector-icons/Feather';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthInput from '../components/AuthInput';
import BackButton from '../components/BackButton';
import Button from '../components/Button';
import { useDatePicker } from '../components/DatePicker';
import FormScrollView from '../components/FormScrollView';
import SegmentedControl from '../components/SegmentedControl';
import { useAuth } from '../lib/authContext';
import { authStyles } from '../lib/authStyles';
import { ACTIVIDAD, ActivityLevel, meta, Profile, RITMOS, Sex } from '../lib/calorias';
import { miles, parseNumber, toDisplay } from '../lib/format';
import { router } from '../lib/router';
import { shared } from '../lib/sharedStyles';
import { colors, fonts } from '../lib/theme';

const yearsAgo = (n: number) => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - n);
  return d;
};

// Datos para calcular la meta del día. La primera vez es el paso obligatorio después de crear la cuenta;
// después se abre desde Hoy para corregir (por ejemplo, al bajar de peso).
export default function PerfilScreen() {
  const { profile, saveProfile } = useAuth();
  const firstTime = !profile;
  const datePicker = useDatePicker();

  const [sex, setSex] = useState<Sex | null>(profile?.sex ?? null);
  const [birth, setBirth] = useState<string | null>(profile?.birth_date ?? null);
  const [height, setHeight] = useState(profile ? String(profile.height_cm) : '');
  const [weight, setWeight] = useState(profile ? String(profile.weight_kg).replace('.', ',') : '');
  const [activity, setActivity] = useState<ActivityLevel | null>(profile?.activity_level ?? null);
  const [deficit, setDeficit] = useState<number>(profile?.deficit_pct ?? 20);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const heightCm = parseNumber(height);
  const weightKg = parseNumber(weight);

  // Lo que quedaría guardado, o null si falta algo o un número está fuera de rango.
  const draft: Profile | null = useMemo(() => {
    if (!sex || !birth || !activity) return null;
    if (!heightCm || heightCm < 120 || heightCm > 230) return null;
    if (!weightKg || weightKg < 35 || weightKg > 300) return null;
    return { sex, birth_date: birth, height_cm: heightCm, weight_kg: weightKg, activity_level: activity, deficit_pct: deficit };
  }, [sex, birth, activity, heightCm, weightKg, deficit]);

  const preview = draft ? meta(draft) : null;

  async function save() {
    if (saving) return;
    if (!draft) {
      if (!sex || !birth || !activity || !height.trim() || !weight.trim()) return setError('Completa todos los datos.');
      if (!heightCm || heightCm < 120 || heightCm > 230) return setError('La estatura va en centímetros, entre 120 y 230.');
      return setError('El peso va en kilos, entre 35 y 300.');
    }
    setError(null);
    setSaving(true);
    try {
      await saveProfile(draft);
      if (firstTime) router.replace('/');
      else router.back();
    } catch (e) {
      setError((e as Error).message);
      setSaving(false);
    }
  }

  function openBirth() {
    datePicker.open({
      value: birth,
      fallback: yearsAgo(30),
      minimumDate: yearsAgo(100),
      maximumDate: yearsAgo(18), // solo mayores de 18
      title: 'Fecha de nacimiento',
      onPick: setBirth,
    });
  }

  return (
    <SafeAreaView style={shared.screen}>
      <FormScrollView contentContainerStyle={shared.scrollContent}>
        {!firstTime && <BackButton />}
        <Text style={shared.title}>{firstTime ? 'Cuéntanos de ti' : 'Tus datos'}</Text>
        <Text style={styles.lead}>Con esto calculamos cuántas calorías gastas al día y cuántas comer para bajar de peso.</Text>

        <Text style={styles.label}>Sexo</Text>
        <SegmentedControl
          options={[
            { key: 'F', label: 'Mujer' },
            { key: 'M', label: 'Hombre' },
          ]}
          value={sex}
          onChange={(k) => k && setSex(k)}
        />
        <Text style={styles.hint}>El cuerpo de mujeres y hombres gasta distinto en reposo; la fórmula lo necesita.</Text>

        <Text style={styles.label}>Fecha de nacimiento</Text>
        <Pressable
          style={({ pressed }) => [styles.dateField, pressed && { opacity: 0.75 }]}
          onPress={openBirth}
          accessibilityRole="button"
        >
          <Text style={[styles.dateText, !birth && { color: colors.dim }]}>{birth ? toDisplay(birth) : 'DD/MM/AAAA'}</Text>
          <Feather name="calendar" size={18} color={colors.dim} />
        </Pressable>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <AuthInput label="Estatura (cm)" placeholder="165" keyboardType="decimal-pad" value={height} onChangeText={setHeight} maxLength={5} />
          </View>
          <View style={{ flex: 1 }}>
            <AuthInput label="Peso (kg)" placeholder="70" keyboardType="decimal-pad" value={weight} onChangeText={setWeight} maxLength={6} />
          </View>
        </View>

        <Text style={[styles.label, { marginTop: 4 }]}>¿Qué tan activa es tu semana?</Text>
        <View style={styles.list}>
          {(Object.keys(ACTIVIDAD) as ActivityLevel[]).map((key, i) => {
            const selected = activity === key;
            return (
              <Pressable
                key={key}
                style={({ pressed }) => [styles.option, i > 0 && styles.optionDivider, pressed && { opacity: 0.75 }]}
                onPress={() => setActivity(key)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.optionTitle, selected && { color: colors.accent }]}>{ACTIVIDAD[key].label}</Text>
                  <Text style={styles.optionDetail}>{ACTIVIDAD[key].detalle}</Text>
                </View>
                <View style={[styles.radio, selected && styles.radioOn]}>{selected && <View style={styles.radioDot} />}</View>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>¿A qué ritmo quieres bajar?</Text>
        <SegmentedControl options={RITMOS.map((r) => ({ key: String(r.pct), label: r.label }))} value={String(deficit)} onChange={(k) => k && setDeficit(Number(k))} />
        <Text style={styles.hint}>
          {deficit === 0 ? 'Comer lo que gastas, sin bajar ni subir.' : `Comer un ${deficit} % menos de lo que gastas al día.`}
        </Text>

        {preview && (
          <View style={styles.preview}>
            <Text style={styles.previewEyebrow}>TU META DIARIA</Text>
            <Text style={styles.previewKcal}>
              {miles(preview.kcal)} <Text style={styles.previewUnit}>kcal</Text>
            </Text>
            {deficit > 0 && (
              <Text style={styles.previewDetail}>
                Unos {preview.kgPorSemana.toFixed(1).replace('.', ',')} kg menos por semana si la cumples.
              </Text>
            )}
            {preview.conPiso && (
              <Text style={styles.previewWarn}>
                Subimos tu meta al mínimo recomendado sin acompañamiento médico ({miles(preview.kcal)} kcal).
              </Text>
            )}
          </View>
        )}

        <Text style={styles.disclaimer}>Es una estimación con fórmulas de uso general. No reemplaza la consulta con un nutricionista o médico.</Text>

        {error && <Text style={authStyles.error}>{error}</Text>}
        <Button label={firstTime ? 'Calcular mi meta' : 'Guardar cambios'} onPress={save} loading={saving} style={{ marginBottom: 24 }} />
      </FormScrollView>
      {datePicker.element}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  lead: { color: colors.dim, fontFamily: fonts.body, fontSize: 14, lineHeight: 20, marginTop: -8, marginBottom: 20 },
  label: { color: colors.chalk, fontFamily: fonts.bodyMedium, fontSize: 13, marginBottom: 8, marginTop: 8 },
  hint: { color: colors.dim, fontFamily: fonts.body, fontSize: 12, lineHeight: 17, marginTop: 6, marginBottom: 8 },
  dateField: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.graphite3,
    backgroundColor: colors.graphite2,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateText: { color: colors.chalk, fontFamily: fonts.body, fontSize: 16 },
  row: { flexDirection: 'row', gap: 12 },
  list: { backgroundColor: colors.graphite, borderRadius: 16, marginBottom: 12 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 60, paddingHorizontal: 16, paddingVertical: 10 },
  optionDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.graphite3 },
  optionTitle: { color: colors.chalk, fontFamily: fonts.bodySemi, fontSize: 15 },
  optionDetail: { color: colors.dim, fontFamily: fonts.body, fontSize: 13, marginTop: 2 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.graphite3, alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: colors.accent },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent },
  preview: { backgroundColor: colors.graphite, borderRadius: 20, padding: 18, marginTop: 16 },
  previewEyebrow: { color: colors.accent, fontFamily: fonts.bodySemi, fontSize: 11, letterSpacing: 1.2 },
  previewKcal: { color: colors.chalk, fontFamily: fonts.display, fontSize: 44, lineHeight: 50, marginTop: 4 },
  previewUnit: { color: colors.dim, fontFamily: fonts.bodyMedium, fontSize: 16 },
  previewDetail: { color: colors.chalk, fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
  previewWarn: { color: colors.accent, fontFamily: fonts.body, fontSize: 13, lineHeight: 18, marginTop: 8 },
  disclaimer: { color: colors.dim, fontFamily: fonts.body, fontSize: 12, lineHeight: 17, marginTop: 14, marginBottom: 16 },
});
