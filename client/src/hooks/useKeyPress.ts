import { useEffect, useCallback, useRef } from 'react';

type KeyHandler = (event: KeyboardEvent) => void;

interface UseKeyPressOptions {
  target?: HTMLElement | Window | null;
  eventType?: 'keydown' | 'keyup' | 'keypress';
  preventDefault?: boolean;
}

/**
 * Hook para detectar teclas pressionadas
 *
 * @param key - Tecla ou combinação de teclas (ex: 'Escape', 'ctrl+s', 'cmd+k')
 * @param callback - Função a ser executada quando a tecla for pressionada
 * @param options - Opções de configuração
 *
 * @example
 * // Detectar Escape
 * useKeyPress('Escape', () => closeModal());
 *
 * // Detectar Ctrl+S
 * useKeyPress('ctrl+s', (e) => {
 *   e.preventDefault();
 *   saveDocument();
 * });
 *
 * // Detectar Cmd+K (Mac) ou Ctrl+K (Windows)
 * useKeyPress('mod+k', () => openSearch());
 */
export function useKeyPress(
  key: string,
  callback: KeyHandler,
  options: UseKeyPressOptions = {}
): void {
  const { target = window, eventType = 'keydown', preventDefault = false } = options;

  const callbackRef = useRef(callback);
  useEffect(() => {
    callbackRef.current = callback;
  });

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      const keys = key.toLowerCase().split('+');
      const mainKey = keys[keys.length - 1];
      const modifiers = keys.slice(0, -1);

      // Verifica modificadores
      const ctrlRequired = modifiers.includes('ctrl');
      const shiftRequired = modifiers.includes('shift');
      const altRequired = modifiers.includes('alt');
      const metaRequired = modifiers.includes('meta') || modifiers.includes('cmd');
      const modRequired = modifiers.includes('mod'); // Cmd no Mac, Ctrl no Windows

      const ctrlPressed = event.ctrlKey;
      const shiftPressed = event.shiftKey;
      const altPressed = event.altKey;
      const metaPressed = event.metaKey;

      // Mod = Cmd no Mac, Ctrl no Windows
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modPressed = isMac ? metaPressed : ctrlPressed;

      // Verifica se a tecla principal corresponde
      const keyMatch =
        event.key.toLowerCase() === mainKey ||
        event.code.toLowerCase() === mainKey ||
        event.code.toLowerCase() === `key${mainKey}`;

      // Verifica se os modificadores correspondem
      const modifiersMatch =
        (modRequired ? modPressed : true) &&
        (!modRequired ? ctrlRequired === ctrlPressed : true) &&
        shiftRequired === shiftPressed &&
        altRequired === altPressed &&
        (!modRequired ? metaRequired === metaPressed : true);

      if (keyMatch && modifiersMatch) {
        if (preventDefault) {
          event.preventDefault();
        }
        callbackRef.current(event);
      }
    },
    [key, preventDefault]
  );

  useEffect(() => {
    const targetElement = target || window;
    if (!targetElement) return;

    targetElement.addEventListener(eventType, handleKeyPress as EventListener);

    return () => {
      targetElement.removeEventListener(eventType, handleKeyPress as EventListener);
    };
  }, [target, eventType, handleKeyPress]);
}

/**
 * Hook para detectar múltiplas teclas
 *
 * @example
 * useKeyPressMultiple({
 *   'Escape': () => closeModal(),
 *   'ctrl+s': () => save(),
 *   'ctrl+z': () => undo()
 * });
 */
export function useKeyPressMultiple(
  keyCallbacks: Record<string, KeyHandler>,
  options: UseKeyPressOptions = {}
): void {
  const callbacksRef = useRef(keyCallbacks);
  useEffect(() => {
    callbacksRef.current = keyCallbacks;
  });

  useEffect(() => {
    const { target = window, eventType = 'keydown', preventDefault = false } = options;
    const targetElement = target || window;
    if (!targetElement) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      Object.entries(callbacksRef.current).forEach(([key, callback]) => {
        const keys = key.toLowerCase().split('+');
        const mainKey = keys[keys.length - 1];
        const modifiers = keys.slice(0, -1);

        const ctrlRequired = modifiers.includes('ctrl');
        const shiftRequired = modifiers.includes('shift');
        const altRequired = modifiers.includes('alt');
        const metaRequired = modifiers.includes('meta') || modifiers.includes('cmd');
        const modRequired = modifiers.includes('mod');

        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const modPressed = isMac ? event.metaKey : event.ctrlKey;

        const keyMatch =
          event.key.toLowerCase() === mainKey ||
          event.code.toLowerCase() === mainKey ||
          event.code.toLowerCase() === `key${mainKey}`;

        const modifiersMatch =
          (modRequired ? modPressed : true) &&
          (!modRequired ? ctrlRequired === event.ctrlKey : true) &&
          shiftRequired === event.shiftKey &&
          altRequired === event.altKey &&
          (!modRequired ? metaRequired === event.metaKey : true);

        if (keyMatch && modifiersMatch) {
          if (preventDefault) {
            event.preventDefault();
          }
          callback(event);
        }
      });
    };

    targetElement.addEventListener(eventType, handleKeyPress as EventListener);

    return () => {
      targetElement.removeEventListener(eventType, handleKeyPress as EventListener);
    };
  }, [options]);
}
