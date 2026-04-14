import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaUser, FaSignOutAlt, FaTicketAlt, FaCheckCircle, FaCheck } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useNotificaciones } from '../../contexts/NotificacionesContext';
import '../../styles/Header.css';

const TIPO_ICON = {
  ticket_creado:     <FaTicketAlt />,
  ticket_asignado:   <FaTicketAlt />,
  ticket_resuelto:   <FaCheckCircle />,
  comentario_nuevo:  <FaBell />,
};

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60)   return 'Ahora';
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400)return `Hace ${Math.floor(diff / 3600)} h`;
  return `Hace ${Math.floor(diff / 86400)} d`;
}

function Header() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { notificaciones, noLeidas, marcarLeida, marcarTodasLeidas } = useNotificaciones() ?? {};
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const countNoLeidas = noLeidas ?? 0;
  const lista = notificaciones ?? [];

  return (
    <header className="app-header">
      <div className="header-right">
        {/* Notifications */}
        <div className="header-item notification-item" ref={dropdownRef}>
          <button
            className="header-icon-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notificaciones"
          >
            <FaBell />
            {countNoLeidas > 0 && (
              <span className="notification-badge">
                {countNoLeidas > 99 ? '99+' : countNoLeidas}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h4>Notificaciones</h4>
                {countNoLeidas > 0 && (
                  <button
                    className="notif-mark-all-btn"
                    onClick={marcarTodasLeidas}
                    title="Marcar todas como leídas"
                  >
                    <FaCheck /> Marcar todas
                  </button>
                )}
              </div>

              <div className="notification-list">
                {lista.length === 0 ? (
                  <p className="notif-empty">Sin notificaciones</p>
                ) : (
                  lista.slice(0, 20).map((n) => (
                    <div
                      key={n.id}
                      className={`notification-item-dropdown ${n.leida ? 'notif-leida' : 'notif-no-leida'}`}
                      onClick={() => {
                        if (!n.leida) marcarLeida(n.id);
                        if (n.ticket_id) navigate(`/tickets`);
                      }}
                    >
                      <span className="notif-tipo-icon">
                        {TIPO_ICON[n.tipo] ?? <FaBell />}
                      </span>
                      <div className="notif-body">
                        <p className="notification-title">{n.titulo}</p>
                        <p className="notif-mensaje">{n.mensaje}</p>
                        <p className="notification-time">{timeAgo(n.created_at)}</p>
                      </div>
                      {!n.leida && <span className="notif-dot" />}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <button className="header-icon-btn" title="Perfil" onClick={() => navigate('/perfil')}>
          <FaUser />
        </button>

        {/* Logout */}
        <button className="header-icon-btn" title="Cerrar sesión" onClick={() => { logout(); navigate('/login'); }}>
          <FaSignOutAlt />
        </button>
      </div>
    </header>
  );
}

export default Header;
