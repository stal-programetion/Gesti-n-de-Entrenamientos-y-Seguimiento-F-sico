import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { CheckSquare, Weight, ChevronRight } from 'lucide-react';

/**
 * Inicializa el estado de registros a partir de los ejercicios de la rutina.
 * Por cada ejercicio, crea una entrada con sus series basadas en series_objetivo.
 * Si el entrenador no definió series_objetivo (compatibilidad), usa el campo 'series' como cantidad.
 */
const initRegistros = (ejercicios) => {
  const state = {};
  ejercicios.forEach(ej => {
    const seriesObj = ej.series_objetivo && ej.series_objetivo.length > 0
      ? ej.series_objetivo
      : Array.from({ length: ej.series || 1 }, (_, i) => ({
          numero_serie: i + 1,
          repeticiones_objetivo: null,
          peso_objetivo_kg: null,
        }));

    state[ej.id] = seriesObj.map(s => ({
      numero_serie: s.numero_serie,
      repeticiones_objetivo: s.repeticiones_objetivo,
      peso_objetivo_kg: s.peso_objetivo_kg,
      // Campos que rellena el cliente:
      repeticiones_hechas: s.repeticiones_objetivo ?? '',
      peso_real_kg: s.peso_objetivo_kg ?? '',
    }));
  });
  return state;
};

