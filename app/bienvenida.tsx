import { router } from '../lib/router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import GlassSurface from '../components/GlassSurface';
import Logo from '../components/Logo';
import Glow from '../components/Glow';
import { colors, fonts } from '../lib/theme';

// Primera pantalla sin sesión. Casi todos los que la ven acaban de instalar la app, así que la acción
// principal es crear la cuenta; quien ya tiene cuenta casi nunca la ve (la sesión queda guardada).
export default function BienvenidaScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <Glow />
      <View style={styles.top}>
        <Logo size={34} />
      </View>

      <View style={styles.bottom}>
        <Text style={styles.headline}>Tus calorías y tus gramos, sin hacer cuentas.</Text>
        <Text style={styles.sub}>Sabes cuánto te queda hoy para bajar de peso.</Text>

        <Button label="Crear cuenta" onPress={() => router.push('/signup')} />
        <Pressable
          style={({ pressed }) => [styles.glassBtn, pressed && styles.pressed]}
          onPress={() => router.push('/login')}
          accessibilityRole="button"
        >
          <GlassSurface radius={14} />
          <Text style={styles.glassText}>Ya tengo cuenta</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  top: { paddingHorizontal: 24, paddingTop: 12 },
  bottom: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: 24, paddingBottom: 12, gap: 12 },
  headline: {
    fontFamily: fonts.display,
    color: colors.chalk,
    fontSize: 46,
    lineHeight: 48,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 14,
  },
  sub: { color: 'rgba(245,245,247,0.8)', fontFamily: fonts.body, fontSize: 15, marginBottom: 16 },
  glassBtn: { height: 52, borderRadius: 14, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  glassText: { color: colors.chalk, fontFamily: fonts.bodySemi, fontSize: 15 },
  pressed: { opacity: 0.75, transform: [{ scale: 0.985 }] },
});
