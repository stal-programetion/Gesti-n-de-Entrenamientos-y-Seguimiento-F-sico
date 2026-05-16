from flask import Flask, jsonify
from flask_jwt_extended import JWTManager
from flask_cors import CORS

# Importaciones locales (modulares)
from config import Config
from models.database import db
from routes.auth_routes import auth_bp
from routes.rutina_routes import rutina_bp
from routes.desempeno_routes import desempeno_bp
from routes.pago_routes import pago_bp
from routes.calorico_routes import calorico_bp
from routes.fotografia_routes import fotografia_bp

def create_app(config_class=Config):
    
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Configuración de CORS vital para que React se conecte
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    # Inicializar las extensiones con la app
    db.init_app(app)
    jwt = JWTManager(app)

    # Registrar los Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(rutina_bp, url_prefix='/api/rutinas')
    app.register_blueprint(desempeno_bp, url_prefix='/api/desempeno')
    app.register_blueprint(pago_bp, url_prefix='/api/pagos')
    app.register_blueprint(calorico_bp, url_prefix='/api/calorico')
    app.register_blueprint(fotografia_bp, url_prefix='/api/fotografia')
    def health_check():
        return jsonify({
            "status": "success", 
            "message": "Bienvenido a la API del Software de Gestión de Entrenamientos y Seguimiento Físico"
        }), 200

    # Funciones que queremos registrar en `flask_jwt_extended` para un mejor manejo de errores (opcional)
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({
            "description": "El requerimiento no contiene el token de acceso.",
            "error": "authorization_required"
        }), 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({
            "description": "El token ha expirado.",
            "error": "token_expired"
        }), 401
    
    return app

# Bloque de ejecución principal
if __name__ == '__main__':
    app = create_app()
    
    # Crear la base de datos y sus tablas automáticamente (si no existen)
    # * Se sugiere usar flask-migrate (Alembic) cuando el proyecto escale a Producción.
    with app.app_context():
        # db.drop_all() # Descomentar para hacer reset completo localmente
        db.create_all()
        print(">> Modelos sincronizados con la Base de Datos")

    # Iniciar el servidor localmente en el puerto 5000
    app.run(debug=True, host='0.0.0.0', port=5000)
