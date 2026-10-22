import type { Tabs } from 'expo-router';
// expo-glass-effect viene incluido con expo-router (misma versión que pide Expo 57); no se instala aparte.
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { useEffect, useRef, useState } from 'react';
import { Animated, Keyboard, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '../lib/theme';

type TabBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>>[0];

const BAR_HEIGHT = 64;
const SIDE = 16;
// Vidrio real de Apple solo en iOS 26+. En Android y iOS anteriores: superficie translúcida con borde de luz.
const LIQUID_GLASS = Platform.OS === 'ios' && isLiquidGlassAvailable();

const bottomOffset = (insetBottom: number) => Math.max(insetBottom, 12) + 6;

// Espacio que deben dejar al final las pantallas con pestañas para que la barra no tape su contenido.
export function useTabBarClearance() {
  const insets = useSafeAreaInsets();
  return BAR_HEIGHT + bottomOffset(insets.bottom) + 20;
}

// Barra de pestañas flotante en forma de píldora, con un indicador que se desliza a la pestaña activa.
export default function FloatingTabBar({ state, descriptors, navigation, insets }: TabBarProps) {
  const [width, setWidth] = useState(0);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const position = useRef(new Animated.Value(state.index)).current;
  const itemWidth = width / state.routes.length;

  useEffect(() => {
    Animated.spring(position, { toValue: state.index, useNativeDriver: true, damping: 18, stiffness: 200, mass: 0.8 }).start();
  }, [state.index, position]);

  // Con el teclado abierto la barra se esconde, para no tapar los campos de texto.
  useEffect(() => {
    const show = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setKeyboardOpen(true));
    const hide = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setKeyboardOpen(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  if (keyboardOpen) return null;

  return (
    <View style={[styles.wrap, { bottom: bottomOffset(insets.bottom) }]} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {LIQUID_GLASS ? (
        <GlassView style={[StyleSheet.absoluteFill, styles.radius]} glassEffectStyle="regular" colorScheme="dark" />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.radius, styles.surface]} />
      )}

      {width > 0 && (
        <Animated.View
          style={[
            styles.indicator,
            { width: itemWidth - 12, transform: [{ translateX: Animated.multiply(position, itemWidth) }] },
          ]}
        />
      )}

      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const focused = state.index === index;
        const color = focused ? colors.accent : colors.dim;
        const label = typeof options.title === 'string' ? options.title : route.name;

        function onPress() {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
        }

        return (
          <TabItem key={route.key} label={label} focused={focused} onPress={onPress}>
            {options.tabBarIcon?.({ focused, color, size: 22 })}
            {/* La barra tiene alto fijo: la letra grande del teléfono se respeta hasta 1,2× para que no se corte. */}
            <Text style={[styles.label, { color }, focused && styles.labelActive]} numberOfLines={1} maxFontSizeMultiplier={1.2}>
              {label}
            </Text>
          </TabItem>
        );
      })}
    </View>
  );
}

// Cada pestaña se "hunde" un poco al presionarla.
function TabItem({ label, focused, onPress, children }: { label: string; focused: boolean; onPress: () => void; children: React.ReactNode }) {
  const scale = useRef(new Animated.Value(1)).current;
  const to = (v: number) => Animated.spring(scale, { toValue: v, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  return (
    <Pressable
      style={styles.item}
      onPress={onPress}
      onPressIn={() => to(0.9)}
      onPressOut={() => to(1)}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
    >
      <Animated.View style={[styles.itemInner, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: SIDE,
    right: SIDE,
    height: BAR_HEIGHT,
    flexDirection: 'row',
    borderRadius: BAR_HEIGHT / 2,
    // Sombra suave para que "flote" (iOS: shadow*, Android: elevation).
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 14,
  },
  radius: { borderRadius: BAR_HEIGHT / 2, overflow: 'hidden' },
  surface: {
    backgroundColor: 'rgba(29,29,31,0.96)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
  },
  indicator: {
    position: 'absolute',
    top: 6,
    bottom: 6,
    left: 6,
    borderRadius: (BAR_HEIGHT - 12) / 2,
    backgroundColor: 'rgba(62,183,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(62,183,255,0.28)',
  },
  item: { flex: 1 },
  itemInner: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 },
  label: { fontSize: 11, fontFamily: fonts.body },
  labelActive: { fontFamily: fonts.bodySemi },
});
