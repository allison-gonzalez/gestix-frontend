import React, { useState, useEffect, useRef } from 'react';
import {
  FaSearch, FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash,
  FaTimes, FaCheck, FaUserCircle, FaShieldAlt, FaBuilding,
  FaExclamationTriangle, FaSpinner,
} from 'react-icons/fa';
import { usuarioService, departamentoService, permisoService, categoriaService } from '../../services';
import '../../styles/UsuariosList.css';
import '../../styles/TicketList.css';

/* ─────────────────────────────────────────────────────────────────
   KEY INSIGHT:
   In this MongoDB schema, Departamento.id and Permiso.id are Int32
   integers (1, 2, 3 …), NOT ObjectId strings.
   Usuario.departamento_id → Int32
   Usuario.permisos        → Array of Int32

   All matching must use Number() coercion, never string ObjectId comparison.
──────────────────────────────────────────────────────────────────── */

/** Return the numeric integer "id" field from a catalogue document */
const docId = (doc) => {
  // The "id" field is Int32; prefer it over the ObjectId "_id"
  if (doc?.id !== undefined && doc.id !== null && !isNaN(Number(doc.id))) {
    return Number(doc.id);
  }
  // Fallback: try _id as number
  if (doc?._id !== undefined && doc._id !== null && !isNaN(Number(doc._id))) {
    return Number(doc._id);
  }
  return null;
};

/** Safely coerce any value to number (null if not numeric) */
const toNum = (v) => {
  const n = Number(v);
  return isNaN(n) ? null : n;
};

const ESTATUS_MAP = {
  1: { label: 'Activo',   cls: 'badge-activo'   },
  0: { label: 'Inactivo', cls: 'badge-inactivo' },
};

/* ── Confirm dialog ───────────────────────────────────────────── */
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="ul-overlay" onClick={onCancel}>
      <div className="ul-confirm" onClick={e => e.stopPropagation()}>
        <div className="ul-confirm__icon"><FaExclamationTriangle /></div>
        <p className="ul-confirm__msg">{message}</p>
        <div className="ul-confirm__btns">
          <button className="ul-btn ul-btn--ghost"  onClick={onCancel}>Cancelar</button>
          <button className="ul-btn ul-btn--danger" onClick={onConfirm}>Eliminar</button>
        </div>
      </div>
    </div>
  );
}

