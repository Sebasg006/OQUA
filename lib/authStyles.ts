import { StyleSheet } from 'react-native';
import { colors, fonts } from './theme';

export const authStyles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  // Pantallas de pasos (recuperar contraseña, código): el contenido arranca arriba, con "Volver" donde se espera.
  scrollContentTop: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  subtitle: {
    color: colors.dim,
    fontSize: 14,
    fontFamily: fonts.body,
    marginTop: -8,
    marginBottom: 24,
  },
  error: {
    color: colors.red,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.body,
    marginBottom: 12,
  },
  linkRight: {
    alignSelf: 'flex-end',
    paddingVertical: 10,
    marginTop: -6,
    marginBottom: 12,
  },
  linkRightText: {
    color: colors.dim,
    fontSize: 13,
    fontFamily: fonts.body,
  },
  primaryBtn: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: colors.ink,
    fontFamily: fonts.bodySemi,
    fontSize: 15,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 24,
  },
  footerText: {
    color: colors.dim,
    fontSize: 13,
    fontFamily: fonts.body,
  },
  footerLink: {
    color: colors.accent,
    fontSize: 13,
    fontFamily: fonts.bodySemi,
  },
});
