import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar, { SidebarProvider, useSidebarState } from './components/layout/Navbar';
import Header from './components/layout/Header';
import LoadingBar from './components/common/LoadingBar';
import { LoadingProvider } from './context/LoadingContext';
import Home from './pages/Home';
import Tickets from './pages/Tickets';
import Usuarios from './pages/Usuarios';
import Administracion from './pages/Administracion';
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
            <Route path="/" element={<Home />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/administracion" element={<Administracion />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <LoadingProvider>
        <SidebarProvider>
          <AppContent />
        </SidebarProvider>
      </LoadingProvider>
    </Router>
  );
}

export default App;
