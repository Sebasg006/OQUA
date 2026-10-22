import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { armarSvg, Capas } from './muneco-partes/capas';

// Muñeco de cada usuario, con el estilo de la mascota de OQUA (capas en lib/muneco-partes/, fuente en design/muneco/).
// Se guarda solo en el teléfono: qué eligió de cada parte y sus colores.

export type Muneco = Capas;

// Colores para gorro, audífonos y ropa. Sin negro: se perdería el contorno.
export const COLORES = ['#82C6FF', '#3EB7FF', '#FF6B6B', '#F4D150', '#8FD694', '#B28DFF', '#FFB86B', '#E8E1E1'];

// Partes que se eligen en el editor. `ninguno`: texto de la opción "sin esta parte"; `color`: qué color usa.
export const PARTES = {
  gorro: {
    label: 'Gorras',
    ninguno: 'Sin gorra',
    color: 'gorroColor',
    opciones: [
      { valor: 'gorra', label: 'Gorra' },
      { valor: 'lana', label: 'Gorro de lana' },
      { valor: 'bucket', label: 'Bucket' },
      { valor: 'gorraAtras', label: 'Hacia atrás' },
      { valor: 'bandana', label: 'Bandana' },
    ],
  },
  pelo: {
    label: 'Peinado',
    opciones: [
      { valor: 'corto', label: 'Corto' },
      { valor: 'rizado', label: 'Rizado' },
      { valor: 'largo', label: 'Largo' },
    ],
  },
  cara: {
    label: 'Expresión',
    opciones: [
      { valor: 'feliz', label: 'Feliz' },
      { valor: 'serio', label: 'Serio' },
      { valor: 'enojado', label: 'Enojado' },
      { valor: 'sorprendido', label: 'Sorprendido' },
    ],
  },
  accesorio: {
    label: 'Accesorios',
    ninguno: 'Ninguno',
    color: 'accesorioColor',
    opciones: [
      { valor: 'gafas', label: 'Gafas' },
      { valor: 'audifonos', label: 'Audífonos' },
      { valor: 'arete', label: 'Arete' },
    ],
  },
  ropa: {
    label: 'Ropa',
    ninguno: 'Sin ropa',
    color: 'ropaColor',
    opciones: [
      { valor: 'hoodie', label: 'Hoodie' },
      { valor: 'camiseta', label: 'Camiseta' },
      { valor: 'chaqueta', label: 'Chaqueta' },
    ],
  },
} as const;

export type Parte = keyof typeof PARTES;

// El inicial es la mascota: gorra con gota, pelo corto, cara de enojado y hoodie azul.
export const MUNECO_INICIAL: Muneco = {
  gorro: 'gorra',
  gorroColor: '#82C6FF',
  pelo: 'corto',
  cara: 'enojado',
  accesorio: null,
  accesorioColor: '#82C6FF',
  ropa: 'hoodie',
  ropaColor: '#82C6FF',
};

export const munecoSvg = armarSvg;

// v3: los muñecos anteriores (Notionists, Open Peeps) usaban otras partes y ya no sirven.
const keyFor = (userId: string) => `oqua_muneco_v3_${userId}`;

// Muñeco guardado del usuario. `saved` es false mientras no lo haya creado (se muestra el inicial).
export function useMuneco(userId: string | undefined) {
  const [muneco, setMuneco] = useState<Muneco>(MUNECO_INICIAL);
  const [saved, setSaved] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(() => {
    if (!userId) return;
    AsyncStorage.getItem(keyFor(userId))
      .then((raw) => {
        if (raw) {
          setMuneco({ ...MUNECO_INICIAL, ...JSON.parse(raw) });
          setSaved(true);
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [userId]);

  useEffect(reload, [reload]);

  const save = useCallback(
    async (m: Muneco) => {
      if (!userId) return;
      await AsyncStorage.setItem(keyFor(userId), JSON.stringify(m));
      setMuneco(m);
      setSaved(true);
    },
    [userId]
  );

  return { muneco, saved, loaded, save, reload };
}
