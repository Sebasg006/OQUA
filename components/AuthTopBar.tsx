import Feather from '@expo/vector-icons/Feather';
import { router } from '../lib/router';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors } from '../lib/theme';
import Logo from './Logo';

// Arriba de las pantallas de entrada (login, registro): volver a la bienvenida, si se llegó desde ahí, y el logo.
export default function AuthTopBar() {
  return (
    <View style={styles.row}>
      {router.canGoBack() && (
        <Pressable
          style={({ pressed }) => [styles.back, pressed && { opacity: 0.6 }]}
          onPress={() => router.back()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Volver"
        >
          <Feather name="arrow-left" size={20} color={colors.chalk} />
        </Pressable>
      )}
      <Logo size={34} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 24, paddingTop: 12 },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(29,29,31,0.62)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18, // igual que el margen inferior del logo, para que queden alineados
  },
});
