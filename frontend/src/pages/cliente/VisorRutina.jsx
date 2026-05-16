import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Dumbbell, PlayCircle, Target, Zap } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: '#f59e0b' }}
          >
            <Dumbbell size={20} className="text-gray-900" strokeWidth={2.5} />
          </div>
          <div>
            <h1
              className="text-3xl font-black text-gray-900 leading-none"
              style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif", letterSpacing: '0.04em' }}
            >
              MIS RUTINAS ASIGNADAS
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">Selecciona una rutina para comenzar tu sesión</p>
          </div>
        </div>

        {/* Grid de rutinas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rutinas.map((rutina, idx) => (
            <div
              key={rutina.id}
              className="bg-white rounded-2xl overflow-hidden"
              style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.08)', border: '1px solid #f3f4f6' }}
            >
              {/* Card header */}
              <div
                className="relative p-5 overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
              >
                {/* Stripe texture */}
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(-45deg, #f59e0b 0px, #f59e0b 1px, transparent 1px, transparent 18px)',
                  }}
                />
                <div className="relative z-10 flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold mb-1">
                      Rutina #{idx + 1}
                    </p>
                    <h2
                      className="text-white text-2xl leading-tight"
                      style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif", letterSpacing: '0.03em' }}
                    >
                      {rutina.nombre}
                    </h2>
                  </div>
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: '#f59e0b' }}
                  >
                    <Zap size={16} className="text-gray-900" strokeWidth={2.5} />
                  </div>
                </div>
              </div>

              {/* Ejercicios */}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Target size={14} className="text-gray-400" />
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {(rutina.ejercicios || []).length} Ejercicios
                  </span>
                </div>

                <ul className="space-y-2 mb-5">
                  {(rutina.ejercicios || []).map((ej) => (
                    <li
                      key={ej.id}
                      className="flex items-center justify-between rounded-xl px-3 py-2.5"
                      style={{ background: '#f9fafb', border: '1px solid #f3f4f6' }}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: '#f59e0b' }}
                        />
                        <span className="text-sm font-semibold text-gray-800">{ej.nombre}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background: '#1e293b', color: '#f59e0b' }}
                        >
                          {ej.series}×{ej.repeticiones}
                        </span>
                        {ej.peso_objetivo_kg && (
                          <span
                            className="text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}
                          >
                            {ej.peso_objetivo_kg} kg
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>

                <Link
                  to={`/cliente/sesion/${rutina.id}`}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-gray-900 transition-all duration-200"
                  style={{
                    background: '#f59e0b',
                    fontFamily: "'Bebas Neue', 'Impact', sans-serif",
                    letterSpacing: '0.08em',
                    fontSize: '1rem',
                    boxShadow: '0 4px 14px rgba(245,158,11,0.35)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#d97706')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#f59e0b')}
                >
                  <PlayCircle size={18} strokeWidth={2.5} />
                  Iniciar Entrenamiento
                </Link>
              </div>
            </div>
          ))}

          {rutinas.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: '#f3f4f6' }}
              >
                <Dumbbell size={28} className="text-gray-400" />
              </div>
              <p className="text-gray-400 font-semibold">No tienes rutinas asignadas actualmente.</p>
              <p className="text-gray-300 text-sm mt-1">Tu entrenador te asignará una pronto.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisorRutina;