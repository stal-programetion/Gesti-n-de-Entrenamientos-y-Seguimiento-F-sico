import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TarjetaTendencia = () => {
  const [tendencia, setTendencia] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTendencia = async () => {
      try {
        const resp = await api.get('/calorico/tendencia');
        setTendencia(resp.data.analisis);
      } catch (err) {
        setError(err.response?.data?.msg || 'Error cargando tendencia calórica');
      }
    };
    fetchTendencia();
  }, []);

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 flex items-center space-x-2"><Activity/> <span>Nutrición & Control</span></h1>
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded shadow border-l-4 border-yellow-500">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!tendencia) return <div className="p-6 text-center">Analizando datos calóricos...</div>;

  const getStatusStyle = (estado) => {
    if (estado.includes('Superávit')) return 'bg-green-100 text-green-800 border-green-500';
    if (estado.includes('Déficit')) return 'bg-red-100 text-red-800 border-red-500';
    return 'bg-blue-100 text-blue-800 border-blue-500';
  };

  const getIcon = (estado) => {
    if (estado.includes('Superávit')) return <TrendingUp size={32} className="text-green-600"/>;
    if (estado.includes('Déficit')) return <TrendingDown size={32} className="text-red-600"/>;
    return <Minus size={32} className="text-blue-600"/>;
  };

  // Convertir historial a formato para gráfica
  const dataChart = tendencia.historial.map(h => ({
    fecha: new Date(h.fecha).toLocaleDateString(),
    peso: h.peso_kg
  }));

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center space-x-2">
        <Activity className="text-blue-600"/>
        <span>Nutrición & Control</span>
      </h1>

      <div className={`p-6 rounded-lg shadow-lg border-l-8 flex items-center justify-between mb-8 ${getStatusStyle(tendencia.estado_actual)}`}>
        <div>
          <h2 className="text-xl font-bold opacity-80 uppercase tracking-wider mb-1">Estado Calórico Actual</h2>
          <p className="text-3xl font-extrabold">{tendencia.estado_actual}</p>
          <p className="mt-2 opacity-90 font-medium">Variación Total: {tendencia.diferencia_total > 0 ? '+' : ''}{tendencia.diferencia_total} Kg</p>
        </div>
        <div className="bg-white p-4 rounded-full shadow-sm">
          {getIcon(tendencia.estado_actual)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow text-center">
          <p className="text-gray-500 font-semibold mb-1">Peso Inicial</p>
          <p className="text-2xl font-bold">{tendencia.peso_inicial} Kg</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <p className="text-gray-500 font-semibold mb-1">Peso Actual</p>
          <p className="text-2xl font-bold">{tendencia.peso_actual} Kg</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h3 className="font-bold text-lg mb-4 text-center">Historial de Pesajes</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dataChart}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="fecha"/>
              <YAxis domain={['dataMin - 1', 'dataMax + 1']}/>
              <Tooltip/>
              <Line type="monotone" dataKey="peso" stroke="#8884d8" strokeWidth={3}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default TarjetaTendencia;
