import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { api, ApiError } from './api';
import { Profile } from './calorias';
import { clearToken, getToken, saveToken } from './tokenStorage';

export type Session = {
  id: string;
  name: string;
  email: string;
};

type AuthResponse = { user: Session; token: string };

type AuthContextValue = {
  session: Session | null;
  profile: Profile | null; // null hasta que la persona llena sus datos la primera vez
  token: string | null;
  loading: boolean; // true mientras se restaura la sesión guardada al abrir la app
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { name: string; email: string; password: string }) => Promise<void>;
  saveProfile: (profile: Profile) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth debe usarse dentro de <AuthProvider />');
  return value;
}

// Todas las rutas de esta app están bajo /nutricion en el servidor que comparte con Coatrack.
export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Al abrir la app: si hay un token guardado, el backend confirma que sigue siendo válido y manda el perfil.
  useEffect(() => {
    (async () => {
      const saved = await getToken();
      if (saved) {
        try {
          const res = await api<{ user: Session; profile: Profile | null }>('/nutricion/me', { token: saved });
          setSession(res.user);
          setProfile(res.profile);
          setToken(saved);
        } catch (e) {
          // Token vencido o inválido: se descarta. Si solo falló la red, se conserva para el próximo intento.
          if (e instanceof ApiError && e.status === 401) await clearToken();
        }
      }
      setLoading(false);
    })();
  }, []);

  async function finish({ user, token }: AuthResponse) {
    // Al entrar se trae el perfil antes de mostrar la app, para no pedir los datos a quien ya los llenó.
    const res = await api<{ profile: Profile | null }>('/nutricion/me', { token });
    await saveToken(token);
    setToken(token);
    setProfile(res.profile);
    setSession(user);
  }

  async function login(email: string, password: string) {
    await finish(await api<AuthResponse>('/nutricion/login', { body: { email, password } }));
  }

  async function signup(data: { name: string; email: string; password: string }) {
    await finish(await api<AuthResponse>('/nutricion/register', { body: data }));
  }

  async function saveProfile(next: Profile) {
    try {
      await api('/nutricion/perfil', { method: 'PUT', body: next, token });
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) await logout();
      throw e;
    }
    setProfile(next);
  }

  async function logout() {
    await clearToken();
    setToken(null);
    setSession(null);
    setProfile(null);
  }

  return (
    <AuthContext.Provider value={{ session, profile, token, loading, login, signup, saveProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
