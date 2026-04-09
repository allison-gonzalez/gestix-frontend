import React, { useState } from 'react';
import { FaSearch, FaFilter, FaEye, FaPen } from 'react-icons/fa';
import '../styles/TicketList.css';

const PRIORITY_COLORS = {
  alta: 'badge-red',
  media: 'badge-orange',
  baja: 'badge-blue',
};

const STATUS_COLORS = {
  abierto: 'badge-green',
  pendiente: 'badge-yellow',
  resuelto: 'badge-gray',
  cerrado: 'badge-gray',
};

export default function TicketList({ tickets = [], loading, onRefresh, onView, onEdit }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('todos');

  const filtered = tickets.filter((t) => {
    const matchSearch =
      t.titulo?.toLowerCase().includes(search.toLowerCase()) ||
      t.descripcion?.toLowerCase().includes(search.toLowerCase());
    if (filter === 'alta') return matchSearch && t.prioridad === 'alta';
    if (filter === 'abiertos') return matchSearch && t.estado === 'abierto';
    if (filter === 'pendientes') return matchSearch && t.estado === 'pendiente';
    if (filter === 'resueltos') return matchSearch && t.estado === 'resuelto';
    if (filter === 'cerrados') return matchSearch && t.estado === 'cerrado';
    return matchSearch;
  });

  return (
    <div className="ticket-list-container">
      <div className="ticket-list-toolbar">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-buttons">
          <button className={`filter-btn ${filter === 'todos' ? 'active' : ''}`} onClick={() => setFilter('todos')}>Todos</button>
          <button className={`filter-btn ${filter === 'alta' ? 'active' : ''}`} onClick={() => setFilter('alta')}>Alta Prioridad</button>
          <button className={`filter-btn ${filter === 'abiertos' ? 'active' : ''}`} onClick={() => setFilter('abiertos')}>Abiertos</button>
          <button className={`filter-btn ${filter === 'pendientes' ? 'active' : ''}`} onClick={() => setFilter('pendientes')}>Pendientes</button>
          <button className={`filter-btn ${filter === 'resueltos' ? 'active' : ''}`} onClick={() => setFilter('resueltos')}>Resueltos</button>
          <button className={`filter-btn ${filter === 'cerrados' ? 'active' : ''}`} onClick={() => setFilter('cerrados')}>Cerrados</button>
          <button className="filter-btn icon-btn"><FaFilter /></button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Cargando tickets...</div>
      ) : (
        <div className="table-wrapper">
          <table className="ticket-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>TÍTULO</th>
                <th>PRIORIDAD</th>
                <th>ESTADO</th>
                <th>ASIGNADO A</th>
                <th>FECHA</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="7" className="empty-state">No se encontraron tickets</td></tr>
              ) : (
                filtered.map((ticket, index) => (
                  <tr key={ticket._id || index}>
                    <td className="ticket-id">#{index + 1}</td>
                    <td className="ticket-title">{ticket.titulo}</td>
                    <td>
                      <span className={`badge ${PRIORITY_COLORS[ticket.prioridad] || 'badge-gray'}`}>
                        {ticket.prioridad}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${STATUS_COLORS[ticket.estado] || 'badge-gray'}`}>
                        {ticket.estado}
                      </span>
                    </td>
                    <td>{ticket.asignado_a || 'Sin asignar'}</td>
                    <td>{ticket.fecha_creacion ? new Date(ticket.fecha_creacion).toLocaleDateString() : '-'}</td>
                    <td className="actions">
                      <button className="action-btn action-btn-view" title="Ver" onClick={() => onView && onView(ticket)}>
                        <FaEye />
                      </button>
                      <button className="action-btn action-btn-edit" title="Editar" onClick={() => onEdit && onEdit(ticket)}>
                        <FaPen />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
