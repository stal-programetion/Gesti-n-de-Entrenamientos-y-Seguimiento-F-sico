import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, X, Save, ArrowLeft } from 'lucide-react';
import api from '../../api';
import './Rutinas.css';

function FormularioRutina() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [clienteId, setClienteId] = useState(''); // Añadido para el cliente
  const [ejercicios, setEjercicios] = useState([]);
  const [clientesDisponibles, setClientesDisponibles] = useState([]);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Simulación de base de datos de ejercicios para el select
  const baseEjercicios = [
    { id: 1, nombre: 'Sentadilla con Barra' },
    { id: 2, nombre: 'Press de Banca' },
    { id: 3, nombre: 'Peso Muerto' },
    { id: 4, nombre: 'Remo con Mancuernas' },
    { id: 5, nombre: 'Press Militar' },
    { id: 6, nombre: 'Dominadas' },
    { id: 7, nombre: 'Zancadas' },
    { id: 8, nombre: 'Curl de Bíceps' },
    { id: 9, nombre: 'Extensión de Tríceps' }
  ];

  useEffect(() => {
    cargarClientes();
    if (isEditing) {
      cargarRutina();
    }
  }, [id]);

  const cargarClientes = async () => {
    try {
      const response = await api.get('/auth/clientes');
      setClientesDisponibles(response.data.data || []);
    } catch (err) {
      console.error("Error al cargar clientes:", err);
    }
  };

  const cargarRutina = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/rutinas/${id}`);
      const rutinaData = response.data.data;
      
      setNombre(rutinaData.nombre);
      setDescripcion(rutinaData.descripcion || '');
      setClienteId(rutinaData.cliente_id || '');
      
      // Adaptamos los ejercicios al formato del formulario (si existieran)
      if (rutinaData.ejercicios) {
        setEjercicios(rutinaData.ejercicios.map(e => ({
          uuid: Math.random().toString(36).substring(7),
          id_ejercicio: e.ejercicio_id || 1, // Puedes ajustarlo si el backend devuelve un ID de la base
          nombre_personalizado: e.nombre_ejercicio || '',
          series: e.series || '',
          repeticiones: e.repeticiones || '',
          peso_objetivo: e.peso_objetivo || ''
        })));
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Error al cargar la rutina. ¿Estás seguro que existe?');
      setLoading(false);
    }
  };

  const handleAddEjercicio = () => {
    setEjercicios([
      ...ejercicios, 
      { 
        uuid: Math.random().toString(36).substring(7),
        nombre_personalizado: '', 
        series: '', 
        repeticiones: '', 
        peso_objetivo: '' 
      }
    ]);
  };

  const handleRemoveEjercicio = (index) => {
    const updated = [...ejercicios];
    updated.splice(index, 1);
    setEjercicios(updated);
  };

  const handleEjercicioChange = (index, field, value) => {
    const updated = [...ejercicios];
    updated[index][field] = value;
    setEjercicios(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim() || !clienteId) {
      setError('El nombre de la rutina y el ID del cliente son requeridos.');
      return;
    }

    try {
      const payload = {
        nombre,
        descripcion,
        cliente_id: parseInt(clienteId),
        ejercicios: ejercicios.map(e => ({
          nombre: e.nombre_personalizado || 'Ejercicio',
          series: parseInt(e.series) || null,
          repeticiones: parseInt(e.repeticiones) || null,
          peso_objetivo_kg: parseFloat(e.peso_objetivo) || null
        }))
      };

      if (isEditing) {
        await api.put(`/rutinas/${id}`, payload);
      } else {
        await api.post('/rutinas/', payload);
      }

      navigate('/entrenador/rutinas');
    } catch (err) {
      console.error(err);
      setError('Hubo un error al guardar la rutina.');
    }
  };

  if (loading) return <p>Cargando datos...</p>;

  return (
    <div className="rutinas-container">
      <div className="rutinas-header">
        <h2>{isEditing ? 'Editar Rutina' : 'Crear Nueva Rutina'}</h2>
        <button className="action-btn back-btn" type="button" onClick={() => navigate('/entrenador/rutinas')}>
          <ArrowLeft size={18} /> Volver
        </button>
      </div>

      {error && <p className="error-msg">{error}</p>}

      <form onSubmit={handleSubmit} className="form-rutina">
        
        {/* Info Básica */}
        <div className="panel-section">
          <h3>Información Básica</h3>
          <div className="form-row">
            <div className="form-group flex-1">
              <label>Nombre (requerido) *</label>
              <input 
                type="text" 
                placeholder="ej. Fuerza Nivel 1" 
                value={nombre} 
                onChange={(e) => setNombre(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group flex-1">
              <label>Asignar a Cliente (requerido) *</label>
              <select 
                value={clienteId} 
                onChange={(e) => setClienteId(e.target.value)} 
                required
                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
              >
                <option value="">-- Selecciona un cliente --</option>
                {clientesDisponibles.map(cliente => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre} ({cliente.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group flex-1">
              <label>Descripción</label>
              <input 
                type="text" 
                placeholder="Describe la rutina..." 
                value={descripcion} 
                onChange={(e) => setDescripcion(e.target.value)} 
              />
            </div>
          </div>
        </div>

        {/* Ejercicios */}
        <div className="panel-section">
          <div className="section-header">
            <h3>Ejercicios de la Rutina</h3>
            <button type="button" className="btn-añadir" onClick={handleAddEjercicio}>
              <Plus size={16} /> Añadir Ejercicio
            </button>
          </div>

          <div className="ejercicios-list">
            {ejercicios.map((ej, index) => (
              <div key={ej.uuid} className="ejercicio-row">
                <div className="ejercicio-drag-handle">⋮⋮</div>
                
                <div className="form-group flex-2">
                  <label>Ejercicio</label>
                  <input 
                    type="text" 
                    placeholder="Sentadilla, Press..."
                    value={ej.nombre_personalizado}
                    onChange={(e) => handleEjercicioChange(index, 'nombre_personalizado', e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group flex-1">
                  <label>Series</label>
                  <input 
                    type="number" 
                    placeholder="ej. 3" 
                    value={ej.series}
                    onChange={(e) => handleEjercicioChange(index, 'series', e.target.value)}
                  />
                </div>
                
                <div className="form-group flex-1">
                  <label>Repeticiones</label>
                  <input 
                    type="number" 
                    placeholder="ej. 10" 
                    value={ej.repeticiones}
                    onChange={(e) => handleEjercicioChange(index, 'repeticiones', e.target.value)}
                  />
                </div>

                <div className="form-group flex-1">
                  <label>Peso (kg)</label>
                  <input 
                    type="number" 
                    placeholder="ej. 80" 
                    value={ej.peso_objetivo}
                    onChange={(e) => handleEjercicioChange(index, 'peso_objetivo', e.target.value)}
                  />
                </div>

                <button 
                  type="button" 
                  className="btn-remove"
                  onClick={() => handleRemoveEjercicio(index)}
                  title="Eliminar"
                >
                  <X size={20} />
                </button>
              </div>
            ))}

            {ejercicios.length === 0 && (
              <p className="no-ejercicios">No hay ejercicios. Haz clic en "Añadir Ejercicio" para comenzar.</p>
            )}
          </div>
        </div>

        {/* Acciones Finales */}
        <div className="form-actions">
          <button type="button" className="btn-cancelar" onClick={() => navigate('/entrenador/rutinas')}>
            Cancelar
          </button>
          <button type="submit" className="btn-guardar">
            {isEditing ? 'Actualizar Rutina' : 'Guardar Rutina'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default FormularioRutina;