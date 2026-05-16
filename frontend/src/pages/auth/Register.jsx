import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { Lock, Mail, User, ShieldCheck } from 'lucide-react';

const Register = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('Cliente'); // Por defecto Cliente
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      const endpoint = rol === 'Entrenador' ? '/auth/register/entrenador' : '/auth/register/cliente';
      const response = await api.post(endpoint, {
        nombre,
        email,
        password
      });

      if (response.status === 201) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000); // Redirige al login tras 2 segundos
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Error al registrar el usuario');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 py-10">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Crear Cuenta</h2>
        
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">¡Registro exitoso! Redirigiendo al login...</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Nombre Completo</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={18}/>
              <input 
                type="text" 
                className="w-full border border-gray-300 pl-10 pr-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                placeholder="Juan Pérez"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={18}/>
              <input 
                type="email" 
                className="w-full border border-gray-300 pl-10 pr-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="correo@ejemplo.com"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18}/>
              <input 
                type="password" 
                className="w-full border border-gray-300 pl-10 pr-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="********"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Tipo de Cuenta</label>
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-3 text-gray-400" size={18}/>
              <select 
                className="w-full border border-gray-300 pl-10 pr-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={rol}
                onChange={(e) => setRol(e.target.value)}
              >
                <option value="Cliente">Cliente</option>
                <option value="Entrenador">Entrenador</option>
              </select>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-700 transition"
          >
            Registrarme
          </button>

          <div className="text-center mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-blue-600 font-bold hover:underline">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
