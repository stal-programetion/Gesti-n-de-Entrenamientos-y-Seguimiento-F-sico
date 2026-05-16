import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { CheckSquare } from 'lucide-react';

const RegistroSesionForm = () => {
  const { rutina_id } = useParams();
  const navigate = useNavigate();
  const [rutina, setRutina] = useState(null);
  const [pesoCorporal, setPesoCorporal] = useState('');
  const [registros, setRegistros] = useState({});
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    const fetchRutina = async () => {
      try {
        const resp = await api.get(`/rutinas/${rutina_id}`);
        setRutina(resp.data.data);
        
        // Inicializar registros vacíos según los ejercicios
        const initRegs = {};
        resp.data.data.ejercicios.forEach(ej => {
          initRegs[ej.id] = { peso_real_kg: '', series_hechas: ej.series };
        });
        setRegistros(initRegs);
      } catch (err) {
        console.error('Error cargando rutina para sesion', err);
      }
    };
    fetchRutina();
  }, [rutina_id]);

  const handleUpdate = (ejId, field, value) => {
    setRegistros({
      ...registros,
      [ejId]: { ...registros[ejId], [field]: value }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);

    const registrosArray = Object.keys(registros).map(ejId => ({
      ejercicio_id: parseInt(ejId),
      peso_real_kg: parseFloat(registros[ejId].peso_real_kg),
      series_hechas: parseInt(registros[ejId].series_hechas)
    }));

    try {
      await api.post('/desempeno/', {
        rutina_id: parseInt(rutina_id),
        peso_corporal_kg: pesoCorporal ? parseFloat(pesoCorporal) : null,
        registros: registrosArray
      });
      navigate('/cliente/historial');
    } catch (error) {
      setMensaje(error.response?.data?.msg || 'Error al guardar la sesión');
    }
  };

  if (!rutina) return <div className="p-6 text-center">Cargando rutina...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Entrenamiento Activo</h1>
      <h2 className="text-lg text-gray-600 mb-6 border-b pb-2">{rutina.nombre}</h2>

      {mensaje && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{mensaje}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-4 justify-between items-center rounded flex shadow">
          <label className="font-bold text-gray-700">Tu Peso Corporal Actual (Kg):</label>
          <input 
            type="number" step="0.1" required
            className="border p-2 rounded w-32 border-blue-300"
            value={pesoCorporal} onChange={e => setPesoCorporal(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          {rutina.ejercicios.map(ej => (
            <div key={ej.id} className="bg-white p-4 rounded shadow border-l-4 border-blue-500 flex flex-col md:flex-row md:items-center justify-between">
              <div className="mb-2 md:mb-0">
                <p className="font-bold text-lg">{ej.nombre}</p>
                <p className="text-sm text-gray-500">Objetivo: {ej.series} series | {ej.peso_objetivo_kg ? `${ej.peso_objetivo_kg} kg` : 'Sin peso'}</p>
              </div>
              <div className="flex space-x-4 items-center">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Series Hechas</label>
                  <input type="number" required
                    className="border p-2 rounded w-20"
                    value={registros[ej.id]?.series_hechas} 
                    onChange={e => handleUpdate(ej.id, 'series_hechas', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Peso Real (Kg)</label>
                  <input type="number" step="0.5" required
                    className="border p-2 rounded w-24 border-green-300"
                    value={registros[ej.id]?.peso_real_kg} 
                    onChange={e => handleUpdate(ej.id, 'peso_real_kg', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700 mt-6 flex justify-center items-center space-x-2">
          <CheckSquare size={20}/> <span>Finalizar y Guardar Sesión</span>
        </button>
      </form>
    </div>
  );
};

export default RegistroSesionForm;
