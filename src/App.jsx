import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Navbar, { SidebarProvider, useSidebarState } from './components/Navbar';
import Header from './components/Header';
import Home from './pages/Home';
import Tickets from './pages/Tickets';
import Usuarios from './pages/Usuarios';
import Login from './pages/Login';
import './styles/index.css';

function AppContent() {
  const { collapsed } = useSidebarState();

  return (
    <div className="app-layout">
      <Navbar />
      <div className={`main-content ${!collapsed ? 'sidebar-expanded' : ''}`}>
        <Header />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/usuarios" element={<Usuarios />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <SidebarProvider>
                  <AppContent />
                </SidebarProvider>
              </ProtectedRoute>
            }
          />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <SidebarProvider>
                  <AppContent />
                </SidebarProvider>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
