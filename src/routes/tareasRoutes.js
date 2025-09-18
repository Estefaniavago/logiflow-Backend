const express = require("express");
const router = express.Router();
const tareasController = require("../controllers/tareasController");

// rutas
router.get("/", tareasController.listarTareas);


router.post("/", tareasController.crearTarea);
router.put("/:id", tareasController.editarTarea);
router.delete("/:id", tareasController.eliminarTarea);
router.get("/filtrar", tareasController.filtrarTareas);

// Obtener tarea por ID
router.get("/:id", tareasController.obtenerTarea);
module.exports = router;