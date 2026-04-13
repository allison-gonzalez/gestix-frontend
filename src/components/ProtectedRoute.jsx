import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FaSpinner } from 'react-icons/fa';
import '../styles/TicketList.css';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="ul-state ul-state--loading">
          <FaSpinner className="spin" />
          <span>Cargando…</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
