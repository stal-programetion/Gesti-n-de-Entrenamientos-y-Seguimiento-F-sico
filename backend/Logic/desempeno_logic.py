from models.models import Sesion, RegistroDesempeno, Rutina, Ejercicio
from models.database import db
from datetime import datetime

def registrar_sesion_completa(data, cliente_id):
    """
    RF03 — Registra una sesión completa con el desempeño real de cada serie de cada ejercicio.

    Payload esperado:
    {
      "rutina_id": 3,
      "peso_corporal_kg": 78.5,           // opcional
      "registros": [
        {
          "ejercicio_id": 12,
          "series": [
            { "numero_serie": 1, "repeticiones_hechas": 12, "peso_real_kg": 80 },
            { "numero_serie": 2, "repeticiones_hechas": 10, "peso_real_kg": 85 },
            { "numero_serie": 3, "repeticiones_hechas": 8,  "peso_real_kg": 87.5 }
          ]
        }
      ]
    }
    """
    try:
        rutina_id = data.get('rutina_id')
        peso_corporal = data.get('peso_corporal_kg')
        registros_data = data.get('registros', [])

        if not rutina_id:
            return None, "Debe proporcionar un rutina_id", 400

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

        # 2. Crear un RegistroDesempeno por cada serie de cada ejercicio
        for reg in registros_data:
            ejercicio_id = reg.get('ejercicio_id')
            series_list = reg.get('series', [])

            if not ejercicio_id:
                db.session.rollback()
                return None, "Cada registro debe incluir 'ejercicio_id'", 400

            if not isinstance(series_list, list) or len(series_list) == 0:
                db.session.rollback()
                return None, f"El ejercicio {ejercicio_id} debe incluir al menos una serie en 'series'", 400

            for serie in series_list:
                numero_serie = serie.get('numero_serie')
                reps_hechas = serie.get('repeticiones_hechas')
                peso_real = serie.get('peso_real_kg')

                if numero_serie is None or reps_hechas is None or peso_real is None:
                    db.session.rollback()
                    return None, "Cada serie debe tener 'numero_serie', 'repeticiones_hechas' y 'peso_real_kg'", 400

                nuevo_registro = RegistroDesempeno(
                    sesion_id=nueva_sesion.id,
                    ejercicio_id=ejercicio_id,
                    numero_serie=int(numero_serie),
                    repeticiones_hechas=int(reps_hechas),
                    peso_real_kg=float(peso_real)
                )
                db.session.add(nuevo_registro)

        db.session.commit()
        return nueva_sesion.id, "Sesión y registros de desempeño guardados exitosamente", 201

    except Exception as e:
        db.session.rollback()
        return None, f"Error interno del servidor: {str(e)}", 500


def obtener_historial_desempeno(cliente_id, rutina_id=None):
    """
    Obtiene el historial de sesiones con el desempeño por serie de cada ejercicio.
    """
    try:
        query = Sesion.query.filter_by(cliente_id=cliente_id)
        if rutina_id:
            query = query.filter_by(rutina_id=rutina_id)

        sesiones = query.order_by(Sesion.fecha.desc()).all()

        historial = []
        for sesion in sesiones:
            # Agrupar los registros por ejercicio
            registros_raw = RegistroDesempeno.query.filter_by(sesion_id=sesion.id).order_by(
                RegistroDesempeno.ejercicio_id, RegistroDesempeno.numero_serie
            ).all()

            ejercicios_dict = {}
            for r in registros_raw:
                ej_id = r.ejercicio_id
                if ej_id not in ejercicios_dict:
                    ejercicios_dict[ej_id] = {
                        "ejercicio_id": ej_id,
                        "ejercicio_nombre": r.ejercicio.nombre if r.ejercicio else "Desconocido",
                        "series": []
                    }
                ejercicios_dict[ej_id]["series"].append({
                    "numero_serie": r.numero_serie,
                    "repeticiones_hechas": r.repeticiones_hechas,
                    "peso_real_kg": float(r.peso_real_kg)
                })

            historial.append({
                "sesion_id": sesion.id,
                "rutina_id": sesion.rutina_id,
                "fecha": sesion.fecha.isoformat(),
                "peso_corporal_kg": float(sesion.peso_corporal_kg) if sesion.peso_corporal_kg else None,
                "ejercicios": list(ejercicios_dict.values())
            })

        return historial, "Historial obtenido", 200

    except Exception as e:
        return None, f"Error interno: {str(e)}", 500