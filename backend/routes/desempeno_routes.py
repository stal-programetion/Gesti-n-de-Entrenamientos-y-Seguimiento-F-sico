from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from Logic.desempeno_logic import registrar_sesion_completa, obtener_historial_desempeno
from routes.auth_routes import require_active_payment

desempeno_bp = Blueprint('desempeno_bp', __name__)

@desempeno_bp.route('/', methods=['POST'])
@jwt_required()
@require_active_payment()
def crear_registro_desempeno():
    """
    Endpoint (RF03) para Registrar Desempeño.
    El cliente envía la información de la sesión y los ejercicios completados.
    """
    claims = get_jwt()
    if claims.get("rol") != "Cliente":
        return jsonify({"msg": "Solo los Clientes pueden registrar su desempeño"}), 403

    cliente_id = get_jwt_identity()
    data = request.get_json()

    sesion_id, msg, status = registrar_sesion_completa(data, cliente_id)

    if status != 201:
        return jsonify({"msg": msg}), status

    return jsonify({"msg": msg, "sesion_id": sesion_id}), status

@desempeno_bp.route('/historial', methods=['GET'])
@jwt_required()
@require_active_payment()
def ver_historial():
    """
    Endpoint para ver todas las sesiones y el desempeño histórico del cliente.
    Puede filtrar por ?rutina_id=X en la query string.
    """
    claims = get_jwt()
    if claims.get("rol") != "Cliente":
        return jsonify({"msg": "Acceso restringido a rol Cliente"}), 403

    cliente_id = get_jwt_identity()
    rutina_id = request.args.get('rutina_id', type=int)

    historial, msg, status = obtener_historial_desempeno(cliente_id, rutina_id)

    if status != 200:
        return jsonify({"msg": msg}), status

    return jsonify({"msg": msg, "historial": historial}), status
