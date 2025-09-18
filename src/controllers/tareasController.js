//Importaciones
//Trae el modelo para manipular datos de las tareas

const Tarea = require("../models/tareasModel");
const fs = require("fs").promises;
const path = require("path");


//configuracion de rutas
const empleadosPath = path.join(__dirname, "../../data/empleados.json");
const areasPath = path.join(__dirname, "../../data/areas.json");

// Define los campos especificos que cada tipo de tarea necesita
//para validar al crear o editar tareas que no falte ningún dato obligatorio

const atributosPorTarea = {
  // Operaciones
  "Planificar ruta de entrega": ["origen", "destino", "fechaEntrega", "vehiculoAsignado", "comentarios"],
  "Asignar transportista": ["transportistaId", "vehiculoAsignado", "fechaAsignacion", "rutaPlanificada", "comentarios"],
  "Registrar incidencia en ruta": ["descripcionIncidencia", "ubicacionIncidencia", "fechaIncidencia", "impacto", "accionesTomadas", "estadoIncidencia"],
  // Almacenes
  "Control de ingreso de mercaderia": ["productoId", "cantidad", "proveedor", "fechaIngreso", "almacenDestino", "observaciones"],
  "Preparacion de pedido": ["pedidoId", "productos", "fechaPreparacion", "responsable", "estadoPreparacion", "comentarios"],
  "Inventario ciclico": ["productoId", "cantidadRegistrada", "cantidadEsperada", "fechaConteo", "responsable", "diferencia", "observaciones"]
};


// Listar tareas 

const listarTareas = async (req, res) => {
  try {
    const tareas = await Tarea.obtenerTodas(); // Obtiene todas las tareas del JSON
    res.json(tareas); // Devuelve el array de tareas
  } catch (error) {
    console.error("Error en listarTareas:", error);
    res.status(500).json({ error: "No se pudieron leer las tareas" });
  }
};

// Crear tarea

//recibe datos del usuario en body
const crearTarea = async (req, res) => {
  try {
    const { titulo, descripcion, areaId, empleadoId, prioridad, fechaVencimiento, tipoTarea, atributos } = req.body;

    
    // Validación de campos obligatorios generales
    if (!titulo || !descripcion || !areaId || !prioridad || !tipoTarea) {
      return res.status(400).json({ error: "Faltan datos obligatorios: titulo, descripcion, areaId, prioridad, tipoTarea" });
    }
if (!atributosPorTarea[tipoTarea]) {
  return res.status(400).json({ error: `Tipo de tarea no válido: ${tipoTarea}` });
}
    // Validar atributos específicos según tipo de tarea
    const atributosNecesarios = atributosPorTarea[tipoTarea] || [];
    for (const attr of atributosNecesarios) {
      if (!atributos || atributos[attr] === undefined || atributos[attr] === null) {
        return res.status(400).json({ error: `Falta el atributo obligatorio para "${tipoTarea}": ${attr}` });
      }
    }

    // Validar empleado que exista si se asigno
    let empleadoValido = null;
    if (empleadoId) {
      const empleadosData = await fs.readFile(empleadosPath, "utf8");
      const empleados = JSON.parse(empleadosData);
      empleadoValido = empleados.find(e => e.id === empleadoId);
      if (!empleadoValido) return res.status(400).json({ error: "Empleado asignado no existe" });
    }

    // Validar área que exista
    const areasData = await fs.readFile(areasPath, "utf8");
    const areas = JSON.parse(areasData);
    const areaValida = areas.find(a => a.id === areaId);
    if (!areaValida) return res.status(400).json({ error: "El área especificada no existe" });

    // Crear la tarea como instancia de la clase
    const nuevaTarea = new Tarea({
      id: await Tarea.generarId(),
      titulo,
      descripcion,
      areaId: parseInt(areaId),
      empleadoId: empleadoValido ? empleadoValido.id : null,
      prioridad,
      fechaVencimiento,
      tipoTarea,
      atributos: atributos || {}
    });

    //guarda la tarea, sobreescribe el json y la agrega
    const tareas = await Tarea.obtenerTodas();
    tareas.push(nuevaTarea);
    await Tarea.guardarTodas(tareas);

    res.status(201).json({ mensaje: "Tarea creada correctamente", tarea: nuevaTarea });

  } catch (error) {
    console.error("Error en crearTarea:", error);
    res.status(500).json({ error: "Error al crear la tarea" });
  }
};


// Editar tarea
const editarTarea = async (req, res) => {
  try {
    const tareaId = parseInt(req.params.id);
    const tareas = await Tarea.obtenerTodas();
    const tarea = tareas.find(t => t.id === tareaId);
    if (!tarea) return res.status(404).json({ error: "Tarea no encontrada" });

    const { empleadoId, areaId, tipoTarea, atributos } = req.body;

    // Validar empleado si se está cambiando
    if (empleadoId) {
      const empleadosData = await fs.readFile(empleadosPath, "utf8");
      const empleados = JSON.parse(empleadosData);
      const empleadoValido = empleados.find(e => e.id === empleadoId);
      if (!empleadoValido) return res.status(400).json({ error: "Empleado asignado no existe" });
    }

    // Validar área si se está cambiando
    if (areaId) {
      const areasData = await fs.readFile(areasPath, "utf8");
      const areas = JSON.parse(areasData);
      const areaValida = areas.find(a => a.id === areaId);
      if (!areaValida) return res.status(400).json({ error: "El área especificada no existe" });
    }

    // Validar atributos obligatorios según tipo de tarea
    const tipo = tipoTarea || tarea.tipoTarea; // usar el tipo actual si no se está cambiando
    const atributosNecesarios = atributosPorTarea[tipo] || [];
    for (const attr of atributosNecesarios) {
      if (!atributos || atributos[attr] === undefined || atributos[attr] === null) {
        return res.status(400).json({ error: `Falta el atributo obligatorio para "${tipo}": ${attr}` });
      }
    }

    // Actualizar tarea
    tarea.actualizar(req.body);
    await Tarea.guardarTodas(tareas);

    res.json({ mensaje: "Tarea actualizada correctamente", tarea });

  } catch (error) {
  console.error("Error en editarTarea:", error);
  res.status(500).json({ error: error.message });
}
  }

