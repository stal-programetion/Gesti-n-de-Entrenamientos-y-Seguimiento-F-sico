from models.models import FotoProgreso
from models.database import db
from datetime import datetime

def subir_foto(cliente_id, url_archivo, notas=None):
    """
    Simula la subida de una foto de progreso para el cliente (RF04).
    """
    try:
         if not url_archivo:
             return None, "Se requiere una URL o ruta del archivo de imagen", 400
             
         nueva_foto = FotoProgreso(
             cliente_id=cliente_id,
             url_archivo=url_archivo,
             fecha_subida=datetime.utcnow().date(),
             notas=notas
         )
         db.session.add(nueva_foto)
         db.session.commit()
         return nueva_foto.id, "Foto registrada con éxito", 201
         
    except Exception as e:
         db.session.rollback()
         return None, f"Error subiendo la foto: {str(e)}", 500

def obtener_galeria(cliente_id):
    """
    Obtiene la lista de fotos subidas por el cliente para comparar de forma cronológica.
    """
    try:
        fotos = FotoProgreso.query.filter_by(cliente_id=cliente_id).order_by(FotoProgreso.fecha_subida.asc()).all()
        resultado = []
        for f in fotos:
            resultado.append({
                "id": f.id,
                "url_archivo": f.url_archivo,
                "fecha_subida": f.fecha_subida.isoformat(),
                "notas": f.notas
            })
        return resultado, "Galería recuperada existosamente", 200
    except Exception as e:
        return None, f"Error obteniendo galería: {str(e)}", 500
