'use client';

/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useState, ReactNode } from 'react';

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
