from .database import db
import enum

class RolUsuario(enum.Enum):
    Administrador = "Administrador"
    Entrenador = "Entrenador"
    Cliente = "Cliente"

class EstadoPago(enum.Enum):
    al_dia = "al_dia"
    mora = "mora"

class EstadoGeneralPago(enum.Enum):
    pendiente = "pendiente"
    completado = "completado"
    fallido = "fallido"

class Usuario(db.Model):
    __tablename__ = 'usuarios'
    
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    rol = db.Column(db.Enum(RolUsuario), nullable=False)
    estado_pago = db.Column(db.Enum(EstadoPago), nullable=True) # Principalmente para clientes
    activo = db.Column(db.Boolean, default=True)

    # Relaciones (Foreign keys target)
    rutinas_creadas = db.relationship('Rutina', foreign_keys='Rutina.entrenador_id', backref='entrenador', lazy=True)
    rutinas_asignadas = db.relationship('Rutina', foreign_keys='Rutina.cliente_id', backref='cliente', lazy=True)
    sesiones = db.relationship('Sesion', backref='cliente', lazy=True)
    fotos = db.relationship('FotoProgreso', backref='cliente', lazy=True)
    pagos = db.relationship('Pago', backref='cliente', lazy=True)

class Rutina(db.Model):
    __tablename__ = 'rutinas'
    
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(150), nullable=False)
    entrenador_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=True)
    cliente_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    activa = db.Column(db.Boolean, default=True)

    # Relaciones
    ejercicios = db.relationship('Ejercicio', backref='rutina', lazy=True, cascade="all, delete-orphan")
    sesiones = db.relationship('Sesion', backref='rutina_diaria', lazy=True)

class Ejercicio(db.Model):
    __tablename__ = 'ejercicios'
    
    id = db.Column(db.Integer, primary_key=True)
    rutina_id = db.Column(db.Integer, db.ForeignKey('rutinas.id'), nullable=False)
    nombre = db.Column(db.String(150), nullable=False)
    series = db.Column(db.Integer, nullable=False)
    repeticiones = db.Column(db.Integer, nullable=False)
    peso_objetivo_kg = db.Column(db.Numeric(5, 2), nullable=True)

    registros = db.relationship('RegistroDesempeno', backref='ejercicio', lazy=True, cascade="all, delete-orphan")

class Sesion(db.Model):
    __tablename__ = 'sesiones'
    
    id = db.Column(db.Integer, primary_key=True)
    cliente_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    rutina_id = db.Column(db.Integer, db.ForeignKey('rutinas.id'), nullable=False)
    fecha = db.Column(db.Date, nullable=False)
    peso_corporal_kg = db.Column(db.Numeric(5, 2), nullable=True)

    registros = db.relationship('RegistroDesempeno', backref='sesion', lazy=True, cascade="all, delete-orphan")

class RegistroDesempeno(db.Model):
    __tablename__ = 'registros_desempeno'
    
    id = db.Column(db.Integer, primary_key=True)
    sesion_id = db.Column(db.Integer, db.ForeignKey('sesiones.id'), nullable=False)
    ejercicio_id = db.Column(db.Integer, db.ForeignKey('ejercicios.id'), nullable=False)
    peso_real_kg = db.Column(db.Numeric(5, 2), nullable=False)
    series_hechas = db.Column(db.Integer, nullable=False)

class FotoProgreso(db.Model):
    __tablename__ = 'fotos_progreso'
    
    id = db.Column(db.Integer, primary_key=True)
    cliente_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    url_imagen = db.Column(db.String(255), nullable=False)
    intervalo_dias = db.Column(db.Integer, nullable=True)
    fecha = db.Column(db.Date, nullable=False)

class Pago(db.Model):
    __tablename__ = 'pagos'
    
    id = db.Column(db.Integer, primary_key=True)
    cliente_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    monto = db.Column(db.Numeric(10, 2), nullable=False)
    estado = db.Column(db.Enum(EstadoGeneralPago), nullable=False)
    fecha_pago = db.Column(db.Date, nullable=False)
