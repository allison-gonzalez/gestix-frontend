import React, { useState, useEffect } from 'react';
import {
  FaKey, FaUser, FaEnvelope, FaPhone,
  FaEye, FaEyeSlash, FaCheck, FaTimes,
  FaEdit, FaSave, FaBan, FaLock,
} from 'react-icons/fa';
import { useProfile } from '../hooks/useProfile';
import '../styles/Profile.css';

const getInitials = (name = '') =>
  name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'U';

const Profile = () => {
  const {
    user,
    loading, error, success, updatePassword,
    updating, profileError, profileSuccess, updateProfileData,
  } = useProfile();

  console.log('Profile.jsx - user:', user);
  console.log('Profile.jsx - must_change_password:', user?.must_change_password);

  /* ── Password state ─────────────────────────── */
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [localError, setLocalError] = useState('');

  /* ── Edit profile state ──────────────────────── */
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({ nombre: '', correo: '', telefono: '' });

  useEffect(() => {
    if (user) setEditData({ nombre: user.nombre || '', correo: user.correo || '', telefono: user.telefono || '' });
  }, [user]);

  /* ── Password rules ──────────────────────────── */
  const rules = {
    length:    passwordData.new.length >= 8,
    lowercase: /[a-z]/.test(passwordData.new),
    uppercase: /[A-Z]/.test(passwordData.new),
    special:   /[^a-zA-Z0-9]/.test(passwordData.new),
  };
  const allRulesMet = Object.values(rules).every(Boolean);

  /* ── Handlers ────────────────────────────────── */
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (passwordData.new !== passwordData.confirm) { setLocalError('Las contraseñas no coinciden'); return; }
    if (!allRulesMet) { setLocalError('La contraseña no cumple los requisitos'); return; }
    const ok = await updatePassword(passwordData.current, passwordData.new);
    if (ok) setPasswordData({ current: '', new: '', confirm: '' });
  };

  const handleProfileSave = async () => {
    const ok = await updateProfileData(editData);
    if (ok) setEditMode(false);
  };

  const handleEditCancel = () => {
    setEditData({ nombre: user?.nombre || '', correo: user?.correo || '', telefono: user?.telefono || '' });
    setEditMode(false);
  };

  /* ── Render ──────────────────────────────────── */
  return (
    <div className="page-container">
      <div className="profile-wrapper">

        {/* ── Hero card ── */}
        <div className="profile-hero">
          <div className="profile-hero-accent" />
          <div className="profile-hero-body">
            <div className="profile-avatar">{getInitials(user?.nombre)}</div>
            <div className="profile-hero-info">
              <h1 className="profile-hero-name">{user?.nombre || 'Usuario'}</h1>
              <span className="profile-hero-email">{user?.correo}</span>
            </div>
          </div>
        </div>

        <div className="profile-grid">

          {user?.must_change_password && (
            <div className="profile-force-change-banner">
              <FaLock />
              <span>Debes cambiar tu contraseña antes de continuar. Usa el formulario de seguridad a continuación.</span>
            </div>
          )}

          {/* ── Información Personal ── */}
          <div className="profile-card">
            <div className="profile-card-header">
              <div className="profile-card-title">
                <span className="pct-icon"><FaUser /></span>
                <h2>Información personal</h2>
              </div>
            </div>

            {profileSuccess && <div className="profile-success">{profileSuccess}</div>}
            {profileError   && <div className="profile-error">{profileError}</div>}

            <div className="profile-info">
              {[
                { icon: <FaUser />,     label: 'Nombre',             key: 'nombre',   type: 'text'  },
                { icon: <FaEnvelope />, label: 'Correo electrónico', key: 'correo',   type: 'email' },
                { icon: <FaPhone />,    label: 'Teléfono',           key: 'telefono', type: 'tel'   },
              ].map(({ icon, label, key, type }) => (
                <div className="info-field" key={key}>
                  <label className="info-label">
                    <span className="info-label-icon">{icon}</span>{label}
                  </label>
                  {editMode ? (
                    <input
                      className="profile-input"
                      type={type}
                      value={editData[key]}
                      onChange={e => setEditData({ ...editData, [key]: e.target.value })}
                    />
                  ) : (
                    <div className="info-value">{user?.[key] || <span className="info-empty">—</span>}</div>
                  )}
                </div>
              ))}
            </div>

            {!editMode ? (
              <button className="btn-save-password" onClick={() => setEditMode(true)}>
                <FaEdit /> Editar información
              </button>
            ) : (
              <div className="edit-action-btns">
                <button className="btn-cancel-full" onClick={handleEditCancel}>
                  <FaBan /> Cancelar
                </button>
                <button className="btn-save-password" onClick={handleProfileSave} disabled={updating}>
                  <FaSave /> {updating ? 'Guardando…' : 'Guardar cambios'}
                </button>
              </div>
            )}
          </div>

          {/* ── Seguridad ── */}
          <div className="profile-card">
            <div className="profile-card-header">
              <div className="profile-card-title">
                <span className="pct-icon pct-icon--key"><FaKey /></span>
                <h2>Seguridad</h2>
              </div>
            </div>

            <form onSubmit={handlePasswordUpdate} className="password-form">
              {success    && <div className="profile-success">{success}</div>}
              {(error || localError) && <div className="profile-error">{localError || error}</div>}

              {[
                { id: 'current', label: 'Contraseña actual',     ph: 'Contraseña actual'          },
                { id: 'new',     label: 'Nueva contraseña',       ph: 'Nueva contraseña'            },
                { id: 'confirm', label: 'Confirmar contraseña',   ph: 'Repite la nueva contraseña'  },
              ].map(({ id, label, ph }) => (
                <div className="form-group" key={id}>
                  <label className="form-label">{label}</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPasswords[id] ? 'text' : 'password'}
                      className="profile-input"
                      value={passwordData[id]}
                      onChange={e => setPasswordData({ ...passwordData, [id]: e.target.value })}
                      placeholder={ph}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPasswords({ ...showPasswords, [id]: !showPasswords[id] })}
                    >
                      {showPasswords[id] ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>

                  {id === 'new' && passwordData.new.length > 0 && (
                    <ul className="password-rules">
                      {[
                        [rules.length,    'Mínimo 8 caracteres'],
                        [rules.lowercase, 'Una letra minúscula'],
                        [rules.uppercase, 'Una letra mayúscula'],
                        [rules.special,   'Un carácter especial'],
                      ].map(([met, text], i) => (
                        <li key={i} className={met ? 'rule-met' : 'rule-unmet'}>
                          {met ? <FaCheck /> : <FaTimes />} {text}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}

              <button type="submit" className="btn-save-password" disabled={loading}>
                <FaLock /> {loading ? 'Guardando…' : 'Cambiar contraseña'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
