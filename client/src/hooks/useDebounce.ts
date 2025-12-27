import { useState, useEffect } from 'react';

/**
 * Hook para debounce de valores
 * Útil para evitar atualizações excessivas em buscas e filtros
 *
 * @param value - Valor a ser "debounced"
 * @param delay - Tempo de espera em milissegundos (padrão: 300ms)
 * @returns Valor após o debounce
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook para criar uma função com debounce
 * Útil para callbacks que não devem ser chamados frequentemente
 *
 * @param callback - Função a ser executada após o debounce
 * @param delay - Tempo de espera em milissegundos (padrão: 300ms)
 * @returns Função com debounce aplicado
 */
export function useDebouncedCallback<T extends (...args: Parameters<T>) => ReturnType<T>>(
  callback: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const newTimeoutId = setTimeout(() => {
      callback(...args);
    }, delay);

    setTimeoutId(newTimeoutId);
  };
}
