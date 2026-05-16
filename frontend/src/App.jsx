import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import PanelPagos from './pages/admin/PanelPagos';
import ListaRutinas from './pages/entrenador/ListaRutinas';
import FormularioRutina from './pages/entrenador/FormularioRutina';
import VisorRutina from './pages/cliente/VisorRutina';
import RegistroSesionForm from './pages/cliente/RegistroSesionForm';
import TablaHistorial from './pages/cliente/TablaHistorial';
import GaleriaFotos from './pages/cliente/GaleriaFotos';
import TarjetaTendencia from './pages/cliente/TarjetaTendencia';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          <div className="flex-1">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Navigate to="/login" replace />} />

              <Route element={<ProtectedRoute allowedRoles={['Administrador']} />}>
                <Route path="/admin/pagos" element={<PanelPagos />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['Entrenador']} />}>
                <Route path="/entrenador/rutinas" element={<ListaRutinas />} />
                <Route path="/entrenador/rutinas/nueva" element={<FormularioRutina />} />
                <Route path="/entrenador/rutinas/:id/editar" element={<FormularioRutina />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['Cliente']} />}>
                <Route path="/cliente/rutinas" element={<VisorRutina />} />
                <Route path="/cliente/sesion/:rutina_id" element={<RegistroSesionForm />} />
                <Route path="/cliente/historial" element={<TablaHistorial />} />
                <Route path="/cliente/progreso" element={<GaleriaFotos />} />
                <Route path="/cliente/nutricion" element={<TarjetaTendencia />} />
              </Route>

              <Route path="*" element={<div className="p-10 text-center font-bold text-2xl">404 - Ruta no encontrada</div>} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
