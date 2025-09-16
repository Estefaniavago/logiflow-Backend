
const { getTareas } = require('../models/tareasModel');


//listatareas maneja peticion y devuelve datos
async function listarTareas(req, res) {
  try {
    const tareas = await getTareas();
    res.json(tareas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { listarTareas };
