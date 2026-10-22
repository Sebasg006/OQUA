import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const KEY = 'nutricion_token';

// SecureStore guarda en el llavero del teléfono; en web no existe, se usa localStorage.
export async function getToken(): Promise<string | null> {
  try {
    if (Platform.OS === 'web') return localStorage.getItem(KEY);
    return await SecureStore.getItemAsync(KEY);
  } catch {
    return null;
  }
}

export async function saveToken(token: string) {
  if (Platform.OS === 'web') return localStorage.setItem(KEY, token);
  await SecureStore.setItemAsync(KEY, token);
}

export async function clearToken() {
  try {
    if (Platform.OS === 'web') return localStorage.removeItem(KEY);
    await SecureStore.deleteItemAsync(KEY);
  } catch {}
}
