import { useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';

// Ejecuta callback cada vez que la pantalla queda visible (al entrar, al volver,
// o si cambian las dependencias mientras está visible, por ejemplo al iniciar sesión).
export function useOnFocus(callback: () => void, deps: unknown[] = []) {
  const saved = useRef(callback);
  saved.current = callback;
  useFocusEffect(useCallback(() => { saved.current(); }, deps));
}