'use client';

import { useCallback, useRef, useState } from 'react';

import { toastHelpers } from '@/hooks/use-toast';

interface UseActionOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
  loadingMessage?: string;
}

interface UseActionReturn<T> {
  isLoading: boolean;
  error: Error | null;
  execute: (...args: unknown[]) => Promise<T | null>;
  reset: () => void;
}

export function useAction<T = unknown>(
  actionFn: (...args: unknown[]) => Promise<T>,
  options: UseActionOptions<T> = {}
): UseActionReturn<T> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { onSuccess, onError, successMessage, errorMessage, loadingMessage } = options;
  const toastIdRef = useRef<string>();

  const execute = useCallback(
    async (...args: unknown[]): Promise<T | null> => {
      setIsLoading(true);
      setError(null);

      if (loadingMessage) {
        toastIdRef.current = toastHelpers.loading(loadingMessage).id;
      }

      try {
        const result = await actionFn(...args);

        if (successMessage) {
          toastHelpers.success(successMessage);
        }

        onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err as Error;
        setError(error);

        if (errorMessage) {
          toastHelpers.error(errorMessage);
        } else {
          toastHelpers.error('Error', error.message);
        }

        onError?.(error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [actionFn, onSuccess, onError, successMessage, errorMessage, loadingMessage]
  );

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  return { isLoading, error, execute, reset };
}

// Hook for mutation with optimistic updates
export function useOptimisticAction<T, P>(
  mutationFn: (params: P) => Promise<T>,
  optimisticData: T,
  options: UseActionOptions<T> = {}
) {
  const [data, setData] = useState<T | null>(null);
  const { isLoading, error, execute, reset } = useAction<T>(
    (params: unknown) => mutationFn(params as P),
    {
      ...options,
      onSuccess: (result) => {
        setData(result);
        options.onSuccess?.(result);
      },
    }
  );

  const executeOptimistic = useCallback(
    async (params: P) => {
      // Immediately update with optimistic data
      setData(optimisticData);

      try {
        const result = await execute(params);
        return result;
      } catch (err) {
        // Revert on error
        setData(null);
        throw err;
      }
    },
    [execute, optimisticData]
  );

  return { data, isLoading, error, execute: executeOptimistic, reset };
}
