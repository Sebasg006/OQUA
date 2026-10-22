import Feather from '@expo/vector-icons/Feather';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Image, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import { useTabBarClearance } from '../../components/FloatingTabBar';
import Glow from '../../components/Glow';
import { useAuth } from '../../lib/authContext';
import { borrarFoto, Foto, listarFotos, tomarFoto } from '../../lib/fotos';
import { formatDate } from '../../lib/format';
import { shared } from '../../lib/sharedStyles';
import { colors, fonts } from '../../lib/theme';

const camera3d = require('../../assets/icons3d/camera.png');

// Cámara: fotos de progreso guardadas solo en el teléfono. La última se ve grande; las demás en cuadrícula.
export default function CamaraScreen() {
  const { session } = useAuth();
  const tabBarClearance = useTabBarClearance();
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [busy, setBusy] = useState(false);
  const [viewing, setViewing] = useState<Foto | null>(null);

  const reload = useCallback(() => {
    if (session) setFotos(listarFotos(session.id));
  }, [session]);

  useFocusEffect(reload);

  if (!session) return null;

  async function onTake() {
    if (!session) return;
    setBusy(true);
    try {
      const result = await tomarFoto(session.id);
      if (result === 'sin-permiso') {
        Alert.alert('Sin acceso a la cámara', 'Para tomar fotos de progreso, permite que OQUA use la cámara en los ajustes del teléfono.', [
          { text: 'Ahora no', style: 'cancel' },
          { text: 'Abrir ajustes', onPress: () => Linking.openSettings() },
        ]);
      }
      reload();
    } catch {
      Alert.alert('No se pudo guardar la foto', 'Inténtalo de nuevo.');
    } finally {
      setBusy(false);
    }
  }

  function onDelete(foto: Foto) {
    Alert.alert('¿Borrar esta foto?', 'Se borra de tu teléfono y no se puede recuperar.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Borrar',
        style: 'destructive',
        onPress: () => {
          borrarFoto(foto);
          setViewing(null);
          reload();
        },
      },
    ]);
  }

  const [latest, ...rest] = fotos;

  return (
    <SafeAreaView style={shared.screen}>
      <Glow />
      <ScrollView contentContainerStyle={[shared.scrollContent, { paddingBottom: tabBarClearance }]}>
        <Text style={shared.title}>Cámara</Text>

        {latest ? (
          <Pressable onPress={() => setViewing(latest)} accessibilityRole="imagebutton" accessibilityLabel="Ver la última foto">
            <Image source={{ uri: latest.uri }} style={styles.latest} />
            <View style={styles.latestTag}>
              <Text style={styles.latestTagText}>Última foto · {formatDate(latest.day)}</Text>
            </View>
          </Pressable>
        ) : (
          <View style={styles.empty}>
            <Image source={camera3d} style={styles.emptyIcon} accessibilityIgnoresInvertColors />
            <Text style={styles.emptyTitle}>Tu primera foto de progreso</Text>
            <Text style={styles.emptyText}>Tómala hoy y compárala en unas semanas. Siempre con la misma luz y la misma pose se nota más el cambio.</Text>
          </View>
        )}

        <Button label="Tomar foto" icon="camera" onPress={onTake} loading={busy} style={{ marginTop: 16 }} />

        <View style={styles.privacy}>
          <Feather name="lock" size={13} color={colors.dim} />
          <Text style={styles.privacyText}>Tus fotos se guardan solo en este teléfono. Nunca se suben a internet.</Text>
        </View>

        {rest.length > 0 && (
          <>
            <Text style={shared.sectionTitle}>Fotos anteriores ({rest.length})</Text>
            <View style={styles.grid}>
              {rest.map((foto) => (
                <Pressable key={foto.uri} style={styles.thumbWrap} onPress={() => setViewing(foto)} accessibilityRole="imagebutton">
                  <Image source={{ uri: foto.uri }} style={styles.thumb} />
                  <Text style={styles.thumbDate}>{formatDate(foto.day)}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Foto a pantalla completa, con fecha y opción de borrar */}
      <Modal visible={!!viewing} animationType="fade" transparent onRequestClose={() => setViewing(null)}>
        <View style={styles.viewer}>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.viewerBar}>
              <Pressable onPress={() => setViewing(null)} hitSlop={12} accessibilityRole="button" accessibilityLabel="Cerrar">
                <Feather name="x" size={26} color={colors.chalk} />
              </Pressable>
              <Text style={styles.viewerDate}>{viewing ? formatDate(viewing.day) : ''}</Text>
              <Pressable onPress={() => viewing && onDelete(viewing)} hitSlop={12} accessibilityRole="button" accessibilityLabel="Borrar foto">
                <Feather name="trash-2" size={22} color={colors.red} />
              </Pressable>
            </View>
            {viewing && <Image source={{ uri: viewing.uri }} style={styles.viewerImage} resizeMode="contain" />}
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  latest: { width: '100%', aspectRatio: 3 / 4, borderRadius: 20, backgroundColor: colors.graphite },
  latestTag: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    backgroundColor: 'rgba(10,10,11,0.7)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  latestTagText: { color: colors.chalk, fontFamily: fonts.bodyMedium, fontSize: 12 },
  empty: { backgroundColor: colors.graphite, borderRadius: 20, padding: 24, alignItems: 'center' },
  emptyIcon: { width: 104, height: 104, marginBottom: 14 },
  emptyTitle: { color: colors.chalk, fontFamily: fonts.bodySemi, fontSize: 17, textAlign: 'center' },
  emptyText: { color: colors.dim, fontFamily: fonts.body, fontSize: 14, lineHeight: 20, textAlign: 'center', marginTop: 6 },
  privacy: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12 },
  privacyText: { color: colors.dim, fontFamily: fonts.body, fontSize: 12, flexShrink: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  thumbWrap: { width: '33.333%', padding: 4 },
  thumb: { width: '100%', aspectRatio: 3 / 4, borderRadius: 12, backgroundColor: colors.graphite },
  thumbDate: { color: colors.dim, fontFamily: fonts.body, fontSize: 11, marginTop: 4, textAlign: 'center' },
  viewer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.96)' },
  viewerBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  viewerDate: { color: colors.chalk, fontFamily: fonts.bodySemi, fontSize: 15 },
  viewerImage: { flex: 1, marginBottom: 24 },
});
