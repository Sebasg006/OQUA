import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, fonts } from '../lib/theme';
import Button from './Button';

// Borrado que no se puede deshacer: el botón rojo se activa solo al escribir la palabra pedida
// (sin importar mayúsculas, tildes ni espacios de más), así es difícil borrar por error.
const normalize = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim().toUpperCase();

export default function ConfirmDeleteModal({
  visible,
  title,
  text,
  word,
  deleting,
  onConfirm,
  onClose,
}: {
  visible: boolean;
  title: string;
  text: string;
  word: string;
  deleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const [typed, setTyped] = useState('');
  const [focused, setFocused] = useState(false);
  const matches = normalize(typed) === normalize(word);

  useEffect(() => {
    if (visible) setTyped('');
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView style={styles.backdrop} behavior="padding">
        <Pressable style={StyleSheet.absoluteFill} onPress={deleting ? undefined : onClose} />
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.text}>{text}</Text>
          <Text style={styles.label}>
            Escribe <Text style={styles.word}>{normalize(word)}</Text> para confirmar
          </Text>
          <TextInput
            style={[styles.input, focused && styles.inputFocused]}
            value={typed}
            onChangeText={setTyped}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoCapitalize="characters"
            autoCorrect={false}
            editable={!deleting}
            maxLength={120}
          />
          <Button label="Eliminar para siempre" variant="danger" onPress={onConfirm} loading={deleting} disabled={!matches} />
          <Pressable style={styles.cancel} onPress={onClose} disabled={deleting} hitSlop={8}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  card: { backgroundColor: colors.graphite, borderRadius: 20, padding: 20 },
  title: { color: colors.chalk, fontFamily: fonts.display, fontSize: 26, lineHeight: 32 },
  text: { color: colors.dim, fontFamily: fonts.body, fontSize: 14, lineHeight: 20, marginTop: 4 },
  label: { color: colors.chalk, fontFamily: fonts.body, fontSize: 14, lineHeight: 20, marginTop: 16 },
  word: { fontFamily: fonts.bodySemi, color: colors.red },
  input: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.graphite3,
    backgroundColor: colors.graphite2,
    paddingHorizontal: 14,
    color: colors.chalk,
    fontFamily: fonts.body,
    fontSize: 16,
    marginTop: 8,
    marginBottom: 14,
  },
  inputFocused: { borderColor: colors.red },
  cancel: { alignSelf: 'center', marginTop: 14, padding: 6 },
  cancelText: { color: colors.dim, fontFamily: fonts.body, fontSize: 14 },
});
