import React, { useState } from 'react';
import { FaSearch, FaFilter, FaEye, FaEdit } from 'react-icons/fa';
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

export default function TicketList({ tickets = [], loading, onRefresh }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('todos');

  const filtered = tickets.filter((t) => {
    const matchSearch =
      t.titulo?.toLowerCase().includes(search.toLowerCase()) ||
      t.descripcion?.toLowerCase().includes(search.toLowerCase());
    if (filter === 'alta') return matchSearch && t.prioridad === 'alta';
    if (filter === 'abiertos') return matchSearch && t.estado === 'abierto';
    return matchSearch;
  });

  const columns = [
    { label: 'ID',         render: (_, i) => <span className="ticket-id">#{i + 1}</span> },
    { label: 'TÍTULO',     render: (t)    => <span className="ticket-title">{t.titulo}</span> },
    { label: 'PRIORIDAD',  render: (t)    => <span className={`badge ${PRIORITY_COLORS[t.prioridad] || 'badge-gray'}`}>{t.prioridad}</span> },
    { label: 'ESTADO',     render: (t)    => <span className={`badge ${STATUS_COLORS[t.estado]    || 'badge-gray'}`}>{t.estado}</span> },
    { label: 'ASIGNADO A', render: (t)    => t.asignado_a || 'Sin asignar' },
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
          <button className={`filter-btn ${filter === 'todos'    ? 'active' : ''}`} onClick={() => setFilter('todos')}>Todos</button>
          <button className={`filter-btn ${filter === 'alta'     ? 'active' : ''}`} onClick={() => setFilter('alta')}>Alta Prioridad</button>
          <button className={`filter-btn ${filter === 'abiertos' ? 'active' : ''}`} onClick={() => setFilter('abiertos')}>Abiertos</button>
          <button className="filter-btn icon-btn"><FaFilter /></button>
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
