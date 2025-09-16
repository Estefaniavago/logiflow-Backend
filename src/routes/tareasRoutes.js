const express = require('express');
const router = express.Router();
const { listarTareas } = require('../controllers/tareasController');

router.get('/', listarTareas);//corresponde al endpoint tareas

module.exports = router;
