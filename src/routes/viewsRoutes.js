const express = require("express");
const router = express.Router();
const viewsController = require("../controllers/viewsController");

router.get("/empleados", viewsController.mostrarEmpleados);
router.get("/tareas", viewsController.mostrarTareas);

module.exports = router;
