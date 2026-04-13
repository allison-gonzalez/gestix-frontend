import React, { useState } from 'react';
import { FaSearch, FaEye, FaEdit } from 'react-icons/fa';
import DataTable from '../common/DataTable';
import '../../styles/TicketList.css';

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

export default function TicketList({ tickets = [], loading, onRefresh, usuarios = [], authUser, onAssign }) {
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

  const columns = [
    { label: 'ID',         render: (t) => <span className="ticket-id">#{t.id}</span> },
    { label: 'TÍTULO',     render: (t)    => <span className="ticket-title">{t.titulo}</span> },
    { label: 'PRIORIDAD',  render: (t)    => <span className={`badge ${PRIORITY_COLORS[t.prioridad] || 'badge-gray'}`}>{t.prioridad}</span> },
    { label: 'ESTADO',     render: (t)    => <span className={`badge ${STATUS_COLORS[t.estado]    || 'badge-gray'}`}>{t.estado}</span> },
    { label: 'ASIGNADO A', render: (t) => {
      if (canAssign) {
        const deptUsers = usuarios.filter(u =>
          String(u.departamento_id) === String(t.departamento_id) && u.estatus === 1
        );
        return (
          <select
            className="assign-select"
            value={t.asignado_a_id ?? ''}
            onChange={(e) => onAssign && onAssign(t.id, e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">Sin asignar</option>
            {deptUsers.map(u => (
              <option key={u.id} value={u.id}>{u.nombre}</option>
            ))}
          </select>
        );
      }
      const assignedUser = usuarios.find(u => String(u.id) === String(t.asignado_a_id));
      return assignedUser?.nombre || 'Sin asignar';
    }},
    { label: 'FECHA',      render: (t)    => t.fecha_creacion ? new Date(t.fecha_creacion).toLocaleDateString() : '-' },
    { label: 'ACCIONES',   render: ()     => (
      <div className="actions">
        <button className="action-btn" title="Ver"><FaEye /></button>
        <button className="action-btn" title="Editar"><FaEdit /></button>
      </div>
    )},
  ];

  return (
    <div className="ticket-list-container">
      <div className="ticket-list-toolbar">
        <div className="search-and-filters">
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
        </div>
      </div>

      <DataTable
        loading={loading}
        rows={filtered}
        columns={columns}
        emptyText="No se encontraron tickets"
      />
    </div>
  );
}