// Eliminar tarea
//lee todas las tareas, busca el inidce que coincida, si no existe error y si existe lo elimina
const eliminarTarea = async (req, res) => {
  try {
    const tareaId = parseInt(req.params.id);
    let tareas = await Tarea.obtenerTodas();
    const index = tareas.findIndex(t => t.id === tareaId);
    if (index === -1) return res.status(404).json({ error: "Tarea no encontrada" });

    tareas.splice(index, 1);
    await Tarea.guardarTodas(tareas);

    res.json({ mensaje: "Tarea eliminada correctamente" });
  } catch (error) {
    console.error("Error en eliminarTarea:", error);
    res.status(500).json({ error: "Error al eliminar la tarea" });
  }
};

// Funcion auxiliar para comparar fechas
// se utiliza al filtrar y apra no repetir codigo
const compararFechas = (fecha1, fecha2, operador) => {
  const date1 = new Date(fecha1);
  const date2 = new Date(fecha2);
  
  switch (operador) {
    case "=":
    case "==":
      return date1.getTime() === date2.getTime();
    case ">":
      return date1.getTime() > date2.getTime();
    case ">=":
      return date1.getTime() >= date2.getTime();
    case "<":
      return date1.getTime() < date2.getTime();
    case "<=":
      return date1.getTime() <= date2.getTime();
    default:
      return false;
  }
};

// Filtrar tareas 
const filtrarTareas = async (req, res) => {
  try {
    const { 
      areaId, 
      estado, 
      prioridad, 
      fechaCreacionDesde,
      fechaCreacionHasta,
      fechaVencimientoDesde,
      fechaVencimientoHasta,
      fechaFinalizacionDesde,
      fechaFinalizacionHasta
    
    } = req.query;
    
    let tareas = await Tarea.obtenerTodas();

    // Filtro por area
    if (areaId) {
      tareas = tareas.filter(t => t.areaId === parseInt(areaId));
    }

    // Filtro por estado
    if (estado) {
      const estadosValidos = ["pendiente", "en proceso", "finalizada"];
      const estadoFiltro = estado.toLowerCase();
      if (estadosValidos.includes(estadoFiltro)) {
        tareas = tareas.filter(t => t.estado.toLowerCase() === estadoFiltro);
      }
    }

    // Filtro por prioridad
    if (prioridad) {
      const prioridadesValidas = ["alta", "media", "baja"];
      const prioridadFiltro = prioridad.toLowerCase();
      if (prioridadesValidas.includes(prioridadFiltro)) {
        tareas = tareas.filter(t => t.prioridad.toLowerCase() === prioridadFiltro);
      }
    }

   // Filtros por fechas
    if (fechaCreacionDesde) tareas = tareas.filter(t => t.fechaCreacion && compararFechas(t.fechaCreacion, fechaCreacionDesde, ">="));
    if (fechaCreacionHasta) tareas = tareas.filter(t => t.fechaCreacion && compararFechas(t.fechaCreacion, fechaCreacionHasta, "<="));

    if (fechaVencimientoDesde) tareas = tareas.filter(t => t.fechaVencimiento && compararFechas(t.fechaVencimiento, fechaVencimientoDesde, ">="));
    if (fechaVencimientoHasta) tareas = tareas.filter(t => t.fechaVencimiento && compararFechas(t.fechaVencimiento, fechaVencimientoHasta, "<="));

    if (fechaFinalizacionDesde) tareas = tareas.filter(t => t.fechaFinalizacion && compararFechas(t.fechaFinalizacion, fechaFinalizacionDesde, ">="));
    if (fechaFinalizacionHasta) tareas = tareas.filter(t => t.fechaFinalizacion && compararFechas(t.fechaFinalizacion, fechaFinalizacionHasta, "<="));

    res.json(tareas);

  } catch (error) {
    console.error("Error filtrando tareas:", error);
    res.status(500).json({ error: "Error filtrando tareas" });
  }

    
};

// Obtener tarea por ID
const obtenerTarea = async (req, res) => {
  try {
    const tareaId = parseInt(req.params.id);
    const tareas = await Tarea.obtenerTodas();
    const tarea = tareas.find(t => t.id === tareaId);

    if (!tarea) {
      return res.status(404).json({ error: "Tarea no encontrada" });
    }

    res.json(tarea);
  } catch (error) {
    console.error("Error en obtenerTarea:", error);
    res.status(500).json({ error: "Error al obtener la tarea" });
  }
};


// exporta 
module.exports = { 
  listarTareas, 
  crearTarea, 
  editarTarea, 
  eliminarTarea, 
  filtrarTareas,
  obtenerTarea
};
