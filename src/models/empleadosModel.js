//Importacioens
const fs = require("fs").promises;
const path = require("path");

// configuracion rutas
const dataPath = path.join(__dirname, "../../data/empleados.json");
const rolesPath = path.join(__dirname, "../../data/roles.json");
const areasPath = path.join(__dirname, "../../data/areas.json");

//Constructor de la clase Empleado
// define los atributos principales y asigna valores por defecto cuando no se proveen.
class Empleado {
  constructor({ id, nombre, dni, email, telefono, areaId, rolId, fechaIngreso, activo = true }) {
    this.id = id;
    this.nombre = nombre;
    this.dni = dni;
    this.email = email || null;
    this.telefono = telefono || null;
    this.areaId = areaId;
    this.rolId = rolId;
    this.fechaIngreso = fechaIngreso || new Date().toISOString().split('T')[0];
    this.activo = activo;
  }

  //para modificar los atributos de un empleado
  actualizar(datos) {
    Object.keys(datos).forEach(key => {
      if (key !== 'id' && key !== 'fechaIngreso') {
        this[key] = datos[key];
      }
    });
  }

  //obtneer todos los empleados
  static async obtenerTodas() {
    try {
      const data = await fs.readFile(dataPath, "utf8");
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  //guardar empleados
  static async guardarTodas(empleados) {
    await fs.writeFile(dataPath, JSON.stringify(empleados, null, 2));
  }

  //generar nuevo id unico para empleasos cargados
  static async generarId() {
    const empleados = await this.obtenerTodas();
    return empleados.length > 0 ? Math.max(...empleados.map(e => e.id)) + 1 : 1;
  }

  //Métodos para buscar empleados por ID, área o rol
  static async obtenerPorId(id) {
    const empleados = await this.obtenerTodas();
    return empleados.find(e => e.id === id);
  }

  static async obtenerPorArea(areaId) {
    const empleados = await this.obtenerTodas();
    return empleados.filter(e => e.areaId === areaId);
  }

  static async obtenerPorRol(rolId) {
    const empleados = await this.obtenerTodas();
    return empleados.filter(e => e.rolId === rolId);
  }

  //Obtiene todos los roles y áreas disponibles desde sus respectivos archivos JSON.
  static async obtenerRoles() {
    try {
      const data = await fs.readFile(rolesPath, "utf8");
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  static async obtenerAreas() {
    try {
      const data = await fs.readFile(areasPath, "utf8");
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  //metodos de validacion
  static async validarRol(rolId) {
    const roles = await this.obtenerRoles();
    return roles.find(r => r.id === rolId);
  }

  static async validarArea(areaId) {
    const areas = await this.obtenerAreas();
    return areas.find(a => a.id === areaId);
  }

  static async validarDniUnico(dni, excludeId = null) {
    const empleados = await this.obtenerTodas();
    return !empleados.find(e => e.dni === dni && e.id !== excludeId);
  }
}

module.exports = Empleado;
