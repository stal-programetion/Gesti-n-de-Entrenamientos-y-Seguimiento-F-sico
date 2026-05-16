import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Activity, User, Briefcase } from 'lucide-react';
import api from '../api';
import './Login.css'; // Reutilizamos los estilos del login

function UserRegister() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('cliente'); // 'cliente' o 'entrenador'
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Determinar la url según el rol
    const url = rol === 'entrenador' ? '/auth/register/entrenador' : '/auth/register/cliente';
    
    try {
      const response = await api.post(url, {
        nombre,
        email,
        password
      });
      
      setSuccess(response.data.msg || '¡Registro exitoso! Redirigiendo al login...');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000); 
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
          <h2>CREA TU CUENTA</h2>
        </div>

        {error && <div className="message-error">{error}</div>}
        {success && <div className="message-success">{success}</div>}

        <form onSubmit={handleRegister}>
          
          <div className="form-group">
            <label>Nombre completo</label>
            <div className="input-wrapper">
              <User className="input-icon" size={18} />
              <input 
                type="text" 
                placeholder="Juan Pérez"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>
          </div>

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
                minLength={6}
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

          <div className="form-group">
            <label>¿Qué tipo de usuario eres?</label>
            <div className="role-selector" style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="rol" 
                  value="cliente" 
                  checked={rol === 'cliente'} 
                  onChange={() => setRol('cliente')} 
                />
                <User size={16} /> Cliente
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="rol" 
                  value="entrenador" 
                  checked={rol === 'entrenador'} 
                  onChange={() => setRol('entrenador')} 
                />
                <Briefcase size={16} /> Entrenador
              </label>
            </div>
          </div>

          <button type="submit" className="submit-btn" style={{ marginTop: '20px' }}>
            REGISTRARME
          </button>

          <p className="register-prompt">
            ¿Ya tienes cuenta? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Inicia sesión aquí</a>
          </p>

        </form>
      </div>

      <div className="page-footer">
        <div className="page-footer-links">
          <a href="#">Términos de servicio</a> | <a href="#">Política de privacidad</a>
        </div>
        <p>© 2026 FitLink - Todos los derechos reservados</p>
      </div>

    </div>
  );
}

export default UserRegister;