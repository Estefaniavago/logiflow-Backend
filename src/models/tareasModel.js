const fs = require('fs').promises;// para trabajar con promesas
const path = require('path');

const tareasFilePath = path.join(__dirname, '../../data/tareas.json');

// Leer todas las tareas
async function getTareas() {
  const data = await fs.readFile(tareasFilePath, 'utf-8');
  return JSON.parse(data);
}
// getTareas devuelve un arry con todas las tares del json
module.exports = { getTareas };
