import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import { Save, Plus, Trash2, ClipboardEdit, User, ChevronDown, ChevronUp } from 'lucide-react';

// Crea una serie objetivo vacía
const nuevaSerieVacia = () => ({ repeticiones_objetivo: '', peso_objetivo_kg: '' });

// Crea un ejercicio vacío con 3 series por defecto
const nuevoEjercicioVacio = () => ({
  nombre: '',
  series: [nuevaSerieVacia(), nuevaSerieVacia(), nuevaSerieVacia()],
});

const FormularioRutina = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [nombre, setNombre] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [clientes, setClientes] = useState([]);
  const [ejercicios, setEjercicios] = useState([nuevoEjercicioVacio()]);
  const [expandidos, setExpandidos] = useState({ 0: true });
  const [mensaje, setMensaje] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const resp = await api.get('/auth/clientes');
        setClientes(resp.data.data);
      } catch (err) {
        console.error('Error fetching clientes', err);
      }
    };
    fetchClientes();

    if (isEditing) {
      const fetchRutina = async () => {
        try {
          const resp = await api.get(`/rutinas/${id}`);
          const rut = resp.data.data;
          setNombre(rut.nombre);
          setClienteId(rut.cliente_id);
          // Mapear al formato interno: series_objetivo → series
          const ejMapeados = rut.ejercicios.map(ej => ({
            nombre: ej.nombre,
            series: ej.series_objetivo.map(s => ({
              repeticiones_objetivo: s.repeticiones_objetivo,
              peso_objetivo_kg: s.peso_objetivo_kg ?? '',
            })),
          }));
          setEjercicios(ejMapeados);
          // Expandir todos al editar
          const exp = {};
          ejMapeados.forEach((_, i) => { exp[i] = true; });
          setExpandidos(exp);
        } catch (err) {
          console.error('Error fetching rutina', err);
        }
      };
      fetchRutina();
    }
  }, [id, isEditing]);

  // ── Ejercicio handlers ──────────────────────────────────────────
  const addEjercicio = () => {
    const newIdx = ejercicios.length;
    setEjercicios([...ejercicios, nuevoEjercicioVacio()]);
    setExpandidos({ ...expandidos, [newIdx]: true });
  };

  const removeEjercicio = (ejIdx) => {
    if (ejercicios.length === 1) return;
    setEjercicios(ejercicios.filter((_, i) => i !== ejIdx));
  };

  const updateEjercicioNombre = (ejIdx, valor) => {
    const copy = [...ejercicios];
    copy[ejIdx] = { ...copy[ejIdx], nombre: valor };
    setEjercicios(copy);
  };

  const toggleExpandido = (ejIdx) => {
    setExpandidos({ ...expandidos, [ejIdx]: !expandidos[ejIdx] });
  };

  // ── Serie handlers ──────────────────────────────────────────────
  const addSerie = (ejIdx) => {
    const copy = [...ejercicios];
    copy[ejIdx] = { ...copy[ejIdx], series: [...copy[ejIdx].series, nuevaSerieVacia()] };
    setEjercicios(copy);
  };

  const removeSerie = (ejIdx, serieIdx) => {
    if (ejercicios[ejIdx].series.length === 1) return;
    const copy = [...ejercicios];
    copy[ejIdx] = { ...copy[ejIdx], series: copy[ejIdx].series.filter((_, i) => i !== serieIdx) };
    setEjercicios(copy);
  };

  const updateSerie = (ejIdx, serieIdx, field, valor) => {
    const copy = [...ejercicios];
    const series = [...copy[ejIdx].series];
    series[serieIdx] = { ...series[serieIdx], [field]: valor };
    copy[ejIdx] = { ...copy[ejIdx], series };
    setEjercicios(copy);
  };

  // ── Submit ──────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setLoading(true);

    const payload = {
      nombre,
      cliente_id: parseInt(clienteId),
      ejercicios: ejercicios.map(ej => ({
        nombre: ej.nombre,
        series: ej.series.map(s => ({
          repeticiones_objetivo: parseInt(s.repeticiones_objetivo),
          peso_objetivo_kg: s.peso_objetivo_kg !== '' ? parseFloat(s.peso_objetivo_kg) : null,
        })),
      })),
    };

    try {
      if (isEditing) {
        await api.put(`/rutinas/${id}`, payload);
      } else {
        await api.post('/rutinas/', payload);
      }
      navigate('/entrenador/rutinas');
    } catch (error) {
      setMensaje(error.response?.data?.msg || 'Error guardando rutina');
    } finally {
      setLoading(false);
    }
  };

  // ── Estilos compartidos ─────────────────────────────────────────
  const focusAmber = { boxShadow: '0 0 0 2px #f59e0b' };
  const inputBase =
    'w-full border border-gray-200 bg-gray-50 px-3 py-2 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white transition';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#f59e0b' }}>
            <ClipboardEdit size={20} className="text-gray-900" strokeWidth={2.5} />
          </div>
          <div>
            <h1
              className="text-3xl font-black text-gray-900 leading-none"
              style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif", letterSpacing: '0.04em' }}
            >
              {isEditing ? 'EDITAR RUTINA' : 'CREAR NUEVA RUTINA'}
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {isEditing ? 'Modifica los datos de esta rutina' : 'Diseña una rutina personalizada para tu cliente'}
            </p>
          </div>
        </div>

        {mensaje && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
            {mensaje}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Datos generales */}
          <div
            className="bg-white rounded-2xl overflow-hidden"
            style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: '1px solid #f3f4f6' }}
          >
            <div
              className="relative px-5 py-4 flex items-center gap-3 overflow-hidden"
              style={{ background: '#0f172a', borderLeft: '4px solid #f59e0b' }}
            >
              <div
                className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'repeating-linear-gradient(-45deg, #f59e0b 0px, #f59e0b 1px, transparent 1px, transparent 18px)' }}
              />
              <User size={15} className="text-gray-400 relative z-10" />
              <h2 className="text-white font-black relative z-10" style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", letterSpacing: '0.05em', fontSize: '1rem' }}>
                DATOS GENERALES
              </h2>
            </div>

            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-xs font-bold uppercase tracking-wider mb-1.5">Nombre de la Rutina</label>
                <input
                  type="text" required className={inputBase}
                  onFocus={e => Object.assign(e.target.style, focusAmber)}
                  onBlur={e => (e.target.style.boxShadow = '')}
                  placeholder="Ej: Fuerza — Tren Superior"
                  value={nombre} onChange={e => setNombre(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-gray-700 text-xs font-bold uppercase tracking-wider mb-1.5">Cliente Asignado</label>
                <select
                  required disabled={isEditing}
                  className={`${inputBase} ${isEditing ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                  onFocus={e => { if (!isEditing) Object.assign(e.target.style, focusAmber); }}
                  onBlur={e => (e.target.style.boxShadow = '')}
                  value={clienteId} onChange={e => setClienteId(e.target.value)}
                >
                  <option value="">Seleccione un cliente...</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre} ({c.email})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Ejercicios */}
          <div
            className="bg-white rounded-2xl overflow-hidden"
            style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: '1px solid #f3f4f6' }}
          >
            <div
              className="relative px-5 py-4 flex items-center justify-between overflow-hidden"
              style={{ background: '#0f172a', borderLeft: '4px solid #f59e0b' }}
            >
              <div
                className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'repeating-linear-gradient(-45deg, #f59e0b 0px, #f59e0b 1px, transparent 1px, transparent 18px)' }}
              />
              <div className="flex items-center gap-3 relative z-10">
                <h2 className="text-white font-black" style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", letterSpacing: '0.05em', fontSize: '1rem' }}>
                  EJERCICIOS
                </h2>
                <span
                  className="text-xs font-black px-2 py-0.5 rounded"
                  style={{ background: '#f59e0b', color: '#0f172a', fontFamily: "'Bebas Neue','Impact',sans-serif" }}
                >
                  {ejercicios.length}
                </span>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {ejercicios.map((ej, ejIdx) => (
                <div
                  key={ejIdx}
                  className="rounded-xl overflow-hidden"
                  style={{ border: '1px solid #e5e7eb' }}
                >
                  {/* Cabecera del ejercicio */}
                  <div
                    className="px-4 py-3 flex items-center justify-between gap-3"
                    style={{ background: '#f8fafc', borderBottom: expandidos[ejIdx] ? '1px solid #e5e7eb' : 'none' }}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span
                        className="text-xs font-black px-2 py-0.5 rounded flex-shrink-0"
                        style={{ background: '#1e293b', color: '#f59e0b', fontFamily: "'Bebas Neue','Impact',sans-serif" }}
                      >
                        #{ejIdx + 1}
                      </span>
                      <input
                        type="text" required
                        className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm font-bold text-gray-800 placeholder-gray-400"
                        placeholder="Nombre del ejercicio (ej: Sentadilla)"
                        value={ej.nombre}
                        onChange={e => updateEjercicioNombre(ejIdx, e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-xs text-gray-400 font-semibold mr-1">{ej.series.length} series</span>
                      <button
                        type="button" onClick={() => toggleExpandido(ejIdx)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
                      >
                        {expandidos[ejIdx] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                      <button
                        type="button" onClick={() => removeEjercicio(ejIdx)}
                        disabled={ejercicios.length === 1}
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition disabled:opacity-30"
                        style={{ background: '#fff1f2', border: '1px solid #fca5a5' }}
                      >
                        <Trash2 size={13} style={{ color: '#dc2626' }} />
                      </button>
                    </div>
                  </div>

                  {/* Tabla de series — visible solo si expandido */}
                  {expandidos[ejIdx] && (
                    <div className="p-4 space-y-2">
                      {/* Encabezados */}
                      <div className="grid grid-cols-12 gap-2 px-1 mb-1">
                        {[
                          { label: 'Serie', cols: 'col-span-2' },
                          { label: 'Reps objetivo', cols: 'col-span-5' },
                          { label: 'Peso obj. (kg)', cols: 'col-span-4' },
                          { label: '', cols: 'col-span-1' },
                        ].map(({ label, cols }) => (
                          <div key={label} className={`${cols} text-xs font-bold text-gray-400 uppercase tracking-wider`}>{label}</div>
                        ))}
                      </div>

                      {ej.series.map((serie, serieIdx) => (
                        <div key={serieIdx} className="grid grid-cols-12 gap-2 items-center">
                          {/* Número de serie */}
                          <div className="col-span-2">
                            <div
                              className="flex items-center justify-center h-9 rounded-xl text-sm font-black"
                              style={{ background: '#f59e0b', color: '#0f172a', fontFamily: "'Bebas Neue','Impact',sans-serif" }}
                            >
                              {serieIdx + 1}
                            </div>
                          </div>

                          {/* Reps objetivo */}
                          <div className="col-span-5">
                            <input
                              type="number" min="1" required
                              className={inputBase}
                              onFocus={e => Object.assign(e.target.style, focusAmber)}
                              onBlur={e => (e.target.style.boxShadow = '')}
                              placeholder="12"
                              value={serie.repeticiones_objetivo}
                              onChange={e => updateSerie(ejIdx, serieIdx, 'repeticiones_objetivo', e.target.value)}
                            />
                          </div>

                          {/* Peso objetivo */}
                          <div className="col-span-4">
                            <input
                              type="number" step="0.5" min="0"
                              className={inputBase}
                              onFocus={e => Object.assign(e.target.style, focusAmber)}
                              onBlur={e => (e.target.style.boxShadow = '')}
                              placeholder="Opc."
                              value={serie.peso_objetivo_kg}
                              onChange={e => updateSerie(ejIdx, serieIdx, 'peso_objetivo_kg', e.target.value)}
                            />
                          </div>

                          {/* Eliminar serie */}
                          <div className="col-span-1 flex justify-center">
                            <button
                              type="button"
                              onClick={() => removeSerie(ejIdx, serieIdx)}
                              disabled={ej.series.length === 1}
                              className="w-7 h-7 rounded-lg flex items-center justify-center transition disabled:opacity-30"
                              style={{ background: '#fff1f2', border: '1px solid #fca5a5' }}
                            >
                              <Trash2 size={12} style={{ color: '#dc2626' }} />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Agregar serie */}
                      <button
                        type="button"
                        onClick={() => addSerie(ejIdx)}
                        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all duration-150 mt-1"
                        style={{ border: '2px dashed #e5e7eb', color: '#9ca3af', background: 'transparent' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.color = '#d97706'; e.currentTarget.style.background = '#fffbeb'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.background = 'transparent'; }}
                      >
                        <Plus size={13} strokeWidth={2.5} />
                        Agregar Serie
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {/* Agregar ejercicio */}
              <button
                type="button" onClick={addEjercicio}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-200"
                style={{ border: '2px dashed #e5e7eb', color: '#6b7280', background: 'transparent' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.color = '#d97706'; e.currentTarget.style.background = '#fffbeb'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.background = 'transparent'; }}
              >
                <Plus size={16} strokeWidth={2.5} />
                Agregar Ejercicio
              </button>
            </div>
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
              <Save size={20} strokeWidth={2.5} />
            )}
            {loading ? 'Guardando...' : isEditing ? 'Actualizar Rutina' : 'Guardar Rutina'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FormularioRutina;