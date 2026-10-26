import type { Food } from './alimentos';

// Producto empacado leído por código de barras. El servidor lo busca en Open Food Facts (valores por 100 g).
export type Producto = {
  code: string;
  name: string;
  brand: string | null;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  serving_g: number | null; // porción que trae el empaque, si la trae
  mine?: boolean; // lo agregó el usuario con la etiqueta (no viene de Open Food Facts)
};

// Los productos escaneados quedan en memoria para que la pantalla de porción los encuentre por su código.
const productos = new Map<string, Producto>();

export const guardarProducto = (p: Producto) => productos.set(p.code, p);

export const esProductoMio = (code: string) => !!productos.get(code)?.mine;

// El producto con la forma de un alimento de la lista, para usar la misma pantalla de porción.
export function productoComoAlimento(code: string): Food | null {
  const p = productos.get(code);
  if (!p) return null;
  return {
    id: 0,
    name: p.name,
    food_group: '',
    search: '',
    kcal: p.kcal,
    protein_g: p.protein_g,
    carbs_g: p.carbs_g,
    fat_g: p.fat_g,
    approx: false,
    portions: p.serving_g ? [{ label: '1 porción del empaque', grams: p.serving_g }] : [],
  };
}
