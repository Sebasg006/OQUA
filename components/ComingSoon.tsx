import { Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Glow from './Glow';
import { shared } from '../lib/sharedStyles';
import { colors, fonts } from '../lib/theme';

// Pantalla provisional de una pestaña que todavía no tiene su función: dice qué va a haber ahí.
export default function ComingSoon({
  title,
  icon,
  text,
}: {
  title: string;
  icon: ImageSourcePropType;
  text: string;
}) {
  return (
    <SafeAreaView style={shared.screen}>
      <Glow />
      <View style={styles.content}>
        <Text style={shared.title}>{title}</Text>
        <View style={styles.center}>
          <Image source={icon} style={styles.icon} accessibilityIgnoresInvertColors />
          <Text style={styles.text}>{text}</Text>
          <Text style={styles.soon}>Muy pronto</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 120 },
  icon: { width: 112, height: 112, marginBottom: 20 },
  text: { color: colors.chalk, fontFamily: fonts.bodyMedium, fontSize: 16, lineHeight: 22, textAlign: 'center', maxWidth: 280 },
  soon: { color: colors.accent, fontFamily: fonts.bodySemi, fontSize: 13, marginTop: 10 },
});
