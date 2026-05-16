from models.models import Pago, Usuario, EstadoGeneralPago, EstadoPago
from models.database import db
from datetime import datetime

def registrar_pago(admin_id, cliente_id, monto):
    """
    Registra un pago para un Cliente y actualiza automáticamente su estado a 'al_dia'.
    RF06: Administración de Pagos.
    """
    try:
        if not cliente_id or not monto:
            return None, "Faltan datos obligatorios (cliente_id, monto)", 400

        cliente = Usuario.query.get(cliente_id)
        if not cliente or cliente.rol.value != "Cliente":
            return None, "El usuario indicado no es un Cliente", 404
        
        # 1. Crear el registro del Pago
        nuevo_pago = Pago(
            cliente_id=cliente_id,
            monto=monto,
            estado=EstadoGeneralPago.completado,
            fecha_pago=datetime.utcnow().date()
        )
        
        # 2. Actualizar el estado del Cliente para desbloquear su acceso (si estaba en mora)
        cliente.estado_pago = EstadoPago.al_dia
        
        db.session.add(nuevo_pago)
        db.session.commit()
        return nuevo_pago.id, "Pago registrado correctamente y cliente actualizado a estado 'al_dia'", 201
        
    except ValueError:
         return None, "El monto debe ser numérico", 400
    except Exception as e:
        db.session.rollback()
        return None, f"Error interno del servidor: {str(e)}", 500
