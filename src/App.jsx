import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Auth (HEAD)
import { AuthProvider } from './contexts/AuthContext';
import { PermissionsProvider } from './contexts/PermissionsContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ProtectedRouteWithPermission } from './components/ProtectedRouteWithPermission';
import { useAuth } from './hooks/useAuth';
import { usePermission } from './hooks/usePermission';
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
import Profile from './pages/Profile';

import './styles/index.css';

function AppContent() {
  const { collapsed } = useSidebarState();
  const { hasPermission } = usePermission();

  return (
    <div className="app-layout">
      <LoadingBar />
      <Navbar />
      <div className={`main-content ${!collapsed ? 'sidebar-expanded' : ''}`}>
        <Header />
        <main className="app-main">
          <Routes>
            <Route path="/home" element={<Home />} />
            
            {/* Ruta del Perfil de Usuario */}
            <Route path="/perfil" element={<Profile />} />

            <Route
              path="/tickets"
              element={
                hasPermission('crear_ticket') || hasPermission('ver_reportes') ? (
                  <Tickets />
                ) : (
                  <PermissionGuardFallback />
                )
              }
            />
            <Route
              path="/usuarios"
              element={
                hasPermission('ver_usuarios') ? (
                  <Usuarios />
                ) : (
                  <PermissionGuardFallback />
                )
              }
            />
            <Route
              path="/reportes"
              element={
                hasPermission('ver_reportes') ? (
                  <Reportes />
                ) : (
                  <PermissionGuardFallback />
                )
              }
            />
            <Route
              path="/administracion"
              element={
                hasPermission('acceso_admin_datos') ? (
                  <Administracion />
                ) : (
                  <PermissionGuardFallback />
                )
              }
            />
            <Route
              path="/admin"
              element={
                hasPermission('acceso_admin') ? (
                  <AdminModule />
                ) : (
                  <PermissionGuardFallback />
                )
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function PermissionGuardFallback() {
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

function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <PermissionsProvider>
        <LoadingProvider>
          <SidebarProvider>
            <AppContent />
          </SidebarProvider>
        </LoadingProvider>
      </PermissionsProvider>
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