from werkzeug.security import check_password_hash, generate_password_hash
from flask_jwt_extended import create_access_token
from models.models import Usuario
from models.database import db


def authenticar_usuario(email, password):
    usuario = Usuario.query.filter_by(email=email).first()

    if not usuario or not check_password_hash(usuario.password_hash, password):
        return None, "Credenciales inválidas", 401
        
    if not usuario.activo:
        return None, "Su cuenta está suspendida o inactiva", 403

    estado_pago_val = usuario.estado_pago.value if usuario.estado_pago else None
    rol_val = usuario.rol.value if usuario.rol else "Cliente"

    claims_adicionales = {
        "rol": rol_val,
        "estado_pago": estado_pago_val
    }
    
    access_token = create_access_token(identity=str(usuario.id), additional_claims=claims_adicionales)
    
    user_data = {
        "id": usuario.id,
        "nombre": usuario.nombre,
        "email": usuario.email,
        "rol": rol_val,
        "estado_pago": estado_pago_val
    }
    
    return access_token, user_data, 200

def registrar_entrenador(data):
    data_requeridos = ['nombre', 'email', 'password']
    if not all(field in data for field in data_requeridos):
        return None, "Faltan campos requeridos: nombre, email, password", 400
        
    if Usuario.query.filter_by(email=data['email']).first():
        return None, "El email ya está registrado", 400
        
    nuevo_entrenador = Usuario(
        nombre=data['nombre'],
        email=data['email'],
        password_hash=generate_password_hash(data['password']),
        rol="Entrenador",
        estado_pago=None,
        activo=True
    )
    
    db.session.add(nuevo_entrenador)
    db.session.commit()
    
    return nuevo_entrenador.id, "Entrenador registrado exitosamente", 201