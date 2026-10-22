import { useCallback } from 'react';
import { api, ApiError } from './api';
import { useAuth } from './authContext';

// Llamadas a la API con el token de la sesión; si el servidor dice que la sesión venció, cierra sesión.
export function useApi() {
  const { token, logout } = useAuth();
  return useCallback(
    async <T,>(path: string, opts: { method?: string; body?: unknown } = {}) => {
      try {
        return await api<T>(path, { ...opts, token });
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) await logout();
        throw e;
      }
    },
    [token, logout],
  );
}
