// src/components/Cliente/Historial.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import api from '../../api';
import './Cliente.css';

function Historial() {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        const response = await api.get('/desempeno/historial'); // Asegúrate que tu backend permita este GET sin params obligatorios
        setHistorial(response.data.data || []);
      } catch (err) {
        setError('No se pudo cargar tu historial.');
      } finally {
        setLoading(false);
      }
    };
    cargarHistorial();
  }, []);

  if (loading) return <div className="cliente-container"><p>Cargando tus logros...</p></div>;

  return (
    <div className="cliente-container">
      <div className="cliente-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={20} /> Volver
        </button>
        <h2>Mi Progreso</h2>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div className="historial-lista">
        {historial.length === 0 ? (
          <p className="no-data">Aún no has registrado ningún entrenamiento.</p>
        ) : (
          historial.map((sesion) => (
            <div key={sesion.sesion_id} className="sesion-history-card">
              <div className="sesion-date-badge">
                <Calendar size={18} />
                <span>{new Date(sesion.fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              {sesion.peso_corporal_kg && (
                <div className="body-weight">Peso ese día: <strong>{sesion.peso_corporal_kg} kg</strong></div>
              )}
              
              <table className="historial-table">
                <thead>
                  <tr>
                    <th>Ejercicio</th>
                    <th>Series Realizadas</th>
                    <th>Peso Usado</th>
                  </tr>
                </thead>
                <tbody>
                  {sesion.registros.map((reg, idx) => (
                    <tr key={idx}>
                      <td>{reg.ejercicio_nombre}</td>
                      <td>{reg.series_hechas}</td>
                      <td>{reg.peso_real_kg} kg</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Historial;