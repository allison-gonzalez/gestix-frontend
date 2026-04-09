import React, { useState, useEffect } from 'react';
import TicketList from '../components/TicketList';
import { ticketService, categoriaService, departamentoService } from '../services';
import '../styles/Tickets.css';

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departamentos, setDepartamentos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    prioridad: 'media',
    departamento_id: '',
    categoria_id: '',
    archivo: null,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTickets();
    fetchCategorias();
    fetchDepartamentos();
  }, []);

  const sortTicketsNewestFirst = (tickets) => {
    return [...tickets].sort((a, b) => {
      const dateA = new Date(a.fecha_creacion);
      const dateB = new Date(b.fecha_creacion);
      return dateB - dateA;
    });
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await ticketService.getAll();
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setTickets(sortTicketsNewestFirst(data));
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategorias = async () => {
    try {
      const res = await categoriaService.getAll();
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setCategorias(data);
    } catch (error) {
      console.error('Error fetching categorias:', error);
    }
  };

  const fetchDepartamentos = async () => {
    try {
      const res = await departamentoService.getAll();
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setDepartamentos(data);
    } catch (error) {
      console.error('Error fetching departamentos:', error);
    }
  };

  const filteredCategorias = categorias.filter((cat) => {
    if (!formData.departamento_id) return false;
    return cat.departamento_id?.toString() === formData.departamento_id?.toString();
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === 'departamento_id') {
        return {
          ...prev,
          departamento_id: value,
          categoria_id: '',
        };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, archivo: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('titulo', formData.titulo);
      data.append('descripcion', formData.descripcion);
      data.append('prioridad', formData.prioridad);
      data.append('categoria_id', formData.categoria_id);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user?.id) {
        data.append('usuario_autor_id', user.id);
      }
      if (formData.departamento_id) {
        data.append('departamento_id', formData.departamento_id);
      }
      if (formData.archivo) {
        data.append('archivo', formData.archivo);
      }

      await ticketService.create(data);
      setShowCreateModal(false);
      setFormData({
        titulo: '',
        descripcion: '',
        prioridad: 'media',
        departamento_id: '',
        categoria_id: '',
        archivo: null,
      });
      fetchTickets();
    } catch (error) {
      console.error('Error creating ticket:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleView = (ticket) => {
    setSelectedTicket(ticket);
    setShowViewModal(true);
  };

  const handleEdit = (ticket) => {
    const category = categorias.find((cat) => (cat.id || cat._id)?.toString() === ticket.categoria_id?.toString());
    setSelectedTicket(ticket);
    setFormData({
      titulo: ticket.titulo,
      descripcion: ticket.descripcion,
      prioridad: ticket.prioridad,
      departamento_id: category?.departamento_id?.toString() || '',
      categoria_id: ticket.categoria_id,
      archivo: null,
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('titulo', formData.titulo);
      data.append('descripcion', formData.descripcion);
      data.append('prioridad', formData.prioridad);
      data.append('categoria_id', formData.categoria_id);
      if (formData.departamento_id) {
        data.append('departamento_id', formData.departamento_id);
      }
      if (formData.archivo) {
        data.append('archivo', formData.archivo);
      }

      await ticketService.update(selectedTicket.id, data);
      setShowEditModal(false);
      setSelectedTicket(null);
      setFormData({
        titulo: '',
        descripcion: '',
        prioridad: 'media',
        departamento_id: '',
        categoria_id: '',
        archivo: null,
      });
      fetchTickets();
    } catch (error) {
      console.error('Error updating ticket:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Tickets</h1>
        <button 
          className="btn-primary" 
          onClick={() => setShowCreateModal(true)}
        >
          Crear Ticket
        </button>
      </div>
      <div className="page-content">
        <TicketList 
          tickets={tickets} 
          loading={loading} 
          onRefresh={fetchTickets}
          onView={handleView}
          onEdit={handleEdit}
        />
      </div>

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Crear Nuevo Ticket</h2>
              <button 
                className="modal-close" 
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="ticket-form">
              <div className="form-group">
                <label htmlFor="titulo">Título</label>
                <input
                  type="text"
                  id="titulo"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="descripcion">Descripción del Problema</label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  rows="4"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="departamento_id">Departamento</label>
                <select
                  id="departamento_id"
                  name="departamento_id"
                  value={formData.departamento_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Seleccionar departamento</option>
                  {departamentos.map((dep) => (
                    <option key={dep.id || dep._id} value={(dep.id || dep._id).toString()}>{dep.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="categoria_id">Categoría</label>
                <select
                  id="categoria_id"
                  name="categoria_id"
                  value={formData.categoria_id}
                  onChange={handleInputChange}
                  required
                  disabled={!formData.departamento_id}
                >
                  <option value="">Seleccionar categoría</option>
                  {filteredCategorias.map(cat => (
                    <option key={cat.id || cat._id} value={cat.id || cat._id}>{cat.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="prioridad">Prioridad</label>
                <select
                  id="prioridad"
                  name="prioridad"
                  value={formData.prioridad}
                  onChange={handleInputChange}
                >
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                  <option value="critica">Crítica</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="archivo">Archivo de Evidencia (opcional)</label>
                <input
                  type="file"
                  id="archivo"
                  name="archivo"
                  onChange={handleFileChange}
                  accept="image/*,.pdf,.doc,.docx"
                />
              </div>
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={submitting}
                >
                  {submitting ? 'Creando...' : 'Crear Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && selectedTicket && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Ver Ticket</h2>
              <button 
                className="modal-close" 
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedTicket(null);
                }}
              >
                ×
              </button>
            </div>
            <div className="ticket-view">
              <div className="view-field">
                <label>ID:</label>
                <span>#{selectedTicket.id}</span>
              </div>
              <div className="view-field">
                <label>Título:</label>
                <span>{selectedTicket.titulo}</span>
              </div>
              <div className="view-field">
                <label>Descripción:</label>
                <span>{selectedTicket.descripcion}</span>
              </div>
              <div className="view-field">
                <label>Prioridad:</label>
                <span className={`badge ${selectedTicket.prioridad === 'alta' ? 'badge-red' : selectedTicket.prioridad === 'media' ? 'badge-orange' : 'badge-blue'}`}>
                  {selectedTicket.prioridad}
                </span>
              </div>
              <div className="view-field">
                <label>Estado:</label>
                <span className={`badge ${selectedTicket.estado === 'abierto' ? 'badge-green' : 'badge-gray'}`}>
                  {selectedTicket.estado}
                </span>
              </div>
              <div className="view-field">
                <label>Fecha de Creación:</label>
                <span>{new Date(selectedTicket.fecha_creacion).toLocaleString()}</span>
              </div>
              {selectedTicket.archivo_path && (
                <div className="view-field">
                  <label>Archivo:</label>
                  <a href={`http://localhost:8000/storage/${selectedTicket.archivo_path}`} target="_blank" rel="noopener noreferrer">
                    Ver Archivo
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedTicket && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Editar Ticket</h2>
              <button 
                className="modal-close" 
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedTicket(null);
                  setFormData({
                    titulo: '',
                    descripcion: '',
                    prioridad: 'media',
                    departamento_id: '',
                    categoria_id: '',
                    archivo: null,
                  });
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdate} className="ticket-form">
              <div className="form-group">
                <label htmlFor="edit-titulo">Título</label>
                <input
                  type="text"
                  id="edit-titulo"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-descripcion">Descripción del Problema</label>
                <textarea
                  id="edit-descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  rows="4"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-departamento_id">Departamento</label>
                <select
                  id="edit-departamento_id"
                  name="departamento_id"
                  value={formData.departamento_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Seleccionar departamento</option>
                  {departamentos.map((dep) => (
                    <option key={dep.id || dep._id} value={(dep.id || dep._id).toString()}>{dep.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="edit-categoria_id">Categoría</label>
                <select
                  id="edit-categoria_id"
                  name="categoria_id"
                  value={formData.categoria_id}
                  onChange={handleInputChange}
                  required
                  disabled={!formData.departamento_id}
                >
                  <option value="">Seleccionar categoría</option>
                  {filteredCategorias.map(cat => (
                    <option key={cat.id || cat._id} value={cat.id || cat._id}>{cat.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="edit-prioridad">Prioridad</label>
                <select
                  id="edit-prioridad"
                  name="prioridad"
                  value={formData.prioridad}
                  onChange={handleInputChange}
                >
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                  <option value="critica">Crítica</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="edit-archivo">Nuevo Archivo de Evidencia (opcional)</label>
                <input
                  type="file"
                  id="edit-archivo"
                  name="archivo"
                  onChange={handleFileChange}
                  accept="image/*,.pdf,.doc,.docx"
                />
                {selectedTicket.archivo_path && (
                  <small>Archivo actual: <a href={`http://localhost:8000/storage/${selectedTicket.archivo_path}`} target="_blank" rel="noopener noreferrer">Ver</a></small>
                )}
              </div>
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedTicket(null);
                    setFormData({
                      titulo: '',
                      descripcion: '',
                      prioridad: 'media',
                      departamento_id: '',
                      categoria_id: '',
                      archivo: null,
                    });
                  }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={submitting}
                >
                  {submitting ? 'Actualizando...' : 'Actualizar Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
