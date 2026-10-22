import Feather from '@expo/vector-icons/Feather';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Avatar from '../components/Avatar';
import BackButton from '../components/BackButton';
import Button from '../components/Button';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { useAuth } from '../lib/authContext';
import { initials } from '../lib/format';
import { shared } from '../lib/sharedStyles';
import { colors, fonts } from '../lib/theme';
import { useApi } from '../lib/useApi';
import FormScrollView from '../components/FormScrollView';

export default function CuentaScreen() {
  const { session, logout } = useAuth();
  const call = useApi();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Borra la cuenta en el servidor y cierra la sesión (la app vuelve a la bienvenida).
  async function deleteAccount() {
    if (deleting) return;
    setDeleting(true);
    try {
      await call('/nutricion/cuenta', { method: 'DELETE' });
      setConfirmDelete(false);
      await logout();
    } catch (e) {
      Alert.alert('No se pudo eliminar la cuenta', (e as Error).message);
      setDeleting(false);
    }
  }

  function confirmLogout() {
    Alert.alert('Cerrar sesión', '¿Seguro que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: logout },
    ]);
  }

  if (!session) return null;

  return (
    <SafeAreaView style={shared.screen}>
      <FormScrollView contentContainerStyle={shared.scrollContent}>
        <BackButton />
        <Text style={shared.title}>Tu cuenta</Text>

        <View style={styles.profile}>
          <Avatar initials={initials(session.name)} size={72} />
          <Text style={styles.name}>{session.name}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Nombre</Text>
            <Text style={styles.fieldValue}>{session.name}</Text>
          </View>
          <View style={[styles.fieldRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.fieldLabel}>Correo</Text>
            <Text style={styles.fieldValue}>{session.email}</Text>
          </View>
        </View>

        <Text style={shared.sectionTitle}>Seguridad</Text>
        <Pressable
          style={({ pressed }) => [styles.optionRow, pressed && { opacity: 0.75 }]}
          onPress={() => setConfirmDelete(true)}
          accessibilityRole="button"
        >
          <Feather name="trash-2" size={18} color={colors.red} />
          <Text style={[styles.optionText, { color: colors.red }]}>Eliminar mi cuenta</Text>
          <Feather name="chevron-right" size={18} color={colors.red} />
        </Pressable>

        <Button label="Cerrar sesión" icon="log-out" variant="danger" onPress={confirmLogout} style={{ marginTop: 32, marginBottom: 24 }} />
      </FormScrollView>
      <ConfirmDeleteModal
        visible={confirmDelete}
        title="Eliminar tu cuenta"
        text="Se borran para siempre tu cuenta y tus datos. No se puede deshacer."
        word="Eliminar"
        deleting={deleting}
        onConfirm={deleteAccount}
        onClose={() => setConfirmDelete(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  profile: { alignItems: 'center', marginTop: 4, marginBottom: 20 },
  card: { backgroundColor: colors.graphite, borderRadius: 16, paddingHorizontal: 16 },
  name: { fontFamily: fonts.display, fontSize: 28, lineHeight: 34, color: colors.chalk, marginTop: 12, textAlign: 'center' },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.graphite2,
  },
  fieldLabel: { color: colors.dim, fontSize: 14, fontFamily: fonts.body },
  fieldValue: { color: colors.chalk, fontSize: 14, fontFamily: fonts.body, flexShrink: 1, textAlign: 'right' },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.graphite,
    borderRadius: 16,
    minHeight: 56,
    paddingHorizontal: 16,
  },
  optionText: { flex: 1, color: colors.chalk, fontSize: 15, fontFamily: fonts.body },
});
