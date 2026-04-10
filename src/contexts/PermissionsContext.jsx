import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { permisoService } from '../services/permisoService';

const PermissionsContext = createContext({ permissionsMap: {}, isLoading: true });

export function PermissionsProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [permissionsMap, setPermissionsMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setPermissionsMap({});
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    permisoService
      .getAll()
      .then((res) => {
        const permisos = res.data?.data || [];
        const map = {};
        permisos.forEach((p) => {
          map[p.nombre] = p.id;
        });
        setPermissionsMap(map);
      })
      .catch(() => setPermissionsMap({}))
      .finally(() => setIsLoading(false));
  }, [isAuthenticated]);

  return (
    <PermissionsContext.Provider value={{ permissionsMap, isLoading }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissionsMap() {
  return useContext(PermissionsContext);
}
