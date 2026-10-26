import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { localDateOf } from './format';
import { useApi } from './useApi';

// Comida anotada a mano. Se guarda en el servidor (tabla nutricion.meals); los gramos son opcionales.
export type Meal = {
  id: string;
  name: string;
  kcal: number;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  food_id: number | null; // null = anotada a mano
  grams: number | null;
  portion: string | null; // "1 taza", "2 × 1 arepa mediana"; null si se escribieron los gramos
};

// A mano (nombre y calorías) o de la lista (alimento y gramos: el servidor calcula las calorías).
// Un producto escaneado va como "a mano" pero con su cantidad (gramos y porción).
export type NewMeal =
  | (Pick<Meal, 'name' | 'kcal' | 'protein_g' | 'carbs_g' | 'fat_g'> & { grams?: number | null; portion?: string | null })
  | { food_id: number; grams: number; portion: string | null };

// El día lo pone el teléfono, para que una comida de las 11 p. m. no caiga en el día siguiente.
export const hoy = () => localDateOf(new Date().toISOString());

// `fecha`: el día al que va la comida (por defecto hoy; desde la semana de Inicio se puede anotar en días anteriores).
export function useCrearComida() {
  const call = useApi();
  return useCallback(
    (meal: NewMeal, fecha?: string) => call<{ meal: Meal }>('/nutricion/comidas', { body: { fecha: fecha || hoy(), ...meal } }),
    [call],
  );
}

// Comidas de un día y lo que suman. `day` null = no cargar (Inicio ya tiene las de hoy en otro llamado).
// Se vuelven a pedir cada vez que se entra a la pantalla (p. ej. al volver de anotar una).
export function useComidasDia(day: string | null) {
  const call = useApi();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const shownDay = useRef<string | null>(null);

  const load = useCallback(() => {
    if (!day) return;
    let active = true;
    // Al cambiar de día se limpia la lista; al volver a la pantalla el mismo día se recarga sin parpadear.
    if (shownDay.current !== day) {
      shownDay.current = day;
      setLoaded(false);
      setMeals([]);
    }
    call<{ meals: Meal[] }>(`/nutricion/comidas?fecha=${day}`)
      .then((res) => {
        if (!active) return;
        setMeals(res.meals);
        setError(null);
      })
      .catch((e) => active && setError((e as Error).message))
      .finally(() => active && setLoaded(true));
    return () => {
      active = false;
    };
  }, [call, day]);

  useFocusEffect(load);

  const remove = useCallback(
    async (id: string) => {
      await call(`/nutricion/comidas/${id}`, { method: 'DELETE' });
      setMeals((list) => list.filter((m) => m.id !== id));
    },
    [call],
  );

  const totals = useMemo(
    () =>
      meals.reduce(
        (t, m) => ({
          kcal: t.kcal + m.kcal,
          proteina: t.proteina + (m.protein_g ?? 0),
          carbos: t.carbos + (m.carbs_g ?? 0),
          grasa: t.grasa + (m.fat_g ?? 0),
        }),
        { kcal: 0, proteina: 0, carbos: 0, grasa: 0 },
      ),
    [meals],
  );

  return { meals, totals, loaded, error, remove };
}

// "Lo que comes seguido": comidas repetidas de los últimos 60 días, con la misma cantidad, para anotarlas con un toque.
export type Reciente = Meal & { veces: number };

export function useRecientes() {
  const call = useApi();
  const [recientes, setRecientes] = useState<Omit<Reciente, 'id'>[]>([]);

  // Si falla, el buscador sigue funcionando igual, solo sin esta sección.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      call<{ meals: Omit<Reciente, 'id'>[] }>('/nutricion/comidas/recientes')
        .then((res) => active && setRecientes(res.meals))
        .catch((e) => console.warn('Recientes:', (e as Error).message));
      return () => {
        active = false;
      };
    }, [call]),
  );

  return recientes;
}

// Lo que hay que mandar para volver a anotar una comida igual: de la lista, alimento y gramos; a mano, sus valores.
export function comoNueva(m: Omit<Meal, 'id'>): NewMeal {
  if (m.food_id !== null && m.grams !== null) return { food_id: m.food_id, grams: m.grams, portion: m.portion };
  return { name: m.name, kcal: m.kcal, protein_g: m.protein_g, carbs_g: m.carbs_g, fat_g: m.fat_g, grams: m.grams, portion: m.portion };
}
