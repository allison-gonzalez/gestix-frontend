import React, { useState } from 'react';
import { FaSearch, FaEye, FaEdit } from 'react-icons/fa';
import '../styles/UsuariosList.css';

const ROL_COLORS = {
  admin: 'badge-red',
  supervisor: 'badge-orange',
  agente: 'badge-blue',
  usuario: 'badge-green',
};

export default function UsuariosList({ usuarios = [], loading }) {
  const [search, setSearch] = useState('');

  const filtered = usuarios.filter((u) =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.nombre?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="usuarios-list-container">
      <div className="usuarios-toolbar">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar usuarios..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Cargando usuarios...</div>
      ) : (
        <div className="table-wrapper">
          <table className="usuarios-table">
            <thead>
              <tr>
                <th>EMAIL</th>
                <th>ROL</th>
                <th>TICKETS ACTIVOS</th>
                <th>ESTADO</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="5" className="empty-state">No se encontraron usuarios</td></tr>
              ) : (
                filtered.map((usuario, index) => (
                  <tr key={usuario._id || index}>
                    <td>{usuario.email}</td>
                    <td>
                      <span className={`badge ${ROL_COLORS[usuario.rol] || 'badge-gray'}`}>
                        {usuario.rol}
                      </span>
                    </td>
                    <td>{usuario.tickets_activos || 0}</td>
                    <td>
                      <span className={`badge ${usuario.activo ? 'badge-green' : 'badge-gray'}`}>
                        {usuario.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="actions">
                      <button className="action-btn" title="Ver"><FaEye /></button>
                      <button className="action-btn" title="Editar"><FaEdit /></button>
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
