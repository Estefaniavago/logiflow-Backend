// Middleware para validación de datos en POST y PUT
const validarDatos = (req, res, next) => {
  if ((req.method === 'POST' || req.method === 'PUT') && (!req.body || Object.keys(req.body).length === 0)) {
    return res.status(400).json({ 
      error: "Datos requeridos", 
      mensaje: "El cuerpo de la petición no puede estar vacío" 
    });
  }
  next();
};

// Middleware de manejo de errores
const manejarErrores = (err, req, res, next) => {
  console.error('Error capturado:', err);

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ 
      error: "JSON inválido", 
      mensaje: "El formato JSON enviado no es válido" 
    });
  }

  res.status(500).json({ 
    error: "Error interno del servidor", 
    mensaje: "Ha ocurrido un error inesperado" 
  });
};

module.exports = {
  validarDatos,
  manejarErrores
};
