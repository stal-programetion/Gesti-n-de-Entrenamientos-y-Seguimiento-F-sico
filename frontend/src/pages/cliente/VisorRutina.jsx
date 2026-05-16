import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Dumbbell, PlayCircle } from 'lucide-react';

const VisorRutina = () => {
  const [rutinas, setRutinas] = useState([]);

  useEffect(() => {
    const fetchRutinas = async () => {
      try {
        const resp = await api.get('/rutinas/');
        setRutinas(resp.data.data || []);
      } catch (err) {
        console.error('Error fetching rutinas cliente', err);
      }
    };
    fetchRutinas();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center space-x-2">
        <Dumbbell className="text-blue-600"/>
        <span>Mis Rutinas Asignadas</span>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rutinas.map(rutina => (
          <div key={rutina.id} className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
            <div className="bg-blue-600 text-white p-4">
              <h2 className="text-xl font-bold">{rutina.nombre}</h2>
            </div>
            <div className="p-4">
              <h4 className="font-bold text-gray-700 mb-2 border-b pb-1">Ejercicios</h4>
              <ul className="space-y-2 mb-6">
                {(rutina.ejercicios || []).map(ej => (
                  <li key={ej.id} className="text-sm bg-gray-50 p-2 rounded">
                    <span className="font-bold">{ej.nombre}</span> — {ej.series}x{ej.repeticiones} 
                    {ej.peso_objetivo_kg && <span className="text-green-600 font-semibold ml-2">({ej.peso_objetivo_kg}kg obj.)</span>}
                  </li>
                ))}
              </ul>
              
              <Link 
                to={`/cliente/sesion/${rutina.id}`} 
                className="w-full bg-green-500 text-white font-bold py-2 rounded flex justify-center items-center space-x-2 hover:bg-green-600 transition"
              >
                <PlayCircle size={20}/>
                <span>Iniciar Entrenamiento</span>
              </Link>
            </div>
          </div>
        ))}
        {rutinas.length === 0 && <p className="text-gray-500">No tienes rutinas asignadas actualmente.</p>}
      </div>
    </div>
  );
};

export default VisorRutina;
