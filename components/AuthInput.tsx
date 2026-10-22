import Feather from '@expo/vector-icons/Feather';
import { Ref, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, fonts } from '../lib/theme';
import { useRevealOnFocus } from '../lib/useKeyboardScroll';

// Campo de texto con etiqueta. El borde se pone dorado mientras se escribe, para saber dónde estás.
// Si es de contraseña (`secureTextEntry`), lleva un ojo a la derecha para mostrarla u ocultarla.
export default function AuthInput({
  label,
  onFocus,
  onBlur,
  style,
  secureTextEntry,
  ...inputProps
}: { label: string; ref?: Ref<TextInput> } & TextInputProps) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  const reveal = useRevealOnFocus();
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View>
        <TextInput
          style={[
            styles.input,
            inputProps.multiline && styles.multiline,
            focused && styles.focused,
            secureTextEntry && styles.withEye,
            style,
          ]}
          placeholderTextColor={colors.dim}
          autoCapitalize="none"
          onFocus={(e) => {
            setFocused(true);
            reveal();
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...inputProps}
          secureTextEntry={secureTextEntry && hidden}
        />
        {secureTextEntry && (
          <Pressable
            style={({ pressed }) => [styles.eye, pressed && { opacity: 0.6 }]}
            onPress={() => setHidden((h) => !h)}
            hitSlop={4}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Mostrar contraseña' : 'Ocultar contraseña'}
          >
            <Feather name={hidden ? 'eye' : 'eye-off'} size={20} color={colors.dim} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: {
    color: colors.dim,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    fontFamily: fonts.body,
  },
  input: {
    minHeight: 52,
    backgroundColor: colors.graphite,
    borderWidth: 1,
    borderColor: colors.graphite3,
    borderRadius: 12,
    color: colors.chalk,
    fontFamily: fonts.body,
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  multiline: { minHeight: 96, textAlignVertical: 'top' },
  focused: { borderColor: colors.accent },
  withEye: { paddingRight: 52 },
  eye: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 52, alignItems: 'center', justifyContent: 'center' },
});
