import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Activity, TrendingUp, TrendingDown, Minus, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg" style={{ border: '1px solid #f59e0b' }}>
        <p className="font-bold" style={{ color: '#f59e0b' }}>{label}</p>
        <p>{payload[0].value} kg</p>
      </div>
    );
  }
  return null;
};

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
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#f59e0b' }}>
              <Activity size={20} className="text-gray-900" strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-black text-gray-900" style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", letterSpacing: '0.04em' }}>
              NUTRICIÓN & CONTROL
            </h1>
          </div>
          <div className="bg-white rounded-2xl p-5 flex items-center gap-3" style={{ border: '2px solid #fef3c7', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#f59e0b' }} />
            <p className="text-gray-700 text-sm font-semibold">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!tendencia) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <span className="w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" style={{ borderTopColor: '#f59e0b' }} />
          Analizando datos calóricos...
        </div>
      </div>
    );
  }

  const esSuperavit = tendencia.estado_actual.includes('Superávit');
  const esDeficit = tendencia.estado_actual.includes('Déficit');
  const esNeutral = !esSuperavit && !esDeficit;

  const statusConfig = {
    ...(esSuperavit && { bg: '#f0fdf4', border: '#86efac', text: '#15803d', pill: '#16a34a', icon: TrendingUp }),
    ...(esDeficit && { bg: '#fff1f2', border: '#fca5a5', text: '#b91c1c', pill: '#dc2626', icon: TrendingDown }),
    ...(esNeutral && { bg: '#eff6ff', border: '#93c5fd', text: '#1d4ed8', pill: '#2563eb', icon: Minus }),
  };
  const cfg = statusConfig;
  const StatusIcon = cfg.icon;

  const dataChart = tendencia.historial.map(h => ({
    fecha: new Date(h.fecha).toLocaleDateString('es', { day: '2-digit', month: 'short' }),
    peso: h.peso_kg,
  }));

  const variacion = tendencia.diferencia_total;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#f59e0b' }}>
            <Activity size={20} className="text-gray-900" strokeWidth={2.5} />
          </div>
          <div>
            <h1
              className="text-3xl font-black text-gray-900 leading-none"
              style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif", letterSpacing: '0.04em' }}
            >
              NUTRICIÓN & CONTROL
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">Análisis calórico y tendencia de peso</p>
          </div>
        </div>

        {/* Estado actual — hero card */}
        <div
          className="rounded-2xl p-6 relative overflow-hidden"
          style={{ background: '#0f172a', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
        >
          {/* stripe */}
          <div
            className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'repeating-linear-gradient(-45deg, #f59e0b 0px, #f59e0b 1px, transparent 1px, transparent 20px)' }}
          />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Estado Calórico Actual</p>
              <h2
                className="text-white leading-none mb-3"
                style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: '2.8rem', letterSpacing: '0.03em' }}
              >
                {tendencia.estado_actual}
              </h2>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-bold px-3 py-1.5 rounded-full"
                  style={{ background: cfg.pill, color: '#fff' }}
                >
                  Variación: {variacion > 0 ? '+' : ''}{variacion} kg
                </span>
              </div>
            </div>
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: cfg.pill, boxShadow: `0 4px 16px ${cfg.pill}55` }}
            >
              <StatusIcon size={30} className="text-white" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Peso inicial / actual */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Peso Inicial', value: tendencia.peso_inicial },
            { label: 'Peso Actual', value: tendencia.peso_actual },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="bg-white rounded-2xl p-5 text-center"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6' }}
            >
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">{label}</p>
              <p
                className="text-gray-900 font-black"
                style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: '2.2rem', letterSpacing: '0.02em' }}
              >
                {value} <span className="text-xl text-gray-400">kg</span>
              </p>
            </div>
          ))}
        </div>

        {/* Gráfica */}
        <div
          className="bg-white rounded-2xl p-6"
          style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: '1px solid #f3f4f6' }}
        >
          <h3
            className="text-xl font-black text-gray-900 mb-5"
            style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", letterSpacing: '0.03em' }}
          >
            HISTORIAL DE PESAJES
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataChart} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#f3f4f6" />
                <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="peso"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ fill: '#f59e0b', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#d97706' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TarjetaTendencia;