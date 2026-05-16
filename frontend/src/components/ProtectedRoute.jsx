import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useContext(AuthContext);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    // Si no tiene permisos, lo devolvemos a una ruta base apropiada o mostramos no autorizado
    return <Navigate to="/no-autorizado" replace />;
  }

  // Validación extra: Si es Cliente y está en mora, la API devolvería 403, 
  // O podemos interceptarlos en UI (opcional). El requerimiento dice que el backend lo bloquea, 
  // pero podemos advertir visualmente.
  
  return <Outlet />;
};

export default ProtectedRoute;
