from models.models import Sesion, RegistroDesempeno, Rutina, Ejercicio
from models.database import db
from datetime import datetime

def registrar_sesion_completa(data, cliente_id):
    """
    Registra una sesión de entrenamiento completa con el desempeño de todos sus ejercicios.
    (RF03: Registro de Desempeño).
    """
    try:
        rutina_id = data.get('rutina_id')
        peso_corporal = data.get('peso_corporal_kg')
        registros_data = data.get('registros', [])

        if not rutina_id:
            return None, "Debe proporcionar un rutina_id", 400

        # Validamos que la rutina exista y pertenezca al cliente
        rutina = Rutina.query.get(rutina_id)
        if not rutina or rutina.cliente_id != int(cliente_id):
            return None, "La rutina no existe o no pertenece a este usuario", 404

        # 1. Crear la Sesión padre
        nueva_sesion = Sesion(
            cliente_id=cliente_id,
            rutina_id=rutina_id,
            fecha=datetime.utcnow().date(),
            peso_corporal_kg=peso_corporal
        )
        db.session.add(nueva_sesion)
        db.session.flush()

        # 2. Iterar y crear los Registros de Desempeño
        for reg in registros_data:
            ejercicio_id = reg.get('ejercicio_id')
            peso_real = reg.get('peso_real_kg')
            series_hechas = reg.get('series_hechas')

            if not all([ejercicio_id, peso_real, series_hechas]):
                db.session.rollback()
                return None, "Cada registro debe tener ejercicio_id, peso_real_kg y series_hechas", 400

            nuevo_registro = RegistroDesempeno(
                sesion_id=nueva_sesion.id,
                ejercicio_id=ejercicio_id,
                peso_real_kg=peso_real,
                series_hechas=series_hechas
            )
            db.session.add(nuevo_registro)

        db.session.commit()
        return nueva_sesion.id, "Sesión y registros de desempeño guardados exitosamente", 201

    except Exception as e:
        db.session.rollback()
        return None, f"Error interno del servidor: {str(e)}", 500

def obtener_historial_desempeno(cliente_id, rutina_id=None):
    """
    Obtiene el historial de sesiones y su desempeño para un cliente.
    Si se provee rutina_id, filtra por esa rutina específica.
    """
    try:
        query = Sesion.query.filter_by(cliente_id=cliente_id)
        if rutina_id:
            query = query.filter_by(rutina_id=rutina_id)
            
        sesiones = query.order_by(Sesion.fecha.desc()).all()
        
        historial = []
        for sesion in sesiones:
            registros = RegistroDesempeno.query.filter_by(sesion_id=sesion.id).all()
            registros_dict = [{
                "ejercicio_id": r.ejercicio_id,
                "ejercicio_nombre": r.ejercicio.nombre if r.ejercicio else "Desconocido",
                "peso_real_kg": float(r.peso_real_kg),
                "series_hechas": r.series_hechas
            } for r in registros]
            
            historial.append({
                "sesion_id": sesion.id,
                "rutina_id": sesion.rutina_id,
                "fecha": sesion.fecha.isoformat(),
                "peso_corporal_kg": float(sesion.peso_corporal_kg) if sesion.peso_corporal_kg else None,
                "registros": registros_dict
            })
            
        return historial, "Historial obtenido", 200

    except Exception as e:
        return None, f"Error interno: {str(e)}", 500
