import { router as expoRouter } from 'expo-router';

// El mismo `router` de expo-router, pero ignora un segundo toque mientras la pantalla anterior todavía se está
// moviendo: así un doble toque en "Volver" no salta dos pantallas y uno en una fila no abre la ficha dos veces.
// Usar este en vez del de expo-router para navegar.
const LOCK_MS = 500;
let lockedUntil = 0;

function guard<A extends unknown[]>(go: (...args: A) => void) {
  return (...args: A) => {
    const now = Date.now();
    if (now < lockedUntil) return;
    lockedUntil = now + LOCK_MS;
    go(...args);
  };
}

export const router = {
  ...expoRouter,
  push: guard(expoRouter.push),
  navigate: guard(expoRouter.navigate),
  replace: guard(expoRouter.replace),
  back: guard(expoRouter.back),
  dismissTo: guard(expoRouter.dismissTo),
};
