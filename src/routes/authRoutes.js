const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { autenticar } = require("../middlewares/auth");

// Rutas de autenticación (públicas)
router.get("/login", authController.mostrarLogin);
router.get("/registro", authController.mostrarRegistro);
router.get("/logout", authController.mostrarLogout);
router.post("/login", authController.login);
router.post("/registro", authController.registrar);
router.post("/logout", authController.logout);

// Ruta protegida - obtener usuario actual
router.get("/me", autenticar, authController.obtenerUsuarioActual);

module.exports = router;

