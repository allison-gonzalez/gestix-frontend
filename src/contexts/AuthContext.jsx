import { createContext, useState, useCallback, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar usuario y token desde localStorage o sessionStorage al montar
  useEffect(() => {
    const storedToken =
      localStorage.getItem('token') || sessionStorage.getItem('token');
    const storedUser =
      localStorage.getItem('user') || sessionStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Error loading auth data:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((newToken, userData, rememberMe = false) => {
    setToken(newToken);
    setUser(userData);
    setIsAuthenticated(true);
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('token', newToken);
    storage.setItem('user', JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  }, []);

  const updateUser = useCallback((newData) => {
    const updatedUser = { ...user, ...newData };
    setUser(updatedUser);
    if (localStorage.getItem('token')) {
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } else {
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
    }
  }, [user]);

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
