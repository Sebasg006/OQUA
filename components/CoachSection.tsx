import Feather from '@expo/vector-icons/Feather';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { shared } from '../lib/sharedStyles';
import { colors, fonts } from '../lib/theme';
import { useApi } from '../lib/useApi';
import Button from './Button';
import { useCoachCode } from './CoachCode';

type Link = { status: 'pendiente' | 'aceptada' | 'rechazada'; coach_name: string };

const STATUS_TEXT: Record<Link['status'], string> = {
  pendiente: 'Esperando que te acepte en Coatrack',
  aceptada: 'Conectado: ve tus comidas, agua, racha y peso',
  rechazada: 'No aceptó la solicitud',
};

// "Tu entrenador" en Tu cuenta: con quién está conectado, poner el código si se saltó en el registro,
// y la opción discreta de dejar de compartir (la ley exige poder retirar el permiso).
export default function CoachSection() {
  const call = useApi();
  const coach = useCoachCode();
  const [link, setLink] = useState<Link | null | undefined>(undefined); // undefined = cargando
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    let active = true;
    call<{ link: Link | null }>('/nutricion/entrenador')
      .then((res) => active && setLink(res.link))
      .catch(() => active && setLink(null));
    return () => {
      active = false;
    };
  }, [call]);
  useFocusEffect(load);

  async function connect() {
    if (saving) return;
    if (!coach.code) return setError('Escribe el código de tu entrenador.');
    if (coach.blocker) return setError(coach.blocker);
    setError(null);
    setSaving(true);
    try {
      const res = await call<{ link: Link }>('/nutricion/entrenador', { body: { code: coach.code, consent: true } });
      setLink(res.link);
      setAdding(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  function stopSharing() {
    if (!link) return;
    Alert.alert('Dejar de compartir', `${link.coach_name} ya no podrá ver tus comidas, agua, racha ni peso. Tus datos en OQUA no se borran.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Dejar de compartir',
        style: 'destructive',
        onPress: async () => {
          try {
            await call('/nutricion/entrenador', { method: 'DELETE' });
            setLink(null);
          } catch (e) {
            Alert.alert('No se pudo', (e as Error).message);
          }
        },
      },
    ]);
  }

  if (link === undefined) {
    return (
      <>
        <Text style={shared.sectionTitle}>Tu entrenador</Text>
        <ActivityIndicator color={colors.accent} style={{ alignSelf: 'flex-start' }} />
      </>
    );
  }

  return (
    <>
      <Text style={shared.sectionTitle}>Tu entrenador</Text>
      {link && link.status !== 'rechazada' ? (
        <View style={styles.card}>
          <View style={styles.row}>
            <Feather name={link.status === 'aceptada' ? 'user-check' : 'clock'} size={18} color={colors.accent} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{link.coach_name}</Text>
              <Text style={styles.status}>{STATUS_TEXT[link.status]}</Text>
            </View>
          </View>
          <Pressable onPress={stopSharing} hitSlop={8} accessibilityRole="button" style={styles.stopLink}>
            <Text style={styles.stopText}>Dejar de compartir</Text>
          </Pressable>
        </View>
      ) : adding ? (
        <View style={styles.card}>
          {coach.element}
          {error && <Text style={styles.error}>{error}</Text>}
          <Button label="Conectar" onPress={connect} loading={saving} style={{ marginBottom: 4 }} />
        </View>
      ) : (
        <Pressable
          style={({ pressed }) => [styles.optionRow, pressed && { opacity: 0.75 }]}
          onPress={() => setAdding(true)}
          accessibilityRole="button"
        >
          <Feather name="user-plus" size={18} color={colors.accent} />
          <View style={{ flex: 1 }}>
            <Text style={styles.optionText}>Conectar con mi entrenador</Text>
            {link?.status === 'rechazada' && <Text style={styles.status}>{link.coach_name} no aceptó la solicitud anterior</Text>}
          </View>
          <Feather name="chevron-right" size={18} color={colors.dim} />
        </Pressable>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.graphite, borderRadius: 16, padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { color: colors.chalk, fontFamily: fonts.bodySemi, fontSize: 15 },
  status: { color: colors.dim, fontFamily: fonts.body, fontSize: 13, marginTop: 2 },
  stopLink: { alignSelf: 'flex-start', marginTop: 14, minHeight: 32, justifyContent: 'center' },
  stopText: { color: colors.dim, fontFamily: fonts.body, fontSize: 13, textDecorationLine: 'underline' },
  error: { color: colors.dim, fontFamily: fonts.body, fontSize: 13, marginBottom: 10 },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.graphite,
    borderRadius: 16,
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  optionText: { color: colors.chalk, fontSize: 15, fontFamily: fonts.body },
});
