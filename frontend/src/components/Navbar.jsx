import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Home } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-gray-800 text-white p-4 shadow-md flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <span className="font-bold text-lg tracking-wider">GestiónEntrenamientos</span>
        {user.rol === 'Administrador' && (
          <Link to="/admin/pagos" className="hover:text-gray-300">Pagos</Link>
        )}
        {user.rol === 'Entrenador' && (
          <Link to="/entrenador/rutinas" className="hover:text-gray-300">Rutinas</Link>
        )}
        {user.rol === 'Cliente' && (
          <>
            <Link to="/cliente/rutinas" className="hover:text-gray-300">Mis Rutinas</Link>
            <Link to="/cliente/historial" className="hover:text-gray-300">Historial</Link>
            <Link to="/cliente/progreso" className="hover:text-gray-300">Progreso Visual</Link>
            <Link to="/cliente/nutricion" className="hover:text-gray-300">Nutrición</Link>
          </>
        )}
      </div>
      
      <div className="flex items-center space-x-4">
        <span className="text-sm bg-gray-700 px-3 py-1 rounded-full">
          {user.nombre} ({user.rol})
        </span>
        <button onClick={handleLogout} className="flex items-center space-x-1 text-red-400 hover:text-red-300">
          <LogOut size={18}/>
          <span>Salir</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
