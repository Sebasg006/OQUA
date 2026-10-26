import { useEffect, useState } from 'react';
import { useApi } from './useApi';

// Alimento de la lista de OQUA (script 011): valores por 100 g de USDA FoodData Central y porciones caseras.
export type Portion = { label: string; grams: number };
export type Food = {
  id: number;
  name: string;
  food_group: string;
  search: string; // nombre y sinónimos en minúsculas y sin tildes
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  approx: boolean;
  portions: Portion[];
};

// La lista es corta y casi nunca cambia: se baja una vez por sesión de la app y se busca en el teléfono.
let cache: Food[] | null = null;

export function useAlimentos() {
  const call = useApi();
  const [foods, setFoods] = useState<Food[] | null>(cache);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cache) return;
    let active = true;
    call<{ foods: Food[] }>('/nutricion/alimentos')
      .then((res) => {
        cache = res.foods;
        if (active) setFoods(res.foods);
      })
      .catch((e) => active && setError((e as Error).message));
    return () => {
      active = false;
    };
  }, [call]);

  return { foods, error };
}

export const alimentoPorId = (id: number) => cache?.find((f) => f.id === id) ?? null;

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();

// Cada palabra escrita debe aparecer en el nombre o sus sinónimos ("arroz coc" encuentra "Arroz blanco cocido").
// Primero los que empiezan por lo escrito.
export function buscar(foods: Food[], query: string) {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (!words.length) return foods;
  const hits = foods.filter((f) => words.every((w) => f.search.includes(w)));
  return hits.sort((a, b) => Number(!a.search.startsWith(words[0])) - Number(!b.search.startsWith(words[0])));
}

// Lo que aportan unos gramos del alimento, redondeado como lo guarda el servidor.
export function aporte(food: Food, grams: number) {
  const k = grams / 100;
  const r1 = (n: number) => Math.round(n * k * 10) / 10;
  return { kcal: Math.round(food.kcal * k), proteina: r1(food.protein_g), carbos: r1(food.carbs_g), grasa: r1(food.fat_g) };
}
