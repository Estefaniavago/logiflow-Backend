const Empleado = require("../models/empleadosModel");
const Tarea = require("../models/tareasModel");
const Area = require("../models/areaModel");
const Rol = require("../models/rolModel");

// Muestra el dashboard/inicio
const mostrarInicio = async (req, res) => {
  try {
    // Obtener estadísticas generales
    const totalEmpleados = await Empleado.countDocuments();
    const empleadosActivos = await Empleado.countDocuments({ activo: true });
    const totalTareas = await Tarea.countDocuments();
    const tareasPendientes = await Tarea.countDocuments({ estado: 'pendiente' });
    const tareasEnProceso = await Tarea.countDocuments({ estado: 'en_proceso' });
    const tareasCompletadas = await Tarea.countDocuments({ estado: 'completada' });
    
    // Obtener tareas recientes
    const tareasRecientes = await Tarea.find()
      .populate("empleadoId", "nombre email")
      .sort({ fechaCreacion: -1 })
      .limit(5)
      .lean();
    
    // Obtener áreas para mostrar nombres
    const areas = await Area.find().lean();
    const areasMap = {};
    areas.forEach(area => { areasMap[area.id] = area.nombre; });
    
    // Agregar nombres de áreas a las tareas
    tareasRecientes.forEach(tarea => {
      tarea.areaNombre = areasMap[tarea.areaId] || `Área ${tarea.areaId}`;
    });
    
    res.render("inicio", {
      usuario: req.usuario,
      totalEmpleados,
      empleadosActivos,
      totalTareas,
      tareasPendientes,
      tareasEnProceso,
      tareasCompletadas,
      tareasRecientes
    });
  } catch (error) {
    console.error("Error al cargar vista de inicio:", error);
    res.status(500).send("Error al cargar la vista de inicio");
  }
};

// Muestra la vista de empleados
const mostrarEmpleados = async (req, res) => {
  try {
    // Verificar que el usuario esté disponible
    if (!req.usuario) {
      return res.redirect("/auth/login");
    }

    const empleados = await Empleado.find().lean();
    const areas = await Area.find().lean();
    const roles = await Rol.find().lean();

    // Crear mapas para búsqueda rápida
    const areasMap = {};
    const rolesMap = {};
    if (areas && areas.length > 0) {
      areas.forEach(area => { areasMap[area.id] = area.nombre; });
    }
    if (roles && roles.length > 0) {
      roles.forEach(rol => { rolesMap[rol.id] = rol.nombre; });
    }

    // Agregar nombres a los empleados
    if (empleados && empleados.length > 0) {
      empleados.forEach(emp => {
        emp.areaNombre = areasMap[emp.areaId] || `Área ${emp.areaId}`;
        emp.rolNombre = rolesMap[emp.rolId] || `Rol ${emp.rolId}`;
      });
    }

    res.render("listaEmpleados", { 
      usuario: req.usuario,
      empleados: empleados || [],
      areas: areas || [],
      roles: roles || [],
      totalEmpleados: empleados ? empleados.length : 0,
      empleadosActivos: empleados ? empleados.filter(e => e.activo).length : 0
    });
  } catch (error) {
    console.error("Error al cargar vista de empleados:", error);
    console.error("Stack trace:", error.stack);
    res.status(500).json({
      error: "Error interno del servidor",
      mensaje: error.message || "Ha ocurrido un error inesperado"
    });
  }
};

// Muestra la vista de tareas
const mostrarTareas = async (req, res) => {
  try {
    const tareas = await Tarea.find()
      .populate("empleadoId", "nombre email")
      .lean();
    const areas = await Area.find().lean();
    
    const empleados = await Empleado.find().lean(); // Para asignar empleado
    // Crear mapa de áreas
    const areasMap = {};
    areas.forEach((area) => {
      areasMap[area.id] = area.nombre;
    });

    // Agregar nombres de áreas a las tareas
    tareas.forEach((tarea) => {
      tarea.areaNombre = areasMap[tarea.areaId] || `Área ${tarea.areaId}`;
    });

    // Estadísticas
    const estadisticas = {
      total: tareas.length,
      pendientes: tareas.filter((t) => t.estado === "pendiente").length,
      enProceso: tareas.filter((t) => t.estado === "en_proceso").length,
      completadas: tareas.filter((t) => t.estado === "completada").length,
      alta: tareas.filter((t) => t.prioridad === "alta").length,
      media: tareas.filter((t) => t.prioridad === "media").length,
      baja: tareas.filter((t) => t.prioridad === "baja").length,
    };

    res.render("listaTareas", {
      usuario: req.usuario,
      tareas: tareas,
      estadisticas: estadisticas,
      areas: areas, //Enviamos areas a la vista
      empleados: empleados,
    });
  } catch (error) {
    console.error("Error al cargar vista de tareas:", error);
    res.status(500).send("Error al cargar la vista de tareas");
  }
};

module.exports = {
  mostrarInicio,
  mostrarEmpleados,
  mostrarTareas, 
};
