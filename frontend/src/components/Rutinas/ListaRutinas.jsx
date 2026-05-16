import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import api from '../../api';
import './Rutinas.css';

function ListaRutinas() {
  const [rutinas, setRutinas] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    cargarRutinas();
  }, []);

  const cargarRutinas = async () => {
    try {
      const response = await api.get('/rutinas/');
      setRutinas(response.data.data || []);
    } catch (err) {
      console.error(err);
      setError('Error al cargar las rutinas. Asegúrate de estar autenticado.');
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta rutina?')) {
      try {
        await api.delete(`/rutinas/${id}`);
        cargarRutinas();
      } catch (err) {
        console.error(err);
        alert('Error al eliminar la rutina');
      }
    }
  };

  return (
    <div className="rutinas-container">
      <div className="rutinas-header">
        <h2>Mis Rutinas</h2>
        <button 
          className="btn-nueva-rutina"
          onClick={() => navigate('/entrenador/rutinas/nueva')}
        >
          <Plus size={20} />
          Nueva Rutina
        </button>
      </div>

      {error && <p className="error-msg">{error}</p>}

      <div className="rutinas-list">
        {rutinas.length === 0 ? (
          <p className="no-data">No has creado ninguna rutina aún.</p>
        ) : (
          <div className="rutinas-grid">
            {rutinas.map(rutina => (
              <div key={rutina.id} className="rutina-card">
                <div className="rutina-card-header">
                  <h3>{rutina.nombre}</h3>
                </div>
                <div className="rutina-card-body">
                  <p>{rutina.descripcion || 'Sin descripción'}</p>
                </div>
                <div className="rutina-card-footer">
                  <button onClick={() => navigate(`/entrenador/rutinas/${rutina.id}/editar`)} className="action-btn edit-btn">
                    <Edit size={16} /> Editar
                  </button>
                  <button onClick={() => handleEliminar(rutina.id)} className="action-btn delete-btn">
                    <Trash2 size={16} /> Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ListaRutinas;