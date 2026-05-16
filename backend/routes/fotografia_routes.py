from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from routes.auth_routes import require_active_payment
from Logic.fotografia_logic import subir_foto, obtener_galeria

fotografia_bp = Blueprint('fotografia_bp', __name__)

@fotografia_bp.route('/', methods=['POST'])
@jwt_required()
@require_active_payment()
def upload_photo():
    """
    Endpoint para subir la url/registro de una foto de progreso (RF04)
    """
    claims = get_jwt()
    if claims.get("rol") != "Cliente":
        return jsonify({"msg": "Solo un Cliente puede subir fotos"}), 403
        
    cliente_id = get_jwt_identity()
    data = request.get_json() or {}
    
    foto_id, msg, status = subir_foto(
        cliente_id=cliente_id,
        url_archivo=data.get("url_archivo"),
        notas=data.get("notas")
    )
    
    if status != 201:
        return jsonify({"msg": msg}), status
        
    return jsonify({"msg": msg, "foto_id": foto_id}), status

@fotografia_bp.route('/', methods=['GET'])
@jwt_required()
@require_active_payment()
def get_gallery():
    """
    Endpoint para obtener la comparativa física
    """
    claims = get_jwt()
    if claims.get("rol") != "Cliente":
        return jsonify({"msg": "Solo un Cliente puede acceder a su galería fotográfica"}), 403
        
    cliente_id = get_jwt_identity()
    datos, msg, status = obtener_galeria(cliente_id)
    
    if status != 200:
        return jsonify({"msg": msg}), status
        
    return jsonify({"msg": msg, "galeria": datos}), status
