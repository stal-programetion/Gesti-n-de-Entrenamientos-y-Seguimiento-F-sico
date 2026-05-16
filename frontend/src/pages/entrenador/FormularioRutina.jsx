import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import { Save, Plus, Trash2 } from 'lucide-react';

const FormularioRutina = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [nombre, setNombre] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [clientes, setClientes] = useState([]);
  const [ejercicios, setEjercicios] = useState([{ nombre: '', series: '', repeticiones: '', peso_objetivo_kg: '' }]);
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    // Obtener clientes
    const fetchClientes = async () => {
      try {
        const resp = await api.get('/auth/clientes');
        setClientes(resp.data.data);
      } catch (err) {
        console.error('Error fetching clientes', err);
      }
    };
    fetchClientes();

    // Si es edición, cargar rutina
    if (isEditing) {
      const fetchRutina = async () => {
        try {
          const resp = await api.get(`/rutinas/${id}`);
          const rut = resp.data.data;
          setNombre(rut.nombre);
          setClienteId(rut.cliente_id);
          setEjercicios(rut.ejercicios);
        } catch (err) {
          console.error('Error fetching rutina', err);
        }
      };
      fetchRutina();
    }
  }, [id, isEditing]);

  const addEjercicio = () => {
    setEjercicios([...ejercicios, { nombre: '', series: '', repeticiones: '', peso_objetivo_kg: '' }]);
  };

  const updateEjercicio = (index, field, value) => {
    const updated = [...ejercicios];
    updated[index][field] = value;
    setEjercicios(updated);
  };

  const removeEjercicio = (index) => {
    if (ejercicios.length > 1) {
      setEjercicios(ejercicios.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);
    const payload = {
      nombre,
      cliente_id: parseInt(clienteId),
      ejercicios: ejercicios.map(e => ({
        ...e,
        series: parseInt(e.series),
        repeticiones: parseInt(e.repeticiones),
        peso_objetivo_kg: e.peso_objetivo_kg ? parseFloat(e.peso_objetivo_kg) : null
      }))
    };

    try {
      if (isEditing) {
        await api.put(`/rutinas/${id}`, payload);
      } else {
        await api.post('/rutinas/', payload);
      }
      navigate('/entrenador/rutinas');
    } catch (error) {
      setMensaje(error.response?.data?.msg || 'Error guardando rutina');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{isEditing ? 'Editar Rutina' : 'Crear Nueva Rutina'}</h1>
      
      {mensaje && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{mensaje}</div>}
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-bold mb-1">Nombre de la Rutina</label>
            <input 
              type="text" required
              className="w-full border p-2 rounded" 
              value={nombre} onChange={e => setNombre(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-1">Cliente</label>
            <select 
              required disabled={isEditing}
              className={`w-full border p-2 rounded ${isEditing ? 'bg-gray-100' : ''}`}
              value={clienteId} onChange={e => setClienteId(e.target.value)}
            >
              <option value="">Seleccione Cliente</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nombre} ({c.email})</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold border-b pb-2 mb-4">Ejercicios</h3>
          {ejercicios.map((ej, idx) => (
            <div key={idx} className="flex space-x-2 items-center mb-3 bg-gray-50 p-3 rounded">
              <input type="text" placeholder="Nombre (Ej: Sentadilla)" required
                className="border p-2 rounded flex-1"
                value={ej.nombre} onChange={e => updateEjercicio(idx, 'nombre', e.target.value)} />
              
              <input type="number" placeholder="Series" required
                className="border p-2 rounded w-24"
                value={ej.series} onChange={e => updateEjercicio(idx, 'series', e.target.value)} />
              
              <input type="number" placeholder="Reps" required
                className="border p-2 rounded w-24"
                value={ej.repeticiones} onChange={e => updateEjercicio(idx, 'repeticiones', e.target.value)} />
              
              <input type="number" step="0.5" placeholder="Peso Obj (kg)"
                className="border p-2 rounded w-32"
                value={ej.peso_objetivo_kg} onChange={e => updateEjercicio(idx, 'peso_objetivo_kg', e.target.value)} />
              
              <button type="button" onClick={() => removeEjercicio(idx)} className="text-red-500 hover:text-red-700 p-2">
                <Trash2 size={20} />
              </button>
            </div>
          ))}
          <button type="button" onClick={addEjercicio} className="mt-2 text-blue-600 font-bold flex items-center space-x-1 hover:text-blue-800">
            <Plus size={18}/> <span>Agregar Ejercicio</span>
          </button>
        </div>

        <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 rounded hover:bg-green-700 flex justify-center items-center space-x-2">
          <Save size={20}/> <span>{isEditing ? 'Actualizar Rutina' : 'Guardar Rutina'}</span>
        </button>
      </form>
    </div>
  );
};

export default FormularioRutina;
