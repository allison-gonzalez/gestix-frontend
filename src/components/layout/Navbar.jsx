import React, { useState, createContext, useContext } from 'react';
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
import { usePermission } from '../../hooks/usePermission';
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
  const { logout, user: authUser } = useAuth();
  const { hasPermission } = usePermission();
  const { collapsed, setCollapsed } = useSidebarState();

  const getInitials = (name) => {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const userData = authUser
    ? {
        name: authUser.nombre || 'Sin nombre',
        initials: getInitials(authUser.nombre),
        email: authUser.correo || '',
      }
    : null;

  const allMenuItems = [
    { path: '/', label: 'Dashboard', icon: FaHome, requiredPermission: null },
    { path: '/tickets', label: 'Tickets', icon: FaTicketAlt, requiredPermission: 'crear_ticket' },
    { path: '/usuarios', label: 'Usuarios', icon: FaUsers, requiredPermission: 'ver_usuarios' },
    { path: '/reportes', label: 'Reportes', icon: FaChartBar, requiredPermission: 'ver_reportes' },
    { path: '/admin', label: 'Administración de Datos', icon: FaCog, requiredPermission: 'acceso_admin' },
    { path: '/administracion', label: 'Administración BD', icon: FaDatabase, requiredPermission: 'acceso_admin_datos' },
  ];

  // Filtrar items según permisos
  const menuItems = allMenuItems.filter((item) => !item.requiredPermission || hasPermission(item.requiredPermission));

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
      {userData && (
        <div className="user-section">
          <div className="user-avatar">{userData.initials}</div>
          <div className="user-info">
            <p className="user-name">{userData.name}</p>
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
