import Feather from '@expo/vector-icons/Feather';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../components/BackButton';
import Button from '../components/Button';
import GlassSurface from '../components/GlassSurface';
import { ApiError } from '../lib/api';
import { guardarProducto, type Producto } from '../lib/barras';
import { router } from '../lib/router';
import { shared } from '../lib/sharedStyles';
import { colors, fonts } from '../lib/theme';
import { useApi } from '../lib/useApi';

const FRAME_W = 280;
const FRAME_H = 170;
const CORNER = 34;
const CARD_RADIUS = 22;

type Estado = { tipo: 'mirando' } | { tipo: 'buscando' } | { tipo: 'noEsta'; code: string } | { tipo: 'error'; mensaje: string };

// Escanear el código de barras de un producto empacado. Al leerlo, el servidor lo busca en Open Food Facts:
// si está (o el usuario ya lo había agregado), pasa a elegir cuánto comió (la misma pantalla de porción);
// si no, ofrece agregarlo con la tabla nutricional de la etiqueta.
export default function EscanearScreen() {
  const { fecha } = useLocalSearchParams<{ fecha?: string }>();
  const call = useApi();
  const [permission, requestPermission] = useCameraPermissions();
  const [estado, setEstado] = useState<Estado>({ tipo: 'mirando' });
  // La cámara avisa varias veces por segundo mientras ve el código: solo se atiende la primera lectura.
  const locked = useRef(false);

  async function onScanned({ data }: BarcodeScanningResult) {
    if (locked.current) return;
    locked.current = true;
    setEstado({ tipo: 'buscando' });
    try {
      const { producto } = await call<{ producto: Producto }>(`/nutricion/barras/${encodeURIComponent(data)}`);
      guardarProducto(producto);
      router.replace({ pathname: '/porcion', params: fecha ? { code: producto.code, fecha } : { code: producto.code } });
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) setEstado({ tipo: 'noEsta', code: data });
      else setEstado({ tipo: 'error', mensaje: (e as Error).message });
    }
  }

  function otraVez() {
    locked.current = false;
    setEstado({ tipo: 'mirando' });
  }

  // Mientras el teléfono responde si ya dio permiso.
  if (!permission) return <View style={shared.screen} />;

  if (!permission.granted) {
    return (
      <SafeAreaView style={shared.screen}>
        <View style={shared.scrollContent}>
          <BackButton />
          <Text style={shared.title}>Escanear código</Text>
          <Text style={styles.lead}>
            Para leer el código de barras de tus alimentos, OQUA necesita usar la cámara. No toma ni guarda fotos.
          </Text>
          {permission.canAskAgain ? (
            <Button label="Permitir cámara" icon="camera" onPress={requestPermission} style={{ marginTop: 24 }} />
          ) : (
            <Button label="Abrir ajustes" icon="settings" onPress={() => Linking.openSettings()} style={{ marginTop: 24 }} />
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.screen}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'] }}
        onBarcodeScanned={estado.tipo === 'mirando' ? onScanned : undefined}
      />

      {/* Oscurece todo menos el recuadro, para que se entienda dónde poner el código. */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.shade} />
        <View style={{ flexDirection: 'row', height: FRAME_H }}>
          <View style={styles.shade} />
          <View style={styles.frame}>
            <View style={[styles.corner, { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 18 }]} />
            <View style={[styles.corner, { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 18 }]} />
            <View style={[styles.corner, { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 18 }]} />
            <View style={[styles.corner, { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 18 }]} />
          </View>
          <View style={styles.shade} />
        </View>
        <View style={styles.shade} />
      </View>

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <View style={styles.top}>
          <Pressable onPress={() => router.back()} style={styles.close} hitSlop={8} accessibilityRole="button" accessibilityLabel="Cerrar">
            <GlassSurface radius={22} />
            <Feather name="x" size={22} color={colors.chalk} />
          </Pressable>
          <Text style={styles.topTitle}>Escanear código</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.card}>
          <GlassSurface radius={CARD_RADIUS} />
          {estado.tipo === 'mirando' && (
            <View style={styles.cardRow}>
              <Feather name="maximize" size={20} color={colors.accent} />
              <Text style={styles.cardText}>Pon el código de barras del empaque dentro del recuadro.</Text>
            </View>
          )}
          {estado.tipo === 'buscando' && (
            <View style={styles.cardRow}>
              <ActivityIndicator color={colors.accent} />
              <Text style={styles.cardText}>Buscando el producto…</Text>
            </View>
          )}
          {estado.tipo === 'noEsta' && (
            <View>
              <Text style={styles.cardTitle}>No encontramos este producto</Text>
              <Text style={styles.cardSub}>Agrégalo una vez con la tabla nutricional de la etiqueta y la próxima vez OQUA lo reconoce.</Text>
              <Button
                label="Agregar este producto"
                icon="plus"
                onPress={() =>
                  router.replace({ pathname: '/producto-nuevo', params: fecha ? { code: estado.code, fecha } : { code: estado.code } })
                }
                style={{ marginTop: 14 }}
              />
              <Button label="Escanear otro" variant="secondary" onPress={otraVez} style={{ marginTop: 8 }} />
            </View>
          )}
          {estado.tipo === 'error' && (
            <View>
              <Text style={styles.cardTitle}>Algo falló</Text>
              <Text style={styles.cardSub}>{estado.mensaje}</Text>
              <Button label="Intentar de nuevo" onPress={otraVez} style={{ marginTop: 14 }} />
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000' },
  lead: { color: colors.dim, fontFamily: fonts.body, fontSize: 15, lineHeight: 22, marginTop: 8 },
  shade: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },
  frame: { width: FRAME_W, height: FRAME_H },
  corner: { position: 'absolute', width: CORNER, height: CORNER, borderColor: colors.accent },
  overlay: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, justifyContent: 'space-between' },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8 },
  close: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  topTitle: { color: colors.chalk, fontFamily: fonts.bodySemi, fontSize: 16 },
  card: { marginHorizontal: 16, marginBottom: 16, padding: 18, borderRadius: CARD_RADIUS, overflow: 'hidden' },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardText: { flex: 1, color: colors.chalk, fontFamily: fonts.bodyMedium, fontSize: 15, lineHeight: 21 },
  cardTitle: { color: colors.chalk, fontFamily: fonts.bodySemi, fontSize: 17 },
  cardSub: { color: colors.dim, fontFamily: fonts.body, fontSize: 14, lineHeight: 20, marginTop: 4 },
});
