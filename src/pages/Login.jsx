import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineCheckCircle, AiOutlineLock, AiOutlineThunderbolt } from 'react-icons/ai';
import { MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md';
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
        login(response.data.access_token, response.data.user, rememberMe);
        navigate('/home');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error en la autenticación';
      setError(errorMessage);
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
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
                <a href="#recuperar" className="recovery-link">
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
