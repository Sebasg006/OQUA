import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { localDateOf } from './format';

export const ML_POR_VASO = 250;
// Tope de vasos por día (5 litros): se puede pasar de la meta, pero no sumar sin fin por error.
export const MAX_VASOS = 20;

// Meta diaria en vasos de 250 ml: unos 35 ml por kilo de peso, entre 6 y 14 vasos.
export function metaVasos(weightKg: number) {
  return Math.min(14, Math.max(6, Math.round((weightKg * 35) / ML_POR_VASO)));
}

// Los vasos se guardan solo en el teléfono, uno por usuario y por día.
const keyFor = (userId: string, day: string) => `oqua_agua_${userId}_${day}`;

export function useAguaHoy(userId: string) {
  const [day, setDay] = useState(() => localDateOf(new Date().toISOString()));
  const [vasos, setVasos] = useState(0);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(keyFor(userId, day))
      .then((v) => active && setVasos(v ? Number(v) || 0 : 0))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [userId, day]);

  const change = useCallback(
    (delta: number) => {
      // Si la app quedó abierta de un día para otro, el conteo empieza de nuevo
      const today = localDateOf(new Date().toISOString());
      const base = today === day ? vasos : 0;
      const next = Math.min(MAX_VASOS, Math.max(0, base + delta));
      if (today !== day) setDay(today);
      setVasos(next);
      AsyncStorage.setItem(keyFor(userId, today), String(next)).catch(() => {});
    },
    [userId, day, vasos]
  );

  return { vasos, agregar: () => change(1), quitar: () => change(-1) };
}
