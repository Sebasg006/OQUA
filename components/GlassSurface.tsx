import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { Platform, StyleSheet, View } from 'react-native';

// Vidrio real solo en iOS 26+; en Android y iOS anteriores, una superficie translúcida con borde fino.
const LIQUID_GLASS = Platform.OS === 'ios' && isLiquidGlassAvailable();

// Fondo de vidrio para una tarjeta o botón sobre una foto. Va como primer hijo de un contenedor con
// `overflow: 'hidden'` y el mismo radio.
export default function GlassSurface({ radius }: { radius: number }) {
  return LIQUID_GLASS ? (
    <GlassView style={[StyleSheet.absoluteFill, { borderRadius: radius }]} glassEffectStyle="regular" colorScheme="dark" />
  ) : (
    <View style={[StyleSheet.absoluteFill, styles.surface, { borderRadius: radius }]} />
  );
}

const styles = StyleSheet.create({
  surface: { backgroundColor: 'rgba(29,29,31,0.62)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)' },
});
