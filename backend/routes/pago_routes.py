from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from Logic.pago_logic import registrar_pago

pago_bp = Blueprint('pago_bp', __name__)

@pago_bp.route('/', methods=['POST'])
@jwt_required()
def register_pago():
    """
    Endpoint (RF06) para Registrar un Pago.
    Solo un usuario con rol 'Administrador' (o sistema) puede hacerlo.
    """
    claims = get_jwt()
    if claims.get("rol") != "Administrador":
         return jsonify({"msg": "Acceso denegado. Solo administradores pueden registrar pagos"}), 403
         
    admin_id = get_jwt_identity()
    data = request.get_json()
    
    pago_id, msg, status_code = registrar_pago(
        admin_id=admin_id,
        cliente_id=data.get('cliente_id'),
        monto=data.get('monto')
    )
    
    if status_code != 201:
        return jsonify({"msg": msg}), status_code
        
    return jsonify({
        "msg": msg,
        "pago_id": pago_id
    }), status_code
