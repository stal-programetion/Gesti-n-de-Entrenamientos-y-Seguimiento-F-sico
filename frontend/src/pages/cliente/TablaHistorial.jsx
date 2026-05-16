import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { History } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TablaHistorial = () => {
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    const fetchHist = async () => {
      try {
        const resp = await api.get('/desempeno/historial');
        setHistorial(resp.data.historial || []);
      } catch (err) {
        console.error('Error fetching historial', err);
      }
    };
    fetchHist();
  }, []);

  // Preparar datos para gráfica: peso corporal a través del tiempo
  const dataGrafica = [...historial].reverse().map(sesion => ({
    fecha: new Date(sesion.fecha).toLocaleDateString(),
    pesoCorportal: sesion.peso_corporal_kg
  })).filter(d => d.pesoCorportal);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold flex items-center space-x-2">
        <History className="text-blue-600"/>
        <span>Historial de Desempeño</span>
      </h1>

      {/* Gráfica */}
      {dataGrafica.length > 0 && (
        <div className="bg-white p-6 rounded shadow">
          <h3 className="font-bold text-lg mb-4 text-center">Evolución de Peso Corporal</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataGrafica}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="pesoCorportal" stroke="#2563eb" strokeWidth={3} name="Peso (kg)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Lista de Sesiones */}
      <div className="space-y-6">
        {historial.map(sesion => (
          <div key={sesion.sesion_id} className="bg-white rounded shadow overflow-hidden border-l-4 border-green-500">
            <div className="bg-gray-100 p-4 flex justify-between items-center border-b">
              <h3 className="font-bold">Fecha: {new Date(sesion.fecha).toLocaleDateString()}</h3>
              <span className="text-sm font-semibold bg-gray-200 px-3 py-1 rounded">
                Peso: {sesion.peso_corporal_kg ? `${sesion.peso_corporal_kg} Kg` : 'N/A'}
              </span>
            </div>
            <div className="p-4 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="p-2">Ejercicio</th>
                    <th className="p-2">Peso Real</th>
                    <th className="p-2">Series Hechas</th>
                  </tr>
                </thead>
                <tbody>
                  {sesion.registros.map((reg, idx) => (
                    <tr key={idx} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="p-2 font-medium">{reg.ejercicio_nombre}</td>
                      <td className="p-2">{reg.peso_real_kg} Kg</td>
                      <td className="p-2">{reg.series_hechas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
        {historial.length === 0 && <p className="text-gray-500">No tienes entrenamientos registrados.</p>}
      </div>
    </div>
  );
};

export default TablaHistorial;
