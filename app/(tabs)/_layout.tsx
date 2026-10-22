import Feather from '@expo/vector-icons/Feather';
import { Tabs } from 'expo-router';
import FloatingTabBar from '../../components/FloatingTabBar';
import { colors } from '../../lib/theme';

// Barra de abajo como en el Figma de OQUA: Calendario, Inicio y Cámara. La app abre en Inicio.
export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      initialRouteName="index"
      // Mantiene las pestañas montadas (en Coatrack, desconectarlas a veces dejaba una en blanco).
      detachInactiveScreens={false}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.ink },
      }}
    >
      <Tabs.Screen
        name="calendario"
        options={{
          title: 'Calendario',
          tabBarIcon: ({ color, size }) => <Feather name="calendar" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="camara"
        options={{
          title: 'Cámara',
          tabBarIcon: ({ color, size }) => <Feather name="camera" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
