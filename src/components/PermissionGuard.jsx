import { usePermission } from '../hooks/usePermission';

export function PermissionGuard({
  children,
  permission,
  permiso,
  permissions = [],
  requireAll = false,
  fallback = null,
}) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermission();

  let hasAccess = false;
  const singlePermission = permission || permiso;

  if (singlePermission) {
    hasAccess = hasPermission(singlePermission);
  } else if (permissions.length > 0) {
    hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  }

  return hasAccess ? children : fallback;
}
