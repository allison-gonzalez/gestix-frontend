import React, { useState, useEffect } from 'react';
import { FaTimes, FaUser } from 'react-icons/fa';
import '../styles/TicketModal.css';

export default function TicketModal({ ticket, usuarios = [], onClose, onSave, mode = 'edit' }) {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    prioridad: 'media',
    estado: 'abierto',
    fecha_creacion: new Date().toISOString().slice(0, 10),
    asignados: [],
    adjunto: null,
  });

  const formatDateForInput = (value) => {
    if (!value) {
      return new Date().toISOString().slice(0, 10);
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toISOString().slice(0, 10);
  };

  useEffect(() => {
    if (ticket) {
      setFormData({
        titulo: ticket.titulo || '',
        descripcion: ticket.descripcion || '',
        prioridad: ticket.prioridad || 'media',
        estado: ticket.estado || 'abierto',
        fecha_creacion: formatDateForInput(ticket.fecha_creacion),
        asignados: ticket.asignados || [],
        adjunto: ticket.adjunto || null,
      });
    }
  }, [ticket]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      adjunto: file,
    }));
  };

  const handleSelectAgent = (usuarioId) => {
    setFormData(prev => {
      const asignados = prev.asignados.includes(usuarioId)
        ? prev.asignados.filter(id => id !== usuarioId)
        : [...prev.asignados, usuarioId];
      return { ...prev, asignados };
    });
  };

  const handleSave = () => {
    const payload = {
      _id: ticket._id,
      ...formData,
      estado: isNewTicket ? 'abierto' : formData.estado,
      fecha_creacion: isNewTicket ? new Date().toISOString().slice(0, 10) : formData.fecha_creacion,
      asignados: isNewTicket ? [] : formData.asignados,
    };

    onSave(payload);
    onClose();
  };

  const getUsuarioNombre = (id) => {
    const usuario = usuarios.find(u => u._id === id || u.id === id);
    return usuario ? usuario.nombre : 'Desconocido';
  };

  const isNewTicket = String(ticket._id || '').startsWith('new-');
  const isViewMode = mode === 'view';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isViewMode ? 'Ver Ticket' : isNewTicket ? 'Crear Ticket' : 'Editar Ticket'}</h2>
          <button className="modal-close" onClick={onClose}><FaTimes /></button>
        </div>

        <div className="modal-body">
          {isViewMode ? (
            <div className="view-ticket-body">
              <div className="view-ticket-grid">
                <div className="view-ticket-card">
                  <label>Título</label>
                  <p>{ticket?.titulo || '-'}</p>
                </div>
                <div className="view-ticket-card">
                  <label>Estado</label>
                  <p>{ticket?.estado ? ticket.estado.charAt(0).toUpperCase() + ticket.estado.slice(1) : '-'}</p>
                </div>
                <div className="view-ticket-card">
                  <label>Prioridad</label>
                  <p>{ticket?.prioridad ? ticket.prioridad.charAt(0).toUpperCase() + ticket.prioridad.slice(1) : '-'}</p>
                </div>
                <div className="view-ticket-card">
                  <label>Fecha</label>
                  <p>{ticket?.fecha_creacion ? new Date(ticket.fecha_creacion).toLocaleDateString() : '-'}</p>
                </div>
              </div>
              <div className="view-ticket-card full-width">
                <label>Descripción</label>
                <p>{ticket?.descripcion || '-'}</p>
              </div>
              <div className="view-ticket-card full-width">
                <label>Asignados</label>
                {ticket?.asignados?.length > 0 ? (
                  <div className="assigned-users">
                    {ticket.asignados.map((id) => (
                      <span key={id} className="assigned-user">
                        {getUsuarioNombre(id)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="no-assigned">No hay usuarios asignados</p>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="form-group">
                <label>Título</label>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  className="form-textarea"
                  rows="4"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Prioridad</label>
                  <select
                    name="prioridad"
                    value={formData.prioridad}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>

                {!isNewTicket && (
                  <>
                    <div className="form-group">
                      <label>Estado</label>
                      <select
                        name="estado"
                        value={formData.estado}
                        onChange={handleChange}
                        className="form-select"
                      >
                        <option value="abierto">Abierto</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="resuelto">Resuelto</option>
                        <option value="cerrado">Cerrado</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Fecha</label>
                      <input
                        type="date"
                        name="fecha_creacion"
                        value={formData.fecha_creacion}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="form-group">
                <label>Adjuntar archivo / imagen</label>
                <input
                  type="file"
                  name="adjunto"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="form-input"
                />
                {formData.adjunto && (
                  <p className="file-name">Archivo seleccionado: {formData.adjunto.name}</p>
                )}
              </div>

              {!isNewTicket && (
                <div className="form-group">
                  <label><FaUser className="icon" /> Asignar a Agentes/Usuarios</label>
                  <div className="agents-list">
                    {usuarios.length === 0 ? (
                      <p className="no-agents">No hay usuarios disponibles</p>
                    ) : (
                      usuarios.map(usuario => (
                        <label key={usuario._id || usuario.id} className="agent-checkbox">
                          <input
                            type="checkbox"
                            checked={formData.asignados.includes(usuario._id || usuario.id)}
                            onChange={() => handleSelectAgent(usuario._id || usuario.id)}
                          />
                          <span className="agent-name">{usuario.nombre}</span>
                          {usuario.departamento && (
                            <span className="agent-dept">{usuario.departamento}</span>
                          )}
                        </label>
                      ))
                    )}
                  </div>
                  {formData.asignados.length > 0 && (
                    <div className="selected-agents">
                      <h4>Asignados a:</h4>
                      <div className="agent-tags">
                        {formData.asignados.map(id => (
                          <span key={id} className="agent-tag">
                            {getUsuarioNombre(id)}
                            <button
                              type="button"
                              onClick={() => handleSelectAgent(id)}
                              className="remove-tag"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>{isViewMode ? 'Cerrar' : 'Cancelar'}</button>
          {!isViewMode && (
            <button className="btn-save" onClick={handleSave}>Guardar Cambios</button>
          )}
        </div>
      </div>
    </div>
  );
}
