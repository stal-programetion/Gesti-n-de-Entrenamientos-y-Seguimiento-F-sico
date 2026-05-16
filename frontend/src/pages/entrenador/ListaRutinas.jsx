import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { ClipboardList, PlusCircle, Zap, Users, CheckCircle, XCircle, ChevronRight } from 'lucide-react';

const ListaRutinas = () => {
  const [rutinas, setRutinas] = useState([]);

  useEffect(() => {
    const fetchRutinas = async () => {
      try {
        const resp = await api.get('/rutinas/');
        setRutinas(resp.data.data || []);
      } catch (error) {
        console.error('Error obteniendo rutinas', error);
      }
    };
    fetchRutinas();
  }, []);

  const activas = rutinas.filter(r => r.activa).length;
  const inactivas = rutinas.length - activas;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#f59e0b' }}>
              <ClipboardList size={20} className="text-gray-900" strokeWidth={2.5} />
            </div>
            <div>
              <h1
                className="text-3xl font-black text-gray-900 leading-none"
                style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif", letterSpacing: '0.04em' }}
              >
                MIS RUTINAS
              </h1>
              <p className="text-gray-400 text-sm mt-0.5">Panel de Entrenador</p>
            </div>
          </div>

          <Link
            to="/entrenador/rutinas/nueva"
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-black text-gray-900 transition-all duration-200 self-start sm:self-auto"
            style={{
              background: '#f59e0b',
              fontFamily: "'Bebas Neue','Impact',sans-serif",
              letterSpacing: '0.07em',
              fontSize: '0.95rem',
              boxShadow: '0 4px 14px rgba(245,158,11,0.35)',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#d97706')}
            onMouseLeave={e => (e.currentTarget.style.background = '#f59e0b')}
          >
            <PlusCircle size={17} strokeWidth={2.5} />
            Crear Nueva Rutina
          </Link>
        </div>

        {/* Stats row */}
        {rutinas.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-7">
            {[
              { label: 'Total', value: rutinas.length, color: '#0f172a' },
              { label: 'Activas', value: activas, color: '#16a34a' },
              { label: 'Inactivas', value: inactivas, color: '#9ca3af' },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="bg-white rounded-2xl p-4 text-center"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6' }}
              >
                <p
                  className="font-black text-3xl leading-none"
                  style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", color, letterSpacing: '0.03em' }}
                >
                  {value}
                </p>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mt-1">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rutinas.map((rutina, idx) => (
            <div
              key={rutina.id}
              className="bg-white rounded-2xl overflow-hidden flex flex-col"
              style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: '1px solid #f3f4f6' }}
            >
              {/* Card header */}
              <div
                className="relative p-5 overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
              >
                <div
                  className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: 'repeating-linear-gradient(-45deg, #f59e0b 0px, #f59e0b 1px, transparent 1px, transparent 18px)' }}
                />
                <div className="relative z-10 flex items-start justify-between">
                  <div className="flex-1 pr-3">
                    <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-1">Rutina #{idx + 1}</p>
                    <h3
                      className="text-white text-xl leading-tight"
                      style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", letterSpacing: '0.03em' }}
                    >
                      {rutina.nombre}
                    </h3>
                  </div>
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: '#f59e0b' }}
                  >
                    <Zap size={14} className="text-gray-900" strokeWidth={2.5} />
                  </div>
                </div>
              </div>

              {/* Card body */}
              <div className="p-5 flex flex-col flex-1 gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Users size={14} className="text-gray-400" />
                  <span className="font-semibold">Cliente ID: {rutina.cliente_id}</span>
                </div>

                <div className="flex items-center gap-2">
                  {rutina.activa ? (
                    <>
                      <CheckCircle size={14} style={{ color: '#16a34a' }} />
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}
                      >
                        Activa
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle size={14} className="text-gray-400" />
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{ background: '#f9fafb', color: '#9ca3af', border: '1px solid #e5e7eb' }}
                      >
                        Inactiva
                      </span>
                    </>
                  )}
                </div>

                <div className="mt-auto pt-3" style={{ borderTop: '1px solid #f3f4f6' }}>
                  <Link
                    to={`/entrenador/rutinas/${rutina.id}/editar`}
                    className="flex items-center justify-between w-full group"
                  >
                    <span
                      className="font-black text-sm"
                      style={{ color: '#f59e0b', fontFamily: "'Bebas Neue','Impact',sans-serif", letterSpacing: '0.05em' }}
                    >
                      EDITAR RUTINA
                    </span>
                    <ChevronRight size={16} style={{ color: '#f59e0b' }} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {rutinas.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl" style={{ border: '1px solid #f3f4f6' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: '#f3f4f6' }}>
                <ClipboardList size={28} className="text-gray-400" />
              </div>
              <p className="text-gray-500 font-semibold">No tienes rutinas creadas aún.</p>
              <p className="text-gray-300 text-sm mt-1">Crea tu primera rutina para asignarla a un cliente.</p>
              <Link
                to="/entrenador/rutinas/nueva"
                className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-gray-900 text-sm"
                style={{ background: '#f59e0b', fontFamily: "'Bebas Neue','Impact',sans-serif", letterSpacing: '0.06em' }}
              >
                <PlusCircle size={15} strokeWidth={2.5} />
                Crear Primera Rutina
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListaRutinas;