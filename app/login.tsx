import { router } from '../lib/router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthInput from '../components/AuthInput';
import AuthTopBar from '../components/AuthTopBar';
import GlassSurface from '../components/GlassSurface';
import Glow from '../components/Glow';
import { useAuth } from '../lib/authContext';
import { shared } from '../lib/sharedStyles';
import { authStyles } from '../lib/authStyles';
import FormScrollView from '../components/FormScrollView';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!email.trim() || !password.trim()) {
      setError('Ingresa tu correo y contraseña.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={shared.screen}>
      <Glow />
      <AuthTopBar />
      <FormScrollView contentContainerStyle={[authStyles.scrollContent, styles.content]}>
          <Text style={[shared.title, styles.shadow]}>Bienvenido</Text>
          <Text style={[authStyles.subtitle, styles.subtitle, styles.shadow]}>Ingresa a tu cuenta para continuar</Text>

          <View style={styles.card}>
            <GlassSurface radius={24} />

            <AuthInput
              label="Correo"
              placeholder="tu@correo.com"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <AuthInput
              label="Contraseña"
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {error && <Text style={authStyles.error}>{error}</Text>}

            <Pressable style={[authStyles.primaryBtn, { marginTop: 6 }, submitting && { opacity: 0.6 }]} onPress={handleSubmit} disabled={submitting}>
              <Text style={authStyles.primaryBtnText}>{submitting ? 'Entrando…' : 'Iniciar sesión'}</Text>
            </Pressable>
          </View>

          <View style={authStyles.footerRow}>
            <Text style={authStyles.footerText}>¿No tienes cuenta?</Text>
            <Text style={authStyles.footerLink} onPress={() => router.push('/signup')} accessibilityRole="link" suppressHighlighting>
              Regístrate
            </Text>
          </View>
        </FormScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // El formulario va abajo, cerca del pulgar.
  content: { justifyContent: 'flex-end', paddingBottom: 4 },
  subtitle: { color: 'rgba(245,245,247,0.8)' },
  shadow: { textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 12 },
  card: { padding: 16, paddingBottom: 18, borderRadius: 24, overflow: 'hidden' },
});
