from flask import Flask, jsonify
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from sqlalchemy import text, inspect

from config import Config
from models.database import db
from routes.auth_routes import auth_bp
from routes.rutina_routes import rutina_bp
from routes.desempeno_routes import desempeno_bp
from routes.pago_routes import pago_bp
from routes.calorico_routes import calorico_bp
from routes.fotografia_routes import fotografia_bp


# ---------------------------------------------------------------------------
# Migración automática (sin Alembic)
# Detecta columnas/tablas obsoletas y migra el esquema sin perder datos.
# Patrón SQLite: RENAME → CREATE nueva → INSERT datos → DROP vieja
# ---------------------------------------------------------------------------

def _columnas_de(inspector, tabla: str) -> set:
    try:
        return {c["name"] for c in inspector.get_columns(tabla)}
    except Exception:
        return set()


def aplicar_migraciones(app):
    with app.app_context():
        insp = inspect(db.engine)
        tablas_existentes = set(insp.get_table_names())
        migraciones = []

        # ── 1. ejercicios: eliminar columna obsoleta 'repeticiones' NOT NULL ──
        # El nuevo modelo no la tiene; al ser NOT NULL bloquea cualquier INSERT.
        if "ejercicios" in tablas_existentes:
            cols_ej = _columnas_de(insp, "ejercicios")
            if "repeticiones" in cols_ej:
                migraciones += [
                    "ALTER TABLE ejercicios RENAME TO ejercicios_old",
                    """CREATE TABLE ejercicios (
                        id        INTEGER PRIMARY KEY,
                        rutina_id INTEGER NOT NULL REFERENCES rutinas(id),
                        nombre    TEXT NOT NULL,
                        series    INTEGER NOT NULL
                    )""",
                    """INSERT INTO ejercicios (id, rutina_id, nombre, series)
                       SELECT id, rutina_id, nombre, series FROM ejercicios_old""",
                    "DROP TABLE ejercicios_old",
                ]
                print("  Info: Detectada columna obsoleta 'repeticiones' en ejercicios - se recreara la tabla")

        # ── 2. registros_desempeno: migrar de (series_hechas) a (numero_serie, repeticiones_hechas) ──
        if "registros_desempeno" in tablas_existentes:
            cols_rd = _columnas_de(insp, "registros_desempeno")
            necesita_recrear      = "series_hechas" in cols_rd
            necesita_numero_serie = "numero_serie" not in cols_rd
            necesita_reps         = "repeticiones_hechas" not in cols_rd

            if necesita_recrear:
                migraciones += [
                    "ALTER TABLE registros_desempeno RENAME TO registros_desempeno_old",
                    """CREATE TABLE registros_desempeno (
                        id                  INTEGER PRIMARY KEY,
                        sesion_id           INTEGER NOT NULL REFERENCES sesiones(id),
                        ejercicio_id        INTEGER NOT NULL REFERENCES ejercicios(id),
                        numero_serie        INTEGER NOT NULL DEFAULT 1,
                        repeticiones_hechas INTEGER NOT NULL DEFAULT 0,
                        peso_real_kg        NUMERIC(5,2) NOT NULL
                    )""",
                    """INSERT INTO registros_desempeno
                           (id, sesion_id, ejercicio_id, numero_serie, repeticiones_hechas, peso_real_kg)
                       SELECT id, sesion_id, ejercicio_id, 1, series_hechas, peso_real_kg
                       FROM registros_desempeno_old""",
                    "DROP TABLE registros_desempeno_old",
                ]
                print("  Info: Detectada columna obsoleta 'series_hechas' - se recreara registros_desempeno")

            elif necesita_numero_serie or necesita_reps:
                if necesita_numero_serie:
                    migraciones.append(
                        "ALTER TABLE registros_desempeno ADD COLUMN numero_serie INTEGER NOT NULL DEFAULT 1"
                    )
                if necesita_reps:
                    migraciones.append(
                        "ALTER TABLE registros_desempeno ADD COLUMN repeticiones_hechas INTEGER NOT NULL DEFAULT 0"
                    )

        # ── Ejecutar todas las migraciones en una sola transaccion ───────────
        if migraciones:
            with db.engine.connect() as conn:
                for sql in migraciones:
                    try:
                        conn.execute(text(sql))
                        print(f"  OK: {sql.strip()[:80]}...")
                    except Exception as e:
                        print(f"  ERROR en migracion: {e}")
                conn.commit()

        # ── 3. Crear tablas nuevas que aun no existen (ej: series_objetivo) ──
        db.create_all()
        print(">> Modelos sincronizados con la Base de Datos")


# ---------------------------------------------------------------------------
# Factory
# ---------------------------------------------------------------------------

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    db.init_app(app)
    jwt = JWTManager(app)

    app.register_blueprint(auth_bp,       url_prefix='/api/auth')
    app.register_blueprint(rutina_bp,     url_prefix='/api/rutinas')
    app.register_blueprint(desempeno_bp,  url_prefix='/api/desempeno')
    app.register_blueprint(pago_bp,       url_prefix='/api/pagos')
    app.register_blueprint(calorico_bp,   url_prefix='/api/calorico')
    app.register_blueprint(fotografia_bp, url_prefix='/api/fotografia')

    @app.route('/')
    def health_check():
        return jsonify({
            "status": "success",
            "message": "Bienvenido a la API del Software de Gestion de Entrenamientos y Seguimiento Fisico"
        }), 200

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


# ---------------------------------------------------------------------------
# Ejecucion principal
# ---------------------------------------------------------------------------

if __name__ == '__main__':
    app = create_app()

    with app.app_context():
        # db.drop_all()  # Descomentar solo para reset completo local
        aplicar_migraciones(app)

  
    app.run(debug=True, host='0.0.0.0', port=5000)