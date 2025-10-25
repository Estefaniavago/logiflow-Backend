const Empleado = require("../models/empleadosModel");
const Tarea = require("../models/tareasModel"); 

// Muestra la vista de empleados
const mostrarEmpleados = async (req, res) => {
  try {
    
    const empleados = await Empleado.find().lean();


    res.render("listaEmpleados", { empleados: empleados });
  } catch (error) {
    console.error("Error al cargar vista de empleados:", error);
    res.status(500).send("Error al cargar la vista de empleados");
  }
};

// Muestra la vista de tareas
const mostrarTareas = async (req, res) => {
  try {
    
    const tareas = await Tarea.find().populate("empleadoId", "nombre").lean();


    res.render("listaTareas", { tareas: tareas });
  } catch (error) {
    console.error("Error al cargar vista de tareas:", error);
    res.status(500).send("Error al cargar la vista de tareas");
  }
};

module.exports = {
  mostrarEmpleados,
  mostrarTareas, 
};