/* ── Toast ────────────────────────────────────────────────────── */
function Toast({ toasts }) {
  return (
    <div className="ul-toasts">
      {toasts.map(t => (
        <div key={t.id} className={`ul-toast ul-toast--${t.type}`}>
          {t.type === 'success' ? <FaCheck /> : <FaExclamationTriangle />}
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Modal form ───────────────────────────────────────────────── */
function UsuarioModal({ usuario, departamentos, permisos, categorias, onClose, onSave }) {
  const isEdit = Boolean(usuario);

  const [form, setForm] = useState(() => ({
    nombre:          usuario?.nombre   ?? '',
    correo:          usuario?.correo   ?? '',
    telefono:        usuario?.telefono ?? '',
    contrasena:      '',
    estatus:         String(usuario?.estatus ?? 1),
    // Keep as number for select value matching; '' = none
    departamento_id: toNum(usuario?.departamento_id) ?? '',
    // Convert every permission id to a number
    permisos:        (usuario?.permisos ?? []).map(Number).filter(n => !isNaN(n)),
    // Categories this user can handle
    categorias_asignables: (usuario?.categorias_asignables ?? []).map(Number).filter(n => !isNaN(n)),
  }));

  const [showPass, setShowPass] = useState(false);
  const [errors,   setErrors]   = useState({});
  const [saving,   setSaving]   = useState(false);

  const togglePermiso = (numericId) => {
    setForm(f => ({
      ...f,
      permisos: f.permisos.includes(numericId)
        ? f.permisos.filter(p => p !== numericId)
        : [...f.permisos, numericId],
    }));
  };

  const toggleCategoria = (numericId) => {
    setForm(f => ({
      ...f,
      categorias_asignables: f.categorias_asignables.includes(numericId)
        ? f.categorias_asignables.filter(c => c !== numericId)
        : [...f.categorias_asignables, numericId],
    }));
  };

  const validatePassword = (pwd) => {
    if (!pwd) return 'La contraseña es requerida';
    if (pwd.length < 8) return 'Mínimo 8 caracteres';
    if (!/[A-Z]/.test(pwd)) return 'Debe incluir al menos una mayúscula';
    if (!/[a-z]/.test(pwd)) return 'Debe incluir al menos una minúscula';
    if (!/[0-9]/.test(pwd)) return 'Debe incluir al menos un número';
    if (!/[^A-Za-z0-9]/.test(pwd)) return 'Debe incluir al menos un carácter especial';
    return null;
  };

  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es requerido';
    if (!form.correo.trim()) e.correo = 'El correo es requerido';
    if (!isEdit) {
      const pwdErr = validatePassword(form.contrasena);
      if (pwdErr) e.contrasena = pwdErr;
    } else if (form.contrasena) {
      const pwdErr = validatePassword(form.contrasena);
      if (pwdErr) e.contrasena = pwdErr;
    }
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      const payload = {
        nombre:                form.nombre,
        correo:                form.correo,
        telefono:              form.telefono,
        estatus:               parseInt(form.estatus, 10),
        departamento_id:       form.departamento_id !== '' ? Number(form.departamento_id) : null,
        permisos:              form.permisos,
        categorias_asignables: form.categorias_asignables,
      };
      if (form.contrasena) payload.contrasena = form.contrasena;
      await onSave(payload);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ul-overlay" onClick={onClose}>
      <div className="ul-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="ul-modal__head">
          <div className="ul-modal__head-icon"><FaUserCircle /></div>
          <div>
            <h2 className="ul-modal__title">
              {isEdit ? 'Editar usuario' : 'Nuevo usuario'}
            </h2>
            <p className="ul-modal__sub">
              {isEdit
                ? `Modificando a ${usuario.nombre}`
                : 'Completa los datos del nuevo miembro'}
            </p>
          </div>
          <button className="ul-modal__close" onClick={onClose}><FaTimes /></button>
        </div>

        {/* Body: two-column */}
        <div className="ul-modal__body">

          {/* ── Left: basic data ── */}
          <div className="ul-modal__col">
            <div className="ul-field">
              <label>Nombre completo <span className="ul-req">*</span></label>
              <input
                value={form.nombre}
                onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                placeholder="Ej. Juan Pérez"
                className={errors.nombre ? 'is-error' : ''}
              />
              {errors.nombre && <span className="ul-error">{errors.nombre}</span>}
            </div>

            <div className="ul-field">
              <label>Correo electrónico <span className="ul-req">*</span></label>
              <input
                type="email"
                value={form.correo}
                onChange={e => setForm(f => ({ ...f, correo: e.target.value }))}
                placeholder="usuario@empresa.com"
                className={errors.correo ? 'is-error' : ''}
              />
              {errors.correo && <span className="ul-error">{errors.correo}</span>}
            </div>

            <div className="ul-field">
              <label>Teléfono</label>
              <input
                value={form.telefono}
                onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
                placeholder="33 1234 5678"
              />
            </div>

            <div className="ul-field">
              <label>
                {isEdit ? 'Nueva contraseña' : 'Contraseña'}{' '}
                {!isEdit && <span className="ul-req">*</span>}
                {isEdit  && <span className="ul-hint">(dejar vacío para no cambiar)</span>}
              </label>
              <div className="ul-pass-wrap">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.contrasena}
                  onChange={e => setForm(f => ({ ...f, contrasena: e.target.value }))}
                  placeholder={isEdit ? '••••••••' : 'Mín. 8 cars., mayús., núm. y especial'}
                  className={errors.contrasena ? 'is-error' : ''}
                />
                <button type="button" className="ul-pass-eye"
                  onClick={() => setShowPass(v => !v)}>
                  {showPass ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.contrasena && <span className="ul-error">{errors.contrasena}</span>}
            </div>

            <div className="ul-row-2">
              <div className="ul-field">
                <label>Estado</label>
                <select
                  value={form.estatus}
                  onChange={e => setForm(f => ({ ...f, estatus: e.target.value }))}
                >
                  <option value="1">Activo</option>
                  <option value="0">Inactivo</option>
                </select>
              </div>

              <div className="ul-field">
                <label><FaBuilding style={{ marginRight: 5 }} />Departamento</label>
                {/*
                  value = number (or '') so React can match <option value={number}>
                  We coerce onChange to Number to keep state type consistent.
                */}
                <select
                  value={form.departamento_id}
                  onChange={e => {
                    const v = e.target.value;
                    setForm(f => ({ ...f, departamento_id: v === '' ? '' : Number(v), categorias_asignables: [] }));
                  }}
                >
                  <option value="">Sin departamento</option>
                  {departamentos.map(d => {
                    const id = docId(d);
                    return (
                      <option key={String(id)} value={String(id)}>
                        {d.nombre}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>

          {/* ── Right: permisos + categorías ── */}
          <div className="ul-modal__col">
            <div className="ul-permisos-head">
              <FaShieldAlt />
              <span>Permisos asignados</span>
              <span className="ul-permisos-count">{form.permisos.length}</span>
            </div>
            <div className="ul-permisos-grid">
              {permisos.length === 0 && (
                <p className="ul-no-permisos">No hay permisos disponibles</p>
              )}
              {permisos.map(p => {
                const numId   = docId(p);
                const checked = form.permisos.includes(numId);
                return (
                  <label
                    key={String(numId)}
                    className={`ul-permiso ${checked ? 'is-checked' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePermiso(numId)}
                    />
                    <span className="ul-permiso__mark">
                      {checked && <FaCheck />}
                    </span>
                    <div className="ul-permiso__info">
                      <span className="ul-permiso__name">{p.nombre}</span>
                      {p.descripcion && (
                        <span className="ul-permiso__desc">{p.descripcion}</span>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Categorías que puede atender */}
            <div className="ul-permisos-head" style={{ marginTop: '1rem' }}>
              <FaShieldAlt />
              <span>Categorías que atiende</span>
              <span className="ul-permisos-count">{form.categorias_asignables.length}</span>
            </div>
            <div className="ul-permisos-grid">
              {(form.departamento_id === '' || form.departamento_id === null) && (
                <p className="ul-no-permisos">Selecciona un departamento primero</p>
              )}
              {categorias.filter(c => Number(c.departamento_id) === Number(form.departamento_id) && form.departamento_id !== '' && form.departamento_id !== null).length === 0 && form.departamento_id !== '' && form.departamento_id !== null && (
                <p className="ul-no-permisos">No hay categorías para este departamento</p>
              )}
              {categorias.filter(c => Number(c.departamento_id) === Number(form.departamento_id)).map(c => {
                const numId   = docId(c);
                const checked = form.categorias_asignables.includes(numId);
                return (
                  <label
                    key={String(numId)}
                    className={`ul-permiso ${checked ? 'is-checked' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCategoria(numId)}
                    />
                    <span className="ul-permiso__mark">
                      {checked && <FaCheck />}
                    </span>
                    <div className="ul-permiso__info">
                      <span className="ul-permiso__name">{c.nombre}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="ul-modal__foot">
          <button className="ul-btn ul-btn--ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button className="ul-btn ul-btn--primary" onClick={handleSubmit} disabled={saving}>
            {saving
              ? <><FaSpinner className="spin" /> Guardando…</>
              : isEdit ? 'Guardar cambios' : 'Crear usuario'
            }
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Detail Drawer ────────────────────────────────────────────── */
function UsuarioDrawer({ usuario, departamentos, permisos, onClose, onEdit }) {
  if (!usuario) return null;

  // Match by integer id
  const depto = departamentos.find(d => docId(d) === toNum(usuario.departamento_id));

  const userPermisos = permisos.filter(p =>
    (usuario.permisos ?? []).map(Number).includes(docId(p))
  );

  return (
    <div className="ul-overlay" onClick={onClose}>
      <div className="ul-drawer" onClick={e => e.stopPropagation()}>
        <div className="ul-drawer__head">
          <div className="ul-drawer__avatar">
            {usuario.nombre?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="ul-drawer__name">{usuario.nombre}</h3>
            <p className="ul-drawer__email">{usuario.correo}</p>
          </div>
          <button className="ul-modal__close" onClick={onClose}><FaTimes /></button>
        </div>

        <div className="ul-drawer__body">
          <div className="ul-drawer__row">
            <span className="ul-drawer__lbl">Teléfono</span>
            <span>{usuario.telefono || '—'}</span>
          </div>
          <div className="ul-drawer__row">
            <span className="ul-drawer__lbl">Departamento</span>
            <span>{depto?.nombre ?? '—'}</span>
          </div>
          <div className="ul-drawer__row">
            <span className="ul-drawer__lbl">Estado</span>
            <span className={`ul-badge ${ESTATUS_MAP[usuario.estatus]?.cls ?? 'badge-gray'}`}>
              {ESTATUS_MAP[usuario.estatus]?.label ?? '—'}
            </span>
          </div>

          <div className="ul-drawer__section">
            <div className="ul-drawer__section-title">
              <FaShieldAlt /> Permisos ({userPermisos.length})
            </div>
            {userPermisos.length === 0
              ? <p className="ul-drawer__empty">Sin permisos asignados</p>
              : (
                <div className="ul-drawer__permisos">
                  {userPermisos.map(p => (
                    <span key={String(docId(p))} className="ul-perm-tag">
                      <FaCheck /> {p.nombre}
                    </span>
                  ))}
                </div>
              )
            }
          </div>
        </div>

        <div className="ul-modal__foot">
          <button className="ul-btn ul-btn--ghost" onClick={onClose}>Cerrar</button>
          <button
            className="ul-btn ul-btn--primary"
            onClick={() => { onClose(); onEdit(usuario); }}
          >
            <FaEdit /> Editar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────── */
export default function UsuariosList({
  usuarios: initialUsuarios = [],
  loading:  initialLoading,
  onRefresh,
}) {
  const [usuarios,      setUsuarios]      = useState(initialUsuarios);
  const [loading,       setLoading]       = useState(initialLoading);
  const [departamentos, setDepartamentos] = useState([]);
  const [permisos,      setPermisos]      = useState([]);
  const [categorias,    setCategorias]    = useState([]);
  const [search,        setSearch]        = useState('');
  const [filterEstatus, setFilterEstatus] = useState('todos');
  const [filterDepto,   setFilterDepto]   = useState('');
  const [modal,         setModal]         = useState(null);
  const [drawer,        setDrawer]        = useState(null);
  const [confirm,       setConfirm]       = useState(null);
  const [toasts,        setToasts]        = useState([]);
  const toastId = useRef(0);

  useEffect(() => { setUsuarios(initialUsuarios); }, [initialUsuarios]);
  useEffect(() => { setLoading(initialLoading);   }, [initialLoading]);

  useEffect(() => {
    const load = async () => {
      try {
        const [dRes, pRes, cRes] = await Promise.all([
          departamentoService.getAll(),
          permisoService.getAll(),
          categoriaService.getAll(),
        ]);
        setDepartamentos(Array.isArray(dRes.data) ? dRes.data : dRes.data?.data ?? []);
        setPermisos(Array.isArray(pRes.data) ? pRes.data : pRes.data?.data ?? []);
        setCategorias(Array.isArray(cRes.data) ? cRes.data : cRes.data?.data ?? []);
      } catch (err) {
        console.warn('Error cargando catálogos:', err);
      }
    };
    load();
  }, []);

  const toast = (msg, type = 'success') => {
    const id = ++toastId.current;
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  };

  const handleSave = async (payload) => {
    try {
      if (modal && typeof modal === 'object') {
        await usuarioService.update(modal._id || modal.id, payload);
        toast('Usuario actualizado correctamente');
      } else {
        await usuarioService.create(payload);
        toast('Usuario creado correctamente');
      }
      setModal(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      toast(err?.response?.data?.error ?? 'Error al guardar el usuario', 'error');
    }
  };

  const handleDelete = async () => {
    if (!confirm) return;
    try {
      await usuarioService.delete(confirm.id);
      toast('Usuario eliminado');
      setConfirm(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      toast(err?.response?.data?.error ?? 'Error al eliminar el usuario', 'error');
      setConfirm(null);
    }
  };

  const filtered = usuarios.filter(u => {
    const q = search.toLowerCase();
    const matchSearch =
      (u.nombre   ?? '').toLowerCase().includes(q) ||
      (u.correo   ?? '').toLowerCase().includes(q) ||
      (u.telefono ?? '').toLowerCase().includes(q);
    const matchEstatus =
      filterEstatus === 'todos' || String(u.estatus) === filterEstatus;
    const matchDepto =
      filterDepto === '' || String(toNum(u.departamento_id)) === filterDepto;
    return matchSearch && matchEstatus && matchDepto;
  });

  // Department name lookup using integer id
  const deptoNombre = (deptId) => {
    if (deptId === null || deptId === undefined || deptId === '') return '—';
    const d = departamentos.find(d => docId(d) === toNum(deptId));
    return d?.nombre ?? '—';
  };

  return (
    <div className="ul-wrap">
      <Toast toasts={toasts} />

      {/* Toolbar */}
      <div className="ul-toolbar">
        <div className="ul-toolbar__left">
          <div className="filter-group">
            <label className="filter-label">Buscar</label>
            <div className="ul-search">
              <FaSearch className="ul-search__icon" />
              <input
                placeholder="Nombre, correo, teléfono"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button className="ul-search__clear" onClick={() => setSearch('')}>
                  <FaTimes />
                </button>
              )}
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-label">Estado</label>
            <select
              className="ul-filter-select"
              value={filterEstatus}
              onChange={e => setFilterEstatus(e.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="1">Activo</option>
              <option value="0">Inactivo</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Departamento</label>
            <select
              className="ul-filter-select"
              value={filterDepto}
              onChange={e => setFilterDepto(e.target.value)}
            >
              <option value="">Todos</option>
              {departamentos.map(d => (
                <option key={docId(d)} value={String(docId(d))}>{d.nombre}</option>
              ))}
            </select>
          </div>

          {(search || filterEstatus !== 'todos' || filterDepto !== '') && (
            <button 
              className="btn-secondary"
              onClick={() => {
                setSearch('');
                setFilterEstatus('todos');
                setFilterDepto('');
              }}
              title="Limpiar todos los filtros"
            >
              <FaTimes /> Limpiar
            </button>
          )}
        </div>

        <button className="ul-btn ul-btn--primary" onClick={() => setModal('create')}>
          <FaPlus /> Nuevo usuario
        </button>
      </div>

      {/* Table */}
      <div className="ul-table-wrap">
        {loading ? (
          <div className="ul-state ul-state--loading">
            <FaSpinner className="spin" />
            <span>Cargando usuarios…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="ul-state ul-state--empty">
            <FaUserCircle />
            <p>No se encontraron usuarios</p>
            {search && (
              <button className="ul-btn ul-btn--ghost" onClick={() => setSearch('')}>
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <table className="ul-table">
            <thead>
              <tr>
                <th>USUARIO</th>
                <th>TELÉFONO</th>
                <th>DEPARTAMENTO</th>
                <th>ESTADO</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => {
                const est = ESTATUS_MAP[u.estatus] ?? { label: '—', cls: 'badge-gray' };
                return (
                  <tr key={u._id || u.id || i}>
                    <td>
                      <div className="ul-user-cell">
                        <div className="ul-avatar">
                          {(u.nombre ?? '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="ul-user-name">{u.nombre}</span>
                          <span className="ul-user-email">{u.correo}</span>
                        </div>
                      </div>
                    </td>
                    <td className="ul-mono" title={u.telefono || ''}>{u.telefono || '—'}</td>
                    <td>{deptoNombre(u.departamento_id)}</td>
                    <td>
                      <span className={`ul-badge ${est.cls}`}>{est.label}</span>
                    </td>
                    <td>
                      <div className="ul-actions">
                        <button className="ul-icon-btn ul-icon-btn--view" title="Ver detalle"
                          onClick={() => setDrawer(u)}>
                          <FaEye />
                        </button>
                        <button className="ul-icon-btn ul-icon-btn--edit" title="Editar"
                          onClick={() => setModal(u)}>
                          <FaEdit />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer count */}
      {!loading && filtered.length > 0 && (
        <div className="ul-footer">
          Mostrando <strong>{filtered.length}</strong> de <strong>{usuarios.length}</strong> usuarios
        </div>
      )}

      {/* Modals */}
      {modal !== null && (
        <UsuarioModal
          usuario={modal === 'create' ? null : modal}
          departamentos={departamentos}
          permisos={permisos}
          categorias={categorias}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {drawer && (
        <UsuarioDrawer
          usuario={drawer}
          departamentos={departamentos}
          permisos={permisos}
          onClose={() => setDrawer(null)}
          onEdit={u => setModal(u)}
        />
      )}

      {confirm && (
        <ConfirmDialog
          message={`¿Eliminar a "${confirm.nombre}"? Esta acción no se puede deshacer.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}