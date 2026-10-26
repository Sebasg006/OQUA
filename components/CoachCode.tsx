import Feather from '@expo/vector-icons/Feather';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { api } from '../lib/api';
import { colors, fonts } from '../lib/theme';
import AuthInput from './AuthInput';

const cleanCode = (c: string) => c.replace(/\s/g, '').toUpperCase();

// Casilla del código del entrenador (como un código de referido) + el permiso para compartir. Al escribir los
// 6 caracteres busca el nombre del entrenador; si existe, pide aceptar qué va a ver. Vacío = sin entrenador.
// `ready`: se puede seguir (vacío, o código válido con el permiso aceptado). `blocker`: por qué no.
export function useCoachCode() {
  const [code, setCode] = useState('');
  const [coach, setCoach] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'checking' | 'ok' | 'notfound' | 'error'>('idle');
  const [consent, setConsent] = useState(false);
  const clean = cleanCode(code);

  useEffect(() => {
    setCoach(null);
    setConsent(false);
    if (clean.length < 6) return setStatus('idle');
    let active = true;
    setStatus('checking');
    api<{ coach: { name: string } }>(`/nutricion/codigo/${clean}`)
      .then((res) => {
        if (!active) return;
        setCoach(res.coach.name);
        setStatus('ok');
      })
      .catch((e) => active && setStatus((e as { status?: number }).status === 404 ? 'notfound' : 'error'));
    return () => {
      active = false;
    };
  }, [clean]);

  const blocker = !clean
    ? null
    : status === 'ok'
      ? consent
        ? null
        : 'Acepta compartir tus datos con tu entrenador, o borra el código.'
      : status === 'checking'
        ? 'Estamos revisando el código.'
        : 'Revisa el código de tu entrenador, o bórralo para seguir sin él.';

  const element = (
    <View>
      <AuthInput
        label="Código de tu entrenador (opcional)"
        placeholder="ABC123"
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={7}
        value={code}
        onChangeText={setCode}
      />
      {status === 'checking' && <ActivityIndicator color={colors.accent} style={styles.checking} />}
      {status === 'notfound' && <Text style={styles.warn}>Ese código no existe. Pídeselo de nuevo a tu entrenador.</Text>}
      {status === 'error' && <Text style={styles.warn}>No pudimos revisar el código. Revisa tu conexión.</Text>}
      {status === 'ok' && coach && (
        <View style={styles.coachBox}>
          <View style={styles.coachRow}>
            <Feather name="user-check" size={18} color={colors.accent} />
            <Text style={styles.coachName}>{coach}</Text>
          </View>
          <Pressable
            onPress={() => setConsent((c) => !c)}
            style={styles.consentRow}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: consent }}
          >
            <View style={[styles.box, consent && styles.boxOn]}>{consent && <Feather name="check" size={14} color={colors.accentInk} />}</View>
            <Text style={styles.consentText}>
              Acepto que <Text style={styles.strong}>{coach}</Text> vea lo que como, mi agua, mi racha y mi peso. Puedo dejar de
              compartir cuando quiera desde Tu cuenta.
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );

  return { code: clean, ready: blocker === null, blocker, element };
}

const styles = StyleSheet.create({
  checking: { alignSelf: 'flex-start', marginTop: -6, marginBottom: 10 },
  warn: { color: colors.dim, fontFamily: fonts.body, fontSize: 13, lineHeight: 18, marginTop: -6, marginBottom: 10 },
  coachBox: { backgroundColor: 'rgba(62,183,255,0.08)', borderRadius: 14, padding: 12, marginTop: -4, marginBottom: 12 },
  coachRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  coachName: { color: colors.chalk, fontFamily: fonts.bodySemi, fontSize: 15 },
  consentRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', minHeight: 44 },
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.graphite3,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  boxOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  consentText: { flex: 1, color: colors.chalk, fontFamily: fonts.body, fontSize: 13, lineHeight: 19 },
  strong: { fontFamily: fonts.bodySemi },
});
