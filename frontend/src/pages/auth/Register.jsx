import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { Lock, Mail, User, ShieldCheck, Zap, Dumbbell, UserCheck } from 'lucide-react';

const ROLES = [
  {
    value: 'Cliente',
    label: 'Cliente',
    icon: User,
    desc: 'Accede a rutinas y sigue tu progreso',
  },
  {
    value: 'Entrenador',
    label: 'Entrenador',
    icon: Dumbbell,
    desc: 'Gestiona atletas y crea programas',
  },
];

const Register = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('Cliente');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const endpoint = rol === 'Entrenador' ? '/auth/register/entrenador' : '/auth/register/cliente';
      const response = await api.post(endpoint, { nombre, email, password });

      if (response.status === 201) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Error al registrar el usuario');
    } finally {
      setLoading(false);
    }
  };

  const focusStyle = { boxShadow: '0 0 0 2px #f59e0b' };
  const blurStyle = {};

  return (
    <div className="min-h-screen flex">
      {/* Left panel — decorative */}
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 relative overflow-hidden p-12"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}
      >
        {/* Diagonal stripes */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'repeating-linear-gradient(-45deg, #f59e0b 0px, #f59e0b 2px, transparent 2px, transparent 28px)',
          }}
        />
        {/* Glows */}
        <div
          className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#f59e0b' }}>
            <Zap size={22} className="text-gray-900" strokeWidth={2.5} />
          </div>
          <span
            className="text-white font-black text-xl"
            style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif", letterSpacing: '0.05em' }}
          >
            SPORT<span style={{ color: '#f59e0b' }}>TRACK</span>
          </span>
        </div>

        {/* Headline */}
        <div className="relative z-10">
          <p className="text-gray-400 text-sm font-semibold tracking-widest uppercase mb-3">Únete al equipo</p>
          <h1
            className="text-white leading-none mb-6"
            style={{
              fontFamily: "'Bebas Neue', 'Impact', sans-serif",
              fontSize: '4.5rem',
              lineHeight: 1,
            }}
          >
            EMPIEZA TU <br />
            <span style={{ color: '#f59e0b' }}>JOURNEY</span>
          </h1>
          <p className="text-gray-400 text-base leading-relaxed max-w-sm">
            Crea tu cuenta, elige tu rol y comienza a construir el mejor rendimiento de tu vida.
          </p>
        </div>

        {/* Feature list */}
        <div className="relative z-10 space-y-3">
          {[
            'Rutinas personalizadas por tu entrenador',
            'Seguimiento de progreso en tiempo real',
            'Comunicación directa con tu equipo',
          ].map((feat) => (
            <div key={feat} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#f59e0b' }}>
                <UserCheck size={11} className="text-gray-900" strokeWidth={3} />
              </div>
              <span className="text-gray-300 text-sm">{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#f59e0b' }}>
              <Zap size={20} className="text-gray-900" strokeWidth={2.5} />
            </div>
            <span className="font-black text-xl text-gray-900" style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif", letterSpacing: '0.05em' }}>
              SPORT<span style={{ color: '#f59e0b' }}>TRACK</span>
            </span>
          </div>

          <div className="mb-7">
            <h2
              className="text-3xl font-black text-gray-900"
              style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif", letterSpacing: '0.03em' }}
            >
              CREAR CUENTA
            </h2>
            <p className="text-gray-400 text-sm mt-1">Completa los datos para comenzar</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
              ¡Registro exitoso! Redirigiendo al login...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nombre */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-1.5">Nombre Completo</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  className="w-full border border-gray-200 bg-gray-50 pl-10 pr-4 py-3 rounded-xl text-sm text-gray-900 placeholder-gray-400 transition focus:outline-none focus:bg-white"
                  onFocus={e => Object.assign(e.target.style, focusStyle)}
                  onBlur={e => Object.assign(e.target.style, blurStyle)}
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  placeholder="Juan Pérez"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-1.5">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="email"
                  className="w-full border border-gray-200 bg-gray-50 pl-10 pr-4 py-3 rounded-xl text-sm text-gray-900 placeholder-gray-400 transition focus:outline-none focus:bg-white"
                  onFocus={e => Object.assign(e.target.style, focusStyle)}
                  onBlur={e => Object.assign(e.target.style, blurStyle)}
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
                  onFocus={e => Object.assign(e.target.style, focusStyle)}
                  onBlur={e => Object.assign(e.target.style, blurStyle)}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Tipo de cuenta — card selector */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">Tipo de Cuenta</label>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map(({ value, label, icon: Icon, desc }) => {
                  const selected = rol === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRol(value)}
                      className="relative flex flex-col items-start gap-1.5 p-3.5 rounded-xl border-2 transition-all duration-150 text-left"
                      style={{
                        borderColor: selected ? '#f59e0b' : '#e5e7eb',
                        background: selected ? '#fffbeb' : '#f9fafb',
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: selected ? '#f59e0b' : '#e5e7eb' }}
                      >
                        <Icon size={15} className={selected ? 'text-gray-900' : 'text-gray-500'} strokeWidth={2.5} />
                      </div>
                      <span className="text-sm font-bold text-gray-800">{label}</span>
                      <span className="text-xs text-gray-400 leading-tight">{desc}</span>
                      {selected && (
                        <div
                          className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full flex items-center justify-center"
                          style={{ background: '#f59e0b' }}
                        >
                          <span className="text-gray-900 text-[9px] font-black">✓</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full text-gray-900 font-black py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
              style={{
                background: '#f59e0b',
                fontFamily: "'Bebas Neue', 'Impact', sans-serif",
                letterSpacing: '0.08em',
                fontSize: '0.95rem',
                boxShadow: loading ? 'none' : '0 4px 14px rgba(245,158,11,0.4)',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#d97706'; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#f59e0b'; }}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Zap size={16} strokeWidth={2.5} />
              )}
              {loading ? 'Registrando...' : 'Crear mi cuenta'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="font-bold hover:underline" style={{ color: '#f59e0b' }}>
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;