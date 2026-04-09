import React, { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FaHome,
  FaTicketAlt,
  FaUsers,
  FaChartBar,
  FaDatabase,
  FaSignOutAlt,
  FaTimes,
  FaBars,
  FaCog,
} from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/Navbar.css';

const SidebarContext = createContext();

export function useSidebarState() {
  return useContext(SidebarContext);
}

export function SidebarProvider({ children }) {
  const [collapsed, setCollapsed] = useState(true);
  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [user, setUser] = useState(null);
  const { collapsed, setCollapsed } = useSidebarState();

  useEffect(() => {
    const currentUser = {
      name: 'USUARIO DEMO',
      initials: 'UD',
      email: 'user@gestix.com',
    };
    setUser(currentUser);
  }, []);

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: FaHome },
    { path: '/tickets', label: 'Tickets', icon: FaTicketAlt },
    { path: '/usuarios', label: 'Usuarios', icon: FaUsers },
    { path: '/reportes', label: 'Reportes', icon: FaChartBar },
    { path: '/admin', label: 'Administración de Datos', icon: FaCog },
    { path: '/administracion', label: 'Administración BD', icon: FaDatabase },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-header">
        <h1 className="logo">Gestix</h1>
        <button
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expandir' : 'Contraer'}
        >
          {collapsed ? <FaBars /> : <FaTimes />}
        </button>
      </div>

      {/* Usuario */}
      {user && (
        <div className="user-section">
          <div className="user-avatar">{user.initials}</div>
          <div className="user-info">
            <p className="user-name">{user.name}</p>
          </div>
        </div>
      )}

      {/* Menu */}
      <ul className="sidebar-menu">
        {menuItems.map((item) => (
          <li key={item.path}>
            <button
              className={`menu-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="menu-icon"><item.icon /></span>
              <span className="menu-label">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={() => { logout(); navigate('/login'); }}>
          <FaSignOutAlt />
          <span className="logout-label">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}

export default Navbar;
