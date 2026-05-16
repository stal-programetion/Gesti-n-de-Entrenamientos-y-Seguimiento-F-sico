import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { CreditCard, CheckCircle, Ban, ShieldCheck, DollarSign, Users, AlertTriangle, XCircle } from 'lucide-react';

const focusAmber = { boxShadow: '0 0 0 2px #f59e0b' };

const PanelPagos = () => {
  const [clientes, setClientes] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState('');
  const [monto, setMonto] = useState('');
  const [mensaje, setMensaje] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState(null);

  const fetchClientes = async () => {
    try {
      const response = await api.get('/auth/clientes?include_inactive=1');
      setClientes(response.data.data || []);
    } catch (error) {
      console.error('Error cargando clientes:', error);
    }
  };

  useEffect(() => { fetchClientes(); }, []);

  const actualizarAcceso = async (clienteId, activo) => {
    setMensaje(null);
    setLoadingId(clienteId);
    try {
      const resp = await api.patch(`/auth/usuarios/${clienteId}/acceso`, { activo });
      setMensaje({ type: 'success', text: resp.data.msg });
      await fetchClientes();
    } catch (error) {
      setMensaje({ type: 'error', text: error.response?.data?.msg || 'Error al actualizar acceso' });
    } finally {
      setLoadingId(null);
    }
  };

  const handlePago = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setLoading(true);
    try {
      const resp = await api.post('/pagos/', {
        cliente_id: parseInt(selectedCliente),
        monto: parseFloat(monto),
      });
      setMensaje({ type: 'success', text: resp.data.msg });
      setMonto('');
      setSelectedCliente('');
    } catch (error) {
      setMensaje({ type: 'error', text: error.response?.data?.msg || 'Error al procesar pago' });
    } finally {
      setLoading(false);
    }
  };

  const totalActivos  = clientes.filter(c => c.activo).length;
  const totalBloqueados = clientes.filter(c => !c.activo).length;
  const totalMora     = clientes.filter(c => c.estado_pago === 'mora').length;

  const inputBase =
    'w-full border border-gray-200 bg-gray-50 px-3 py-2.5 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white transition';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: '#f59e0b' }}
          >
            <CreditCard size={20} className="text-gray-900" strokeWidth={2.5} />
          </div>
          <div>
            <h1
              className="text-3xl font-black text-gray-900 leading-none"
              style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif", letterSpacing: '0.04em' }}
            >
              PANEL DE PAGOS
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">Tesorería y control de acceso</p>
          </div>
        </div>

        {/* Stats */}
        {clientes.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Activos',    value: totalActivos,    color: '#16a34a' },
              { label: 'Bloqueados', value: totalBloqueados, color: '#dc2626' },
              { label: 'En Mora',    value: totalMora,       color: '#f59e0b' },
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

        {/* Mensaje global */}
        {mensaje && (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold"
            style={
              mensaje.type === 'success'
                ? { background: '#f0fdf4', border: '1px solid #86efac', color: '#15803d' }
                : { background: '#fff1f2', border: '1px solid #fca5a5', color: '#b91c1c' }
            }
          >
            {mensaje.type === 'success'
              ? <CheckCircle size={16} strokeWidth={2.5} />
              : <XCircle size={16} strokeWidth={2.5} />
            }
            {mensaje.text}
          </div>
        )}

        {/* Formulario de pago */}
        <div
          className="bg-white rounded-2xl overflow-hidden"
          style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: '1px solid #f3f4f6' }}
        >
          {/* Section header */}
          <div
            className="relative px-5 py-4 flex items-center gap-3 overflow-hidden"
            style={{ background: '#0f172a', borderLeft: '4px solid #f59e0b' }}
          >
            <div
              className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'repeating-linear-gradient(-45deg, #f59e0b 0px, #f59e0b 1px, transparent 1px, transparent 18px)' }}
            />
            <DollarSign size={15} className="text-gray-400 relative z-10" strokeWidth={2.5} />
            <h2
              className="text-white font-black relative z-10"
              style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", letterSpacing: '0.05em', fontSize: '1rem' }}
            >
              REGISTRAR PAGO
            </h2>
          </div>

          <form onSubmit={handlePago} className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-xs font-bold uppercase tracking-wider mb-1.5">
                Cliente
              </label>
              <select
                required
                className={`${inputBase} cursor-pointer`}
                value={selectedCliente}
                onChange={e => setSelectedCliente(e.target.value)}
                onFocus={e => Object.assign(e.target.style, focusAmber)}
                onBlur={e => (e.target.style.boxShadow = '')}
              >
                <option value="">Seleccione un cliente...</option>
                {clientes.map(cli => (
                  <option key={cli.id} value={cli.id}>
                    {cli.nombre} — {cli.estado_pago}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 text-xs font-bold uppercase tracking-wider mb-1.5">
                Monto ($)
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="Ej: 50.00"
                className={inputBase}
                value={monto}
                onChange={e => setMonto(e.target.value)}
                onFocus={e => Object.assign(e.target.style, focusAmber)}
                onBlur={e => (e.target.style.boxShadow = '')}
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-gray-900 transition-all duration-200 disabled:opacity-60"
                style={{
                  background: '#f59e0b',
                  fontFamily: "'Bebas Neue','Impact',sans-serif",
                  letterSpacing: '0.08em',
                  fontSize: '1rem',
                  boxShadow: '0 4px 16px rgba(245,158,11,0.35)',
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#d97706'; }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#f59e0b'; }}
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CreditCard size={18} strokeWidth={2.5} />
                )}
                {loading ? 'Procesando...' : 'Registrar Pago y Liberar Acceso'}
              </button>
            </div>
          </form>
        </div>

        {/* Tabla de control de acceso */}
        <div
          className="bg-white rounded-2xl overflow-hidden"
          style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: '1px solid #f3f4f6' }}
        >
          {/* Section header */}
          <div
            className="relative px-5 py-4 flex items-center justify-between overflow-hidden"
            style={{ background: '#0f172a', borderLeft: '4px solid #f59e0b' }}
          >
            <div
              className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'repeating-linear-gradient(-45deg, #f59e0b 0px, #f59e0b 1px, transparent 1px, transparent 18px)' }}
            />
            <div className="relative z-10 flex items-center gap-3">
              <Users size={15} className="text-gray-400" strokeWidth={2.5} />
              <h2
                className="text-white font-black"
                style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", letterSpacing: '0.05em', fontSize: '1rem' }}
              >
                CONTROL DE ACCESO
              </h2>
            </div>
            <span
              className="relative z-10 text-xs font-black px-2 py-0.5 rounded"
              style={{ background: '#f59e0b', color: '#0f172a', fontFamily: "'Bebas Neue','Impact',sans-serif" }}
            >
              {clientes.length} clientes
            </span>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
                  {['Cliente', 'Correo', 'Estado Pago', 'Acceso', 'Acción'].map(h => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clientes.map(cli => (
                  <tr
                    key={cli.id}
                    className="border-b last:border-0 transition-colors"
                    style={{ borderColor: '#f3f4f6' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td className="px-5 py-3 font-semibold text-gray-800">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: '#1e293b' }}
                        >
                          <span
                            style={{ color: '#f59e0b', fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: '0.75rem', fontWeight: 900 }}
                          >
                            {cli.nombre?.[0]?.toUpperCase()}
                          </span>
                        </div>
                        {cli.nombre}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{cli.email}</td>
                    <td className="px-5 py-3">
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit"
                        style={
                          cli.estado_pago === 'mora'
                            ? { background: '#fff1f2', color: '#b91c1c', border: '1px solid #fca5a5' }
                            : { background: '#f0fdf4', color: '#15803d', border: '1px solid #86efac' }
                        }
                      >
                        {cli.estado_pago === 'mora' && <AlertTriangle size={10} strokeWidth={2.5} />}
                        {cli.estado_pago}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={
                          cli.activo
                            ? { background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }
                            : { background: '#f9fafb', color: '#9ca3af', border: '1px solid #e5e7eb' }
                        }
                      >
                        {cli.activo ? 'Activo' : 'Bloqueado'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <button
                        type="button"
                        disabled={loadingId === cli.id}
                        onClick={() => actualizarAcceso(cli.id, !cli.activo)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all duration-150 disabled:opacity-50"
                        style={{
                          fontFamily: "'Bebas Neue','Impact',sans-serif",
                          letterSpacing: '0.05em',
                          ...(cli.activo
                            ? { background: '#fff1f2', color: '#dc2626', border: '1px solid #fca5a5' }
                            : { background: '#f0fdf4', color: '#16a34a', border: '1px solid #86efac' }),
                        }}
                        onMouseEnter={e => {
                          if (loadingId !== cli.id)
                            e.currentTarget.style.background = cli.activo ? '#fee2e2' : '#dcfce7';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = cli.activo ? '#fff1f2' : '#f0fdf4';
                        }}
                      >
                        {loadingId === cli.id ? (
                          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : cli.activo ? (
                          <Ban size={13} strokeWidth={2.5} />
                        ) : (
                          <ShieldCheck size={13} strokeWidth={2.5} />
                        )}
                        {cli.activo ? 'Bloquear' : 'Reactivar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden p-4 space-y-3">
            {clientes.map(cli => (
              <div
                key={cli.id}
                className="rounded-xl overflow-hidden"
                style={{ border: '1px solid #f3f4f6' }}
              >
                {/* Card top */}
                <div
                  className="px-4 py-3 flex items-center justify-between"
                  style={{ background: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: '#1e293b' }}
                    >
                      <span style={{ color: '#f59e0b', fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: '0.75rem', fontWeight: 900 }}>
                        {cli.nombre?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{cli.nombre}</p>
                      <p className="text-xs text-gray-400">{cli.email}</p>
                    </div>
                  </div>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={
                      cli.activo
                        ? { background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }
                        : { background: '#f9fafb', color: '#9ca3af', border: '1px solid #e5e7eb' }
                    }
                  >
                    {cli.activo ? 'Activo' : 'Bloqueado'}
                  </span>
                </div>

                {/* Card bottom */}
                <div className="px-4 py-3 flex items-center justify-between">
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"
                    style={
                      cli.estado_pago === 'mora'
                        ? { background: '#fff1f2', color: '#b91c1c', border: '1px solid #fca5a5' }
                        : { background: '#f0fdf4', color: '#15803d', border: '1px solid #86efac' }
                    }
                  >
                    {cli.estado_pago === 'mora' && <AlertTriangle size={10} strokeWidth={2.5} />}
                    {cli.estado_pago}
                  </span>
                  <button
                    type="button"
                    disabled={loadingId === cli.id}
                    onClick={() => actualizarAcceso(cli.id, !cli.activo)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all disabled:opacity-50"
                    style={{
                      fontFamily: "'Bebas Neue','Impact',sans-serif",
                      letterSpacing: '0.05em',
                      ...(cli.activo
                        ? { background: '#fff1f2', color: '#dc2626', border: '1px solid #fca5a5' }
                        : { background: '#f0fdf4', color: '#16a34a', border: '1px solid #86efac' }),
                    }}
                  >
                    {loadingId === cli.id ? (
                      <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : cli.activo ? (
                      <Ban size={13} strokeWidth={2.5} />
                    ) : (
                      <ShieldCheck size={13} strokeWidth={2.5} />
                    )}
                    {cli.activo ? 'Bloquear' : 'Reactivar'}
                  </button>
                </div>
              </div>
            ))}

            {clientes.length === 0 && (
              <div className="flex flex-col items-center py-12 text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: '#f3f4f6' }}>
                  <Users size={24} className="text-gray-400" />
                </div>
                <p className="text-gray-400 font-semibold text-sm">No hay clientes registrados.</p>
              </div>
            )}
          </div>

          {/* Empty state desktop */}
          {clientes.length === 0 && (
            <div className="hidden md:flex flex-col items-center py-16 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: '#f3f4f6' }}>
                <Users size={24} className="text-gray-400" />
              </div>
              <p className="text-gray-400 font-semibold text-sm">No hay clientes registrados.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default PanelPagos;