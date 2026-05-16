// src/components/Cliente/SesionActiva.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, X, ArrowLeft, Save } from 'lucide-react';
import api from '../../api';
import './Cliente.css';

function SesionActiva() {
  const { rutina_id } = useParams();
  const navigate = useNavigate();
  
  const [rutina, setRutina] = useState(null);
  const [ejercicioActualIdx, setEjercicioActualIdx] = useState(0);
  const [pesoCorporal, setPesoCorporal] = useState('');
  
  // Estado para acumular el desempeño antes de enviarlo
  // Formato: { ejercicio_id: { peso_real_kg: 0, series_hechas: 0 } }
  const [desempeno, setDesempeno] = useState({});
  
  // Inputs temporales para el ejercicio actual
  const [inputPeso, setInputPeso] = useState('');
  const [inputSeries, setInputSeries] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFinishing, setIsFinishing] = useState(false);

  useEffect(() => {
    const cargarRutina = async () => {
      try {
        const response = await api.get(`/rutinas/${rutina_id}`);
        setRutina(response.data.data);
      } catch (err) {
        setError('Error al cargar la rutina para entrenar.');
      } finally {
        setLoading(false);
      }
    };
    cargarRutina();
  }, [rutina_id]);

  // Cuando cambia el ejercicio, limpiamos los inputs locales
  useEffect(() => {
    if (rutina && rutina.ejercicios[ejercicioActualIdx]) {
      const ej = rutina.ejercicios[ejercicioActualIdx];
      // Si ya habíamos guardado algo para este ejercicio, lo recuperamos
      const guardado = desempeno[ej.id];
      setInputPeso(guardado ? guardado.peso_real_kg : (ej.peso_objetivo_kg || ''));
      setInputSeries(guardado ? guardado.series_hechas : ej.series);
    }
  }, [ejercicioActualIdx, rutina, desempeno]);

  const guardarEjercicioTemporal = () => {
    const ejActual = rutina.ejercicios[ejercicioActualIdx];
    setDesempeno(prev => ({
      ...prev,
      [ejActual.id]: {
        ejercicio_id: ejActual.id,
        peso_real_kg: parseFloat(inputPeso) || 0,
        series_hechas: parseInt(inputSeries) || 0
      }
    }));
  };

  const avanzarEjercicio = () => {
    guardarEjercicioTemporal();
    if (ejercicioActualIdx < rutina.ejercicios.length - 1) {
      setEjercicioActualIdx(prev => prev + 1);
    } else {
      setIsFinishing(true); // Abrimos el modal final
    }
  };

  const retrocederEjercicio = () => {
    guardarEjercicioTemporal();
    if (ejercicioActualIdx > 0) {
      setEjercicioActualIdx(prev => prev - 1);
    }
  };

  const finalizarEntrenamiento = async () => {
    // Asegurarnos de guardar el último ejercicio si no se hizo
    guardarEjercicioTemporal();
    
    try {
      // Formatear payload según tu desempeno_logic.py
      const payload = {
        rutina_id: parseInt(rutina_id),
        peso_corporal_kg: pesoCorporal ? parseFloat(pesoCorporal) : null,
        registros: Object.values(desempeno) // Convertimos el objeto en un array
      };

      await api.post('/desempeno/', payload);
      alert('¡Entrenamiento registrado con éxito! 🎉');
      navigate('/cliente/historial');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar la sesión.');
      setIsFinishing(false);
    }
  };

  if (loading) return <div className="cliente-container"><p>Preparando fierros...</p></div>;
  if (!rutina || rutina.ejercicios.length === 0) return <div className="cliente-container"><p>Esta rutina no tiene ejercicios.</p></div>;

  const ejercicio = rutina.ejercicios[ejercicioActualIdx];
  const progreso = `${ejercicioActualIdx + 1} de ${rutina.ejercicios.length}`;

  return (
    <div className="sesion-container">
      {/* HEADER MODO ENTRENAMIENTO */}
      <div className="sesion-header">
        <button className="back-btn-ghost" onClick={() => navigate('/cliente/rutinas')}>
          <X size={24} />
        </button>
        <div className="header-info">
          <h2>{rutina.nombre}</h2>
          <span className="progress-text">{progreso} completado</span>
        </div>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {/* TARJETA DEL EJERCICIO ACTUAL */}
      {!isFinishing ? (
        <div className="ejercicio-en-vivo">
          <div className="ejercicio-meta">
            <h1>{ejercicio.nombre}</h1>
            <div className="meta-pills">
              <span className="pill">Objetivo: {ejercicio.series}x{ejercicio.repeticiones}</span>
              {ejercicio.peso_objetivo_kg && <span className="pill obj">Peso Meta: {ejercicio.peso_objetivo_kg}kg</span>}
            </div>
          </div>

          <div className="registro-inputs">
            <h3>¿Qué lograste hacer hoy?</h3>
            
            <div className="input-group-large">
              <label>Peso Real (kg)</label>
              <div className="number-stepper">
                <button type="button" onClick={() => setInputPeso(Math.max(0, (parseFloat(inputPeso||0) - 2.5)).toString())}>-</button>
                <input 
                  type="number" 
                  step="0.5"
                  value={inputPeso} 
                  onChange={(e) => setInputPeso(e.target.value)} 
                />
                <button type="button" onClick={() => setInputPeso((parseFloat(inputPeso||0) + 2.5).toString())}>+</button>
              </div>
            </div>

            <div className="input-group-large">
              <label>Series Completadas</label>
              <div className="number-stepper">
                <button type="button" onClick={() => setInputSeries(Math.max(0, (parseInt(inputSeries||0) - 1)).toString())}>-</button>
                <input 
                  type="number" 
                  value={inputSeries} 
                  onChange={(e) => setInputSeries(e.target.value)} 
                />
                <button type="button" onClick={() => setInputSeries((parseInt(inputSeries||0) + 1).toString())}>+</button>
              </div>
            </div>
          </div>

          <div className="sesion-actions">
            <button 
              className="btn-secundario" 
              onClick={retrocederEjercicio}
              disabled={ejercicioActualIdx === 0}
            >
              Anterior
            </button>
            <button className="btn-primario-grande" onClick={avanzarEjercicio}>
              {ejercicioActualIdx === rutina.ejercicios.length - 1 ? 'Terminar Rutina' : 'Siguiente'}
            </button>
          </div>
        </div>
      ) : (
        /* PANTALLA DE FINALIZACIÓN */
        <div className="modal-finalizacion">
          <h2>¡Casi listo!</h2>
          <p>Has completado todos los ejercicios de {rutina.nombre}.</p>
          
          <div className="input-group-large" style={{marginTop: '20px'}}>
            <label>Opcional: Registra tu peso corporal actual (kg)</label>
            <input 
              type="number" 
              step="0.1"
              placeholder="Ej. 80.5"
              value={pesoCorporal} 
              onChange={(e) => setPesoCorporal(e.target.value)} 
              className="input-estandar"
            />
          </div>

          <div className="sesion-actions">
            <button className="btn-secundario" onClick={() => setIsFinishing(false)}>
              Revisar Ejercicios
            </button>
            <button className="btn-exito-grande" onClick={finalizarEntrenamiento}>
              <Save size={20} /> Guardar Entrenamiento
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SesionActiva;