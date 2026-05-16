from models.models import Sesion
from models.database import db

def obtener_tendencia_peso(cliente_id):
    """
    Analiza el historial de pesos registrados del cliente para
    determinar su estado calórico/tendencia (RF05).
    """
    try:
        # Obtener todas las sesiones donde el peso fue registrado, ordenadas cronológicamente
        sesiones = Sesion.query.filter(
            Sesion.cliente_id == cliente_id,
            Sesion.peso_corporal_kg != None
        ).order_by(Sesion.fecha.asc()).all()

        if len(sesiones) < 2:
            return None, "Se requieren al menos 2 registros de peso en diferentes sesiones para generar un análisis", 400

        primer_peso = float(sesiones[0].peso_corporal_kg)
        ultimo_peso = float(sesiones[-1].peso_corporal_kg)
        diferencia = ultimo_peso - primer_peso

        # Lógica básica para tendencia
        if diferencia > 0.5:
             estado = "Superávit Calórico (Aumento de Masa)"
        elif diferencia < -0.5:
             estado = "Déficit Calórico (Pérdida de Peso)"
        else:
             estado = "Mantenimiento"

        historial = [{"fecha": s.fecha.isoformat(), "peso_kg": float(s.peso_corporal_kg)} for s in sesiones]

        resultado = {
             "estado_actual": estado,
             "peso_inicial": primer_peso,
             "peso_actual": ultimo_peso,
             "diferencia_total": round(diferencia, 2),
             "historial": historial
        }

        return resultado, "Análisis completado", 200

    except Exception as e:
        return None, f"Error calculando la tendencia: {str(e)}", 500
