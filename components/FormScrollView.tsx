import { ReactNode } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleProp, TextInput, TextInputProps, ViewStyle } from 'react-native';
import { KeyboardRevealContext, useKeyboardScroll, useRevealOnFocus } from '../lib/useKeyboardScroll';

// Contenedor de todos los formularios: deja espacio para el teclado (en las dos plataformas; con edge-to-edge,
// Android no lo hace solo) y sube la pantalla hasta la casilla donde se escribe. Las casillas (AuthInput y las de
// medición) se enganchan solas por contexto.
export default function FormScrollView({
  children,
  contentContainerStyle,
}: {
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
}) {
  const { scrollRef, reveal } = useKeyboardScroll();
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <ScrollView ref={scrollRef} contentContainerStyle={contentContainerStyle} keyboardShouldPersistTaps="handled">
        <KeyboardRevealContext.Provider value={reveal}>{children}</KeyboardRevealContext.Provider>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// TextInput que, dentro de un FormScrollView, sube la pantalla al enfocarse (para casillas que no son AuthInput).
export function FormTextInput({ onFocus, ...props }: TextInputProps) {
  const reveal = useRevealOnFocus();
  return (
    <TextInput
      {...props}
      onFocus={(e) => {
        reveal();
        onFocus?.(e);
      }}
    />
  );
}
