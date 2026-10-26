import { router } from '../lib/router';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthInput from '../components/AuthInput';
import AuthTopBar from '../components/AuthTopBar';
import GlassSurface from '../components/GlassSurface';
import Glow from '../components/Glow';
import { useAuth } from '../lib/authContext';
import { authStyles } from '../lib/authStyles';
import { shared } from '../lib/sharedStyles';
import FormScrollView from '../components/FormScrollView';
import { useCoachCode } from '../components/CoachCode';

export default function SignupScreen() {
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const coach = useCoachCode();
  // "siguiente" pasa a la próxima casilla; subir la pantalla con el teclado lo hace FormScrollView.
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  async function handleSubmit() {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Completa nombre, correo y contraseña.');
      return;
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (coach.blocker) {
      setError(coach.blocker);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await signup({ name: name.trim(), email: email.trim(), password }, coach.code || undefined);
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
          <Text style={[shared.title, styles.shadow]}>Crear cuenta</Text>
          <Text style={[authStyles.subtitle, styles.subtitle, styles.shadow]}>Crea tu cuenta para llevar tus calorías del día</Text>

          <View style={styles.card}>
            <GlassSurface radius={24} />

            <AuthInput
              label="Nombre"
              placeholder="Tu nombre"
              autoCapitalize="words"
              value={name}
              onChangeText={setName}
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => emailRef.current?.focus()}
            />
            <AuthInput
              ref={emailRef}
              label="Correo"
              placeholder="tu@correo.com"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />
            <AuthInput
              ref={passwordRef}
              label="Contraseña"
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              returnKeyType="done"
            />

            {coach.element}

            {error && <Text style={authStyles.error}>{error}</Text>}

            <Pressable style={[authStyles.primaryBtn, { marginTop: 6 }, submitting && { opacity: 0.6 }]} onPress={handleSubmit} disabled={submitting}>
              <Text style={authStyles.primaryBtnText}>{submitting ? 'Creando…' : 'Crear cuenta'}</Text>
            </Pressable>
          </View>

          <View style={authStyles.footerRow}>
            <Text style={authStyles.footerText}>¿Ya tienes cuenta?</Text>
            <Text style={authStyles.footerLink} onPress={() => router.push('/login')} accessibilityRole="link" suppressHighlighting>
              Inicia sesión
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
