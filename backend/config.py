import os

class Config:
    # Clave secreta generada para sesiones de Flask y JWT (reemplazar en prod)
    SECRET_KEY = os.environ.get('SECRET_KEY', 'default-secret-key-cambiar-en-produccion')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key-cambiar-en-produccion')
    
    # Configuración de base de datos SQLite (para pruebas iniciales)
    # Preparado para PostgreSQL en el futuro: postgresql://usuario:password@localhost/nombre_db
    import os
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///' + os.path.join(BASE_DIR, 'fitness_app.db'))
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Token expira en 24 horas por defecto
    JWT_ACCESS_TOKEN_EXPIRES = 86400
