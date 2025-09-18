const express = require("express");
const router = express.Router();
const empleadosController = require("../controllers/empleadosController");

// Rutas CRUD para empleados
router.get("/", empleadosController.listarEmpleados);
router.post("/", empleadosController.crearEmpleado);
router.get("/:id", empleadosController.obtenerEmpleado);
router.put("/:id", empleadosController.editarEmpleado);
router.delete("/:id", empleadosController.eliminarEmpleado);

// Rutas de filtrado y consultas
router.get("/filtrar/buscar", empleadosController.filtrarEmpleados);
router.get("/roles/disponibles", empleadosController.obtenerRoles);
router.get("/areas/disponibles", empleadosController.obtenerAreas);

module.exports = router;
