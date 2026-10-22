import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, fonts } from '../lib/theme';

const PAD = 4;

// Selector de opciones en fila: el fondo de la opción elegida se desliza de una a otra.
// `tone="accent"` para elegir un valor (fecha, objetivo, nivel); `tone="neutral"` para cambiar de sección.
// Con `allowDeselect`, tocar la opción elegida la quita (onChange recibe null).
export default function SegmentedControl<K extends string>({
  options,
  value,
  onChange,
  tone = 'accent',
  trackColor = colors.graphite,
  allowDeselect = false,
  accessibilityRole = 'radio',
  style,
}: {
  options: { key: K; label: string }[];
  value: K | null;
  onChange: (key: K | null) => void;
  tone?: 'accent' | 'neutral';
  trackColor?: string;
  allowDeselect?: boolean;
  accessibilityRole?: 'radio' | 'tab';
  style?: StyleProp<ViewStyle>;
}) {
  const [width, setWidth] = useState(0);
  const index = options.findIndex((o) => o.key === value);
  const position = useRef(new Animated.Value(Math.max(index, 0))).current;
  const shown = useRef(new Animated.Value(index >= 0 ? 1 : 0)).current;
  const wasShown = useRef(index >= 0);
  const itemWidth = width / options.length;

  useEffect(() => {
    if (index >= 0) {
      // Si no había nada elegido, el fondo aparece en su sitio en vez de llegar deslizándose desde otra opción.
      if (wasShown.current) Animated.spring(position, { toValue: index, useNativeDriver: true, damping: 18, stiffness: 200, mass: 0.8 }).start();
      else position.setValue(index);
    }
    wasShown.current = index >= 0;
    Animated.timing(shown, { toValue: index >= 0 ? 1 : 0, duration: 150, useNativeDriver: true }).start();
  }, [index, position, shown]);

  return (
    <View style={[styles.track, { backgroundColor: trackColor }, style]} onLayout={(e) => setWidth(e.nativeEvent.layout.width - PAD * 2)}>
      {width > 0 && (
        <Animated.View
          style={[
            styles.indicator,
            {
              width: itemWidth,
              backgroundColor: tone === 'accent' ? colors.accent : colors.graphite3,
              opacity: shown,
              transform: [{ translateX: Animated.multiply(position, itemWidth) }],
            },
          ]}
        />
      )}
      {options.map((o) => {
        const selected = o.key === value;
        return (
          <Pressable
            key={o.key}
            style={styles.item}
            onPress={() => onChange(selected && allowDeselect ? null : o.key)}
            accessibilityRole={accessibilityRole}
            accessibilityState={{ selected }}
          >
            <Text
              style={[styles.text, selected && (tone === 'accent' ? styles.textAccent : styles.textNeutral)]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', borderRadius: 14, padding: PAD },
  indicator: { position: 'absolute', left: PAD, top: PAD, height: 44, borderRadius: 10 },
  item: { flex: 1, height: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  text: { color: colors.dim, fontFamily: fonts.body, fontSize: 14 },
  textAccent: { color: colors.accentInk, fontFamily: fonts.bodySemi },
  textNeutral: { color: colors.chalk, fontFamily: fonts.bodySemi },
});
