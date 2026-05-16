from flask import Blueprint, request, jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt
from functools import wraps
from Logic.auth_logic import authenticar_usuario, registrar_admin, registrar_entrenador, registrar_cliente, obtener_lista_clientes, actualizar_acceso_usuario

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"msg": "Email y contraseña son obligatorios"}), 400

    access_token, result, status_code = authenticar_usuario(data['email'], data['password'])
    
    if status_code != 200:
        return jsonify({"msg": result}), status_code
        
    return jsonify({
        "msg": "Autenticación exitosa",
        "access_token": access_token,
        "usuario": result
    }), 200

@auth_bp.route('/register/entrenador', methods=['POST'])
def register_entrenador_route():
    data = request.get_json()
    
    entrenador_id, msg, status_code = registrar_entrenador(data)
    
    if status_code != 201:
        return jsonify({"msg": msg}), status_code
        
    return jsonify({"msg": msg, "entrenador_id": entrenador_id}), status_code

@auth_bp.route('/register/cliente', methods=['POST'])
def register_cliente_route():
    data = request.get_json()
    
    cliente_id, msg, status_code = registrar_cliente(data)
    
    if status_code != 201:
        return jsonify({"msg": msg}), status_code
        
    return jsonify({"msg": msg, "cliente_id": cliente_id}), status_code

@auth_bp.route('/register/admin', methods=['POST'])
def register_admin_route():
    data = request.get_json()

    admin_id, msg, status_code = registrar_admin(data)

    if status_code != 201:
        return jsonify({"msg": msg}), status_code

    return jsonify({"msg": msg, "admin_id": admin_id}), status_code

@auth_bp.route('/clientes', methods=['GET'])
def get_clientes_route():
    include_inactive = request.args.get('include_inactive', '0') == '1'
    data, msg, status_code = obtener_lista_clientes(include_inactive=include_inactive)
    if status_code != 200:
        return jsonify({"msg": msg}), status_code
    return jsonify({"data": data}), status_code

@auth_bp.route('/usuarios/<int:usuario_id>/acceso', methods=['PATCH'])
def toggle_usuario_acceso_route(usuario_id):
    verify_jwt_in_request()
    claims = get_jwt()

    if claims.get("rol") != "Administrador":
        return jsonify({"msg": "Acceso denegado. Solo administradores pueden modificar el acceso"}), 403

    data = request.get_json() or {}
    if 'activo' not in data:
        return jsonify({"msg": "El campo 'activo' es obligatorio"}), 400

    usuario_data, msg, status_code = actualizar_acceso_usuario(usuario_id, data.get('activo'))
    if status_code != 200:
        return jsonify({"msg": msg}), status_code

    return jsonify({"msg": msg, "usuario": usuario_data}), status_code

def require_active_payment():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            
            rol = claims.get("rol")
            estado_pago = claims.get("estado_pago")
            
            if rol == "Cliente" and estado_pago == "mora":
                return jsonify({
                    "msg": "Acceso restringido. Su cuenta presenta un estado de mora en sus pagos. Por favor, regularice su situación."
                }), 403
                
            return fn(*args, **kwargs)
        return decorator
    return wrapper
