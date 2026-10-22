import { StyleSheet, Text } from 'react-native';
import { APP_NAME } from '../lib/brand';
import { colors, fonts } from '../lib/theme';

// Logo provisional: solo el nombre, con la última letra en azul. Se reemplaza por el logo de OQUA más adelante.
export default function Logo({ size = 44 }: { size?: number }) {
  const name = APP_NAME.toUpperCase();
  return (
    <Text style={[styles.word, { fontSize: Math.round(size * 0.8) }]} accessibilityRole="image" accessibilityLabel={APP_NAME}>
      {name.slice(0, -1)}
      <Text style={{ color: colors.accent }}>{name.slice(-1)}</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  word: { fontFamily: fonts.display, color: colors.chalk, letterSpacing: 1.5, marginBottom: 18 },
});
