import React, { useState } from 'react';
import { FaSearch, FaEye, FaEdit, FaTrash, FaPlus, FaSave, FaTimes, FaCheck } from 'react-icons/fa';
import { usuarioService, departamentoService, permisoService } from '../../services';
import '../../styles/UsuariosList.css';

export default function UsuariosList({ usuarios = [], loading, onRefresh, departamentos = [], permisos = [] }) {
  const [search, setSearch]           = useState('');
  const [alert, setAlert]             = useState(null);
  const [showModal, setShowModal]     = useState(false);
  const [showView, setShowView]       = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewUser, setViewUser]       = useState(null);
  const [saving, setSaving]           = useState(false);
  const [form, setForm] = useState({
    nombre: '', correo: '', telefono: '',
    contrasena: '', estatus: 1,
    departamento_id: '', permisos: [],
  });

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 3500);
  };

  const filtered = usuarios.filter((u) =>
    (u.nombre  || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.correo  || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.telefono|| '').toLowerCase().includes(search.toLowerCase())
  );

  /* ── Helpers ─────────────────────────────────── */
  const getDeptName = (id) =>
    departamentos.find(d => String(d._id) === String(id) || String(d.id) === String(id))?.nombre || '-';

  const getPermisosNames = (ids = []) =>
    ids.map(id => permisos.find(p => String(p._id) === String(id))?.nombre || id).join(', ') || '-';

  /* ── Open modal ──────────────────────────────── */
  const openCreate = () => {
    setEditingUser(null);
    setForm({ nombre: '', correo: '', telefono: '', contrasena: '', estatus: 1, departamento_id: '', permisos: [] });
    setShowModal(true);
  };

  const openEdit = (u) => {
    setEditingUser(u);
    setForm({
      nombre:          u.nombre          || '',
      correo:          u.correo          || '',
      telefono:        u.telefono        || '',
      contrasena:      '',               // vacío → no cambia
      estatus:         u.estatus         ?? 1,
      departamento_id: String(u.departamento_id || ''),
      permisos:        u.permisos        || [],
    });
    setShowModal(true);
  };

  const openView = (u) => { setViewUser(u); setShowView(true); };

  /* ── Save ────────────────────────────────────── */
  const handleSave = async () => {
    if (!form.nombre.trim() || !form.correo.trim()) {
      showAlert('error', 'Nombre y correo son obligatorios');
      return;
    }
    if (!editingUser && !form.contrasena.trim()) {
      showAlert('error', 'La contraseña es obligatoria para nuevos usuarios');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        nombre:           form.nombre,
        correo:           form.correo,
        telefono:         form.telefono,
        estatus:          Number(form.estatus),
        departamento_id:  form.departamento_id,
        permisos:         form.permisos,
      };
      if (form.contrasena.trim()) payload.contrasena = form.contrasena;

      if (editingUser) {
        await usuarioService.update(editingUser._id, payload);
        showAlert('success', 'Usuario actualizado');
      } else {
        await usuarioService.create(payload);
        showAlert('success', 'Usuario creado');
      }
      setShowModal(false);
      onRefresh();
    } catch (err) {
      showAlert('error', err.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete ──────────────────────────────────── */
  const handleDelete = async (u) => {
    if (!window.confirm(`¿Eliminar al usuario "${u.nombre}"?`)) return;
    try {
      await usuarioService.delete(u._id);
      showAlert('success', 'Usuario eliminado');
      onRefresh();
    } catch (err) {
      showAlert('error', 'Error al eliminar usuario');
    }
  };

  /* ── Toggle permiso ──────────────────────────── */
  const togglePermiso = (id) => {
    const strId = String(id);
    setForm(prev => ({
      ...prev,
      permisos: prev.permisos.includes(strId)
        ? prev.permisos.filter(p => p !== strId)
        : [...prev.permisos, strId],
    }));
  };

  /* ── Render ──────────────────────────────────── */
  return (
    <div className="usuarios-list-container">

      {/* Alert */}
      {alert && (
        <div className={`admin-alert ${alert.type}`} style={{ margin: '0 0 16px 0' }}>
          {alert.type === 'success' ? <FaCheck /> : <FaTimes />}
          <span>{alert.message}</span>
          <button className="alert-close" onClick={() => setAlert(null)}>✕</button>
        </div>
      )}

      {/* Toolbar */}
      <div className="usuarios-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar usuarios..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn-primary" onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <FaPlus /> Nuevo Usuario
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-state">Cargando usuarios...</div>
      ) : (
        <div className="table-wrapper">
          <table className="usuarios-table">
            <thead>
              <tr>
                <th>NOMBRE</th>
                <th>CORREO</th>
                <th>TELÉFONO</th>
                <th>DEPARTAMENTO</th>
                <th>ESTADO</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="6" className="empty-state">No se encontraron usuarios</td></tr>
              ) : (
                filtered.map((u, i) => (
                  <tr key={u._id || i}>
                    <td style={{ fontWeight: 500 }}>{u.nombre || '-'}</td>
                    <td>{u.correo || '-'}</td>
                    <td>{u.telefono || '-'}</td>
                    <td>{getDeptName(u.departamento_id)}</td>
                    <td>
                      <span className={`badge ${u.estatus ? 'badge-green' : 'badge-red'}`}>
                        {u.estatus ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="actions">
                      <button className="action-btn" title="Ver" onClick={() => openView(u)}><FaEye /></button>
                      <button className="action-btn" title="Editar" onClick={() => openEdit(u)}><FaEdit /></button>
                      <button className="action-btn" title="Eliminar" onClick={() => handleDelete(u)}
                        style={{ color: '#e53e3e' }}><FaTrash /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── MODAL CREAR / EDITAR ───────────────────── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingUser ? <><FaEdit /> Editar Usuario</> : <><FaPlus /> Nuevo Usuario</>}
              </h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><FaTimes /></button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Nombre */}
              <div className="form-group">
                <label>Nombre *</label>
                <input type="text" value={form.nombre}
                  onChange={e => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Nombre completo" autoFocus />
              </div>

              {/* Correo */}
              <div className="form-group">
                <label>Correo *</label>
                <input type="email" value={form.correo}
                  onChange={e => setForm({ ...form, correo: e.target.value })}
                  placeholder="correo@ejemplo.com" />
              </div>

              {/* Teléfono */}
              <div className="form-group">
                <label>Teléfono</label>
                <input type="text" value={form.telefono}
                  onChange={e => setForm({ ...form, telefono: e.target.value })}
                  placeholder="10 dígitos" />
              </div>

              {/* Contraseña */}
              <div className="form-group">
                <label>{editingUser ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}</label>
                <input type="password" value={form.contrasena}
                  onChange={e => setForm({ ...form, contrasena: e.target.value })}
                  placeholder={editingUser ? '••••••' : 'Mínimo 4 caracteres'} />
              </div>

              {/* Departamento */}
              <div className="form-group">
                <label>Departamento</label>
                <select value={form.departamento_id}
                  onChange={e => setForm({ ...form, departamento_id: e.target.value })}>
                  <option value="">Seleccionar...</option>
                  {departamentos.map(d => (
                    <option key={d._id} value={d._id || d.id}>{d.nombre}</option>
                  ))}
                </select>
              </div>

              {/* Estatus */}
              <div className="form-group">
                <label>Estatus</label>
                <select value={form.estatus}
                  onChange={e => setForm({ ...form, estatus: parseInt(e.target.value) })}>
                  <option value={1}>Activo</option>
                  <option value={0}>Inactivo</option>
                </select>
              </div>

              {/* Permisos */}
              {permisos.length > 0 && (
                <div className="form-group">
                  <label>Permisos</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                    {permisos.map(p => {
                      const checked = form.permisos.includes(String(p._id));
                      return (
                        <label key={p._id} style={{
                          display: 'flex', alignItems: 'center', gap: 5,
                          padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
                          background: checked ? '#e0f7fa' : '#f8fafc',
                          border: `1.5px solid ${checked ? '#2DC4D4' : '#e0e6ee'}`,
                          fontSize: '0.82rem', fontWeight: checked ? 600 : 400,
                          color: checked ? '#1B3A5C' : '#4a5568',
                          transition: 'all 0.15s',
                        }}>
                          <input type="checkbox" checked={checked}
                            onChange={() => togglePermiso(p._id)}
                            style={{ display: 'none' }} />
                          {checked && <FaCheck style={{ fontSize: 10, color: '#2DC4D4' }} />}
                          {p.nombre}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                <FaSave /> {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL VER DETALLE ─────────────────────── */}
      {showView && viewUser && (
        <div className="modal-overlay" onClick={() => setShowView(false)}>
          <div className="modal-card" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title"><FaEye /> Detalle de Usuario</h3>
              <button className="modal-close" onClick={() => setShowView(false)}><FaTimes /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                ['Nombre',        viewUser.nombre],
                ['Correo',        viewUser.correo],
                ['Teléfono',      viewUser.telefono || '-'],
                ['Departamento',  getDeptName(viewUser.departamento_id)],
                ['Permisos',      getPermisosNames(viewUser.permisos)],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ minWidth: 120, fontWeight: 600, fontSize: '0.82rem',
                    textTransform: 'uppercase', color: '#7a8a99' }}>{label}</span>
                  <span style={{ color: '#1B3A5C', fontSize: '0.9rem' }}>{val}</span>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ minWidth: 120, fontWeight: 600, fontSize: '0.82rem',
                  textTransform: 'uppercase', color: '#7a8a99' }}>Estado</span>
                <span className={`badge ${viewUser.estatus ? 'badge-green' : 'badge-red'}`}>
                  {viewUser.estatus ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-primary" onClick={() => { setShowView(false); openEdit(viewUser); }}>
                <FaEdit /> Editar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}