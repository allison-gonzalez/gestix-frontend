import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Auth (HEAD)
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';

// Layout (MAIN)
import Navbar, { SidebarProvider, useSidebarState } from './components/layout/Navbar';
import Header from './components/layout/Header';
import LoadingBar from './components/common/LoadingBar';
import { LoadingProvider } from './context/LoadingContext';

// Pages (MAIN + comunes)
import Home from './pages/Home';
import Tickets from './pages/Tickets';
import Usuarios from './pages/Usuarios';
import Administracion from './pages/Administracion';
import AdminModule from './pages/AdminModule';
import Reportes from './pages/Reportes';

import './styles/index.css';

function AppContent() {
  const { collapsed } = useSidebarState();

  return (
    <div className="app-layout">
      <LoadingBar />
      <Navbar />
      <div className={`main-content ${!collapsed ? 'sidebar-expanded' : ''}`}>
        <Header />
        <main className="app-main">
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/administracion" element={<Administracion />} />
            <Route path="/admin" element={<AdminModule />} />
            <Route path="/reportes" element={<Reportes />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <LoadingProvider>
        <SidebarProvider>
          <AppContent />
        </SidebarProvider>
      </LoadingProvider>
    </ProtectedRoute>
  );
}

function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/home" replace />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Login (HEAD prioridad) */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

          {/* Redirect base */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Rutas protegidas */}
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;