import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '../lib/theme';
import GlassSurface from './GlassSurface';

const fire = require('../assets/icons3d/fire.png');
const VISIBLE_MS = 4000;
const RADIUS = 24;

const diasText = (n: number) => `${n} ${n === 1 ? 'día' : 'días'}`;

export function streakCopy(dias: number, hoyCumplido: boolean) {
  if (hoyCumplido) return { title: `¡${diasText(dias)} de racha!`, body: 'Hoy ya cuenta. Sigue así mañana.' };
  if (dias > 0) return { title: `Llevas ${diasText(dias)} de racha`, body: 'Anota una comida o completa el agua para no perderla.' };
  return { title: 'Empieza tu racha hoy', body: 'Anota una comida o completa el agua.' };
}

// Racha como notificación flotante de vidrio (estilo iPhone): baja desde arriba, se queda unos segundos y sube sola.
// Va encima de la pantalla (no ocupa espacio en la lista); tocarla la cierra antes.
export default function StreakBanner({
  open,
  dias,
  hoyCumplido,
  onClose,
}: {
  open: boolean;
  dias: number;
  hoyCumplido: boolean;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const anim = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      Animated.spring(anim, { toValue: 1, friction: 8, tension: 70, useNativeDriver: true }).start();
      const timer = setTimeout(onClose, VISIBLE_MS);
      return () => clearTimeout(timer);
    }
    Animated.timing(anim, { toValue: 0, duration: 220, useNativeDriver: true }).start(({ finished }) => finished && setMounted(false));
  }, [open, anim, onClose]);

  if (!mounted) return null;
  const { title, body } = streakCopy(dias, hoyCumplido);

  return (
    <Animated.View
      style={[
        styles.wrap,
        { top: insets.top + 8 },
        {
          opacity: anim,
          transform: [
            { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-90, 0] }) },
            { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) },
          ],
        },
      ]}
      pointerEvents={open ? 'auto' : 'none'}
    >
      <Pressable onPress={onClose} style={styles.banner} accessibilityRole="button" accessibilityLabel={`${title}. ${body}. Toca para cerrar.`}>
        <GlassSurface radius={RADIUS} />
        <View style={styles.tint} pointerEvents="none" />
        <Animated.Image source={fire} style={[styles.icon, !hoyCumplido && styles.iconOff]} />
        <View style={{ flex: 1 }}>
          <View style={styles.head}>
            <Text style={styles.app}>OQUA · RACHA</Text>
            <Text style={styles.time}>ahora</Text>
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 12,
    right: 12,
    zIndex: 10,
    // Sombra suave para que se vea flotando sobre el contenido
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: RADIUS,
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  // Un poco más oscuro que el vidrio solo, para que el texto se lea sobre el anillo azul
  tint: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(10,10,11,0.35)' },
  icon: { width: 42, height: 42 },
  iconOff: { opacity: 0.4 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  app: { color: colors.dim, fontFamily: fonts.bodySemi, fontSize: 11, letterSpacing: 0.8 },
  time: { color: colors.dim, fontFamily: fonts.body, fontSize: 11 },
  title: { color: colors.chalk, fontFamily: fonts.bodySemi, fontSize: 15, marginTop: 2 },
  body: { color: colors.dim, fontFamily: fonts.body, fontSize: 13, lineHeight: 18, marginTop: 1 },
});
