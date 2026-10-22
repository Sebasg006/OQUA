import { StyleSheet } from 'react-native';
import { colors, fonts } from './theme';

export const shared = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.ink,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  eyebrow: {
    color: colors.dim,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
    fontFamily: fonts.body,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 30,
    lineHeight: 36, // la letra de títulos se corta por abajo sin alto de línea explícito
    color: colors.chalk,
    marginBottom: 16,
  },
  sectionTitle: {
    color: colors.chalk,
    fontSize: 13,
    fontFamily: fonts.bodyMedium,
    marginTop: 20,
    marginBottom: 10,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.graphite,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    color: colors.chalk,
    fontFamily: fonts.body,
    fontSize: 14,
    padding: 0,
  },
});
