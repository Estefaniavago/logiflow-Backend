const Usuario = require("../models/usuarioModel");
const { generarToken } = require("../middlewares/auth");

// Registrar nuevo usuario
const registrar = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    // Validaciones básicas
    if (!nombre || !email || !password) {
      return res.status(400).json({
        error: "Datos incompletos",
        mensaje: "Nombre, email y contraseña son obligatorios"
      });
    }

    // Verificar si el email ya existe
    const usuarioExistente = await Usuario.findOne({ email: email.toLowerCase() });
    if (usuarioExistente) {
      return res.status(409).json({
        error: "Email en uso",
        mensaje: "Ya existe un usuario con este email"
      });
    }

    // Crear nuevo usuario
    const nuevoUsuario = new Usuario({
      nombre,
      email: email.toLowerCase(),
      password,
      rol: rol || "usuario"
    });

    await nuevoUsuario.save();

    // Generar token
    const token = generarToken(nuevoUsuario._id);

    // Actualizar último acceso
    nuevoUsuario.ultimoAcceso = new Date();
    await nuevoUsuario.save();

    res.status(201).json({
      mensaje: "Usuario registrado correctamente",
      usuario: nuevoUsuario.toJSON(),
      token
    });
  } catch (error) {
    console.error("Error en registrar:", error);
    res.status(500).json({
      error: "Error al registrar usuario",
      mensaje: error.message
    });
  }
};

// Iniciar sesión
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validaciones
    if (!email || !password) {
      return res.status(400).json({
        error: "Datos incompletos",
        mensaje: "Email y contraseña son obligatorios"
      });
    }

    // Buscar usuario con password
    const usuario = await Usuario.findOne({ email: email.toLowerCase() }).select("+password");

    if (!usuario) {
      return res.status(401).json({
        error: "Credenciales inválidas",
        mensaje: "Email o contraseña incorrectos"
      });
    }

    // Verificar si el usuario está activo
    if (!usuario.activo) {
      return res.status(401).json({
        error: "Cuenta desactivada",
        mensaje: "Su cuenta ha sido desactivada. Contacte al administrador."
      });
    }

    // Verificar contraseña
    const passwordValida = await usuario.compararPassword(password);

    if (!passwordValida) {
      return res.status(401).json({
        error: "Credenciales inválidas",
        mensaje: "Email o contraseña incorrectos"
      });
    }

    // Generar token
    const token = generarToken(usuario._id);

    // Actualizar último acceso
    usuario.ultimoAcceso = new Date();
    await usuario.save();

    // Respuesta para API
    if (req.headers.accept && req.headers.accept.includes("application/json")) {
      return res.json({
        mensaje: "Inicio de sesión exitoso",
        usuario: usuario.toJSON(),
        token
      });
    }

    // Respuesta para vistas (establecer cookie y redirigir)
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
    });

    res.redirect("/");
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({
      error: "Error al iniciar sesión",
      mensaje: error.message
    });
  }
};

// Mostrar vista de logout (pantalla de despedida)
const mostrarLogout = async (req, res) => {
  // Intentar obtener el usuario antes de cerrar sesión
  let usuario = { nombre: "Usuario", email: "" };
  
  if (req.cookies?.token) {
    try {
      const jwt = require("jsonwebtoken");
      const Usuario = require("../models/usuarioModel");
      const { JWT_SECRET } = require("../middlewares/auth");
      
      const decoded = jwt.verify(req.cookies.token, JWT_SECRET);
      usuario = await Usuario.findById(decoded.id);
    } catch (error) {
      // Si hay error al obtener usuario, usar valores por defecto
      console.log("No se pudo obtener usuario para logout");
    }
  }
  
  // Cerrar sesión (limpiar cookie)
  res.clearCookie("token");
  
  // Mostrar pantalla de despedida
  res.render("logout", {
    usuario: usuario || { nombre: "Usuario", email: "" }
  });
};

// Cerrar sesión (para API)
const logout = (req, res) => {
  res.clearCookie("token");
  
  if (req.headers.accept && req.headers.accept.includes("application/json")) {
    return res.json({
      mensaje: "Sesión cerrada correctamente"
    });
  }

  res.redirect("/auth/login");
};

// Obtener usuario actual
const obtenerUsuarioActual = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario._id);
    res.json({
      usuario: usuario.toJSON()
    });
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener usuario",
      mensaje: error.message
    });
  }
};

// Mostrar vista de login
const mostrarLogin = (req, res) => {
  // Si ya está autenticado, redirigir al inicio
  if (req.cookies?.token) {
    return res.redirect("/");
  }
  res.render("login");
};

// Mostrar vista de registro
const mostrarRegistro = (req, res) => {
  // Si ya está autenticado, redirigir al inicio
  if (req.cookies?.token) {
    return res.redirect("/");
  }
  res.render("registro");
};

module.exports = {
  registrar,
  login,
  logout,
  obtenerUsuarioActual,
  mostrarLogin,
  mostrarRegistro,
  mostrarLogout
};

