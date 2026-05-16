// src/components/Cliente/MisRutinas.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Activity, ArrowLeft } from 'lucide-react';
import api from '../../api'; // Asumiendo que esta es tu instancia de axios
import './Cliente.css';

function MisRutinas() {
  const [rutinas, setRutinas] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const cargarMisRutinas = async () => {
      try {
        const response = await api.get('/rutinas/');
        // La API (listar_rutinas_por_usuario) ya filtra por el rol del token
        setRutinas(response.data.data || []);
      } catch (err) {
        setError('No pudimos cargar tus rutinas. Intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    cargarMisRutinas();
  }, []);

  if (loading) return <div className="cliente-container"><p>Cargando tu plan de entrenamiento...</p></div>;

  return (
    <div className="cliente-container">
      <div className="cliente-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={20} /> Volver
        </button>
        <h2>Mi Plan de Entrenamiento</h2>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div className="rutinas-grid">
        {rutinas.length === 0 ? (
          <div className="no-data-card">
            <Activity size={48} color="#9ca3af" />
            <p>Aún no tienes rutinas asignadas. Habla con tu entrenador.</p>
          </div>
        ) : (
          rutinas.map(rutina => (
            <div key={rutina.id} className="rutina-cliente-card">
              <div className="card-content">
                <h3>{rutina.nombre}</h3>
                <p className="status-badge">{rutina.activa ? 'Activa' : 'Inactiva'}</p>
              </div>
              <button 
                className="btn-iniciar"
                onClick={() => navigate(`/cliente/sesion/${rutina.id}`)}
                disabled={!rutina.activa}
              >
                <Play size={18} /> Iniciar Sesión
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MisRutinas;