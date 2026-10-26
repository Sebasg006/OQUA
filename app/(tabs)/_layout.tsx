import Feather from '@expo/vector-icons/Feather';
import { Tabs } from 'expo-router';
import FloatingTabBar from '../../components/FloatingTabBar';
import { getDiaElegido } from '../../lib/diaElegido';
import { router } from '../../lib/router';
import { colors } from '../../lib/theme';

// Barra de abajo: Inicio (lo del día), "+" para anotar comida y Perfil (muñeco, datos, entrenador y cuenta).
// La app abre en Inicio.
export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => (
        <FloatingTabBar
          {...props}
          centerAction={{
            label: 'Anotar comida',
            // Desde Inicio anota en el día que se está viendo; desde Perfil, en hoy.
            onPress: (route) => {
              const fecha = route === 'index' ? getDiaElegido() : null;
              router.push({ pathname: '/comida', params: fecha ? { fecha } : {} });
            },
          }}
        />
      )}
      initialRouteName="index"
      // Mantiene las pestañas montadas (en Coatrack, desconectarlas a veces dejaba una en blanco).
      detachInactiveScreens={false}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.ink },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cuenta"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <Feather name="user" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
