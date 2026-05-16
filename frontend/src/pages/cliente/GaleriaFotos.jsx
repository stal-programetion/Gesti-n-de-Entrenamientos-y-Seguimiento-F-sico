import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Camera, ImagePlus } from 'lucide-react';

const GaleriaFotos = () => {
  const [fotos, setFotos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [urlArchivo, setUrlArchivo] = useState('');
  const [notas, setNotas] = useState('');

  const fetchFotos = async () => {
    try {
      const resp = await api.get('/fotografia/');
      setFotos(resp.data.galeria || []);
    } catch (err) {
      console.error('Error fetching gallery', err);
    }
  };

  useEffect(() => {
    fetchFotos();
  }, []);

  const handleSubir = async (e) => {
    e.preventDefault();
    try {
      await api.post('/fotografia/', { url_archivo: urlArchivo, notas });
      setShowModal(false);
      setUrlArchivo('');
      setNotas('');
      fetchFotos(); // refrescar
    } catch (err) {
      alert('Error subiendo foto');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto relative">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center space-x-2">
          <Camera className="text-blue-600"/>
          <span>Progreso Visual</span>
        </h1>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center space-x-2 hover:bg-blue-700"
        >
          <ImagePlus size={18} />
          <span>Subir Foto</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {fotos.map((f, i) => (
          <div key={f.id} className="bg-white rounded shadow overflow-hidden group">
            <div className="relative h-64 overflow-hidden bg-gray-100">
              <img src={f.url_archivo} alt={`Progreso ${i}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            </div>
            <div className="p-4 border-t">
              <p className="text-sm font-bold text-gray-500">{new Date(f.fecha_subida).toLocaleDateString()}</p>
              {f.notas && <p className="text-gray-700 mt-2 text-sm italic">"{f.notas}"</p>}
            </div>
          </div>
        ))}
        {fotos.length === 0 && <p className="text-gray-500 col-span-full">Aún no hay fotos de progreso subidas.</p>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Subir Nueva Foto</h2>
            <form onSubmit={handleSubir} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1">URL de la Imagen</label>
                <input type="url" required
                  className="w-full border p-2 rounded"
                  value={urlArchivo} onChange={e => setUrlArchivo(e.target.value)}
                  placeholder="https://ejemplo.com/mifoto.jpg"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Notas (Opcional)</label>
                <textarea rows="3"
                  className="w-full border p-2 rounded"
                  value={notas} onChange={e => setNotas(e.target.value)}
                  placeholder="Ej: Semana 4, después de entrenar pierna..."
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="bg-gray-300 px-4 py-2 rounded">Cancelar</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GaleriaFotos;
