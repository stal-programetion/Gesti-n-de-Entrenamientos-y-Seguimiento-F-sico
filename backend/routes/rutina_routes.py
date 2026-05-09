from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from Logic.rutina_logic import crear_rutina_con_ejercicios, eliminar_rutina, listar_rutinas_por_usuario, modificar_rutina, obtener_rutina_con_ejercicios

rutina_bp = Blueprint('rutina_bp', __name__)

@rutina_bp.route('/', methods=['POST'])
@jwt_required()
def create_rutina():
    """
    Endpoint (RF02) para Creación de Rutinas.
    El entrenador define ejercicios, series, repeticiones y peso objetivo.
    """
    claims = get_jwt()
    rol = claims.get("rol")
    
    # Restricción: Solo cuentas con rol Entrenador pueden acceder aquí
    if rol != "Entrenador":
        return jsonify({
            "msg": "Acceso no autorizado. Se requiere rol de Entrenador para crear rutinas."
        }), 403
        
    entrenador_id = get_jwt_identity()
    data = request.get_json()
    
    # Delegamos la responsabilidad y lógica compleja a la capa 'Logic'
    rutina_id, msg, status_code = crear_rutina_con_ejercicios(data, entrenador_id)
    
    if status_code != 201:
        return jsonify({"msg": msg}), status_code
        
    return jsonify({
        "msg": msg,
        "rutina_id": rutina_id
    }), status_code

@rutina_bp.route('/<int:rutina_id>', methods=['GET'])
@jwt_required()
def get_rutina(rutina_id):
    """
    Endpoint (RF03) para Obtener Rutina por ID.
    Cualquier rol lo puede obtener, pero podrías agregar capas de seguridad en la BD
    según el entrenador o cliente específico.
    """
    # Llamamos a nuestro controlador lógico
    rutina_data, msg, status_code = obtener_rutina_con_ejercicios(rutina_id)
    
    # En caso de error o no encontrar la rutina
    if status_code != 200:
        return jsonify({"msg": msg}), status_code
        
    return jsonify({
        "msg": msg,
        "data": rutina_data
    }), status_code

@rutina_bp.route('/<int:rutina_id>', methods=['PUT'])
@jwt_required()
def update_rutina(rutina_id):
    """
    Endpoint (RF04) para Modificar Rutina.
    Solo el entrenador que creó la rutina puede modificarla.
    Permite cambiar el nombre de la rutina y/o sus ejercicios.
    """
    claims = get_jwt()
    rol = claims.get("rol")
    
    # Restricción: Solo cuentas con rol Entrenador pueden acceder aquí
    if rol != "Entrenador":
        return jsonify({
            "msg": "Acceso no autorizado. Se requiere rol de Entrenador para modificar rutinas."
        }), 403
        
    entrenador_id = get_jwt_identity()
    data = request.get_json()
    
    # Llamamos a nuestro controlador lógico
    updated_rutina_id, msg, status_code = modificar_rutina(rutina_id, data, entrenador_id)
    
    if status_code != 200:
        return jsonify({"msg": msg}), status_code
        
    return jsonify({
        "msg": msg,
        "rutina_id": updated_rutina_id
    }), status_code

@rutina_bp.route('/', methods=['GET'])
@jwt_required()
def listar_rutinas():
    """
    Endpoint para Listar Rutinas del usuario actual.
    """
    claims = get_jwt()
    rol = claims.get("rol")
    usuario_id = get_jwt_identity()
    
    rutinas_data, msg, status_code = listar_rutinas_por_usuario(usuario_id, rol)
    
    if status_code != 200:
        return jsonify({"msg": msg}), status_code
        
    return jsonify({
        "msg": msg,
        "data": rutinas_data
    }), status_code

@rutina_bp.route('/<int:rutina_id>', methods=['DELETE'])
@jwt_required()
def delete_rutina(rutina_id):
    """
    Endpoint para Eliminar (Desactivar) una rutina.
    Solo el entrenador creador puede hacerlo.
    """
    claims = get_jwt()
    rol = claims.get("rol")
    
    if rol != "Entrenador":
        return jsonify({"msg": "Acceso no autorizado."}), 403
        
    entrenador_id = get_jwt_identity()
    
    deleted_id, msg, status_code = eliminar_rutina(rutina_id, entrenador_id)
    
    if status_code != 200:
        return jsonify({"msg": msg}), status_code
        
    return jsonify({
        "msg": msg,
        "rutina_id": deleted_id
    }), status_code
