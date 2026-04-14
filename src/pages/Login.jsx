import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineCheckCircle, AiOutlineLock, AiOutlineThunderbolt } from 'react-icons/ai';
import { MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md';
import { FaTimes, FaKey, FaEnvelope } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import '../styles/Login.css';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Forgot password state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [tempPassword, setTempPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      if (response.data.success) {
        console.log('Login response:', response.data.user);
        console.log('must_change_password:', response.data.user.must_change_password);
        login(response.data.access_token, response.data.user, rememberMe);
        console.log('After login() called');
        if (response.data.user.must_change_password) {
          console.log('Redirigiendo a /perfil (must_change_password = true)');
          console.log('navigate("/perfil") será llamado ahora...');
          navigate('/perfil');
          console.log('navigate("/perfil") fue llamado');
        } else {
          console.log('Redirigiendo a /home (must_change_password = false)');
          navigate('/home');
        }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error en la autenticación';
      setError(errorMessage);
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotOpen = (e) => {
    e.preventDefault();
    setForgotEmail('');
    setForgotError('');
    setTempPassword('');
    setShowForgotModal(true);
  };

  const handleForgotClose = () => {
    setShowForgotModal(false);
    setForgotEmail('');
    setForgotError('');
    setTempPassword('');
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError('');
    setTempPassword('');

    try {
      const response = await api.post('/auth/forgot-password', { email: forgotEmail });
      if (response.data.success) {
        setTempPassword('sent');
      } else {
        setForgotError(response.data.message || 'No se pudo procesar la solicitud.');
      }
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Error al procesar la solicitud.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="forgot-overlay" onClick={handleForgotClose}>
          <div className="forgot-modal" onClick={(e) => e.stopPropagation()}>
            <div className="forgot-modal-header">
              <h2><FaKey /> Recuperar Contraseña</h2>
              <button className="forgot-close-btn" onClick={handleForgotClose} aria-label="Cerrar">
                <FaTimes />
              </button>
            </div>

            {!tempPassword ? (
              <>
                <p className="forgot-description">
                  Ingresa tu correo electrónico y recibirás una contraseña temporal para acceder a tu cuenta.
                </p>
                <form onSubmit={handleForgotSubmit} className="forgot-form">
                  {forgotError && <div className="forgot-error">{forgotError}</div>}
                  <div className="forgot-input-group">
                    <FaEnvelope className="forgot-input-icon" />
                    <input
                      type="email"
                      placeholder="usuario@empresa.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                  <button
                    type="submit"
                    className="forgot-submit-btn"
                    disabled={forgotLoading}
                  >
                    {forgotLoading ? 'Procesando...' : 'Obtener contraseña temporal'}
                  </button>
                </form>
              </>
            ) : (
              <div className="forgot-success">
                <AiOutlineCheckCircle className="forgot-success-icon" />
                <p><strong>¡Correo enviado!</strong></p>
                <p>Revisa tu bandeja de entrada en <strong>{forgotEmail}</strong>. Te enviamos una contraseña temporal para acceder.</p>
                <p className="forgot-warning">
                  Recuerda cambiarla desde tu perfil después de iniciar sesión.
                </p>
                <button className="forgot-submit-btn" onClick={handleForgotClose}>
                  Volver al inicio de sesión
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="login-wrapper">
        {/* Left Side - Form */}
        <div className="login-left">
          <div className="login-card">
            <div className="login-header">
              <div className="logo">
                <span className="logo-text">Gestix</span>
              </div>
              <p className="subtitle">SISTEMA DE TICKETS</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              {error && <div className="error-message">{error}</div>}

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    id="email"
                    placeholder="usuario@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Contraseña</label>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    placeholder=""
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="eye-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? (
                      <AiOutlineEyeInvisible />
                    ) : (
                      <AiOutlineEye />
                    )}
                  </button>
                </div>
              </div>

              <div className="checkbox-wrapper">
                <button
                  type="button"
                  className="checkbox-btn"
                  onClick={() => setRememberMe(!rememberMe)}
                  aria-label={rememberMe ? 'Desmarcar recuérdame' : 'Marcar recuérdame'}
                >
                  {rememberMe ? (
                    <MdCheckBox className="checkbox-icon checked" />
                  ) : (
                    <MdCheckBoxOutlineBlank className="checkbox-icon" />
                  )}
                  <span>Recuérdame</span>
                </button>
              </div>

              <button
                type="submit"
                className={`submit-btn ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>
            </form>

            <div className="login-footer">
              <p>
                ¿Olvidaste tu contraseña?{' '}
                <a href="#recuperar" className="recovery-link" onClick={handleForgotOpen}>
                  Recuperar
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Info Cards */}
        <div className="login-right">
          <div className="info-cards">
            <div className="info-card">
              <AiOutlineCheckCircle className="card-icon" />
              <h3>Fácil de usar</h3>
              <p>Interfaz intuitiva para gestionar tus tickets</p>
            </div>
            <div className="info-card">
              <AiOutlineLock className="card-icon" />
              <h3>Seguro</h3>
              <p>Tus datos están protegidos con encriptación</p>
            </div>
            <div className="info-card">
              <AiOutlineThunderbolt className="card-icon" />
              <h3>Rápido</h3>
              <p>Respuestas inmediatas a tus solicitudes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
