import React, { useState } from 'react';
import { FaSearch, FaEye, FaPlus, FaSpinner, FaTimes } from 'react-icons/fa';
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

export default function TicketList({ tickets = [], loading, onRefresh, onView, onCreateTicket, usuarios = [], authUser, onAssign }) {
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [filterPrioridad, setFilterPrioridad] = useState('todas');

  const canAssign = Array.isArray(authUser?.permisos) && authUser.permisos.some(p => Number(p) === 4);

  const filtered = tickets.filter((t) => {
    const matchSearch =
      t.titulo?.toLowerCase().includes(search.toLowerCase()) ||
      t.descripcion?.toLowerCase().includes(search.toLowerCase());
    const matchEstado = filterEstado === 'todos' || t.estado === filterEstado;
    const matchPrioridad = filterPrioridad === 'todas' || t.prioridad === filterPrioridad;
    return matchSearch && matchEstado && matchPrioridad;
  });

  return (
    <div className="ticket-list-container">
      <div className="ticket-list-toolbar">
        <div className="search-and-filters">
          <div className="filter-group">
            <label className="filter-label">Buscar</label>
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Buscar tickets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className="search-box-clear" onClick={() => setSearch('')}>
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
          <div className="filter-buttons">
            <div className="filter-group">
              <label className="filter-label">Estado</label>
              <select
                className="filter-select"
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
              >
                <option value="todos">Todos</option>
                <option value="abierto">Abierto</option>
                <option value="pendiente">Pendiente</option>
                <option value="resuelto">Resuelto</option>
                <option value="cerrado">Cerrado</option>
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Prioridad</label>
              <select
                className="filter-select"
                value={filterPrioridad}
                onChange={(e) => setFilterPrioridad(e.target.value)}
              >
                <option value="todas">Todas</option>
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="critica">Crítica</option>
              </select>
            </div>
          </div>

          {(search || filterEstado !== 'todos' || filterPrioridad !== 'todas') && (
            <button 
              className="btn-secondary"
              onClick={() => {
                setSearch('');
                setFilterEstado('todos');
                setFilterPrioridad('todas');
              }}
              title="Limpiar todos los filtros"
            >
              <FaTimes /> Limpiar
            </button>
          )}
        </div>
        <button 
          className="btn-primary btn-create-ticket"
          onClick={onCreateTicket}
          title="Crear nuevo ticket"
        >
          <FaPlus /> Crear Ticket
        </button>
      </div>

      {loading ? (
        <div className="ul-state ul-state--loading">
          <FaSpinner className="spin" />
          <span>Cargando tickets…</span>
        </div>
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
                    <td className="ticket-id">#{ticket.id}</td>
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
                    <td>
                      {canAssign ? (
                        <select
                          className="assign-select"
                          value={ticket.asignado_a_id ?? ''}
                          onChange={(e) => onAssign && onAssign(ticket.id, e.target.value ? Number(e.target.value) : null)}
                        >
                          <option value="">Sin asignar</option>
                          {usuarios
                            .filter(u => String(u.departamento_id) === String(ticket.departamento_id) && u.estatus === 1)
                            .map(u => (
                              <option key={u.id} value={u.id}>{u.nombre}</option>
                            ))
                          }
                        </select>
                      ) : (
                        ticket.asignado_a_id
                          ? (usuarios.find(u => Number(u.id) === Number(ticket.asignado_a_id))?.nombre ?? 'Sin asignar')
                          : 'Sin asignar'
                      )}
                    </td>
                    <td>{ticket.fecha_creacion ? new Date(ticket.fecha_creacion).toLocaleDateString() : '-'}</td>
                    <td>
                      <div className="admin-actions">
                        <button className="backup-btn restore" title="Ver" onClick={() => onView && onView(ticket)}>
                          <FaEye />
                        </button>
                      </div>
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
