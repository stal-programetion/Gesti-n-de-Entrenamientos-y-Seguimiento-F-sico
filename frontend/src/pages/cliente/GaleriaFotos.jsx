import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Camera, ImagePlus, X, CalendarDays, StickyNote } from 'lucide-react';

const GaleriaFotos = () => {
  const [fotos, setFotos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [urlArchivo, setUrlArchivo] = useState('');
  const [notas, setNotas] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchFotos = async () => {
    try {
      const resp = await api.get('/fotografia/');
      setFotos(resp.data.galeria || []);
    } catch (err) {
      console.error('Error fetching gallery', err);
    }
  };

  useEffect(() => { fetchFotos(); }, []);

  const handleSubir = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/fotografia/', { url_archivo: urlArchivo, notas });
      setShowModal(false);
      setUrlArchivo('');
      setNotas('');
      fetchFotos();
    } catch (err) {
      alert('Error subiendo foto');
    } finally {
      setLoading(false);
    }
  };

  const focusAmber = { boxShadow: '0 0 0 2px #f59e0b' };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#f59e0b' }}>
              <Camera size={20} className="text-gray-900" strokeWidth={2.5} />
            </div>
            <div>
              <h1
                className="text-3xl font-black text-gray-900 leading-none"
                style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif", letterSpacing: '0.04em' }}
              >
                PROGRESO VISUAL
              </h1>
              <p className="text-gray-400 text-sm mt-0.5">{fotos.length} foto{fotos.length !== 1 ? 's' : ''} registrada{fotos.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-gray-900 transition-all duration-200"
            style={{
              background: '#f59e0b',
              fontFamily: "'Bebas Neue','Impact',sans-serif",
              letterSpacing: '0.06em',
              fontSize: '0.9rem',
              boxShadow: '0 4px 14px rgba(245,158,11,0.35)',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#d97706')}
            onMouseLeave={e => (e.currentTarget.style.background = '#f59e0b')}
          >
            <ImagePlus size={16} strokeWidth={2.5} />
            Subir Foto
          </button>
        </div>

        {/* Grid */}
        {fotos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {fotos.map((f, i) => (
              <div
                key={f.id}
                className="bg-white rounded-2xl overflow-hidden group"
                style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.08)', border: '1px solid #f3f4f6' }}
              >
                {/* Image */}
                <div className="relative h-60 overflow-hidden bg-gray-100">
                  <img
                    src={f.url_archivo}
                    alt={`Progreso ${i + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Overlay on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end"
                    style={{ background: 'linear-gradient(to top, rgba(15,23,42,0.8) 0%, transparent 60%)' }}
                  >
                    <span
                      className="text-white text-xs font-bold px-3 py-2 uppercase tracking-wider"
                      style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", letterSpacing: '0.06em', fontSize: '0.85rem' }}
                    >
                      Foto #{i + 1}
                    </span>
                  </div>
                  {/* Badge */}
                  <div
                    className="absolute top-3 right-3 px-2 py-1 rounded-lg text-xs font-black"
                    style={{ background: '#f59e0b', color: '#0f172a', fontFamily: "'Bebas Neue','Impact',sans-serif", letterSpacing: '0.05em' }}
                  >
                    {new Date(f.fecha_subida).toLocaleDateString('es', { day: '2-digit', month: 'short' })}
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4">
                  <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1">
                    <CalendarDays size={12} />
                    <span>{new Date(f.fecha_subida).toLocaleDateString('es', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  {f.notas && (
                    <div className="flex items-start gap-1.5 mt-2">
                      <StickyNote size={12} className="text-gray-300 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-600 text-xs italic leading-relaxed">"{f.notas}"</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl" style={{ border: '1px solid #f3f4f6' }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: '#f3f4f6' }}>
              <Camera size={28} className="text-gray-400" />
            </div>
            <p className="text-gray-500 font-semibold">Aún no hay fotos de progreso.</p>
            <p className="text-gray-300 text-sm mt-1">Sube tu primera foto para comenzar a documentar tu evolución.</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-5 flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-gray-900 text-sm"
              style={{ background: '#f59e0b', fontFamily: "'Bebas Neue','Impact',sans-serif", letterSpacing: '0.06em' }}
            >
              <ImagePlus size={15} strokeWidth={2.5} />
              Subir Primera Foto
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center p-4 z-50" style={{ backdropFilter: 'blur(4px)' }}>
          <div
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden"
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}
          >
            {/* Modal header */}
            <div
              className="relative px-6 py-5 flex items-center justify-between overflow-hidden"
              style={{ background: '#0f172a' }}
            >
              <div
                className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'repeating-linear-gradient(-45deg, #f59e0b 0px, #f59e0b 1px, transparent 1px, transparent 18px)' }}
              />
              <h2
                className="relative z-10 text-white font-black text-xl"
                style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", letterSpacing: '0.04em' }}
              >
                SUBIR NUEVA FOTO
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="relative z-10 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: 'rgba(255,255,255,0.1)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(245,158,11,0.3)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
              >
                <X size={15} className="text-white" />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6">
              <form onSubmit={handleSubir} className="space-y-5">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-1.5">URL de la Imagen</label>
                  <input
                    type="url"
                    required
                    className="w-full border border-gray-200 bg-gray-50 px-4 py-3 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white transition"
                    onFocus={e => Object.assign(e.target.style, focusAmber)}
                    onBlur={e => (e.target.style.boxShadow = '')}
                    value={urlArchivo}
                    onChange={e => setUrlArchivo(e.target.value)}
                    placeholder="https://ejemplo.com/mifoto.jpg"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-1.5">Notas <span className="text-gray-400 font-normal">(Opcional)</span></label>
                  <textarea
                    rows="3"
                    className="w-full border border-gray-200 bg-gray-50 px-4 py-3 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white transition resize-none"
                    onFocus={e => Object.assign(e.target.style, focusAmber)}
                    onBlur={e => (e.target.style.boxShadow = '')}
                    value={notas}
                    onChange={e => setNotas(e.target.value)}
                    placeholder="Ej: Semana 4, después de entrenar pierna..."
                  />
                </div>
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 rounded-xl text-sm font-bold text-gray-600 transition-colors"
                    style={{ background: '#f3f4f6', border: '1px solid #e5e7eb' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#e5e7eb')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#f3f4f6')}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 rounded-xl font-black text-gray-900 flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60"
                    style={{
                      background: '#f59e0b',
                      fontFamily: "'Bebas Neue','Impact',sans-serif",
                      letterSpacing: '0.06em',
                      fontSize: '0.95rem',
                      boxShadow: '0 4px 14px rgba(245,158,11,0.35)',
                    }}
                    onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#d97706'; }}
                    onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#f59e0b'; }}
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ImagePlus size={15} strokeWidth={2.5} />
                    )}
                    {loading ? 'Subiendo...' : 'Guardar Foto'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GaleriaFotos;