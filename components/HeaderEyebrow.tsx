import Feather from '@expo/vector-icons/Feather';
import { ComponentProps } from 'react';
import { router } from '../lib/router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../lib/authContext';
import { initials } from '../lib/format';
import { shared } from '../lib/sharedStyles';
import { colors } from '../lib/theme';
import Avatar from './Avatar';

// Texto pequeño sobre el título de cada pestaña + acceso rápido a "Tu cuenta" (sus iniciales).
// Con `icon` va en dorado (Entrenar: el ícono de su pestaña, para no confundirla con Clientes).
export default function HeaderEyebrow({ text, icon }: { text: string; icon?: ComponentProps<typeof Feather>['name'] }) {
  const { session } = useAuth();
  return (
    <View style={styles.row}>
      <View style={styles.label}>
        {icon && <Feather name={icon} size={13} color={colors.accent} />}
        <Text style={[shared.eyebrow, { marginBottom: 0 }, icon && { color: colors.accent }]}>{text}</Text>
      </View>
      <Pressable onPress={() => router.push('/cuenta')} hitSlop={8} accessibilityLabel="Tu cuenta">
        <Avatar initials={initials(session?.name ?? '')} size={32} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  label: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
