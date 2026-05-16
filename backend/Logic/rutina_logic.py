from models.models import Rutina, Ejercicio, SerieObjetivo, Usuario
from models.database import db

def _build_series_objetivo(ejercicio_id, series_data):
    """
    Crea objetos SerieObjetivo a partir del array de series enviado por el entrenador.
    series_data: [{ repeticiones_objetivo, peso_objetivo_kg? }, ...]  (ordenado por índice = numero_serie)
    """
    objetos = []
    for i, s in enumerate(series_data, start=1):
        if 'repeticiones_objetivo' not in s:
            raise ValueError(f"La serie {i} debe incluir 'repeticiones_objetivo'")
        objetos.append(SerieObjetivo(
            ejercicio_id=ejercicio_id,
            numero_serie=i,
            repeticiones_objetivo=int(s['repeticiones_objetivo']),
            peso_objetivo_kg=s.get('peso_objetivo_kg')
        ))
    return objetos


def crear_rutina_con_ejercicios(data, entrenador_id):
    """
    RF02 — Crea una Rutina con sus ejercicios y los objetivos por serie.

    Payload esperado:
    {
      "nombre": "Tren Superior",
      "cliente_id": 5,
      "ejercicios": [
        {
          "nombre": "Press Banca",
          "series": [
            { "repeticiones_objetivo": 12, "peso_objetivo_kg": 80 },
            { "repeticiones_objetivo": 10, "peso_objetivo_kg": 85 },
            { "repeticiones_objetivo": 8,  "peso_objetivo_kg": 90 }
          ]
        }
      ]
    }
    """
    try:
        nombre_rutina = data.get('nombre')
        cliente_id = data.get('cliente_id')
        ejercicios_data = data.get('ejercicios', [])

        if not nombre_rutina or not cliente_id:
            return None, "Faltan datos de la rutina (nombre y cliente_id son obligatorios)", 400

        if not ejercicios_data or not isinstance(ejercicios_data, list) or len(ejercicios_data) == 0:
            return None, "Debe proporcionar una lista con al menos un ejercicio", 400

        cliente = Usuario.query.get(cliente_id)
        if not cliente or cliente.rol.value != "Cliente":
            return None, "El cliente_id proporcionado no es válido o no corresponde a un rol Cliente", 404

        nueva_rutina = Rutina(
            nombre=nombre_rutina,
            entrenador_id=entrenador_id,
            cliente_id=cliente_id,
            activa=True
        )
        db.session.add(nueva_rutina)
        db.session.flush()

        for ej_data in ejercicios_data:
            if 'nombre' not in ej_data or 'series' not in ej_data:
                db.session.rollback()
                return None, "Cada ejercicio debe contener 'nombre' y 'series' (array de series)", 400

            series_list = ej_data['series']
            if not isinstance(series_list, list) or len(series_list) == 0:
                db.session.rollback()
                return None, "El campo 'series' de cada ejercicio debe ser un array con al menos un elemento", 400

            nuevo_ejercicio = Ejercicio(
                rutina_id=nueva_rutina.id,
                nombre=ej_data['nombre'],
                series=len(series_list),
            )
            db.session.add(nuevo_ejercicio)
            db.session.flush()

            for obj in _build_series_objetivo(nuevo_ejercicio.id, series_list):
                db.session.add(obj)

        db.session.commit()
        return nueva_rutina.id, "Rutina y ejercicios creados exitosamente", 201

    except ValueError as ve:
        db.session.rollback()
        return None, str(ve), 400
    except Exception as e:
        db.session.rollback()
        return None, f"Error interno del servidor: {str(e)}", 500


