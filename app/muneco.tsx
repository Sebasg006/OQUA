import Feather from '@expo/vector-icons/Feather';
import { memo, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../components/BackButton';
import Button from '../components/Button';
import MunecoView from '../components/MunecoView';
import { useAuth } from '../lib/authContext';
import { COLORES, Muneco, Parte, PARTES, useMuneco } from '../lib/muneco';
import { router } from '../lib/router';
import { shared } from '../lib/sharedStyles';
import { colors, fonts } from '../lib/theme';

const ORDEN = Object.keys(PARTES) as Parte[];
const THUMB = 96;
const pick = <T,>(arr: readonly T[]) => arr[Math.floor(Math.random() * arr.length)];

// Miniatura de una opción: el muñeco actual con esa opción puesta, y su nombre debajo.
const Opcion = memo(function Opcion({
  muneco,
  selected,
  label,
  onPress,
}: {
  muneco: Muneco;
  selected: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.option} accessibilityRole="button" accessibilityState={{ selected }} accessibilityLabel={label}>
      {({ pressed }) => (
        <>
          <View style={[styles.thumb, selected && styles.thumbSelected, pressed && { opacity: 0.75 }]}>
            <MunecoView muneco={muneco} size={THUMB - 10} rounded={false} />
          </View>
          <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]} numberOfLines={2}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
});

// Crear o editar el muñeco: vista previa grande, una pestaña por parte, miniaturas y colores.
export default function MunecoScreen() {
  const { session } = useAuth();
  const { muneco: guardado, loaded, save } = useMuneco(session?.id);
  const [muneco, setMuneco] = useState<Muneco>(guardado);
  const [parte, setParte] = useState<Parte>('gorro');
  const [saving, setSaving] = useState(false);

  // Cuando termina de leer el muñeco guardado, el editor arranca desde ahí
  useEffect(() => {
    if (loaded) setMuneco(guardado);
  }, [loaded, guardado]);

  const info = PARTES[parte];
  const set = (cambios: Partial<Muneco>) => setMuneco((m) => ({ ...m, ...cambios }));
  const colorKey = 'color' in info ? info.color : null;
  // El color se muestra si la parte lo usa y hay algo puesto (en accesorios, solo los audífonos tienen color)
  const showColors = colorKey && muneco[parte] !== null && (parte !== 'accesorio' || muneco.accesorio === 'audifonos');

  function sorpresa() {
    setMuneco({
      gorro: Math.random() < 0.7 ? pick(PARTES.gorro.opciones).valor : null,
      gorroColor: pick(COLORES),
      pelo: pick(PARTES.pelo.opciones).valor,
      cara: pick(PARTES.cara.opciones).valor,
      accesorio: Math.random() < 0.5 ? pick(PARTES.accesorio.opciones).valor : null,
      accesorioColor: pick(COLORES),
      ropa: pick(PARTES.ropa.opciones).valor,
      ropaColor: pick(COLORES),
    });
  }

  async function onSave() {
    setSaving(true);
    try {
      await save(muneco);
      router.back();
    } catch {
      Alert.alert('No se pudo guardar', 'Inténtalo de nuevo.');
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={shared.screen}>
      <View style={styles.top}>
        <BackButton />
        <Text style={shared.title}>Crea tu avatar</Text>

        <View style={styles.preview}>
          <View style={styles.halo} />
          <MunecoView muneco={muneco} size={180} />
          <Pressable onPress={sorpresa} style={({ pressed }) => [styles.dice, pressed && { opacity: 0.7 }]} accessibilityRole="button" accessibilityLabel="Avatar al azar">
            <Feather name="shuffle" size={18} color={colors.accentInk} />
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {ORDEN.map((p) => (
            <Pressable
              key={p}
              onPress={() => setParte(p)}
              style={[styles.tab, p === parte && styles.tabActive]}
              accessibilityRole="tab"
              accessibilityState={{ selected: p === parte }}
            >
              <Text style={[styles.tabText, p === parte && styles.tabTextActive]}>{PARTES[p].label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.grid}>
          {info.opciones.map((o) => (
            <Opcion
              key={o.valor}
              muneco={{ ...muneco, [parte]: o.valor }}
              selected={muneco[parte] === o.valor}
              label={o.label}
              onPress={() => set({ [parte]: o.valor } as Partial<Muneco>)}
            />
          ))}
          {'ninguno' in info && (
            <Opcion
              muneco={{ ...muneco, [parte]: null }}
              selected={muneco[parte] === null}
              label={info.ninguno}
              onPress={() => set({ [parte]: null } as Partial<Muneco>)}
            />
          )}
        </View>

        {showColors && colorKey && (
          <>
            <Text style={styles.colorsTitle}>Color</Text>
            <View style={styles.colors}>
              {COLORES.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => set({ [colorKey]: c } as Partial<Muneco>)}
                  style={[styles.swatchRing, muneco[colorKey] === c && styles.swatchRingSelected]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: muneco[colorKey] === c }}
                >
                  <View style={[styles.swatch, { backgroundColor: c }]} />
                </Pressable>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Guardar avatar" onPress={onSave} loading={saving} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  top: { paddingHorizontal: 20, paddingTop: 16 },
  preview: { alignSelf: 'center', alignItems: 'center', justifyContent: 'center', width: 230, height: 210, marginBottom: 12 },
  halo: {
    position: 'absolute',
    width: 208,
    height: 208,
    borderRadius: 104,
    backgroundColor: 'rgba(62,183,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(62,183,255,0.25)',
  },
  dice: {
    position: 'absolute',
    right: 14,
    bottom: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: { gap: 8, paddingBottom: 12 },
  tab: { paddingHorizontal: 14, height: 36, borderRadius: 18, backgroundColor: colors.graphite, justifyContent: 'center' },
  tabActive: { backgroundColor: colors.accent },
  tabText: { color: colors.chalk, fontFamily: fonts.bodyMedium, fontSize: 14 },
  tabTextActive: { color: colors.accentInk, fontFamily: fonts.bodySemi },
  body: { paddingHorizontal: 20, paddingBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  option: { width: THUMB, alignItems: 'center' },
  thumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  thumbSelected: { borderColor: colors.accent },
  optionLabel: { color: colors.dim, fontFamily: fonts.body, fontSize: 12, marginTop: 6, textAlign: 'center' },
  optionLabelSelected: { color: colors.chalk, fontFamily: fonts.bodySemi },
  colorsTitle: { color: colors.chalk, fontFamily: fonts.bodySemi, fontSize: 14, marginTop: 20, marginBottom: 10 },
  colors: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  swatchRing: { width: 44, height: 44, borderRadius: 22, borderWidth: 3, borderColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
  swatchRingSelected: { borderColor: colors.chalk },
  swatch: { width: 32, height: 32, borderRadius: 16 },
  footer: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.graphite3 },
});
