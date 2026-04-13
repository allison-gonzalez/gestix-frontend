import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePermission } from '../hooks/usePermission';

export function ProtectedRouteWithPermission({
  children,
  requiredPermissions = [],
  requireAll = false,
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const { hasAnyPermission, hasAllPermissions } = usePermission();

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <p>Cargando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPermissions.length > 0) {
    const hasAccess = requireAll
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);

    if (!hasAccess) {
      return (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          <h2>Acceso Denegado</h2>
          <p>No tienes permisos para acceder a este módulo.</p>
        </div>
      );
    }
  }

  return children;
}
