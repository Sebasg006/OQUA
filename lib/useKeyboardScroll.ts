import { createContext, useCallback, useContext, useEffect, useRef } from 'react';
import { Keyboard, Platform, ScrollView, TextInput } from 'react-native';

// Para formularios dentro de un ScrollView: cuando sale el teclado o se pasa a otra casilla, sube la pantalla
// lo justo para que la casilla donde se escribe (y lo que sigue debajo) quede a la vista sobre el teclado.
// Normalmente no se usa directo: <FormScrollView> lo arma, y las casillas lo llaman solas al enfocarse.
export function useKeyboardScroll(extraBelow = 96) {
  const scrollRef = useRef<ScrollView>(null);

  const reveal = useCallback(() => {
    // Un instante después, para que el teclado y el foco ya estén en su sitio.
    setTimeout(() => {
      const input = TextInput.State.currentlyFocusedInput();
      if (input) scrollRef.current?.getScrollResponder()?.scrollResponderScrollNativeHandleToKeyboard(input, extraBelow, true);
    }, 80);
  }, [extraBelow]);

  useEffect(() => {
    const sub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', reveal);
    return () => sub.remove();
  }, [reveal]);

  return { scrollRef, reveal };
}

// Las casillas dentro de un <FormScrollView> piden subir la pantalla al enfocarse (fuera de uno, no hace nada).
export const KeyboardRevealContext = createContext<() => void>(() => {});
export const useRevealOnFocus = () => useContext(KeyboardRevealContext);
