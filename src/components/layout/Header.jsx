import React, { useState, useEffect } from 'react';
import { FaBell, FaUser, FaSignOutAlt } from 'react-icons/fa';
import '../../styles/Header.css';
import { subscribeNotifications } from '../../services/notificationBus';

const NOTIFICATIONS_STORAGE_KEY = 'gestix_notifications';

const INITIAL_NOTIFICATIONS = [
  {
    id: 'n1',
    title: 'Nuevo ticket asignado',
    time: 'Hace 5 minutos',
    unread: true,
  },
  {
    id: 'n2',
    title: 'Ticket resuelto',
    time: 'Hace 2 horas',
    unread: false,
  },
  {
    id: 'n3',
    title: 'Nuevo usuario registrado',
    time: 'Hace 1 día',
    unread: false,
  },
];

function Header() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [showNotifications, setShowNotifications] = useState(false);

  const loadNotifications = () => {
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('No se pudo leer notificaciones de localStorage', error);
      return null;
    }
  };

  const saveNotifications = (items) => {
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.warn('No se pudo guardar notificaciones en localStorage', error);
    }
  };

  useEffect(() => {
    const stored = loadNotifications();
    if (stored) {
      setNotifications(stored);
    }
  }, []);

  useEffect(() => {
    saveNotifications(notifications);
  }, [notifications]);

  useEffect(() => {
    const unsubscribe = subscribeNotifications((notification) => {
      setNotifications((prev) => [{ ...notification, unread: true }, ...prev].slice(0, 10));
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (showNotifications) {
      setNotifications((prev) => prev.map((notification) => ({
        ...notification,
        unread: false,
      })));
    }
  }, [showNotifications]);

  const unreadCount = notifications.filter((notification) => notification.unread).length;

  return (
    <header className="app-header">
      <div className="header-right">
        {/* Notifications */}
        <div className="header-item notification-item">
          <button
            className="header-icon-btn"
            onClick={() => setShowNotifications((prev) => !prev)}
          >
            <FaBell />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h4>Notificaciones</h4>
              </div>
              <div className="notification-list">
                {notifications.length === 0 ? (
                  <div className="notification-item-dropdown">
                    <p className="notification-title">No hay notificaciones</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div key={notification.id} className="notification-item-dropdown">
                      <p className="notification-title">{notification.title}</p>
                      {notification.description && (
                        <p className="notification-description">{notification.description}</p>
                      )}
                      <p className="notification-time">{notification.time}</p>
                    </div>
                  ))
                )}
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