def obtener_rutina_con_ejercicios(rutina_id):
    """RF03 — Obtiene una Rutina con sus ejercicios y los objetivos de cada serie."""
    try:
        rutina = Rutina.query.get(rutina_id)
        if not rutina:
            return None, "Rutina no encontrada", 404

        ejercicios = Ejercicio.query.filter_by(rutina_id=rutina_id).all()
        ejercicios_list = []
        for ej in ejercicios:
            series_obj = SerieObjetivo.query.filter_by(ejercicio_id=ej.id).order_by(SerieObjetivo.numero_serie).all()
            ejercicios_list.append({
                "id": ej.id,
                "nombre": ej.nombre,
                "series": ej.series,
                "series_objetivo": [
                    {
                        "numero_serie": s.numero_serie,
                        "repeticiones_objetivo": s.repeticiones_objetivo,
                        "peso_objetivo_kg": float(s.peso_objetivo_kg) if s.peso_objetivo_kg is not None else None
                    }
                    for s in series_obj
                ]
            })

        rutina_data = {
            "id": rutina.id,
            "nombre": rutina.nombre,
            "entrenador_id": rutina.entrenador_id,
            "cliente_id": rutina.cliente_id,
            "activa": rutina.activa,
            "ejercicios": ejercicios_list
        }
        return rutina_data, "Rutina obtenida exitosamente", 200

    except Exception as e:
        return None, f"Error interno del servidor: {str(e)}", 500


def modificar_rutina(rutina_id, data, entrenador_id):
    """RF04 — Modifica una Rutina existente. Solo el entrenador creador puede hacerlo."""
    try:
        rutina = Rutina.query.get(rutina_id)
        if not rutina:
            return None, "Rutina no encontrada", 404

        if str(rutina.entrenador_id) != str(entrenador_id):
            return None, "Acceso no autorizado: solo el entrenador que creó la rutina puede modificarla", 403

        nuevo_nombre = data.get('nombre')
        if nuevo_nombre:
            rutina.nombre = nuevo_nombre

        ejercicios_data = data.get('ejercicios')
        if ejercicios_data is not None:
            Ejercicio.query.filter_by(rutina_id=rutina_id).delete()
            db.session.flush()

            for ej_data in ejercicios_data:
                if 'nombre' not in ej_data or 'series' not in ej_data:
                    db.session.rollback()
                    return None, "Cada ejercicio debe contener 'nombre' y 'series' (array de series)", 400

                series_list = ej_data['series']
                if not isinstance(series_list, list) or len(series_list) == 0:
                    db.session.rollback()
                    return None, "El campo 'series' de cada ejercicio debe ser un array con al menos un elemento", 400

                nuevo_ejercicio = Ejercicio(
                    rutina_id=rutina.id,
                    nombre=ej_data['nombre'],
                    series=len(series_list),
                )
                db.session.add(nuevo_ejercicio)
                db.session.flush()

                for obj in _build_series_objetivo(nuevo_ejercicio.id, series_list):
                    db.session.add(obj)

        db.session.commit()
        return rutina.id, "Rutina modificada exitosamente", 200

    except ValueError as ve:
        db.session.rollback()
        return None, str(ve), 400
    except Exception as e:
        db.session.rollback()
        return None, f"Error interno del servidor: {str(e)}", 500


def listar_rutinas_por_usuario(usuario_id, rol):
    """Lista las rutinas según el rol del usuario."""
    try:
        if rol == "Cliente":
            rutinas = Rutina.query.filter_by(cliente_id=usuario_id, activa=True).all()
        elif rol == "Entrenador":
            rutinas = Rutina.query.filter_by(entrenador_id=usuario_id).all()
        else:
            rutinas = Rutina.query.all()

        lista_rutinas = [{
            "id": r.id,
            "nombre": r.nombre,
            "entrenador_id": r.entrenador_id,
            "cliente_id": r.cliente_id,
            "activa": r.activa
        } for r in rutinas]

        return lista_rutinas, "Rutinas obtenidas exitosamente", 200

    except Exception as e:
        return None, f"Error interno del servidor: {str(e)}", 500


def eliminar_rutina(rutina_id, entrenador_id):
    """Soft-delete de una Rutina."""
    try:
        rutina = Rutina.query.get(rutina_id)
        if not rutina:
            return None, "Rutina no encontrada", 404

        if rutina.entrenador_id != entrenador_id:
            return None, "Acceso no autorizado: solo el entrenador que creó la rutina puede eliminarla", 403

        rutina.activa = False
        db.session.commit()
        return rutina.id, "Rutina eliminada (desactivada) exitosamente", 200

    except Exception as e:
        db.session.rollback()
        return None, f"Error interno del servidor: {str(e)}", 500