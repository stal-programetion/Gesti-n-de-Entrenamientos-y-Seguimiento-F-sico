import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { ClipboardList, PlusCircle } from 'lucide-react';

const ListaRutinas = () => {
  const [rutinas, setRutinas] = useState([]);

  useEffect(() => {
    const fetchRutinas = async () => {
      try {
        const resp = await api.get('/rutinas/');
        setRutinas(resp.data.data || []);
      } catch (error) {
        console.error("Error obteniendo rutinas", error);
      }
    };
    fetchRutinas();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center space-x-2">
          <ClipboardList className="text-blue-600"/>
          <span>Mis Rutinas (Entrenador)</span>
        </h1>
        <Link to="/entrenador/rutinas/nueva" className="bg-blue-600 text-white px-4 py-2 rounded flex items-center space-x-2 hover:bg-blue-700">
          <PlusCircle size={18} />
          <span>Crear Nueva Rutina</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rutinas.map(rutina => (
          <div key={rutina.id} className="bg-white p-5 rounded-lg shadow border-l-4 border-blue-600">
            <h3 className="text-xl font-bold mb-2">{rutina.nombre}</h3>
            <p className="text-gray-600 mb-1">Cliente ID: {rutina.cliente_id}</p>
            <p className="text-sm font-medium mb-4">
              Estado: <span className={rutina.activa ? "text-green-600" : "text-gray-500"}>{rutina.activa ? "Activa" : "Inactiva"}</span>
            </p>
            <Link 
              to={`/entrenador/rutinas/${rutina.id}/editar`}
              className="mt-2 inline-block text-blue-600 hover:text-blue-800 font-semibold"
            >
              Editar Rutina →
            </Link>
          </div>
        ))}
        {rutinas.length === 0 && <p className="text-gray-500">No tienes rutinas creadas.</p>}
      </div>
    </div>
  );
};

export default ListaRutinas;
