import Feather from '@expo/vector-icons/Feather';
import { ComponentProps } from 'react';
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, fonts } from '../lib/theme';

type Variant = 'primary' | 'secondary' | 'danger';

// Botón de la app: alto cómodo para el pulgar (52), se oscurece al tocarlo y muestra un indicador mientras carga.
export default function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: ComponentProps<typeof Feather>['name'];
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const textColor = variant === 'primary' ? colors.ink : variant === 'danger' ? colors.red : colors.chalk;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && styles.pressed,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          {icon && <Feather name={icon} size={18} color={textColor} />}
          <Text style={[styles.text, { color: textColor }]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 18,
  },
  primary: { backgroundColor: colors.accent },
  secondary: { backgroundColor: colors.graphite, borderWidth: 1, borderColor: colors.graphite3 },
  danger: { borderWidth: 1, borderColor: colors.red },
  pressed: { opacity: 0.75, transform: [{ scale: 0.985 }] },
  disabled: { opacity: 0.5 },
  text: { fontFamily: fonts.bodySemi, fontSize: 15 },
});
