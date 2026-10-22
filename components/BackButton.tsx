import Feather from '@expo/vector-icons/Feather';
import { router } from '../lib/router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../lib/theme';

// "← Volver" arriba de las pantallas internas: flecha dentro de un círculo sólido (como el botón de editar) + a dónde vuelve.
export default function BackButton({ label = 'Volver', onPress }: { label?: string; onPress?: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.btn, pressed && { opacity: 0.6 }]}
      onPress={onPress ?? (() => router.back())}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={styles.circle}>
        <Feather name="arrow-left" size={20} color={colors.chalk} />
      </View>
      <Text style={styles.text} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 44, alignSelf: 'flex-start', marginBottom: 10 },
  circle: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.graphite, alignItems: 'center', justifyContent: 'center' },
  text: { color: colors.chalk, fontSize: 15, fontFamily: fonts.bodyMedium, maxWidth: 220 },
});
