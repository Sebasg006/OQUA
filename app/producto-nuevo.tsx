import Feather from '@expo/vector-icons/Feather';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthInput from '../components/AuthInput';
import BackButton from '../components/BackButton';
import Button from '../components/Button';
import FormScrollView from '../components/FormScrollView';
import { authStyles } from '../lib/authStyles';
import { guardarProducto, type Producto } from '../lib/barras';
import { parseNumber } from '../lib/format';
import { router } from '../lib/router';
import { shared } from '../lib/sharedStyles';
import { colors, fonts } from '../lib/theme';
import { useApi } from '../lib/useApi';

// Enseñarle a OQUA un producto que no encontró (p. ej. marcas de almacén): se copia UNA vez la tabla nutricional
// de la etiqueta, columna "por 100 g". Queda guardado con su código y la próxima vez lo reconoce al escanearlo.
export default function ProductoNuevoScreen() {
  const { code, fecha } = useLocalSearchParams<{ code: string; fecha?: string }>();
  const call = useApi();
  const [name, setName] = useState('');
  const [kcal, setKcal] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [serving, setServing] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (saving) return;
    if (!name.trim()) return setError('Escribe el nombre del producto.');
    const kcalN = parseNumber(kcal);
    if (kcalN === undefined) return setError('Escribe las calorías por 100 g.');
    if (Number.isNaN(kcalN) || kcalN > 900) return setError('Las calorías por 100 g van en números, hasta 900.');

    // En la etiqueta, lo que no trae el producto sale en 0: si se deja vacío, se toma como 0.
    const gramos: number[] = [];
    for (const text of [protein, carbs, fat]) {
      const n = parseNumber(text);
      if (n !== undefined && (Number.isNaN(n) || n > 100)) return setError('Los gramos por 100 g van en números, hasta 100.');
      gramos.push(n === undefined ? 0 : Math.round(n * 10) / 10);
    }
    const servingN = parseNumber(serving);
    if (servingN !== undefined && (Number.isNaN(servingN) || servingN <= 0 || servingN > 3000)) {
      return setError('La porción va en gramos, hasta 3.000.');
    }

    setError(null);
    setSaving(true);
    try {
      const { producto } = await call<{ producto: Producto }>('/nutricion/barras', {
        body: {
          code,
          name: name.trim(),
          kcal: Math.round(kcalN * 10) / 10,
          protein_g: gramos[0],
          carbs_g: gramos[1],
          fat_g: gramos[2],
          serving_g: servingN === undefined ? null : Math.round(servingN * 10) / 10,
        },
      });
      guardarProducto(producto);
      // Ya guardado: sigue directo a elegir cuánto comió, como si lo hubiera encontrado al escanear.
      router.replace({ pathname: '/porcion', params: fecha ? { code: producto.code, fecha } : { code: producto.code } });
    } catch (e) {
      setError((e as Error).message);
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={shared.screen}>
      <FormScrollView contentContainerStyle={shared.scrollContent}>
        <BackButton />
        <Text style={shared.title}>Nuevo producto</Text>
        <Text style={styles.lead}>
          Copia la tabla nutricional de la etiqueta una sola vez. La próxima vez que lo escanees, OQUA ya lo reconoce.
        </Text>
        <View style={styles.codeRow}>
          <Feather name="hash" size={14} color={colors.dim} />
          <Text style={styles.code}>{code}</Text>
        </View>

        <AuthInput
          label="Nombre del producto"
          placeholder="Galletas de avena Éxito"
          value={name}
          onChangeText={setName}
          maxLength={60}
          autoCapitalize="sentences"
          autoFocus
        />

        <Text style={styles.label}>Por 100 g (columna de la etiqueta)</Text>
        <AuthInput label="Calorías (kcal)" placeholder="450" keyboardType="decimal-pad" value={kcal} onChangeText={setKcal} maxLength={5} />
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <AuthInput label="Proteína (g)" placeholder="0" keyboardType="decimal-pad" value={protein} onChangeText={setProtein} maxLength={5} />
          </View>
          <View style={{ flex: 1 }}>
            <AuthInput label="Carbos (g)" placeholder="0" keyboardType="decimal-pad" value={carbs} onChangeText={setCarbs} maxLength={5} />
          </View>
          <View style={{ flex: 1 }}>
            <AuthInput label="Grasa (g)" placeholder="0" keyboardType="decimal-pad" value={fat} onChangeText={setFat} maxLength={5} />
          </View>
        </View>

        <AuthInput
          label="Tamaño de la porción en gramos (opcional)"
          placeholder="30"
          keyboardType="decimal-pad"
          value={serving}
          onChangeText={setServing}
          maxLength={6}
        />
        <Text style={styles.hint}>Sale arriba de la tabla: "Tamaño por porción: 30 g".</Text>

        {error && <Text style={authStyles.error}>{error}</Text>}
        <Button label="Guardar producto" onPress={save} loading={saving} style={{ marginTop: 16, marginBottom: 24 }} />
      </FormScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  lead: { color: colors.dim, fontFamily: fonts.body, fontSize: 14, lineHeight: 20, marginTop: -8, marginBottom: 8 },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
  code: { color: colors.dim, fontFamily: fonts.bodyMedium, fontSize: 13, letterSpacing: 1 },
  label: { color: colors.chalk, fontFamily: fonts.bodyMedium, fontSize: 13, marginBottom: 4, marginTop: 4 },
  row: { flexDirection: 'row', gap: 10 },
  hint: { color: colors.dim, fontFamily: fonts.body, fontSize: 12, lineHeight: 17, marginTop: -6 },
});
