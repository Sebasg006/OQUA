import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, SectionList, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../components/BackButton';
import { aporte, buscar, Food, useAlimentos } from '../lib/alimentos';
import { comoNueva, Reciente, useCrearComida, useRecientes } from '../lib/comidas';
import { miles } from '../lib/format';
import { router } from '../lib/router';
import { shared } from '../lib/sharedStyles';
import { colors, fonts } from '../lib/theme';

// Anotar comida: buscar el alimento en la lista (nadie sabe de memoria cuántas calorías tiene el arroz).
// Sin escribir nada se ve toda la lista por grupos; al escribir, solo lo que coincide.
export default function ComidaScreen() {
  // fecha: día anterior elegido en la semana de Inicio (sin ella, la comida va a hoy).
  const { fecha } = useLocalSearchParams<{ fecha?: string }>();
  const { foods, error } = useAlimentos();
  const [query, setQuery] = useState('');
  const recientes = useRecientes();

  const sections = useMemo(() => {
    if (!foods) return [];
    const hits = buscar(foods, query);
    if (query.trim()) return hits.length ? [{ title: '', data: hits }] : [];
    const groups = new Map<string, Food[]>();
    for (const f of hits) groups.set(f.food_group, [...(groups.get(f.food_group) ?? []), f]);
    return [...groups].map(([title, data]) => ({ title, data }));
  }, [foods, query]);

  const manual = (
    <Pressable
      style={({ pressed }) => [styles.manual, pressed && { opacity: 0.75 }]}
      onPress={() => router.push({ pathname: '/comida-manual', params: fecha ? { fecha } : {} })}
      accessibilityRole="button"
    >
      <Feather name="edit-3" size={18} color={colors.accent} />
      <View style={{ flex: 1 }}>
        <Text style={styles.manualTitle}>¿No está en la lista?</Text>
        <Text style={styles.manualText}>Anótala a mano con las calorías del empaque.</Text>
      </View>
      <Feather name="chevron-right" size={18} color={colors.dim} />
    </Pressable>
  );

  return (
    <SafeAreaView style={shared.screen} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <BackButton />
        <Text style={shared.title}>¿Qué comiste?</Text>
        <View style={[shared.search, styles.search]}>
          <Feather name="search" size={18} color={colors.dim} />
          <TextInput
            style={shared.searchInput}
            placeholder="Arroz, huevo, arepa…"
            placeholderTextColor={colors.dim}
            value={query}
            onChangeText={setQuery}
            autoFocus
            autoCorrect={false}
            returnKeyType="search"
            accessibilityLabel="Buscar alimento"
          />
          {!!query && (
            <Pressable onPress={() => setQuery('')} hitSlop={10} accessibilityRole="button" accessibilityLabel="Borrar búsqueda">
              <Feather name="x-circle" size={18} color={colors.dim} />
            </Pressable>
          )}
          {/* Otra forma de buscar: leer el código de barras de un producto empacado. */}
          <Pressable
            onPress={() => router.push({ pathname: '/escanear', params: fecha ? { fecha } : {} })}
            style={styles.scan}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel="Escanear código de barras"
          >
            <MaterialCommunityIcons name="barcode-scan" size={20} color={colors.accent} />
          </Pressable>
        </View>
      </View>

      {!foods && !error && <ActivityIndicator color={colors.accent} style={{ marginTop: 32 }} />}
      {error && !foods && <Text style={styles.empty}>{error}</Text>}

      {foods && (
        <SectionList
          sections={sections}
          keyExtractor={(f) => String(f.id)}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          stickySectionHeadersEnabled={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={!query.trim() && recientes.length > 0 ? <Recientes items={recientes} fecha={fecha} /> : null}
          renderSectionHeader={({ section }) => (section.title ? <Text style={styles.group}>{section.title}</Text> : null)}
          renderItem={({ item }) => <FoodRow food={item} fecha={fecha} />}
          ListEmptyComponent={<Text style={styles.empty}>No encontramos “{query.trim()}”. Prueba con otra palabra o anótala a mano.</Text>}
          ListFooterComponent={
            <View>
              {manual}
              <Text style={styles.source}>
                Valores por 100 g de USDA FoodData Central (dominio público). Son promedios: lo que comes puede variar un poco.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

// Arriba del buscador: lo que más repite. Un toque la anota igual (misma cantidad) y vuelve a Inicio.
function Recientes({ items, fecha }: { items: Omit<Reciente, 'id'>[]; fecha?: string }) {
  const crear = useCrearComida();
  const [saving, setSaving] = useState<number | null>(null);

  async function anotar(i: number) {
    if (saving !== null) return;
    setSaving(i);
    try {
      await crear(comoNueva(items[i]), fecha);
      router.dismissTo('/');
    } catch (e) {
      Alert.alert('No se pudo anotar', (e as Error).message);
      setSaving(null);
    }
  }

  return (
    <View>
      <Text style={styles.group}>Lo que comes seguido</Text>
      {items.map((m, i) => {
        const amount = m.portion ?? (m.grams !== null ? `${String(m.grams).replace('.', ',')} g` : null);
        return (
          <Pressable
            key={`${m.food_id ?? m.name}-${m.grams}-${m.portion}-${m.kcal}`}
            style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.graphite2 }]}
            onPress={() => anotar(i)}
            accessibilityRole="button"
            accessibilityLabel={`Anotar ${m.name}${amount ? `, ${amount}` : ''}`}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.rowName}>{m.name}</Text>
              <Text style={styles.rowDetail}>{amount ? `${amount} · ` : ''}{miles(m.kcal)} kcal</Text>
            </View>
            <View style={styles.add}>
              {saving === i ? <ActivityIndicator color={colors.accentInk} size="small" /> : <Feather name="plus" size={20} color={colors.accentInk} />}
            </View>
          </Pressable>
        );
      })}
      <Text style={styles.group}>Todos los alimentos</Text>
    </View>
  );
}

function FoodRow({ food, fecha }: { food: Food; fecha?: string }) {
  const first = food.portions[0];
  const detail = first ? `${first.label} · ${miles(aporte(food, first.grams).kcal)} kcal` : `${miles(food.kcal)} kcal por 100 g`;
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.graphite2 }]}
      onPress={() => router.push({ pathname: '/porcion', params: fecha ? { id: String(food.id), fecha } : { id: String(food.id) } })}
      accessibilityRole="button"
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.rowName}>{food.name}</Text>
        <Text style={styles.rowDetail}>{detail}</Text>
      </View>
      <Feather name="chevron-right" size={18} color={colors.dim} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 16 },
  search: { marginBottom: 8 },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  group: { color: colors.dim, fontFamily: fonts.bodyMedium, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', marginTop: 20, marginBottom: 6 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 60,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.graphite,
    borderRadius: 14,
    marginBottom: 6,
  },
  scan: { marginLeft: 4, paddingLeft: 10, borderLeftWidth: 1, borderLeftColor: colors.graphite3, minHeight: 28, justifyContent: 'center' },
  add: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  rowName: { color: colors.chalk, fontFamily: fonts.bodyMedium, fontSize: 15 },
  rowDetail: { color: colors.dim, fontFamily: fonts.body, fontSize: 13, marginTop: 2 },
  empty: { color: colors.dim, fontFamily: fonts.body, fontSize: 14, lineHeight: 20, textAlign: 'center', marginTop: 24, paddingHorizontal: 20 },
  manual: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 60,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.graphite3,
    marginTop: 20,
  },
  manualTitle: { color: colors.chalk, fontFamily: fonts.bodySemi, fontSize: 15 },
  manualText: { color: colors.dim, fontFamily: fonts.body, fontSize: 13, marginTop: 2 },
  source: { color: colors.dim, fontFamily: fonts.body, fontSize: 11, lineHeight: 16, marginTop: 16, textAlign: 'center' },
});
