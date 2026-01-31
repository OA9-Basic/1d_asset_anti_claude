/**
 * Async Operation Hook
 *
 * Hook for async operations with automatic loading state
 */

import { useCallback, useState } from 'react';

import { useLoading } from './loading-provider';

export function useAsyncOperation<T = void>() {
  const { startLoading, stopLoading } = useLoading();
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(
    async (operation: () => Promise<T>, loadingMessage = 'Processing...'): Promise<T | null> => {
      startLoading(loadingMessage);
      setError(null);

      try {
        const result = await operation();
        setData(result);
        return result;
      } catch (err) {
        const error = err as Error;
        setError(error);
        return null;
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { execute, data, error, reset };
}
