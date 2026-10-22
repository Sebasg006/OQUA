import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../lib/theme';

export default function Avatar({ initials, size = 42 }: { initials: string; size?: number }) {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.text, { fontSize: Math.round(size * 0.36) }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.graphite2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: fonts.displayBold,
    color: colors.accent,
    fontSize: 15,
  },
});
