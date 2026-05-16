import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { History, Calendar, Weight, ChevronDown, ChevronUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

// Fila expandible por ejercicio — muestra la tabla de series al hacer clic
const FilaEjercicio = ({ ejercicio }) => {
  const [abierto, setAbierto] = useState(false);

  const pesoMax = Math.max(...ejercicio.series.map(s => s.peso_real_kg));
  const totalReps = ejercicio.series.reduce((acc, s) => acc + s.repeticiones_hechas, 0);

  return (
    <div className="border-b last:border-0" style={{ borderColor: '#f3f4f6' }}>
      {/* Fila resumen — clickeable */}
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#f59e0b' }} />
          <span className="font-semibold text-gray-800 text-sm truncate">{ejercicio.ejercicio_nombre}</span>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0 ml-3">
          {/* Series */}
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full hidden sm:inline"
            style={{ background: '#f3f4f6', color: '#374151' }}
          >
            {ejercicio.series.length} series
          </span>
          {/* Total reps */}
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full hidden sm:inline"
            style={{ background: '#f3f4f6', color: '#374151' }}
          >
            {totalReps} reps
          </span>
          {/* Peso máx */}
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: '#1e293b', color: '#f59e0b' }}
          >
            {pesoMax} kg máx
          </span>
          {/* Toggle */}
          <span className="text-gray-400 ml-1">
            {abierto ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </span>
        </div>
      </button>

      {/* Detalle de series */}
      {abierto && (
        <div className="px-5 pb-4">
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #f3f4f6' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['Serie', 'Reps hechas', 'Peso real'].map(h => (
                    <th key={h} className="text-center px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ejercicio.series.map((serie, si) => (
                  <tr key={si} className="border-t" style={{ borderColor: '#f3f4f6' }}>
                    <td className="text-center px-4 py-2.5">
                      <span
                        className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-black"
                        style={{ background: '#f59e0b', color: '#0f172a', fontFamily: "'Bebas Neue','Impact',sans-serif" }}
                      >
                        {serie.numero_serie}
                      </span>
                    </td>
                    <td className="text-center px-4 py-2.5">
                      <span className="font-bold text-gray-700">{serie.repeticiones_hechas}</span>
                      <span className="text-gray-400 text-xs ml-1">reps</span>
                    </td>
                    <td className="text-center px-4 py-2.5">
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{ background: '#1e293b', color: '#f59e0b' }}
                      >
                        {serie.peso_real_kg} kg
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Componente principal ──────────────────────────────────────────────────────
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

  const dataGrafica = [...historial]
    .reverse()
    .map(sesion => ({
      fecha: new Date(sesion.fecha + 'T12:00:00').toLocaleDateString('es', { day: '2-digit', month: 'short' }),
      pesoCorporal: sesion.peso_corporal_kg,
    }))
    .filter(d => d.pesoCorporal);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-7">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#f59e0b' }}>
            <History size={20} className="text-gray-900" strokeWidth={2.5} />
          </div>
          <div>
            <h1
              className="text-3xl font-black text-gray-900 leading-none"
              style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif", letterSpacing: '0.04em' }}
            >
              HISTORIAL DE DESEMPEÑO
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">Registro de todas tus sesiones</p>
          </div>
        </div>

        {/* Gráfica de peso corporal */}
        {dataGrafica.length > 0 && (
          <div
            className="bg-white rounded-2xl p-6"
            style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: '1px solid #f3f4f6' }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3
                className="text-xl font-black text-gray-900"
                style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif", letterSpacing: '0.03em' }}
              >
                EVOLUCIÓN DE PESO CORPORAL
              </h3>
              <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: '#f59e0b', color: '#0f172a' }}>
                {dataGrafica.length} registros
              </span>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dataGrafica} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#f3f4f6" />
                  <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="pesoCorporal"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{ fill: '#f59e0b', r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: '#d97706' }}
                    name="Peso (kg)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Lista de sesiones */}
        <div className="space-y-4">
          {historial.map((sesion) => (
            <div
              key={sesion.sesion_id}
              className="bg-white rounded-2xl overflow-hidden"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6' }}
            >
              {/* Cabecera de sesión */}
              <div
                className="px-5 py-4 flex items-center justify-between"
                style={{ background: '#0f172a', borderLeft: '4px solid #f59e0b' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#f59e0b' }}>
                    <Calendar size={13} className="text-gray-900" strokeWidth={2.5} />
                  </div>
                  <span
                    className="text-white font-black text-lg"
                    style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", letterSpacing: '0.03em' }}
                  >
                    {new Date(sesion.fecha + 'T12:00:00').toLocaleDateString('es', {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {/* Cantidad de ejercicios */}
                  <span className="text-gray-400 text-xs font-semibold hidden sm:inline">
                    {sesion.ejercicios?.length ?? 0} ejercicios
                  </span>
                  {sesion.peso_corporal_kg && (
                    <div className="flex items-center gap-1.5">
                      <Weight size={13} className="text-gray-400" />
                      <span className="text-gray-300 text-sm font-semibold">{sesion.peso_corporal_kg} kg</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Ejercicios expandibles */}
              <div>
                {(sesion.ejercicios || []).map((ej, i) => (
                  <FilaEjercicio key={i} ejercicio={ej} />
                ))}
                {(!sesion.ejercicios || sesion.ejercicios.length === 0) && (
                  <p className="px-5 py-4 text-sm text-gray-400">Sin ejercicios registrados en esta sesión.</p>
                )}
              </div>
            </div>
          ))}

          {historial.length === 0 && (
            <div
              className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl"
              style={{ border: '1px solid #f3f4f6' }}
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: '#f3f4f6' }}>
                <History size={28} className="text-gray-400" />
              </div>
              <p className="text-gray-400 font-semibold">No tienes entrenamientos registrados.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TablaHistorial;