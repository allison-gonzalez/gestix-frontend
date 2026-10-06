import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { permisoService } from '../services/permisoService';
import { cacheGet, cacheSet } from '../utils/localCache';

const toMap = (permisos) => {
  const map = {};
  permisos.forEach((p) => { map[p.nombre] = p.id; });
  return map;
};

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
        cacheSet('permisos', permisos);
        setPermissionsMap(toMap(permisos));
      })
      // sin internet se usa la última lista guardada, para no perder el acceso a las pantallas
      .catch(() => setPermissionsMap(toMap(cacheGet('permisos') || [])))
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
