import {
  BigShouldersDisplay_600SemiBold,
  BigShouldersDisplay_700Bold,
  BigShouldersDisplay_800ExtraBold,
} from '@expo-google-fonts/big-shoulders-display';
import { IBMPlexMono_500Medium } from '@expo-google-fonts/ibm-plex-mono';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../lib/authContext';
import { colors, fonts } from '../lib/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    BigShouldersDisplay_600SemiBold,
    BigShouldersDisplay_700Bold,
    BigShouldersDisplay_800ExtraBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    IBMPlexMono_500Medium,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <View style={{ flex: 1, backgroundColor: colors.ink }}>
          <StatusBar style="light" />
          <RootNavigator />
        </View>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

function RootNavigator() {
  const { session, profile, loading } = useAuth();

  // Mientras se restaura la sesión guardada: aviso de espera (no pantalla negra; el servidor gratis tarda en despertar).
  if (loading) return <ConnectingScreen />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.ink },
        animation: 'slide_from_right',
      }}
    >
      {/* Con sesión y datos llenos se llega a las pestañas (abre en Inicio). Sin datos todavía, la primera disponible es "perfil". */}
      <Stack.Protected guard={!!session && !!profile}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>

      <Stack.Protected guard={!!session}>
        <Stack.Screen name="perfil" />
        <Stack.Screen name="cuenta" />
      </Stack.Protected>

      <Stack.Protected guard={!session}>
        {/* La primera de este grupo es a donde llega quien no tiene sesión. */}
        <Stack.Screen name="bienvenida" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
      </Stack.Protected>
    </Stack>
  );
}

function ConnectingScreen() {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, backgroundColor: colors.ink }}>
      <ActivityIndicator color={colors.accent} size="large" />
      <Text style={{ color: colors.chalk, fontFamily: fonts.bodyMedium, fontSize: 16, marginTop: 18 }}>Conectando…</Text>
      {slow && (
        <Text style={{ color: colors.dim, fontFamily: fonts.body, fontSize: 14, lineHeight: 20, marginTop: 8, textAlign: 'center' }}>
          La primera vez del día puede tardar hasta un minuto.
        </Text>
      )}
    </View>
  );
}
