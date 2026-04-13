<<<<<<< Updated upstream
import React, { useState, useMemo } from 'react';
import {
  FaSearch, FaEye, FaEdit, FaTrash, FaPlus, FaTimes,
  FaCheck, FaSort, FaUser, FaEnvelope, FaPhone,
  FaBuilding, FaShieldAlt, FaKey,
} from 'react-icons/fa';
import '../../styles/UsuariosList.css';

/* ─────────────────────────────────────────────────────────────
   Normaliza CUALQUIER valor a un array JS limpio.
   MongoDB puede devolver BSONArray (objeto iterable), null, etc.
───────────────────────────────────────────────────────────── */
const toArr = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'object') return Object.values(val);
  return [];
};

/* ── Opciones de ordenamiento ─────────────────────────────── */
const SORT_OPTIONS = [
  { value: 'nombre_asc',  label: 'Nombre A→Z' },
  { value: 'nombre_desc', label: 'Nombre Z→A' },
  { value: 'reciente',    label: 'Más recientes' },
  { value: 'antiguo',     label: 'Más antiguos' },
  { value: 'activo',      label: 'Activos primero' },
  { value: 'inactivo',    label: 'Inactivos primero' },
];

/* ── Validación contraseña ────────────────────────────────── */
const validatePassword = (pwd) => {
  const errors = [];
  if (pwd.length < 8) errors.push('Mínimo 8 caracteres');
  if (!/[A-Z]/.test(pwd)) errors.push('Al menos una mayúscula');
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(pwd))
    errors.push('Al menos un carácter especial');
  return errors;
};

/* ── Color de avatar según nombre ────────────────────────── */
const avatarColor = (str = 'U') => {
  const palette = [
    '#0e7490','#0891b2','#1d4ed8','#4f46e5',
    '#7c3aed','#a21caf','#047857','#b45309',
  ];
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return palette[Math.abs(h) % palette.length];
};

