import { LayoutAnimation } from 'react-native';

// Llamar justo antes de abrir o cerrar algo (acordeones, bloques plegables): el próximo cambio de tamaño
// se anima en vez de saltar. Corre en el lado nativo, así que no frena la app.
export function animateNextLayout() {
  LayoutAnimation.configureNext(LayoutAnimation.create(240, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.opacity));
}
