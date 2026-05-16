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

// ── 404 ──────────────────────────────────────────────────────────────────────
const NotFound = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
    <div
      className="bg-white rounded-2xl overflow-hidden text-center"
      style={{
        boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
        border: '1px solid #f3f4f6',
        maxWidth: 420,
        width: '100%',
      }}
    >
      {/* Dark header band */}
      <div
        className="relative px-8 py-8 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'repeating-linear-gradient(-45deg, #f59e0b 0px, #f59e0b 1px, transparent 1px, transparent 18px)',
          }}
        />
        <p
          className="relative z-10 leading-none"
          style={{
            fontFamily: "'Bebas Neue', 'Impact', sans-serif",
            fontSize: '6rem',
            color: '#f59e0b',
            letterSpacing: '0.05em',
          }}
        >
          404
        </p>
        <p
          className="relative z-10 text-gray-400 text-sm font-semibold tracking-widest uppercase mt-1"
        >
          Ruta no encontrada
        </p>
      </div>

      {/* Body */}
      <div className="px-8 py-6">
        <p className="text-gray-500 text-sm">
          La página que buscas no existe o fue movida.
        </p>
        <a
          href="/"
          className="mt-5 inline-flex items-center gap-2 px-6 py-3 rounded-xl font-black text-gray-900 text-sm transition-all duration-200"
          style={{
            background: '#f59e0b',
            fontFamily: "'Bebas Neue', 'Impact', sans-serif",
            letterSpacing: '0.07em',
            boxShadow: '0 4px 14px rgba(245,158,11,0.35)',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#d97706')}
          onMouseLeave={e => (e.currentTarget.style.background = '#f59e0b')}
        >
          Volver al inicio
        </a>
      </div>
    </div>
  </div>
);

// ── App ───────────────────────────────────────────────────────────────────────
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

              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
