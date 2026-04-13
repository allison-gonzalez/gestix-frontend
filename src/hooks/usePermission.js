import { useAuth } from './useAuth';
import { usePermissionsMap } from '../contexts/PermissionsContext';

export function usePermission() {
  const { user } = useAuth();
  const { permissionsMap } = usePermissionsMap();

  const hasPermission = (permissionName) => {
    if (!user?.permisos) return false;
    const permissionId = permissionsMap[permissionName];
    if (permissionId === undefined) return false;
    return user.permisos.some(p => Number(p) === Number(permissionId));
  };

  const hasAnyPermission = (permissionNames) => {
    return permissionNames.some((name) => hasPermission(name));
  };

  const hasAllPermissions = (permissionNames) => {
    return permissionNames.every((name) => hasPermission(name));
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    userPermissions: user?.permisos || [],
  };
}
