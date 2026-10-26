import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { aguaDeDias, metaVasos } from './agua';
import { localDateOf } from './format';
import { useApi } from './useApi';

const DIAS_ATRAS = 365;

const dayOffset = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return localDateOf(d.toISOString());
};

// Racha: días seguidos "cumplidos". Un día cuenta si se anotó al menos una comida O se completó la meta de agua
// (decisión del usuario: basta con una de las dos). Si hoy todavía no se cumple, la racha sigue viva desde ayer.
// hoyCumplido llega desde Inicio para que la racha cambie apenas se anota algo, sin volver a pedir nada.
// `diaElegido`: si en la semana se está viendo un día anterior, lo que se anote ahí cuenta al instante.
export function useRacha(
  userId: string | undefined,
  weightKg: number | undefined,
  hoyCumplido: boolean,
  diaElegido?: { day: string; cumple: boolean },
) {
  const call = useApi();
  const [pasados, setPasados] = useState<Set<string> | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!userId || !weightKg) return;
      let active = true;
      const days = Array.from({ length: DIAS_ATRAS }, (_, i) => dayOffset(i + 1)); // de ayer hacia atrás
      Promise.all([
        call<{ days: string[] }>(`/nutricion/comidas/dias?desde=${days[days.length - 1]}`),
        aguaDeDias(userId, days, call),
      ])
        .then(([comidas, agua]) => {
          if (!active) return;
          const meta = metaVasos(weightKg);
          const done = new Set(comidas.days);
          for (const [day, vasos] of Object.entries(agua)) if (vasos >= meta) done.add(day);
          setPasados(done);
        })
        .catch((e) => {
          // Sin datos de días anteriores la racha cuenta solo hoy; el aviso sale en la terminal de Expo.
          console.warn('Racha: no se pudieron leer los días anteriores:', (e as Error).message);
          if (active) setPasados(new Set());
        });
      return () => {
        active = false;
      };
    }, [call, userId, weightKg]),
  );

  if (!pasados) return null;
  const done = new Set(pasados);
  if (diaElegido) {
    if (diaElegido.cumple) done.add(diaElegido.day);
    else done.delete(diaElegido.day);
  }
  const today = dayOffset(0);
  let dias = 0;
  while (dias < DIAS_ATRAS && done.has(dayOffset(dias + 1))) dias++;
  // Para marcar en la semana qué días contaron.
  const cuenta = (day: string) => (day === today ? hoyCumplido : done.has(day));
  return { dias: dias + (hoyCumplido ? 1 : 0), hoyCumplido, cuenta };
}