const RegistroSesionForm = () => {
  const { rutina_id } = useParams();
  const navigate = useNavigate();
  const [rutina, setRutina] = useState(null);
  const [pesoCorporal, setPesoCorporal] = useState('');
  const [registros, setRegistros] = useState({});
  const [mensaje, setMensaje] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRutina = async () => {
      try {
        const resp = await api.get(`/rutinas/${rutina_id}`);
        const data = resp.data.data;
        setRutina(data);
        setRegistros(initRegistros(data.ejercicios));
      } catch (err) {
        console.error('Error cargando rutina para sesion', err);
      }
    };
    fetchRutina();
  }, [rutina_id]);

  const handleUpdateSerie = (ejId, serieIdx, field, value) => {
    setRegistros(prev => {
      const series = [...prev[ejId]];
      series[serieIdx] = { ...series[serieIdx], [field]: value };
      return { ...prev, [ejId]: series };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setLoading(true);

    // Construir el array de registros con series anidadas
    const registrosArray = Object.keys(registros).map(ejId => ({
      ejercicio_id: parseInt(ejId),
      series: registros[ejId].map(s => ({
        numero_serie: s.numero_serie,
        repeticiones_hechas: parseInt(s.repeticiones_hechas),
        peso_real_kg: parseFloat(s.peso_real_kg),
      })),
    }));

    try {
      await api.post('/desempeno/', {
        rutina_id: parseInt(rutina_id),
        peso_corporal_kg: pesoCorporal ? parseFloat(pesoCorporal) : null,
        registros: registrosArray,
      });
      navigate('/cliente/historial');
    } catch (error) {
      setMensaje(error.response?.data?.msg || 'Error al guardar la sesión');
    } finally {
      setLoading(false);
    }
  };

  const focusAmber = { boxShadow: '0 0 0 2px #f59e0b' };

  if (!rutina)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <span className="w-5 h-5 border-2 border-gray-300 border-t-amber-500 rounded-full animate-spin" style={{ borderTopColor: '#f59e0b' }} />
          Cargando rutina...
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2 font-semibold uppercase tracking-wider">
            <span>Entrenamiento Activo</span>
            <ChevronRight size={14} />
            <span style={{ color: '#f59e0b' }}>En curso</span>
          </div>
          <h1
            className="text-4xl font-black text-gray-900 leading-none"
            style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif", letterSpacing: '0.03em' }}
          >
            {rutina.nombre}
          </h1>
        </div>

        {mensaje && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
            {mensaje}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Peso corporal */}
          <div
            className="bg-white rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#f59e0b' }}>
                <Weight size={17} className="text-gray-900" strokeWidth={2.5} />
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">Peso Corporal Actual</p>
                <p className="text-gray-400 text-xs">Registra tu peso de hoy</p>
              </div>
            </div>
            <div className="relative">
              <input
                type="number" step="0.1" required
                className="border border-gray-200 bg-gray-50 px-4 py-2.5 rounded-xl text-sm text-gray-900 text-right focus:outline-none focus:bg-white w-32"
                onFocus={e => Object.assign(e.target.style, focusAmber)}
                onBlur={e => (e.target.style.boxShadow = '')}
                placeholder="75.0"
                value={pesoCorporal}
                onChange={e => setPesoCorporal(e.target.value)}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-semibold pointer-events-none">kg</span>
            </div>
          </div>

          {/* Ejercicios */}
          <div className="space-y-4">
            {rutina.ejercicios.map((ej, ejIdx) => (
              <div
                key={ej.id}
                className="bg-white rounded-2xl overflow-hidden"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6' }}
              >
                {/* Cabecera del ejercicio */}
                <div
                  className="px-5 py-3 flex items-center justify-between"
                  style={{ background: '#0f172a', borderLeft: '4px solid #f59e0b' }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="text-xs font-black px-2 py-0.5 rounded"
                      style={{ background: '#f59e0b', color: '#0f172a', fontFamily: "'Bebas Neue','Impact',sans-serif", letterSpacing: '0.05em' }}
                    >
                      #{ejIdx + 1}
                    </span>
                    <p className="font-black text-white text-base" style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", letterSpacing: '0.03em' }}>
                      {ej.nombre}
                    </p>
                  </div>
                  <span className="text-gray-400 text-xs font-semibold">
                    {ej.series} series
                  </span>
                </div>

                {/* Tabla de series */}
                <div className="px-5 py-4">
                  {/* Encabezados */}
                  <div className="grid grid-cols-12 gap-2 mb-2 px-1">
                    {[
                      { label: 'Serie', cols: 'col-span-2' },
                      { label: 'Objetivo', cols: 'col-span-3 text-center' },
                      { label: 'Reps reales', cols: 'col-span-4' },
                      { label: 'Peso real (kg)', cols: 'col-span-3' },
                    ].map(({ label, cols }) => (
                      <div key={label} className={`${cols} text-xs font-bold text-gray-400 uppercase tracking-wider`}>{label}</div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    {(registros[ej.id] || []).map((serie, serieIdx) => (
                      <div key={serieIdx} className="grid grid-cols-12 gap-2 items-center">

                        {/* Número de serie */}
                        <div className="col-span-2">
                          <div
                            className="flex items-center justify-center h-9 rounded-xl text-sm font-black"
                            style={{ background: '#f59e0b', color: '#0f172a', fontFamily: "'Bebas Neue','Impact',sans-serif" }}
                          >
                            {serie.numero_serie}
                          </div>
                        </div>

                        {/* Objetivo del entrenador (solo lectura) */}
                        <div className="col-span-3 flex flex-col items-center">
                          {serie.repeticiones_objetivo != null ? (
                            <span className="text-xs text-gray-500 font-semibold leading-tight text-center">
                              {serie.repeticiones_objetivo} reps
                              {serie.peso_objetivo_kg != null && (
                                <><br /><span className="text-gray-400">{serie.peso_objetivo_kg} kg</span></>
                              )}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </div>

                        {/* Reps reales */}
                        <div className="col-span-4">
                          <input
                            type="number" min="0" required
                            className="w-full border border-gray-200 bg-gray-50 px-3 py-2 rounded-xl text-sm text-gray-900 focus:outline-none focus:bg-white transition"
                            onFocus={e => Object.assign(e.target.style, focusAmber)}
                            onBlur={e => (e.target.style.boxShadow = '')}
                            placeholder={serie.repeticiones_objetivo ?? '0'}
                            value={serie.repeticiones_hechas}
                            onChange={e => handleUpdateSerie(ej.id, serieIdx, 'repeticiones_hechas', e.target.value)}
                          />
                        </div>

                        {/* Peso real */}
                        <div className="col-span-3">
                          <input
                            type="number" step="0.5" min="0" required
                            className="w-full border border-gray-200 bg-gray-50 px-3 py-2 rounded-xl text-sm text-gray-900 focus:outline-none focus:bg-white transition"
                            onFocus={e => Object.assign(e.target.style, focusAmber)}
                            onBlur={e => (e.target.style.boxShadow = '')}
                            placeholder={serie.peso_objetivo_kg ?? '0'}
                            value={serie.peso_real_kg}
                            onChange={e => handleUpdateSerie(ej.id, serieIdx, 'peso_real_kg', e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Submit */}
          <button
            type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-gray-900 transition-all duration-200 disabled:opacity-60"
            style={{
              background: '#f59e0b',
              fontFamily: "'Bebas Neue', 'Impact', sans-serif",
              letterSpacing: '0.08em',
              fontSize: '1.1rem',
              boxShadow: '0 6px 20px rgba(245,158,11,0.4)',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#d97706'; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#f59e0b'; }}
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              <CheckSquare size={20} strokeWidth={2.5} />
            )}
            {loading ? 'Guardando...' : 'Finalizar y Guardar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistroSesionForm;