import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '../lib/theme';

// Aviso flotante tipo burbuja abajo de la pantalla: sube al aparecer y baja al irse (message = null lo oculta).
// Va abajo para no tapar el título ni los botones de arriba. `bottom`: en pantallas con barra de pestañas, su espacio.
export default function Toast({ message, bottom }: { message: string | null; bottom?: number }) {
  const insets = useSafeAreaInsets();
  const progress = useRef(new Animated.Value(0)).current;
  // Se conserva el último texto mientras corre la animación de salida.
  const [shown, setShown] = useState<string | null>(message);

  useEffect(() => {
    if (message) {
      setShown(message);
      Animated.spring(progress, { toValue: 1, useNativeDriver: true, damping: 16, stiffness: 220 }).start();
    } else {
      Animated.timing(progress, { toValue: 0, duration: 180, useNativeDriver: true }).start(({ finished }) => {
        if (finished) setShown(null);
      });
    }
  }, [message, progress]);

  if (!shown) return null;

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [24, 0] });
  const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] });

  return (
    <View pointerEvents="none" style={[styles.wrap, { bottom: bottom ?? insets.bottom + 16 }]}>
      <Animated.View style={[styles.toast, { opacity: progress, transform: [{ translateY }, { scale }] }]}>
        <Text style={styles.text}>{shown}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16, alignItems: 'center' },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(42,42,45,0.97)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 22,
    maxWidth: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  text: { color: colors.chalk, fontSize: 13, fontFamily: fonts.bodyMedium, flexShrink: 1 },
});
