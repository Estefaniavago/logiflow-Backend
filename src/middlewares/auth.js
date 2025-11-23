const jwt = require("jsonwebtoken");
const Usuario = require("../models/usuarioModel");

// Clave secreta para JWT (en producción debe estar en variables de entorno)
const JWT_SECRET = process.env.JWT_SECRET || "logiflow_secret_key_2025";

// Middleware para verificar token JWT
const autenticar = async (req, res, next) => {
  try {
    // Obtener token del header Authorization
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      // También verificar en cookies (útil para vistas)
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        error: "No autorizado",
        mensaje: "Token de autenticación requerido. Por favor inicie sesión."
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Buscar usuario y verificar que existe y está activo
    const usuario = await Usuario.findById(decoded.id).select("+password");

    if (!usuario) {
      return res.status(401).json({
        error: "No autorizado",
        mensaje: "El usuario asociado a este token ya no existe."
      });
    }

    if (!usuario.activo) {
      return res.status(401).json({
        error: "No autorizado",
        mensaje: "Su cuenta ha sido desactivada."
      });
    }

    // Agregar usuario al request
    req.usuario = usuario;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: "Token inválido",
        mensaje: "El token de autenticación no es válido."
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Token expirado",
        mensaje: "Su sesión ha expirado. Por favor inicie sesión nuevamente."
      });
    }

    return res.status(500).json({
      error: "Error de autenticación",
      mensaje: "Error al verificar la autenticación."
    });
  }
};

// Middleware para verificar roles específicos
const autorizar = (...roles) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        error: "No autorizado",
        mensaje: "Debe estar autenticado para acceder a este recurso."
      });
    }

    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({
        error: "Acceso prohibido",
        mensaje: `No tiene permisos para realizar esta acción. Se requiere uno de los siguientes roles: ${roles.join(", ")}`
      });
    }

    next();
  };
};

// Middleware para vistas (redirige a login si no está autenticado)
const autenticarVista = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.redirect("/auth/login");
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const usuario = await Usuario.findById(decoded.id);

    if (!usuario || !usuario.activo) {
      res.clearCookie("token");
      return res.redirect("/auth/login");
    }

    // Convertir a objeto plano para evitar problemas con Pug
    req.usuario = usuario.toObject ? usuario.toObject() : usuario;
    next();
  } catch (error) {
    console.error("Error en autenticarVista:", error);
    res.clearCookie("token");
    return res.redirect("/auth/login");
  }
};

// Función para generar token JWT
const generarToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });
};

module.exports = {
  autenticar,
  autorizar,
  autenticarVista,
  generarToken,
  JWT_SECRET
};

