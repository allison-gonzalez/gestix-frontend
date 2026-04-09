import React, { createContext, useContext, useState, useEffect } from 'react';
import { registerLoadingCallback } from '../services/api';

const LoadingContext = createContext(false);

export function LoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    registerLoadingCallback(setIsLoading);
  }, []);

  return (
    <LoadingContext.Provider value={isLoading}>
      {children}
    </LoadingContext.Provider>
  );
}

export const useLoading = () => useContext(LoadingContext);
