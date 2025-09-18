const Empleado = require("../models/empleadosModel");

// Listar empleados
//obtiene empleados y los devuelve
const listarEmpleados = async (req, res) => {
  try {
    const empleados = await Empleado.obtenerTodas();
    res.json(empleados);
  } catch (error) {
    console.error("Error en listarEmpleados:", error);
    res.status(500).json({ error: "No se pudieron leer los empleados" });
  }
};

//Crea un nuevo empleado asegurando que los datos sean válidos y únicos
const crearEmpleado = async (req, res) => {
  try {
    const { nombre, dni, email, telefono, areaId, rolId } = req.body;

    if (!nombre || !dni || !areaId || !rolId) {
      return res.status(400).json({ error: "Faltan datos obligatorios: nombre, dni, areaId, rolId" });
    }

    const dniUnico = await Empleado.validarDniUnico(dni);
    if (!dniUnico) return res.status(400).json({ error: "El DNI ya está registrado" });

    const rolValido = await Empleado.validarRol(rolId);
    if (!rolValido) return res.status(400).json({ error: "El rol especificado no existe" });

    const areaValida = await Empleado.validarArea(areaId);
    if (!areaValida) return res.status(400).json({ error: "El área especificada no existe" });

    const nuevoEmpleado = new Empleado({
      id: await Empleado.generarId(),
      nombre,
      dni,
      email,
      telefono,
      areaId: parseInt(areaId),
      rolId: parseInt(rolId)
    });

    const empleados = await Empleado.obtenerTodas();
    empleados.push(nuevoEmpleado);
    await Empleado.guardarTodas(empleados);

    res.status(201).json({ mensaje: "Empleado creado correctamente", empleado: nuevoEmpleado });
  } catch (error) {
    console.error("Error en crearEmpleado:", error);
    res.status(500).json({ error: "Error al crear el empleado" });
  }
};

//Actualiza la información de un empleado existente en el json
const editarEmpleado = async (req, res) => {
  try {
    const empleadoId = parseInt(req.params.id);
    const empleados = await Empleado.obtenerTodas();
    const empleado = empleados.find(e => e.id === empleadoId);

    if (!empleado) return res.status(404).json({ error: "Empleado no encontrado" });

    Object.keys(req.body).forEach(key => {
      if (key !== 'id' && key !== 'fechaIngreso') {
        empleado[key] = req.body[key];
      }
    });

    await Empleado.guardarTodas(empleados);
    res.json({ mensaje: "Empleado actualizado correctamente", empleado });
  } catch (error) {
    console.error("Error en editarEmpleado:", error);
    res.status(500).json({ error: "Error al editar el empleado" });
  }
};


// Eliminar empleado
const eliminarEmpleado = async (req, res) => {
  try {
    const empleadoId = parseInt(req.params.id);
    let empleados = await Empleado.obtenerTodas();
    const index = empleados.findIndex(e => e.id === empleadoId);

    if (index === -1) return res.status(404).json({ error: "Empleado no encontrado" });

    empleados.splice(index, 1);
    await Empleado.guardarTodas(empleados);

    res.json({ mensaje: "Empleado eliminado correctamente" });
  } catch (error) {
    console.error("Error en eliminarEmpleado:", error);
    res.status(500).json({ error: "Error al eliminar el empleado" });
  }
};


// Obtener empleado por ID
const obtenerEmpleado = async (req, res) => {
  try {
    const empleadoId = parseInt(req.params.id);
    const empleado = await Empleado.obtenerPorId(empleadoId);

    if (!empleado) return res.status(404).json({ error: "Empleado no encontrado" });

    res.json(empleado);
  } catch (error) {
    console.error("Error en obtenerEmpleado:", error);
    res.status(500).json({ error: "Error al obtener el empleado" });
  }
};


// Filtra empleados según criterios recibidos
const filtrarEmpleados = async (req, res) => {
  try {
    const { areaId, rolId, activo } = req.query;
    let empleados = await Empleado.obtenerTodas();

    if (areaId) empleados = empleados.filter(e => e.areaId === parseInt(areaId));
    if (rolId) empleados = empleados.filter(e => e.rolId === parseInt(rolId));
    if (activo !== undefined) empleados = empleados.filter(e => e.activo === (activo === "true"));

    res.json(empleados);
  } catch (error) {
    console.error("Error en filtrarEmpleados:", error);
    res.status(500).json({ error: "Error filtrando empleados" });
  }
};

// Obtener roles y areas disponibles
const obtenerRoles = async (req, res) => {
  try {
    const roles = await Empleado.obtenerRoles();
    res.json(roles);
  } catch (error) {
    console.error("Error en obtenerRoles:", error);
    res.status(500).json({ error: "Error al obtener los roles" });
  }
};

const obtenerAreas = async (req, res) => {
  try {
    const areas = await Empleado.obtenerAreas();
    res.json(areas);
  } catch (error) {
    console.error("Error en obtenerAreas:", error);
    res.status(500).json({ error: "Error al obtener las áreas" });
  }
};
module.exports = { 
  listarEmpleados, 
  crearEmpleado, 
  editarEmpleado, 
  eliminarEmpleado, 
  obtenerEmpleado,
  filtrarEmpleados,
  obtenerRoles,
  obtenerAreas
};
