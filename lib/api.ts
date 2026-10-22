import Constants from 'expo-constants';
import { Platform } from 'react-native';

// En desarrollo, Expo sabe la IP de tu computador (hostUri) y el teléfono
// llega al backend por esa IP; "localhost" en un teléfono sería el teléfono mismo.
function resolveBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  if (host) return `http://${host}:3000`;
  return Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
}

export const API_URL = resolveBaseUrl();

export class ApiError extends Error {
  // code: identificador opcional que manda el backend (p. ej. 'EMAIL_NOT_VERIFIED').
  constructor(message: string, public status: number, public code?: string) {
    super(message);
  }
}

export async function api<T>(path: string, opts: { method?: string; body?: unknown; token?: string | null } = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: opts.method ?? (opts.body ? 'POST' : 'GET'),
      headers: {
        'Content-Type': 'application/json',
        ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
      },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
  } catch {
    throw new ApiError('No se pudo conectar con el servidor. Revisa que el backend esté corriendo y que estés en la misma red.', 0);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error ?? 'Error del servidor', res.status, data.code);
  return data as T;
}
