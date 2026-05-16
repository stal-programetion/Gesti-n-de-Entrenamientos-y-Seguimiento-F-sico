import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Lock, Mail, Zap } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      if (result.rol === 'Administrador') navigate('/admin/pagos');
      else if (result.rol === 'Entrenador') navigate('/entrenador/rutinas');
      else if (result.rol === 'Cliente') navigate('/cliente/rutinas');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — decorative sport side */}
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 relative overflow-hidden p-12"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}
      >
        {/* Diagonal accent stripe */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'repeating-linear-gradient(-45deg, #f59e0b 0px, #f59e0b 2px, transparent 2px, transparent 28px)',
          }}
        />
        {/* Glow circle */}
        <div
          className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }}
        />
        <div
          className="absolute -top-20 -right-20 w-[300px] h-[300px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#f59e0b' }}>
            <Zap size={22} className="text-gray-900" strokeWidth={2.5} />
          </div>
          <span className="text-white font-black text-xl tracking-tight" style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif", letterSpacing: '0.05em' }}>
            SPORT<span style={{ color: '#f59e0b' }}>TRACK</span>
          </span>
        </div>

        {/* Headline */}
        <div className="relative z-10">
          <p className="text-gray-400 text-sm font-semibold tracking-widest uppercase mb-3">Gestión Deportiva</p>
          <h1
            className="text-white leading-none mb-6"
            style={{
              fontFamily: "'Bebas Neue', 'Impact', sans-serif",
              fontSize: '4.5rem',
              letterSpacing: '0.02em',
              lineHeight: 1,
            }}
          >
            SUPERA TUS <br />
            <span style={{ color: '#f59e0b' }}>LÍMITES</span>
          </h1>
          <p className="text-gray-400 text-base leading-relaxed max-w-sm">
            Accede a tus rutinas, monitorea tu progreso y conecta con tu entrenador desde un solo lugar.
          </p>
        </div>

        {/* Stats row */}
        <div className="relative z-10 flex gap-8">
          
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#f59e0b' }}>
              <Zap size={20} className="text-gray-900" strokeWidth={2.5} />
            </div>
            <span className="font-black text-xl text-gray-900" style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif", letterSpacing: '0.05em' }}>
              SPORT<span style={{ color: '#f59e0b' }}>TRACK</span>
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-gray-900" style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif", letterSpacing: '0.03em' }}>
              BIENVENIDO DE VUELTA
            </h2>
            <p className="text-gray-400 text-sm mt-1">Ingresa tus credenciales para continuar</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-1.5">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="email"
                  className="w-full border border-gray-200 bg-gray-50 pl-10 pr-4 py-3 rounded-xl text-sm text-gray-900 placeholder-gray-400 transition focus:outline-none focus:ring-2 focus:bg-white"
                  style={{ '--tw-ring-color': '#f59e0b' }}
                  onFocus={e => e.target.style.boxShadow = '0 0 0 2px #f59e0b'}
                  onBlur={e => e.target.style.boxShadow = ''}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="correo@ejemplo.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-1.5">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="password"
                  className="w-full border border-gray-200 bg-gray-50 pl-10 pr-4 py-3 rounded-xl text-sm text-gray-900 placeholder-gray-400 transition focus:outline-none focus:bg-white"
                  onFocus={e => e.target.style.boxShadow = '0 0 0 2px #f59e0b'}
                  onBlur={e => e.target.style.boxShadow = ''}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full text-gray-900 font-black py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm tracking-wider uppercase disabled:opacity-60"
              style={{
                background: loading ? '#d97706' : '#f59e0b',
                fontFamily: "'Bebas Neue', 'Impact', sans-serif",
                letterSpacing: '0.08em',
                fontSize: '0.95rem',
                boxShadow: loading ? 'none' : '0 4px 14px rgba(245,158,11,0.4)',
              }}
              onMouseEnter={e => { if (!loading) e.target.style.background = '#d97706'; }}
              onMouseLeave={e => { if (!loading) e.target.style.background = '#f59e0b'; }}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Zap size={16} strokeWidth={2.5} />
              )}
              {loading ? 'Ingresando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="font-bold hover:underline" style={{ color: '#f59e0b' }}>
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;