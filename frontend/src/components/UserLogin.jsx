import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Activity } from 'lucide-react';
import api from '../api';
import './Login.css';

function UserLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });
      
      const { access_token, usuario } = response.data;
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(usuario));
      
      setSuccess('¡Ingreso exitoso! Bienvenido ' + usuario.nombre + '. Redirigiendo...');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500); 
    } catch (err) {
      if (err.response && err.response.data && err.response.data.msg) {
        setError(err.response.data.msg);
      } else {
        setError('Error de conexión. Asegúrate de que el servidor esté activo.');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        
        <div className="login-header">
          <div className="login-logo">
            <Activity className="login-logo-icon" size={32} strokeWidth={3} />
            <h1>FitLink</h1>
          </div>
          <h2>BIENVENIDO DE NUEVO</h2>
        </div>

        {error && <div className="message-error">{error}</div>}
        {success && <div className="message-success">{success}</div>}

        <form onSubmit={handleLogin}>
          
          <div className="form-group">
            <label>Correo electrónico</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input 
                type="email" 
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button" 
                className="show-password-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </div>

          <div className="options-row">
            <label className="remember-me">
              <input type="checkbox" />
              Recordarme
            </label>
            <a href="#" className="forgot-password">¿Olvidé mi contraseña?</a>
          </div>

          <button type="submit" className="submit-btn">
            INICIAR SESIÓN
          </button>

          <p className="register-prompt">
            ¿Aún no tienes cuenta? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/register'); }}>Regístrate gratis aquí</a>
          </p>

        </form>
      </div>

      <div className="page-footer">
        <div className="page-footer-links">
          <a href="#">Términos de servicio</a> | <a href="#">Política de privacidad</a>
        </div>
        <div className="social-icons">
          {/* Iconos removidos temporalmente para evitar problemas de compatibilidad */}
        </div>
        <p>© 2026 FitLink - Todos los derechos reservados</p>
      </div>

    </div>
  );
}

export default UserLogin;