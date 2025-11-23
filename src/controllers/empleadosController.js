const Empleado = require("../models/empleadosModel");
const Rol = require("../models/rolModel");
const Area = require("../models/areaModel");

// Helper para validar DNI 
const validarDniUnico = async (dni, excludeId = null) => {
  const query = { dni: dni };
  if (excludeId) {
    query._id = { $ne: excludeId }; 
  }
  const empleado = await Empleado.findOne(query);
  return !empleado; 
};

// Listar empleados
const listarEmpleados = async (req, res) => {
  try {
    
    const empleados = await Empleado.find(); 
    res.json(empleados);
  } catch (error) {
    console.error("Error en listarEmpleados:", error);
    res.status(500).json({ error: "No se pudieron leer los empleados" });
  }
};

// Crear empleado
const crearEmpleado = async (req, res) => {
  try {
    const { nombre, dni, email, telefono, areaId, rolId } = req.body;
    if (!nombre || !dni || !areaId || !rolId) {
      return res.status(400).json({ error: "Faltan datos obligatorios..." });
    }

    // Validar formato de DNI (exactamente 8 dígitos numéricos)
    if (!/^\d{8}$/.test(dni)) {
      return res.status(400).json({ error: "El DNI debe ser exactamente 8 dígitos numéricos" });
    }

    // Validación con Mongoose
    const dniUnico = await validarDniUnico(dni);
    if (!dniUnico) return res.status(400).json({ error: "El DNI ya está registrado" });

    
    const rolValido = await Rol.findOne({ id: rolId }); 
    if (!rolValido) return res.status(400).json({ error: "El rol especificado no existe" });

    
    const areaValida = await Area.findOne({ id: areaId }); 
    if (!areaValida) return res.status(400).json({ error: "El área especificada no existe" });

    const nuevoEmpleado = new Empleado({
     
      nombre,
      dni,
      email,
      telefono,
      areaId: parseInt(areaId),
      rolId: parseInt(rolId)
    });


    await nuevoEmpleado.save(); 

    res.status(201).json({ mensaje: "Empleado creado correctamente", empleado: nuevoEmpleado });
  } catch (error) {
    console.error("Error en crearEmpleado:", error);
     if (error.code === 11000) { // Error de DNI duplicado
       return res.status(400).json({ error: "El DNI ya está registrado" });
    }
    res.status(500).json({ error: "Error al crear el empleado" });
  }
};

// Editar empleado
const editarEmpleado = async (req, res) => {
  try {
    const empleadoId = req.params.id; // Este es el _id de Mongo
    const datos = req.body;

    // --- INICIO DE VALIDACIÓN (Completado) ---

    // 1. Validar DNI (si se está intentando cambiar)
    if (datos.dni) {
      // Validar formato de DNI (exactamente 8 dígitos numéricos)
      if (!/^\d{8}$/.test(datos.dni)) {
        return res.status(400).json({ error: "El DNI debe ser exactamente 8 dígitos numéricos" });
      }
      
      // Pasamos 'empleadoId' para que la validación ignore a este mismo empleado
      const dniUnico = await validarDniUnico(datos.dni, empleadoId);
      if (!dniUnico) {
        return res
          .status(400)
          .json({ error: "El DNI ya está registrado en otro empleado" });
      }
    }

    // 2. Validar Rol (si se está intentando cambiar)
    if (datos.rolId) {
      const rolValido = await Rol.findOne({ id: datos.rolId });
      if (!rolValido) {
        return res.status(400).json({ error: "El rol especificado no existe" });
      }
    }

    // 3. Validar Área (si se está intentando cambiar)
    if (datos.areaId) {
      const areaValida = await Area.findOne({ id: datos.areaId });
      if (!areaValida) {
        return res
          .status(400)
          .json({ error: "El área especificada no existe" });
      }
    }

    // --- FIN DE VALIDACIÓN ---

    // Excluir campos que no deberían actualizarse (por si acaso)
    delete datos.id;
    delete datos._id;
    delete datos.fechaIngreso; // La fecha de ingreso no se edita

    const empleado = await Empleado.findByIdAndUpdate(
      empleadoId,
      { $set: datos },
      { new: true } // Devuelve el documento actualizado
    );

    if (!empleado)
      return res.status(404).json({ error: "Empleado no encontrado" });

    res.json({ mensaje: "Empleado actualizado correctamente", empleado });
  } catch (error) {
    console.error("Error en editarEmpleado:", error);
    // Manejar error de DNI duplicado también en la edición
    if (error.code === 11000) {
      return res.status(400).json({ error: "El DNI ya está registrado" });
    }
    res.status(500).json({ error: "Error al editar el empleado" });
  }
};

// Eliminar empleado
const eliminarEmpleado = async (req, res) => {
  try {
    const empleadoId = req.params.id; 

    const empleado = await Empleado.findByIdAndDelete(empleadoId);

    if (!empleado) return res.status(404).json({ error: "Empleado no encontrado" });

    res.json({ mensaje: "Empleado eliminado correctamente" });
  } catch (error) {
    console.error("Error en eliminarEmpleado:", error);
    res.status(500).json({ error: "Error al eliminar el empleado" });
  }
};

// Obtener empleado por ID
const obtenerEmpleado = async (req, res) => {
  try {
    const empleadoId = req.params.id; 
    
    const empleado = await Empleado.findById(empleadoId); 

    if (!empleado) return res.status(404).json({ error: "Empleado no encontrado" });
    res.json(empleado);
  } catch (error) {
    console.error("Error en obtenerEmpleado:", error);
    res.status(500).json({ error: "Error al obtener el empleado" });
  }
};

// Filtrar empleados
const filtrarEmpleados = async (req, res) => {
  try {
    const { areaId, rolId, activo } = req.query;
    let query = {}; // Objeto de consulta de Mongoose

    if (areaId) query.areaId = parseInt(areaId);
    if (rolId) query.rolId = parseInt(rolId);
    if (activo !== undefined) query.activo = (activo === "true");

    const empleados = await Empleado.find(query);

    res.json(empleados);
  } catch (error) {
    console.error("Error en filtrarEmpleados:", error);
    res.status(500).json({ error: "Error filtrando empleados" });
  }
};

// Obtener roles y areas (ahora desde la DB)
const obtenerRoles = async (req, res) => {
  try {
    
    const roles = await Rol.find(); 
    res.json(roles);
  } catch (error) {
    console.error("Error en obtenerRoles:", error);
    res.status(500).json({ error: "Error al obtener los roles" });
  }
};

const obtenerAreas = async (req, res) => {
  try {
    
    const areas = await Area.find(); 
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