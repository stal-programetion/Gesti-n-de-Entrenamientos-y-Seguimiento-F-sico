from models.models import Rutina, Ejercicio, Usuario
from models.database import db

def crear_rutina_con_ejercicios(data, entrenador_id):
    """
    Lógica para crear una Rutina y sus ejercicios asociados (RF02).
    Asegura que esto pase dentro de una sola transacción de BD.
    """
    try:
        nombre_rutina = data.get('nombre')
        cliente_id = data.get('cliente_id')
        ejercicios_data = data.get('ejercicios', [])

        # Validaciones iniciales
        if not nombre_rutina or not cliente_id:
            return None, "Faltan datos de la rutina (nombre y cliente_id son obligatorios)", 400

        if not ejercicios_data or not isinstance(ejercicios_data, list) or len(ejercicios_data) == 0:
            return None, "Debe proporcionar una lista con al menos un ejercicio", 400

        # Validar que el cliente exista y que efectivamente sea un Cliente
        cliente = Usuario.query.get(cliente_id)
        if not cliente or cliente.rol.value != "Cliente":
            return None, "El cliente_id proporcionado no es válido o no corresponde a un rol Cliente", 404

        # 1. Instanciar y guardar la nueva Rutina
        nueva_rutina = Rutina(
            nombre=nombre_rutina,
            entrenador_id=entrenador_id,
            cliente_id=cliente_id,
            activa=True
        )
        db.session.add(nueva_rutina)
        
        # Hacemos un flush para que la BD asigne un ID a nueva_rutina sin cerrar la transacción
        db.session.flush()

        # 2. Instanciar los Ejercicios e iterar sobre los provistos por el entrenador
        for ej_data in ejercicios_data:
            campos_requeridos = ['nombre', 'series', 'repeticiones']
            if not all(k in ej_data for k in campos_requeridos):
                db.session.rollback()
                return None, "Cada ejercicio debe contener obligatoriamente: nombre, series, y repeticiones", 400
                
            nuevo_ejercicio = Ejercicio(
                rutina_id=nueva_rutina.id,
                nombre=ej_data['nombre'],
                series=int(ej_data['series']),
                repeticiones=int(ej_data['repeticiones']),
                peso_objetivo_kg=ej_data.get('peso_objetivo_kg')  # Este es opcional (puede ser None)
            )
            db.session.add(nuevo_ejercicio)

        # 3. Guardar todo definitivamente
        db.session.commit()
        return nueva_rutina.id, "Rutina y ejercicios creados exitosamente", 201

    except ValueError:
        db.session.rollback()
        return None, "Error de formato: las series y repeticiones deben ser numéricas", 400
    except Exception as e:
        db.session.rollback()
        return None, f"Error interno del servidor: {str(e)}", 500
    
def obtener_rutina_con_ejercicios(rutina_id):
    """
    Lógica para obtener una Rutina junto con sus ejercicios asociados (RF03).
    Devuelve un diccionario con la información de la rutina y una lista de ejercicios.
    """
    try:
        rutina = Rutina.query.get(rutina_id)
        if not rutina:
            return None, "Rutina no encontrada", 404

        ejercicios = Ejercicio.query.filter_by(rutina_id=rutina_id).all()
        ejercicios_list = [{
            "id": ej.id,
            "nombre": ej.nombre,
            "series": ej.series,
            "repeticiones": ej.repeticiones,
            "peso_objetivo_kg": float(ej.peso_objetivo_kg) if ej.peso_objetivo_kg is not None else None
        } for ej in ejercicios]

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
    """
    Lógica para modificar una Rutina existente (RF04).
    Permite cambiar el nombre de la rutina y/o sus ejercicios.
    Solo el entrenador que creó la rutina puede modificarla.
    """
    try:
        rutina = Rutina.query.get(rutina_id)
        if not rutina:
            return None, "Rutina no encontrada", 404
        
        if str(rutina.entrenador_id) != str(entrenador_id):
            return None, "Acceso no autorizado: solo el entrenador que creó la rutina puede modificarla", 403

        # Modificar el nombre de la rutina si se proporciona
        nuevo_nombre = data.get('nombre')
        if nuevo_nombre:
            rutina.nombre = nuevo_nombre

        # Modificar los ejercicios si se proporciona una lista de ejercicios
        ejercicios_data = data.get('ejercicios')
        if ejercicios_data is not None:
            # Eliminar los ejercicios existentes
            Ejercicio.query.filter_by(rutina_id=rutina_id).delete()
            db.session.flush()  # Asegura que los cambios se reflejen antes de agregar nuevos ejercicios

            # Agregar los nuevos ejercicios
            for ej_data in ejercicios_data:
                campos_requeridos = ['nombre', 'series', 'repeticiones']
                if not all(k in ej_data for k in campos_requeridos):
                    db.session.rollback()
                    return None, "Cada ejercicio debe contener obligatoriamente: nombre, series, y repeticiones", 400
                    
                nuevo_ejercicio = Ejercicio(
                    rutina_id=rutina.id,
                    nombre=ej_data['nombre'],
                    series=int(ej_data['series']),
                    repeticiones=int(ej_data['repeticiones']),
                    peso_objetivo_kg=ej_data.get('peso_objetivo_kg')  # Este es opcional (puede ser None)
                )
                db.session.add(nuevo_ejercicio)

        db.session.commit()
        return rutina.id, "Rutina modificada exitosamente", 200

    except ValueError:
        db.session.rollback()
        return None, "Error de formato: las series y repeticiones deben ser numéricas", 400
    except Exception as e:
        db.session.rollback()
        return None, f"Error interno del servidor: {str(e)}", 500
    
def listar_rutinas_por_usuario(usuario_id, rol):
    """
    Lista las rutinas basándose en el rol.
    Si es Cliente, ve las rutinas donde él es el cliente.
    Si es Entrenador, ve las rutinas donde él es el creador.
    """
    try:
        if rol == "Cliente":
            rutinas = Rutina.query.filter_by(cliente_id=usuario_id, activa=True).all()
        elif rol == "Entrenador":
            rutinas = Rutina.query.filter_by(entrenador_id=usuario_id).all()
        else:
             # Administradores pueden ver todas
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
    """
    Lógica para desactivar/borrar lógicamente una Rutina.
    """
    try:
        rutina = Rutina.query.get(rutina_id)
        if not rutina:
            return None, "Rutina no encontrada", 404
        
        if rutina.entrenador_id != entrenador_id:
            return None, "Acceso no autorizado: solo el entrenador que creó la rutina puede eliminarla", 403

        # Desactivado lógico (soft delete) recomendable para no perder histórico
        rutina.activa = False
        db.session.commit()
        
        return rutina.id, "Rutina eliminada (desactivada) exitosamente", 200

    except Exception as e:
        db.session.rollback()
        return None, f"Error interno del servidor: {str(e)}", 500