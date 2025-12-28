import { useState, useCallback } from 'react';

interface UseClipboardOptions {
  timeout?: number;
}

interface UseClipboardReturn {
  copied: boolean;
  copy: (text: string) => Promise<boolean>;
  error: Error | null;
}

/**
 * Hook para copiar texto para a área de transferência
 *
 * @param options - Opções de configuração
 * @returns { copied, copy, error }
 *
 * @example
 * const { copied, copy } = useClipboard();
 *
 * <button onClick={() => copy('Texto para copiar')}>
 *   {copied ? 'Copiado!' : 'Copiar'}
 * </button>
 */
export function useClipboard(options: UseClipboardOptions = {}): UseClipboardReturn {
  const { timeout = 2000 } = options;

  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      if (!navigator?.clipboard) {
        setError(new Error('Clipboard API não disponível'));
        return false;
      }

      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setError(null);

        // Reset após timeout
        setTimeout(() => {
          setCopied(false);
        }, timeout);

        return true;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Erro ao copiar'));
        setCopied(false);
        return false;
      }
    },
    [timeout]
  );

  return { copied, copy, error };
}

/**
 * Hook para ler da área de transferência
 *
 * @returns { paste, error }
 */
export function useClipboardRead(): {
  paste: () => Promise<string | null>;
  error: Error | null;
} {
  const [error, setError] = useState<Error | null>(null);

  const paste = useCallback(async (): Promise<string | null> => {
    if (!navigator?.clipboard) {
      setError(new Error('Clipboard API não disponível'));
      return null;
    }

    try {
      const text = await navigator.clipboard.readText();
      setError(null);
      return text;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao colar'));
      return null;
    }
  }, []);

  return { paste, error };
}
