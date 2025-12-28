import { useState, useCallback, useEffect, useRef } from 'react';

interface AsyncState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

interface UseAsyncReturn<T, P extends unknown[]> extends AsyncState<T> {
  execute: (...params: P) => Promise<T | null>;
  reset: () => void;
}

/**
 * Hook para gerenciar operações assíncronas com estados de loading, success e error
 *
 * @param asyncFunction - Função assíncrona a ser executada
 * @param immediate - Se true, executa imediatamente ao montar o componente
 *
 * @example
 * const { data, isLoading, error, execute } = useAsync(fetchPatients);
 *
 * // Executar manualmente
 * const handleClick = () => execute();
 *
 * // Ou executar automaticamente
 * const { data, isLoading } = useAsync(fetchPatients, true);
 */
export function useAsync<T, P extends unknown[] = []>(
  asyncFunction: (...params: P) => Promise<T>,
  immediate = false
): UseAsyncReturn<T, P> {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    isLoading: immediate,
    isSuccess: false,
    isError: false,
  });

  // Ref para verificar se o componente está montado
  const mountedRef = useRef(true);

  // Ref para a função assíncrona (evita recriação)
  const asyncFunctionRef = useRef(asyncFunction);
  asyncFunctionRef.current = asyncFunction;

  const execute = useCallback(async (...params: P): Promise<T | null> => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      isSuccess: false,
      isError: false,
      error: null,
    }));

    try {
      const result = await asyncFunctionRef.current(...params);

      if (mountedRef.current) {
        setState({
          data: result,
          error: null,
          isLoading: false,
          isSuccess: true,
          isError: false,
        });
      }

      return result;
    } catch (error) {
      if (mountedRef.current) {
        setState({
          data: null,
          error: error instanceof Error ? error : new Error(String(error)),
          isLoading: false,
          isSuccess: false,
          isError: true,
        });
      }
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      isSuccess: false,
      isError: false,
    });
  }, []);

  // Executa imediatamente se solicitado
  useEffect(() => {
    if (immediate) {
      execute(...([] as unknown as P));
    }
  }, [immediate, execute]);

  // Cleanup quando desmonta
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return { ...state, execute, reset };
}

/**
 * Hook para executar função com loading state
 *
 * @example
 * const { isLoading, withLoading } = useLoading();
 *
 * const handleSave = withLoading(async () => {
 *   await saveData();
 * });
 */
export function useLoading(): {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  withLoading: <T>(fn: () => Promise<T>) => () => Promise<T>;
} {
  const [isLoading, setLoading] = useState(false);

  const withLoading = useCallback(
    <T>(fn: () => Promise<T>) =>
      async () => {
        setLoading(true);
        try {
          return await fn();
        } finally {
          setLoading(false);
        }
      },
    []
  );

  return { isLoading, setLoading, withLoading };
}

/**
 * Hook para gerenciar múltiplos estados de loading
 *
 * @example
 * const { isLoading, startLoading, stopLoading } = useMultipleLoading();
 *
 * const handleSave = async () => {
 *   startLoading('save');
 *   await save();
 *   stopLoading('save');
 * };
 *
 * // Verificar se está carregando
 * if (isLoading('save')) { ... }
 * if (isLoading()) { ... } // qualquer loading ativo
 */
export function useMultipleLoading(): {
  isLoading: (key?: string) => boolean;
  startLoading: (key: string) => void;
  stopLoading: (key: string) => void;
  activeLoadings: string[];
} {
  const [loadingStates, setLoadingStates] = useState<Set<string>>(new Set());

  const isLoading = useCallback(
    (key?: string) => {
      if (key) {
        return loadingStates.has(key);
      }
      return loadingStates.size > 0;
    },
    [loadingStates]
  );

  const startLoading = useCallback((key: string) => {
    setLoadingStates(prev => new Set(prev).add(key));
  }, []);

  const stopLoading = useCallback((key: string) => {
    setLoadingStates(prev => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }, []);

  return {
    isLoading,
    startLoading,
    stopLoading,
    activeLoadings: Array.from(loadingStates),
  };
}
