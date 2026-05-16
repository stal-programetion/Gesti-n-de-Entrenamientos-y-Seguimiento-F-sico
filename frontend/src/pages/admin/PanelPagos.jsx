import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { CreditCard, CheckCircle, Ban, ShieldCheck } from 'lucide-react';

const PanelPagos = () => {
  const [clientes, setClientes] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState('');
  const [monto, setMonto] = useState('');
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await api.get('/auth/clientes?include_inactive=1');
        setClientes(response.data.data || []);
      } catch (error) {
        console.error('Error cargando clientes:', error);
      }
    };
    fetchClientes();
  }, []);

  const actualizarAcceso = async (clienteId, activo) => {
    setMensaje(null);
    try {
      const resp = await api.patch(`/auth/usuarios/${clienteId}/acceso`, { activo });
      setMensaje({ type: 'success', text: resp.data.msg });
      const response = await api.get('/auth/clientes?include_inactive=1');
      setClientes(response.data.data || []);
    } catch (error) {
      setMensaje({ type: 'error', text: error.response?.data?.msg || 'Error al actualizar acceso' });
    }
  };

  const handlePago = async (e) => {
    e.preventDefault();
    setMensaje(null);
    try {
      const resp = await api.post('/pagos/', {
        cliente_id: parseInt(selectedCliente),
        monto: parseFloat(monto)
      });
      setMensaje({ type: 'success', text: resp.data.msg });
      setMonto('');
      setSelectedCliente('');
    } catch (error) {
      setMensaje({ type: 'error', text: error.response?.data?.msg || 'Error al procesar pago' });
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center space-x-2">
        <CreditCard className="text-blue-600"/>
        <span>Tesorería - Registro de Pagos</span>
      </h1>

      <div className="bg-white p-6 rounded-lg shadow">
        {mensaje && (
          <div className={`p-4 mb-6 rounded ${mensaje.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {mensaje.type === 'success' && <CheckCircle className="inline mr-2" size={18}/>}
            {mensaje.text}
          </div>
        )}

        <form onSubmit={handlePago} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1 font-semibold">Seleccionar Cliente</label>
            <select 
              className="w-full border p-2 rounded"
              value={selectedCliente}
              onChange={(e) => setSelectedCliente(e.target.value)}
              required
            >
              <option value="">-- Seleccione un cliente --</option>
              {clientes.map(cli => (
                <option key={cli.id} value={cli.id} className={cli.estado_pago === 'mora' ? 'text-red-500' : ''}>
                  {cli.nombre} - {cli.email} ({cli.estado_pago})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-1 font-semibold">Monto Pagado ($)</label>
            <input 
              type="number" 
              step="0.01"
              className="w-full border p-2 rounded"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              required
              placeholder="Ej: 50.00"
            />
          </div>

          <button 
            type="submit" 
            className="bg-blue-600 text-white font-bold py-2 px-6 rounded hover:bg-blue-700 transition"
          >
            Registrar Pago y Liberar Sistema
          </button>
        </form>

        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
            <Ban className="text-red-600" />
            <span>Control de acceso del sistema</span>
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-3 border-b">Nombre</th>
                  <th className="text-left p-3 border-b">Correo</th>
                  <th className="text-left p-3 border-b">Estado</th>
                  <th className="text-left p-3 border-b">Acción</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((cli) => (
                  <tr key={cli.id} className="border-b last:border-b-0">
                    <td className="p-3">{cli.nombre}</td>
                    <td className="p-3">{cli.email}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-sm ${cli.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {cli.activo ? 'Activo' : 'Bloqueado'}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => actualizarAcceso(cli.id, !cli.activo)}
                        className={`inline-flex items-center space-x-2 px-3 py-2 rounded text-white font-semibold ${cli.activo ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                      >
                        {cli.activo ? <Ban size={16} /> : <ShieldCheck size={16} />}
                        <span>{cli.activo ? 'Bloquear acceso' : 'Reactivar acceso'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanelPagos;
