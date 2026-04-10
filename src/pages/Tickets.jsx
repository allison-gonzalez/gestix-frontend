import React, { useState, useEffect } from 'react';
import { FaPaperPlane, FaBuilding, FaUser, FaTimes, FaTicketAlt, FaEye, FaEdit } from 'react-icons/fa';
import TicketList from '../components/TicketList';
import { ticketService, comentarioService, categoriaService, departamentoService, usuarioService } from '../services';
import { useAuth } from '../hooks/useAuth';
import '../styles/Tickets.css';

export default function Tickets() {
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState('departamento');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departamentos, setDepartamentos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [commentFile, setCommentFile] = useState(null);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState('');
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    prioridad: 'media',
    departamento_id: '',
    categoria_id: '',
    archivo: null,
  });
  const [submitting, setSubmitting] = useState(false);

  // Calcular tickets filtrados
  const ticketsDepartamento = tickets.filter(t => 
    authUser?.departamento_id && String(t.departamento_id) === String(authUser.departamento_id)
  );
  const ticketsCreados = tickets.filter(t => 
    authUser?.id && Number(t.usuario_autor_id) === Number(authUser.id)
  );

  useEffect(() => {
    fetchTickets();
    fetchCategorias();
    fetchDepartamentos();
    fetchUsuarios();
  }, []);

  useEffect(() => {
    if (showViewModal && selectedTicket) {
      fetchComments(selectedTicket.id);
    }
  }, [showViewModal, selectedTicket]);

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

  const fetchUsuarios = async () => {
    try {
      const res = await usuarioService.getAll();
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setUsuarios(data);
    } catch (error) {
      console.error('Error fetching usuarios:', error);
    }
  };

  const handleAssign = async (ticketId, asignadoAId) => {
    if (!ticketId) return;
    try {
      await ticketService.update(ticketId, { asignado_a_id: asignadoAId });
      fetchTickets();
    } catch (error) {
      console.error('Error asignando ticket:', error);
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

  const fetchComments = async (ticketId) => {
    try {
      const res = await comentarioService.getByTicket(ticketId);
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleCommentFileChange = (e) => {
    setCommentFile(e.target.files[0]);
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedTicket) {
      return;
    }

    setCommentLoading(true);
    setCommentError('');

    try {
      if (!authUser?.id) {
        setCommentError('Debes iniciar sesión para agregar un comentario.');
        return;
      }

      const data = new FormData();
      data.append('ticket_id', selectedTicket.id);
      data.append('comentario', commentText.trim());
      data.append('usuario_autor_id', authUser.id);
      if (commentFile) {
        data.append('evidencia', commentFile);
      }

      const response = await comentarioService.create(data);
      const newComment = response.data?.data;
      if (newComment) {
        setComments((prev) => [...prev, newComment]);
      }
      setCommentText('');
      setCommentFile(null);
    } catch (error) {
      const responseData = error.response?.data;
      console.error('Error creating comment:', responseData || error.message);
      if (responseData?.errors) {
        const validationMessage = Object.values(responseData.errors)
          .flat()
          .join(' ');
        setCommentError(validationMessage || 'No se pudo agregar el comentario. Intenta de nuevo.');
      } else if (responseData?.error) {
        setCommentError(responseData.error);
      } else {
        setCommentError('No se pudo agregar el comentario. Intenta de nuevo.');
      }
    } finally {
      setCommentLoading(false);
    }
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
      if (authUser?.id) {
        data.append('usuario_autor_id', authUser.id);
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
      </div>
      <div className="page-content">
        <div className="admin-panel">
          <div className="admin-tabs">
            <button 
              className={`admin-tab ${activeTab === 'departamento' ? 'active' : ''}`} 
              onClick={() => setActiveTab('departamento')}
            >
              <FaBuilding /> Tickets del Departamento
            </button>
            <button 
              className={`admin-tab ${activeTab === 'creados' ? 'active' : ''}`} 
              onClick={() => setActiveTab('creados')}
            >
              <FaUser /> Mis Tickets
            </button>
          </div>

          {activeTab === 'departamento' && (
            <TicketList 
              tickets={ticketsDepartamento} 
              loading={loading} 
              onRefresh={fetchTickets}
              onView={handleView}
              onEdit={handleEdit}
              onCreateTicket={() => setShowCreateModal(true)}
              usuarios={usuarios}
              authUser={authUser}
              onAssign={handleAssign}
            />
          )}

          {activeTab === 'creados' && (
            <TicketList 
              tickets={ticketsCreados} 
              loading={loading} 
              onRefresh={fetchTickets}
              onView={handleView}
              onEdit={handleEdit}
              onCreateTicket={() => setShowCreateModal(true)}
              usuarios={usuarios}
              authUser={authUser}
              onAssign={handleAssign}
            />
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2><FaTicketAlt /> Crear Nuevo Ticket</h2>
              <button 
                className="modal-close" 
                onClick={() => setShowCreateModal(false)}
              >
                <FaTimes />
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
          <div className="modal-content modal-large">
            <div className="modal-header">
              <h2><FaEye /> Ver Ticket</h2>
              <button 
                className="modal-close" 
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedTicket(null);
                  setComments([]);
                  setCommentText('');
                  setCommentFile(null);
                  setCommentError('');
                }}
              >
                <FaTimes />
              </button>
            </div>
            <div className="ticket-view">
              <div className="view-field">
                <label>ID</label>
                <span>#{selectedTicket.id}</span>
              </div>
              <div className="view-field">
                <label>Prioridad</label>
                <span className={`badge ${selectedTicket.prioridad === 'alta' || selectedTicket.prioridad === 'critica' ? 'badge-red' : selectedTicket.prioridad === 'media' ? 'badge-orange' : 'badge-blue'}`}>
                  {selectedTicket.prioridad}
                </span>
              </div>
              <div className="view-field full-width">
                <label>Título</label>
                <span>{selectedTicket.titulo}</span>
              </div>
              <div className="view-field full-width">
                <label>Descripción</label>
                <span>{selectedTicket.descripcion}</span>
              </div>
              <div className="view-field">
                <label>Estado</label>
                <span className={`badge ${selectedTicket.estado === 'abierto' ? 'badge-green' : selectedTicket.estado === 'en_progreso' ? 'badge-blue' : 'badge-gray'}`}>
                  {selectedTicket.estado}
                </span>
              </div>
              <div className="view-field">
                <label>Fecha de Creación</label>
                <span>{new Date(selectedTicket.fecha_creacion).toLocaleString()}</span>
              </div>
              {selectedTicket.archivo_path && (
                <div className="view-field full-width">
                  <label>Archivo</label>
                  <a href={`http://localhost:8000/storage/${selectedTicket.archivo_path}`} target="_blank" rel="noopener noreferrer">
                    Ver Archivo adjunto
                  </a>
                </div>
              )}
            </div>

            <div className="comment-section">
              <div className="comment-section-header">
                <h3>Comentarios</h3>
              </div>

              <div className="comment-thread">
                {comments.length === 0 ? (
                  <div className="comment-empty">Aún no hay comentarios en este ticket.</div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="comment-item">
                      <div className="comment-header">
                        <strong>{comment.usuario_autor_nombre}</strong>
                        <span>{new Date(comment.fecha).toLocaleString()}</span>
                      </div>
                      <div className="comment-body">
                        <p>{comment.comentario}</p>
                        {comment.url_evidencia && (
                          <a href={comment.url_evidencia} target="_blank" rel="noopener noreferrer" className="comment-file-link">
                            Ver archivo adjunto
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form className="comment-form" onSubmit={handleSubmitComment}>
                <div className="form-group">
                  <label htmlFor="comentario">Agregar comentario</label>
                  <textarea
                    id="comentario"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    rows="3"
                    placeholder="Escribe tu comentario aquí..."
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="commentFile">Adjuntar archivo o imagen (opcional)</label>
                  <input
                    id="commentFile"
                    type="file"
                    onChange={handleCommentFileChange}
                  />
                  {commentFile && <small style={{color:'#718096', marginTop: '4px'}}>{commentFile.name}</small>}
                </div>
                {commentError && <div className="comment-error">{commentError}</div>}
                <div className="comment-send-row">
                  <button type="submit" className="comment-send-button" disabled={commentLoading}>
                    {commentLoading ? 'Enviando...' : <><FaPaperPlane /> Enviar</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedTicket && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2><FaEdit /> Editar Ticket</h2>
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
                <FaTimes />
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
