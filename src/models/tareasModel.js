//Importaciones y configuración de la ruta
const fs = require("fs").promises;
const path = require("path");

// Ruta fija del archivo JSON de tareas
const dataPath = path.join(__dirname, "../../data/tareas.json");

// Clase Tarea y constructor
class Tarea {
  constructor({ id, descripcion, areaId, tipoTarea, empleadoId, atributos, prioridad, fechaAsignacion, estado = "pendiente" }) {
    this.id = id;
    this.descripcion = descripcion;
    this.areaId = areaId;
    this.tipoTarea = tipoTarea;
    this.empleadoId = empleadoId;
    this.atributos = atributos || {};
    this.prioridad = prioridad;
    this.fechaAsignacion = fechaAsignacion;
    this.estado = estado;
    this.fechaCreacion = new Date().toISOString().split('T')[0];
  }

  //Método de la clase tarea que permite actualizar atributos de una tarea existente
  //sin modificar el id ni la fecha de creación de la tarea
  actualizar(datos) {
    Object.keys(datos).forEach(key => {
      if (key !== 'id' && key !== 'fechaCreacion') {
        this[key] = datos[key];
      }
    });
  }

  //Métodos estáticos para interactuar con el archivo JSON

  //Obtiene todas las tareas
  static async obtenerTodas() {
  try {
    const data = await fs.readFile(dataPath, "utf8");
    const tareasArray = JSON.parse(data);
    // Convertir cada objeto en instancia de Tarea
    return tareasArray.map(t => new Tarea(t));
  } catch (error) {
    return [];
  }
}

  //Guarda todas las tareas en el archivo (JSON formateado)
  static async guardarTodas(tareas) {
    await fs.writeFile(dataPath, JSON.stringify(tareas, null, 2), "utf8");
  }

  //Genera un nuevo id único
  static async generarId() {
    const tareas = await this.obtenerTodas();
    return tareas.length > 0 ? Math.max(...tareas.map(t => t.id)) + 1 : 1;
  }

  //Busca una tarea por id
  static async obtenerPorId(id) {
    const tareas = await this.obtenerTodas();
    return tareas.find(t => t.id === id);
  }

 // Devuelve todas las tareas de un área especificada
static async obtenerPorArea(areaId) {
  const tareas = await this.obtenerTodas();
  return tareas.filter(t => t.areaId === parseInt(areaId));
}
}

//Exporta la clase
module.exports = Tarea;
