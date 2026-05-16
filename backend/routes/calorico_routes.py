from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from Logic.calorico_logic import obtener_tendencia_peso
from routes.auth_routes import require_active_payment

calorico_bp = Blueprint('calorico_bp', __name__)

@calorico_bp.route('/tendencia', methods=['GET'])
@jwt_required()
@require_active_payment()
def ver_tendencia_calorica():
    """
    Endpoint (RF05) para Control de Estado Calórico.
    """
    claims = get_jwt()
    if claims.get("rol") != "Cliente":
        return jsonify({"msg": "Solo un Cliente puede ver su análisis calórico individual"}), 403
        
    cliente_id = get_jwt_identity()
    datos, msg, status_code = obtener_tendencia_peso(cliente_id)
    
    if status_code != 200:
        return jsonify({"msg": msg}), status_code
        
    return jsonify({
        "msg": msg,
        "analisis": datos
    }), status_code
