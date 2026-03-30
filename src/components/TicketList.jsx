import React, { useState } from 'react';
import { FaSearch, FaEye, FaEdit } from 'react-icons/fa';
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

export default function TicketList({ tickets = [], loading, onRefresh, onEditTicket, onViewTicket }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('todos');

  const filtered = tickets.filter((t) => {
    const matchSearch =
      t.titulo?.toLowerCase().includes(search.toLowerCase()) ||
      t.descripcion?.toLowerCase().includes(search.toLowerCase());

    if (filter === 'todos') return matchSearch;
    return matchSearch && t.estado === filter;
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
          <select
            className="filter-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="abierto">Abiertos</option>
            <option value="pendiente">Pendiente</option>
            <option value="resuelto">Resueltos</option>
            <option value="cerrado">Cerrados</option>
          </select>
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
                      <button className="action-btn" title="Ver" onClick={() => onViewTicket?.(ticket)}><FaEye /></button>
                      <button className="action-btn" title="Editar" onClick={() => onEditTicket(ticket)}><FaEdit /></button>
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
