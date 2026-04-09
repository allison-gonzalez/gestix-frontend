import React, { useState } from 'react';
import { FaBell, FaUser, FaSignOutAlt } from 'react-icons/fa';
import '../styles/Header.css';

function Header() {
  const [notifications] = useState(3);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="app-header">
      <div className="header-right">
        {/* Notifications */}
        <div className="header-item notification-item">
          <button
            className="header-icon-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <FaBell />
            {notifications > 0 && (
              <span className="notification-badge">{notifications}</span>
            )}
          </button>

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h4>Notificaciones</h4>
              </div>
              <div className="notification-list">
                <div className="notification-item-dropdown">
                  <p className="notification-title">Nuevo ticket asignado</p>
                  <p className="notification-time">Hace 5 minutos</p>
                </div>
                <div className="notification-item-dropdown">
                  <p className="notification-title">Ticket resuelto</p>
                  <p className="notification-time">Hace 2 horas</p>
                </div>
                <div className="notification-item-dropdown">
                  <p className="notification-title">Nuevo usuario registrado</p>
                  <p className="notification-time">Hace 1 día</p>
                </div>
              </div>
              <div className="notification-footer">
                <a href="#notifications">Ver todas →</a>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <button className="header-icon-btn" title="Perfil">
          <FaUser />
        </button>

        {/* Logout */}
        <button className="header-icon-btn" title="Cerrar sesión">
          <FaSignOutAlt />
        </button>
      </div>
    </header>
  );
}

export default Header;
