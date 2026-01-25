'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { FullPageLoader } from '@/components/ui/loading-overlay';

interface LoadingContextType {
  isLoading: boolean;
  message: string;
  setLoading: (loading: boolean, message?: string) => void;
  startLoading: (message?: string) => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return context;
}

interface LoadingProviderProps {
  children: ReactNode;
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('Loading...');

  const setLoading = useCallback((loading: boolean, msg?: string) => {
    setIsLoading(loading);
    if (msg) setMessage(msg);
  }, []);

  const startLoading = useCallback((msg?: string) => {
    setIsLoading(true);
    if (msg) setMessage(msg);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <LoadingContext.Provider
      value={{ isLoading, message, setLoading, startLoading, stopLoading }}
    >
      {children}
      {isLoading && <FullPageLoader message={message} />}
    </LoadingContext.Provider>
  );
}

// Hook for async operations with automatic loading state
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

  return { execute, error, data };
}
