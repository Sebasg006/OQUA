import Feather from '@expo/vector-icons/Feather';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthInput from '../components/AuthInput';
import BackButton from '../components/BackButton';
import Button from '../components/Button';
import FormScrollView from '../components/FormScrollView';
import { alimentoPorId, aporte } from '../lib/alimentos';
import { esProductoMio, productoComoAlimento } from '../lib/barras';
import { authStyles } from '../lib/authStyles';
import { useCrearComida } from '../lib/comidas';
import { miles, parseNumber } from '../lib/format';
import { router } from '../lib/router';
import { shared } from '../lib/sharedStyles';
import { colors, fonts } from '../lib/theme';

const GRAMOS = -1; // opción "En gramos" (para quien pesa en la gramera)
const MAX_QTY = 10;

const qtyText = (n: number) => String(n).replace('.', ',');
const decimal = (n: number) => String(Math.round(n * 10) / 10).replace('.', ',');

// ¿Cuánto comiste? Se elige una porción casera (y cuántas) o se escriben los gramos; la app muestra lo que aporta.
// Sirve para un alimento de la lista (`id`) o para un producto leído por código de barras (`code`).
export default function PorcionScreen() {
  const { id, code, fecha } = useLocalSearchParams<{ id?: string; code?: string; fecha?: string }>();
  const food = code ? productoComoAlimento(code) : alimentoPorId(Number(id));
  const crear = useCrearComida();
  const [choice, setChoice] = useState(food?.portions.length ? 0 : GRAMOS);
  const [qty, setQty] = useState(1);
  const [gramsText, setGramsText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // La lista vive en memoria; si la app se recargó en esta pantalla, se vuelve al buscador.
  if (!food) {
    return (
      <SafeAreaView style={shared.screen}>
        <View style={shared.scrollContent}>
          <BackButton />
          <Text style={styles.lead}>No encontramos ese alimento. Vuelve a {code ? 'escanearlo' : 'buscarlo'}.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const portion = choice === GRAMOS ? null : food.portions[choice];
  const typed = parseNumber(gramsText);
  const grams = portion ? portion.grams * qty : typed && !Number.isNaN(typed) ? typed : 0;
  const total = aporte(food, grams);

  async function save() {
    if (saving || !food) return;
    if (!portion) {
      if (typed === undefined) return setError('Escribe cuántos gramos comiste.');
      if (Number.isNaN(typed) || typed <= 0 || typed > 3000) return setError('Los gramos van en números, hasta 3.000.');
    }
    setError(null);
    setSaving(true);
    const amount = {
      grams: Math.round(grams * 10) / 10,
      portion: portion ? (qty === 1 ? portion.label : `${qtyText(qty)} × ${portion.label}`) : null,
    };
    try {
      // Un producto escaneado no está en la lista del servidor: se guarda con sus valores ya calculados.
      await crear(
        code
          ? { name: food.name, kcal: total.kcal, protein_g: total.proteina, carbs_g: total.carbos, fat_g: total.grasa, ...amount }
          : { food_id: food.id, ...amount },
        fecha,
      );
      router.dismissTo('/');
    } catch (e) {
      setError((e as Error).message);
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={shared.screen}>
      <FormScrollView contentContainerStyle={shared.scrollContent}>
        <BackButton />
        <Text style={shared.title}>{food.name}</Text>
        {food.approx && <Text style={styles.approx}>Valor aproximado: usamos el alimento más parecido de la tabla.</Text>}

        <Text style={styles.label}>¿Cuánto comiste?</Text>
        <View style={styles.chips}>
          {food.portions.map((p, i) => (
            <Chip key={p.label} label={p.label} selected={choice === i} onPress={() => setChoice(i)} />
          ))}
          <Chip label="En gramos" icon="sliders" selected={choice === GRAMOS} onPress={() => setChoice(GRAMOS)} />
        </View>

        {portion ? (
          <View style={styles.qtyRow}>
            <Stepper icon="minus" label="Menos" disabled={qty <= 0.5} onPress={() => setQty((q) => Math.max(0.5, q - 0.5))} />
            <View style={styles.qtyCenter}>
              <Text style={styles.qtyValue}>{qtyText(qty)}</Text>
              <Text style={styles.qtyHint}>
                {portion.label} · {decimal(portion.grams * qty)} g
              </Text>
            </View>
            <Stepper icon="plus" label="Más" disabled={qty >= MAX_QTY} onPress={() => setQty((q) => Math.min(MAX_QTY, q + 0.5))} />
          </View>
        ) : (
          <AuthInput
            label="Gramos (lo que marca la gramera)"
            placeholder="150"
            keyboardType="decimal-pad"
            value={gramsText}
            onChangeText={setGramsText}
            maxLength={6}
            autoFocus
          />
        )}

        <View style={styles.preview}>
          <Text style={styles.previewEyebrow}>ESTO APORTA</Text>
          <Text style={styles.previewKcal}>
            {miles(total.kcal)} <Text style={styles.previewUnit}>kcal</Text>
          </Text>
          <View style={styles.macros}>
            <Macro label="Proteína" value={total.proteina} />
            <Macro label="Carbos" value={total.carbos} />
            <Macro label="Grasa" value={total.grasa} />
          </View>
        </View>

        {code && (
          <Text style={styles.source}>
            {esProductoMio(code)
              ? 'Datos que copiaste de la etiqueta.'
              : 'Datos de Open Food Facts (base abierta, ODbL), tomados de la etiqueta del producto.'}
          </Text>
        )}
        {error && <Text style={authStyles.error}>{error}</Text>}
        <Button label="Guardar comida" onPress={save} loading={saving} disabled={grams <= 0} style={{ marginTop: 16, marginBottom: 24 }} />
      </FormScrollView>
    </SafeAreaView>
  );
}

function Chip({
  label,
  selected,
  onPress,
  icon,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: 'sliders';
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.chip, selected && styles.chipOn, pressed && { opacity: 0.75 }]}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
    >
      {icon && <Feather name={icon} size={14} color={selected ? colors.accentInk : colors.dim} />}
      <Text style={[styles.chipText, selected && styles.chipTextOn]}>{label}</Text>
    </Pressable>
  );
}

function Stepper({ icon, label, disabled, onPress }: { icon: 'minus' | 'plus'; label: string; disabled: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.stepper, disabled && { opacity: 0.35 }, pressed && { opacity: 0.75 }]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Feather name={icon} size={22} color={colors.chalk} />
    </Pressable>
  );
}

function Macro({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.macro}>
      <Text style={styles.macroValue}>{decimal(value)} g</Text>
      <Text style={styles.macroLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  lead: { color: colors.dim, fontFamily: fonts.body, fontSize: 14, lineHeight: 20, marginTop: 8 },
  approx: { color: colors.dim, fontFamily: fonts.body, fontSize: 13, lineHeight: 18, marginTop: -8, marginBottom: 12 },
  label: { color: colors.chalk, fontFamily: fonts.bodyMedium, fontSize: 13, marginBottom: 10, marginTop: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 22,
    backgroundColor: colors.graphite2,
  },
  chipOn: { backgroundColor: colors.accent },
  chipText: { color: colors.chalk, fontFamily: fonts.bodyMedium, fontSize: 14 },
  chipTextOn: { color: colors.accentInk },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  qtyCenter: { flex: 1, alignItems: 'center' },
  qtyValue: { color: colors.chalk, fontFamily: fonts.display, fontSize: 40, lineHeight: 46 },
  qtyHint: { color: colors.dim, fontFamily: fonts.body, fontSize: 13, textAlign: 'center' },
  stepper: { width: 56, height: 56, borderRadius: 16, backgroundColor: colors.graphite2, alignItems: 'center', justifyContent: 'center' },
  preview: { backgroundColor: colors.graphite, borderRadius: 20, padding: 18, marginTop: 12 },
  previewEyebrow: { color: colors.accent, fontFamily: fonts.bodySemi, fontSize: 11, letterSpacing: 1.2 },
  previewKcal: { color: colors.chalk, fontFamily: fonts.display, fontSize: 44, lineHeight: 50, marginTop: 4 },
  previewUnit: { color: colors.dim, fontFamily: fonts.bodyMedium, fontSize: 16 },
  macros: { flexDirection: 'row', marginTop: 12 },
  macro: { flex: 1 },
  macroValue: { color: colors.chalk, fontFamily: fonts.bodySemi, fontSize: 16 },
  source: { color: colors.dim, fontFamily: fonts.body, fontSize: 11, lineHeight: 16, marginTop: 12, textAlign: 'center' },
  macroLabel: { color: colors.dim, fontFamily: fonts.body, fontSize: 12, marginTop: 2 },
});
