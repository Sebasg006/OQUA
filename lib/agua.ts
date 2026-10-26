import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { useApi } from './useApi';

export const ML_POR_VASO = 250;
// Tope de vasos por día (5 litros): se puede pasar de la meta, pero no sumar sin fin por error.
export const MAX_VASOS = 20;

// Meta diaria en vasos de 250 ml: unos 35 ml por kilo de peso, entre 6 y 14 vasos.
export function metaVasos(weightKg: number) {
  return Math.min(14, Math.max(6, Math.round((weightKg * 35) / ML_POR_VASO)));
}

// Los vasos se guardan en el teléfono (responde al instante y sirve sin señal) y en el servidor (script 012),
// para que el entrenador conectado los vea. Una llave por usuario y por día.
const PREFIX = (userId: string) => `oqua_agua_${userId}_`;
const keyFor = (userId: string, day: string) => `${PREFIX(userId)}${day}`;
// 'ok' cuando todo lo del teléfono ya está en el servidor; si un envío falla, queda 'pendiente' y se reintenta al abrir.
const syncKey = (userId: string) => `oqua_agua_sync_${userId}`;

type Call = ReturnType<typeof useApi>;

// Vasos de una lista de días 'AAAA-MM-DD' (de menor a mayor o al revés). Manda lo del teléfono; lo que no esté ahí
// (p. ej. tras reinstalar la app) se completa con el servidor si se pasa `call`. Los días sin registro no aparecen.
export async function aguaDeDias(userId: string, days: string[], call?: Call): Promise<Record<string, number>> {
  const result: Record<string, number> = {};
  const local = new Set<string>();
  try {
    const pairs = await AsyncStorage.multiGet(days.map((d) => keyFor(userId, d)));
    pairs.forEach(([, value], i) => {
      if (value == null) return;
      local.add(days[i]);
      const n = Number(value) || 0;
      if (n > 0) result[days[i]] = n;
    });
  } catch {}
  if (call && days.length) {
    const sorted = [...days].sort();
    try {
      const res = await call<{ days: Record<string, number> }>(`/nutricion/agua?desde=${sorted[0]}&hasta=${sorted[sorted.length - 1]}`);
      for (const [day, n] of Object.entries(res.days)) if (!local.has(day) && n > 0) result[day] = n;
    } catch {}
  }
  return result;
}

// Sube todo lo que el teléfono tenga guardado (la primera vez, o tras un envío fallido).
async function subirPendientes(userId: string, call: Call) {
  if ((await AsyncStorage.getItem(syncKey(userId))) === 'ok') return;
  const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(PREFIX(userId)));
  const pairs = await AsyncStorage.multiGet(keys);
  const dias = pairs
    .map(([k, v]) => ({ fecha: k.slice(PREFIX(userId).length), vasos: Math.min(MAX_VASOS, Math.max(0, Number(v) || 0)) }))
    .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d.fecha));
  for (let i = 0; i < dias.length; i += 400) {
    await call('/nutricion/agua', { method: 'PUT', body: { dias: dias.slice(i, i + 400) } });
  }
  await AsyncStorage.setItem(syncKey(userId), 'ok');
}

// Vasos de un día (hoy u otro elegido en la semana). `day` null = no cargar nada (lo usa Inicio cuando el día
// elegido es hoy y ya tiene el de hoy). Cada cambio se guarda en el teléfono y se manda al servidor.
export function useAgua(userId: string, day: string | null) {
  const call = useApi();
  const [vasos, setVasos] = useState(0);

  useEffect(() => {
    if (!userId || !day) return;
    let active = true;
    setVasos(0);
    (async () => {
      const saved = await AsyncStorage.getItem(keyFor(userId, day));
      if (saved != null) {
        if (active) setVasos(Number(saved) || 0);
      } else {
        // Nada en el teléfono para ese día: puede que se haya anotado antes de reinstalar la app.
        const fromServer = await aguaDeDias(userId, [day], call);
        if (active && fromServer[day]) setVasos(fromServer[day]);
      }
    })().catch(() => {});
    subirPendientes(userId, call).catch(() => {});
    return () => {
      active = false;
    };
  }, [userId, day, call]);

  const change = useCallback(
    (delta: number) => {
      if (!day) return;
      const next = Math.min(MAX_VASOS, Math.max(0, vasos + delta));
      setVasos(next);
      AsyncStorage.setItem(keyFor(userId, day), String(next)).catch(() => {});
      call('/nutricion/agua', { method: 'PUT', body: { dias: [{ fecha: day, vasos: next }] } }).catch(() =>
        AsyncStorage.setItem(syncKey(userId), 'pendiente').catch(() => {}),
      );
    },
    [userId, day, vasos, call]
  );

  return { vasos, agregar: () => change(1), quitar: () => change(-1) };
}
