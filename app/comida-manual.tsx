import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthInput from '../components/AuthInput';
import BackButton from '../components/BackButton';
import Button from '../components/Button';
import FormScrollView from '../components/FormScrollView';
import { authStyles } from '../lib/authStyles';
import { useCrearComida } from '../lib/comidas';
import { parseNumber } from '../lib/format';
import { router } from '../lib/router';
import { shared } from '../lib/sharedStyles';
import { colors, fonts } from '../lib/theme';

// Plan B para lo que no está en la lista: nombre y calorías; los gramos son opcionales (no todo empaque los trae).
export default function ComidaManualScreen() {
  const { fecha } = useLocalSearchParams<{ fecha?: string }>();
  const crear = useCrearComida();
  const [name, setName] = useState('');
  const [kcal, setKcal] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (saving) return;
    const kcalN = parseNumber(kcal);
    if (!name.trim()) return setError('Escribe qué comiste.');
    if (kcalN === undefined) return setError('Escribe las calorías.');
    if (Number.isNaN(kcalN) || kcalN > 5000) return setError('Las calorías van en números, hasta 5.000.');

    const gramos: Record<string, number | null> = {};
    for (const [key, text] of [
      ['protein_g', protein],
      ['carbs_g', carbs],
      ['fat_g', fat],
    ] as const) {
      const n = parseNumber(text);
      if (n !== undefined && (Number.isNaN(n) || n > 500)) return setError('Los gramos van en números, hasta 500.');
      gramos[key] = n === undefined ? null : Math.round(n * 10) / 10;
    }

    setError(null);
    setSaving(true);
    try {
      await crear({
        name: name.trim(),
        kcal: Math.round(kcalN),
        protein_g: gramos.protein_g,
        carbs_g: gramos.carbs_g,
        fat_g: gramos.fat_g,
      }, fecha);
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
        <Text style={shared.title}>Anotar a mano</Text>
        <Text style={styles.lead}>Las calorías y gramos salen en la etiqueta del empaque o en la carta del restaurante.</Text>

        <AuthInput
          label="¿Qué comiste?"
          placeholder="Arepa con huevo"
          value={name}
          onChangeText={setName}
          maxLength={80}
          autoCapitalize="sentences"
          autoFocus
        />
        <AuthInput label="Calorías (kcal)" placeholder="350" keyboardType="number-pad" value={kcal} onChangeText={setKcal} maxLength={4} />

        <Text style={styles.label}>Gramos (opcional)</Text>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <AuthInput label="Proteína" placeholder="0" keyboardType="decimal-pad" value={protein} onChangeText={setProtein} maxLength={5} />
          </View>
          <View style={{ flex: 1 }}>
            <AuthInput label="Carbos" placeholder="0" keyboardType="decimal-pad" value={carbs} onChangeText={setCarbs} maxLength={5} />
          </View>
          <View style={{ flex: 1 }}>
            <AuthInput label="Grasa" placeholder="0" keyboardType="decimal-pad" value={fat} onChangeText={setFat} maxLength={5} />
          </View>
        </View>

        {error && <Text style={authStyles.error}>{error}</Text>}
        <Button label="Guardar comida" onPress={save} loading={saving} style={{ marginTop: 8, marginBottom: 24 }} />
      </FormScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  lead: { color: colors.dim, fontFamily: fonts.body, fontSize: 14, lineHeight: 20, marginTop: -8, marginBottom: 20 },
  label: { color: colors.chalk, fontFamily: fonts.bodyMedium, fontSize: 13, marginBottom: 4, marginTop: 4 },
  row: { flexDirection: 'row', gap: 10 },
});