/* ══════════════════════════════════════════════════════════
   MODAL DETALLE
══════════════════════════════════════════════════════════ */
function ModalDetalle({ usuario, departamentos, permisosCatalogo, onClose, onEdit }) {
  if (!usuario) return null;

  /* Búsqueda robusta de departamento */
  const uId = String(usuario.departamento_id ?? '');
  let deptNombre = '—';
  if (uId) {
    const found = departamentos.find(d => {
      const dId = String(d._id || d.id || '');
      return dId && dId === uId;
    });
    if (found) {
      deptNombre = found.nombre;
    } else if (/^\d+$/.test(uId)) {
      // Legacy: departamento_id guardado como entero 1-based
      const idx = parseInt(uId, 10) - 1;
      deptNombre = departamentos[idx]?.nombre || `Dept. ${uId}`;
    } else {
      deptNombre = `Dept. ${uId}`;
    }
  }

  /* Permisos: busca por _id o id en el catálogo, con fallback para enteros legacy */
  const permisosArr = toArr(usuario.permisos);
  const permisosEncontrados = permisosArr.map((id, arrayIdx) => {
    const strId = String(id);
    // Búsqueda exacta por _id
    let found = permisosCatalogo.find(p => String(p._id || p.id) === strId);
    // Fallback: si es entero 1-based, buscar por índice
    if (!found && /^\d+$/.test(strId)) {
      const idx = parseInt(strId, 10) - 1;
      found = permisosCatalogo[idx];
    }
    return found ? found.nombre : null;
  }).filter(Boolean);

  const nombre  = usuario.nombre || 'Usuario';
  const correo  = usuario.correo || usuario.email || '—';
  const activo  = usuario.estatus === 1;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-detalle" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-left">
            <div className="modal-avatar" style={{ background: avatarColor(nombre) }}>
              {nombre[0].toUpperCase()}
            </div>
            <div>
              <h2 className="modal-title">Detalle de Usuario</h2>
              <p className="modal-subtitle">{correo}</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><FaTimes /></button>
        </div>

        <div className="modal-body">
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-icon"><FaUser /></div>
              <div>
                <span className="detail-label">NOMBRE</span>
                <span className="detail-value">{nombre}</span>
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-icon"><FaEnvelope /></div>
              <div>
                <span className="detail-label">CORREO</span>
                <span className="detail-value">{correo}</span>
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-icon"><FaPhone /></div>
              <div>
                <span className="detail-label">TELÉFONO</span>
                <span className="detail-value">{usuario.telefono || '—'}</span>
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-icon"><FaBuilding /></div>
              <div>
                <span className="detail-label">DEPARTAMENTO</span>
                <span className="detail-value">{deptNombre}</span>
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-icon"><FaCheck /></div>
              <div>
                <span className="detail-label">ESTADO</span>
                <span className={`badge-estado ${activo ? 'activo' : 'inactivo'}`}>
                  {activo ? 'ACTIVO' : 'INACTIVO'}
                </span>
              </div>
            </div>
            {/* Permisos: ocupa toda la fila */}
            <div className="detail-item detail-item-full">
              <div className="detail-icon"><FaShieldAlt /></div>
              <div style={{ flex: 1 }}>
                <span className="detail-label">PERMISOS</span>
                {permisosEncontrados.length > 0 ? (
                  <div className="permisos-chips">
                    {permisosEncontrados.map((nombre, i) => (
                      <span key={i} className="permiso-chip">{nombre}</span>
                    ))}
                  </div>
                ) : (
                  <span className="detail-value" style={{ color: '#cbd5e1' }}>Sin permisos asignados</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cerrar</button>
          <button className="btn-primary" onClick={() => onEdit(usuario)}>
            <FaEdit /> Editar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MODAL EDITAR / CREAR
══════════════════════════════════════════════════════════ */
function ModalEditar({ usuario, onClose, onSave, departamentos, permisosCatalogo }) {
  const esNuevo = !usuario;

  /* Resuelve el departamento_id inicial: si es un entero legacy (1, 2, 3...),
     intenta mapearlo al _id real del departamento en el catálogo.            */
  const resolverDeptId = (rawId) => {
    if (!rawId && rawId !== 0) return '';
    const str = String(rawId);
    // Si ya existe como _id en el catálogo, usar directo
    const exact = departamentos.find(d => String(d._id || d.id || '') === str);
    if (exact) return str;
    // Legacy: entero 1-based → buscar por índice
    if (/^\d+$/.test(str)) {
      const idx = parseInt(str, 10) - 1;
      const byIdx = departamentos[idx];
      if (byIdx) return String(byIdx._id || byIdx.id || '');
    }
    return str;
  };

  /* Toggle permiso — compara todo como string para evitar problemas de tipo.
     También resuelve IDs enteros legacy al ObjectId real del catálogo.        */
  const resolverPermisoId = (rawId) => {
    const str = String(rawId);
    const exact = permisosCatalogo.find(p => String(p._id || p.id) === str);
    if (exact) return str;
    if (/^\d+$/.test(str)) {
      const idx = parseInt(str, 10) - 1;
      const byIdx = permisosCatalogo[idx];
      if (byIdx) return String(byIdx._id || byIdx.id || str);
    }
    return str;
  };

  // Obtener permisos iniciales del usuario (normalizados a array)
const permisosIniciales = toArr(usuario?.permisos);

// Normalizar permisos iniciales resolviendo IDs legacy
const permisosNormalizados = permisosIniciales.map(resolverPermisoId);

  const [form, setForm] = useState({
    nombre:          usuario?.nombre    || '',
    correo:          usuario?.correo    || usuario?.email || '',
    telefono:        usuario?.telefono  || '',
    contrasena:      '',
    departamento_id: resolverDeptId(usuario?.departamento_id),
    estatus:         usuario?.estatus   ?? 1,
    permisos:        permisosNormalizados,
  });

  const [errors,  setErrors]  = useState({});
  const [saving,  setSaving]  = useState(false);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  /* Toggle permiso — compara todo como string para evitar problemas de tipo */
  const permisoActivo = (pid) => form.permisos.some(p => String(p) === String(pid));

  const togglePermiso = (id) => {
    const strId = String(id);
    setForm(prev => ({
      ...prev,
      permisos: permisoActivo(strId)
        ? prev.permisos.filter(p => String(p) !== strId)
        : [...prev.permisos, strId],
=======
import React, { useState, useEffect, useRef } from 'react';
import {
  FaSearch, FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash,
  FaTimes, FaCheck, FaUserCircle, FaShieldAlt, FaBuilding,
  FaExclamationTriangle, FaSpinner,
} from 'react-icons/fa';
import { usuarioService, departamentoService, permisoService } from '../../services';
import '../../styles/UsuariosList.css';

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
function UsuarioModal({ usuario, departamentos, permisos, onClose, onSave }) {
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
>>>>>>> Stashed changes
    }));
  };

  const validate = () => {
    const e = {};
<<<<<<< Updated upstream
    if (!form.nombre.trim())  e.nombre = 'El nombre es requerido';
    if (!form.correo.trim())  e.correo = 'El correo es requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) e.correo = 'Correo inválido';
    if (esNuevo && !form.contrasena) {
      e.contrasena = 'La contraseña es requerida';
    } else if (form.contrasena) {
      const pwErr = validatePassword(form.contrasena);
      if (pwErr.length > 0) e.contrasena = pwErr.join(' · ');
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      /* Enviar correo como "correo" que es como lo espera el backend */
      const payload = {
        nombre:          form.nombre.trim(),
        correo:          form.correo.trim(),
        telefono:        form.telefono.trim() || null,
        estatus:         Number(form.estatus),
        departamento_id: form.departamento_id || null,
        permisos:        form.permisos,
      };
      if (form.contrasena) payload.contrasena = form.contrasena;
      await onSave(payload, usuario?._id || usuario?.id);
      onClose();
    } catch (err) {
      setErrors({ general: err?.response?.data?.error || err.message || 'Error al guardar' });
=======
    if (!form.nombre.trim()) e.nombre = 'El nombre es requerido';
    if (!form.correo.trim()) e.correo = 'El correo es requerido';
    if (!isEdit && !form.contrasena.trim()) e.contrasena = 'La contraseña es requerida';
    if (!isEdit && form.contrasena.length < 4) e.contrasena = 'Mínimo 4 caracteres';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      const payload = {
        nombre:          form.nombre,
        correo:          form.correo,
        telefono:        form.telefono,
        estatus:         parseInt(form.estatus, 10),
        // Must be integer (Int32) to match DB schema, or null
        departamento_id: form.departamento_id !== '' ? Number(form.departamento_id) : null,
        // Array of integers — matches DB schema exactly
        permisos:        form.permisos,
      };
      if (form.contrasena) payload.contrasena = form.contrasena;
      await onSave(payload);
>>>>>>> Stashed changes
    } finally {
      setSaving(false);
    }
  };

<<<<<<< Updated upstream
  const pwStrength = form.contrasena ? validatePassword(form.contrasena) : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-editar" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-left">
            <div className="modal-avatar modal-avatar-edit" style={{ background: avatarColor(form.nombre || 'N') }}>
              {esNuevo ? <FaPlus /> : (form.nombre || 'U')[0].toUpperCase()}
            </div>
            <div>
              <h2 className="modal-title">{esNuevo ? 'Nuevo Usuario' : 'Editar Usuario'}</h2>
              <p className="modal-subtitle">
                {esNuevo ? 'Completa los datos del nuevo usuario' : `Modificando a ${usuario?.nombre}`}
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><FaTimes /></button>
        </div>

        <div className="modal-body modal-body-scroll">
          {errors.general && <div className="form-error-banner">{errors.general}</div>}

          <div className="form-grid">
            {/* Nombre */}
            <div className={`form-field ${errors.nombre ? 'has-error' : ''}`}>
              <label className="form-label"><FaUser /> NOMBRE *</label>
              <input className="form-input" type="text" value={form.nombre}
                onChange={e => handleChange('nombre', e.target.value)}
                placeholder="Nombre completo" autoFocus />
              {errors.nombre && <span className="form-error">{errors.nombre}</span>}
            </div>

            {/* Correo */}
            <div className={`form-field ${errors.correo ? 'has-error' : ''}`}>
              <label className="form-label"><FaEnvelope /> CORREO *</label>
              <input className="form-input" type="email" value={form.correo}
                onChange={e => handleChange('correo', e.target.value)}
                placeholder="correo@empresa.com" />
              {errors.correo && <span className="form-error">{errors.correo}</span>}
            </div>

            {/* Teléfono */}
            <div className="form-field">
              <label className="form-label"><FaPhone /> TELÉFONO</label>
              <input className="form-input" type="tel" value={form.telefono}
                onChange={e => handleChange('telefono', e.target.value)}
                placeholder="10 dígitos" />
            </div>

            {/* Contraseña */}
            <div className={`form-field ${errors.contrasena ? 'has-error' : ''}`}>
              <label className="form-label">
                <FaKey /> {esNuevo ? 'CONTRASEÑA *' : 'NUEVA CONTRASEÑA'}
                {!esNuevo && <span className="form-label-hint"> — vacío = sin cambio</span>}
              </label>
              <input className="form-input" type="password" value={form.contrasena}
                onChange={e => handleChange('contrasena', e.target.value)}
                placeholder={esNuevo ? 'Mín. 8 chars, 1 mayús., 1 especial' : '••••••••'} />
              {form.contrasena && pwStrength !== null && (
                <div className="pw-requirements">
                  {pwStrength.length === 0
                    ? <span className="req-ok">✓ Contraseña válida</span>
                    : pwStrength.map((e, i) => <span key={i} className="req-fail">✗ {e}</span>)
                  }
                </div>
              )}
              {errors.contrasena && <span className="form-error">{errors.contrasena}</span>}
            </div>

            {/* Departamento */}
            <div className="form-field">
              <label className="form-label"><FaBuilding /> DEPARTAMENTO</label>
              <select className="form-input form-select"
                value={form.departamento_id}
                onChange={e => handleChange('departamento_id', e.target.value)}>
                <option value="">— Seleccionar —</option>
                {departamentos.map(d => (
                  <option key={d._id || d.id} value={String(d._id || d.id)}>
                    {d.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Estatus */}
            <div className="form-field">
              <label className="form-label">ESTATUS</label>
              <select className="form-input form-select"
                value={form.estatus}
                onChange={e => handleChange('estatus', parseInt(e.target.value))}>
                <option value={1}>Activo</option>
                <option value={0}>Inactivo</option>
              </select>
            </div>
          </div>

          {/* Permisos — solo en modal de edición/creación */}
          {permisosCatalogo.length > 0 && (
            <div className="form-field form-field-full" style={{ marginTop: 16 }}>
              <label className="form-label"><FaShieldAlt /> PERMISOS</label>
              <div className="permisos-grid">
                {permisosCatalogo.map(p => {
                  const pid     = String(p._id || p.id);
                  const checked = permisoActivo(pid);
                  return (
                    <button key={pid} type="button"
                      className={`permiso-toggle ${checked ? 'selected' : ''}`}
                      onClick={() => togglePermiso(pid)}>
                      <span className="permiso-check">{checked ? '✓' : ''}</span>
                      {p.nombre}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose} disabled={saving}>Cancelar</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving
              ? 'Guardando...'
              : esNuevo ? <><FaPlus /> Crear Usuario</> : <><FaCheck /> Guardar Cambios</>
=======
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
                  placeholder={isEdit ? '••••••••' : 'Mínimo 4 caracteres'}
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
                    setForm(f => ({ ...f, departamento_id: v === '' ? '' : Number(v) }));
                  }}
                >
                  <option value="">Sin departamento</option>
                  {departamentos.map(d => {
                    const id = docId(d);
                    return (
                      <option key={String(id)} value={id}>
                        {d.nombre}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>

          {/* ── Right: permisos ── */}
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
                // Checked if the user's permisos array (numbers) includes this permission's numeric id
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
>>>>>>> Stashed changes
            }
          </button>
        </div>
      </div>
    </div>
  );
}

<<<<<<< Updated upstream
/* ══════════════════════════════════════════════════════════
   MODAL CONFIRMAR ELIMINAR
══════════════════════════════════════════════════════════ */
function ModalEliminar({ usuario, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);
  if (!usuario) return null;

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm(usuario._id || usuario.id);
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-confirm" onClick={e => e.stopPropagation()}>
        <div className="confirm-icon">🗑️</div>
        <h2 className="confirm-title">¿Eliminar usuario?</h2>
        <p className="confirm-desc">
          Estás a punto de eliminar a <strong>{usuario.nombre}</strong>.
          Esta acción no se puede deshacer.
        </p>
        <div className="modal-footer modal-footer-center">
          <button className="btn-secondary" onClick={onClose} disabled={deleting}>Cancelar</button>
          <button className="btn-danger" onClick={handleConfirm} disabled={deleting}>
            {deleting ? 'Eliminando...' : <><FaTrash /> Eliminar</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════════════════════ */
export default function UsuariosList({
  usuarios = [],
  loading,
  onRefresh,
  onUpdate,
  onDelete,
  onCreate,
  departamentos    = [],
  permisosCatalogo = [],
}) {
  const [search,       setSearch]       = useState('');
  const [sortBy,       setSortBy]       = useState('nombre_asc');
  const [modalDetalle, setModalDetalle] = useState(null);
  const [modalEditar,  setModalEditar]  = useState(null);
  const [modalEliminar,setModalEliminar]= useState(null);
  const [alert,        setAlert]        = useState(null);

  const showAlert = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 3500);
  };

  /* ── Helper: nombre de departamento ───────────────── */
  const getDeptNombre = (id) => {
    if (!id && id !== 0) return '—';
    const strId = String(id);
    const found = departamentos.find(d => {
      // Comparar contra _id, id, o contra índice numérico (datos legacy)
      const dId  = String(d._id || d.id || '');
      const dIdx = String(d.index ?? '');
      return (dId && dId === strId) || (dIdx && dIdx === strId);
    });
    // Fallback: si el id es un número pequeño (1, 2, 3...) usarlo como índice 1-based
    if (!found && /^\d+$/.test(strId)) {
      const idx = parseInt(strId, 10) - 1;
      if (departamentos[idx]) return departamentos[idx].nombre;
    }
    return found?.nombre || '—';
  };

  /* ── Filtro + ordenamiento ────────────────────────── */
  const filtered = useMemo(() => {
    let list = usuarios.filter(u => {
      const term = search.toLowerCase();
      return (
        (u.nombre   || '').toLowerCase().includes(term) ||
        (u.correo   || u.email || '').toLowerCase().includes(term) ||
        (u.telefono || '').toLowerCase().includes(term) ||
        getDeptNombre(u.departamento_id).toLowerCase().includes(term)
      );
    });

    switch (sortBy) {
      case 'nombre_asc':  list = [...list].sort((a, b) => (a.nombre||'').localeCompare(b.nombre||'')); break;
      case 'nombre_desc': list = [...list].sort((a, b) => (b.nombre||'').localeCompare(a.nombre||'')); break;
      case 'reciente':    list = [...list].sort((a, b) => String(b._id||'').localeCompare(String(a._id||''))); break;
      case 'antiguo':     list = [...list].sort((a, b) => String(a._id||'').localeCompare(String(b._id||''))); break;
      case 'activo':      list = [...list].sort((a, b) => (b.estatus||0) - (a.estatus||0)); break;
      case 'inactivo':    list = [...list].sort((a, b) => (a.estatus||0) - (b.estatus||0)); break;
    }
    return list;
  }, [usuarios, search, sortBy, departamentos]);

  /* ── Handlers ─────────────────────────────────────── */
  const handleSave = async (formData, id) => {
    try {
      if (id) await onUpdate?.(id, formData);
      else    await onCreate?.(formData);
      onRefresh?.();
      showAlert('success', id ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente');
    } catch (err) {
      showAlert('error', err?.response?.data?.error || 'Error al guardar el usuario');
      throw err; // re-throw para que el modal muestre el error también
    }
  };

  const handleDelete = async (id) => {
    try {
      await onDelete?.(id);
      onRefresh?.();
      showAlert('success', 'Usuario eliminado');
    } catch {
      showAlert('error', 'Error al eliminar el usuario');
    }
  };

  const handleEditFromDetail = (u) => {
    setModalDetalle(null);
    setModalEditar(u);
  };

  /* ── Render ───────────────────────────────────────── */
  return (
    <div className="ul-container">

      {/* Alert toast */}
      {alert && (
        <div className={`ul-alert ul-alert-${alert.type}`}>
          <span>{alert.type === 'success' ? '✓' : '✕'}</span>
          <span>{alert.msg}</span>
          <button onClick={() => setAlert(null)}>✕</button>
        </div>
      )}

      {/* Toolbar */}
      <div className="ul-toolbar">
        <div className="ul-toolbar-left">
          <div className="ul-search">
            <FaSearch className="ul-search-icon" />
            <input
              type="text"
              placeholder="Buscar por nombre, correo, teléfono o departamento…"
=======
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
  const [search,        setSearch]        = useState('');
  const [filterEstatus, setFilterEstatus] = useState('todos');
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
        const [dRes, pRes] = await Promise.all([
          departamentoService.getAll(),
          permisoService.getAll(),
        ]);
        setDepartamentos(Array.isArray(dRes.data) ? dRes.data : dRes.data?.data ?? []);
        setPermisos(Array.isArray(pRes.data) ? pRes.data : pRes.data?.data ?? []);
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
    return matchSearch && matchEstatus;
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
          <div className="ul-search">
            <FaSearch className="ul-search__icon" />
            <input
              placeholder="Buscar por nombre, correo…"
>>>>>>> Stashed changes
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
<<<<<<< Updated upstream
              <button className="ul-search-clear" onClick={() => setSearch('')}>
=======
              <button className="ul-search__clear" onClick={() => setSearch('')}>
>>>>>>> Stashed changes
                <FaTimes />
              </button>
            )}
          </div>

<<<<<<< Updated upstream
          <div className="ul-sort">
            <FaSort className="ul-sort-icon" />
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <button className="ul-btn-nuevo" onClick={() => setModalEditar('new')}>
          <FaPlus /> Nuevo Usuario
        </button>
      </div>

      {/* Contador */}
      <div className="ul-count">
        {filtered.length} usuario{filtered.length !== 1 ? 's' : ''}{search ? ` encontrado${filtered.length !== 1 ? 's' : ''}` : ''}
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="ul-loading">
          <div className="ul-spinner" />
          <span>Cargando usuarios...</span>
        </div>
      ) : (
        <div className="ul-table-wrapper">
=======
          <div className="ul-filter-tabs">
            {[
              { key: 'todos', label: 'Todos'     },
              { key: '1',     label: 'Activos'   },
              { key: '0',     label: 'Inactivos' },
            ].map(tab => (
              <button
                key={tab.key}
                className={`ul-filter-tab ${filterEstatus === tab.key ? 'is-active' : ''}`}
                onClick={() => setFilterEstatus(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
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
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="ul-empty">
                    <div className="ul-empty-icon">👤</div>
                    <p>No se encontraron usuarios</p>
                  </td>
                </tr>
              ) : filtered.map((u, idx) => {
                const nombre  = u.nombre || u.email || 'Usuario';
                const correo  = u.correo || u.email || '—';
                const activo  = u.estatus === 1;
                const deptNom = getDeptNombre(u.departamento_id);

                return (
                  <tr key={u._id || u.id || idx}>
                    {/* Usuario: avatar + nombre + correo */}
                    <td>
                      <div className="ul-user-cell">
                        <div className="ul-avatar" style={{ background: avatarColor(nombre) }}>
                          {nombre[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="ul-user-name">{nombre}</div>
                          <div className="ul-user-email">{correo}</div>
                        </div>
                      </div>
                    </td>

                    <td className="ul-dept">{u.telefono || '—'}</td>

                    <td className="ul-dept">
                      {u.departamento_id
                        ? <span className="ul-dept-badge">{deptNom}</span>
                        : <span style={{ color: '#cbd5e1' }}>—</span>
                      }
                    </td>

                    <td>
                      <span className={`badge-estado-sm ${activo ? 'activo' : 'inactivo'}`}>
                        {activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>

                    <td>
                      <div className="ul-actions">
                        <button className="ul-action-btn ul-btn-ver"   title="Ver detalle" onClick={() => setModalDetalle(u)}>
                          <FaEye />
                        </button>
                        <button className="ul-action-btn ul-btn-edit"  title="Editar"      onClick={() => setModalEditar(u)}>
                          <FaEdit />
                        </button>
                        <button className="ul-action-btn ul-btn-delete" title="Eliminar"   onClick={() => setModalEliminar(u)}>
=======
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
                    <td className="ul-mono">{u.telefono || '—'}</td>
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
                        <button className="ul-icon-btn ul-icon-btn--del" title="Eliminar"
                          onClick={() => setConfirm({ id: u._id || u.id, nombre: u.nombre })}>
>>>>>>> Stashed changes
                          <FaTrash />
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

<<<<<<< Updated upstream
      {/* Modales */}
      {modalDetalle && (
        <ModalDetalle
          usuario={modalDetalle}
          departamentos={departamentos}
          permisosCatalogo={permisosCatalogo}
          onClose={() => setModalDetalle(null)}
          onEdit={handleEditFromDetail}
        />
      )}
      {modalEditar && (
        <ModalEditar
          usuario={modalEditar === 'new' ? null : modalEditar}
          onClose={() => setModalEditar(null)}
          onSave={handleSave}
          departamentos={departamentos}
          permisosCatalogo={permisosCatalogo}
        />
      )}
      {modalEliminar && (
        <ModalEliminar
          usuario={modalEliminar}
          onClose={() => setModalEliminar(null)}
          onConfirm={handleDelete}
=======
      {/* Modals */}
      {modal !== null && (
        <UsuarioModal
          usuario={modal === 'create' ? null : modal}
          departamentos={departamentos}
          permisos={permisos}
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
>>>>>>> Stashed changes
        />
      )}
    </div>
  );
}