const Tarea = require("../models/tareasModel");
const Empleado = require("../models/empleadosModel");
const Area = require("../models/areaModel");


// Define los campos especificos que cada tipo de tarea necesita
const atributosPorTarea = {
  // Operaciones
  "Planificar ruta de entrega": [
    "origen",
    "destino",
    "fechaEntrega",
    "vehiculoAsignado",
    "comentarios",
  ],
  "Asignar transportista": [
    "transportistaId",
    "vehiculoAsignado",
    "fechaAsignacion",
    "rutaPlanificada",
    "comentarios",
  ],
  "Registrar incidencia en ruta": [
    "descripcionIncidencia",
    "ubicacionIncidencia",
    "fechaIncidencia",
    "impacto",
    "accionesTomadas",
    "estadoIncidencia",
  ],
  // Almacenes
  "Control de ingreso de mercaderia": [
    "productoId",
    "cantidad",
    "proveedor",
    "fechaIngreso",
    "almacenDestino",
    "observaciones",
  ],
  "Preparacion de pedido": [
    "pedidoId",
    "productos",
    "fechaPreparacion",
    "responsable",
    "estadoPreparacion",
    "comentarios",
  ],
  "Inventario ciclico": [
    "productoId",
    "cantidadRegistrada",
    "cantidadEsperada",
    "fechaConteo",
    "responsable",
    "diferencia",
    "observaciones",
  ],
};

// Listar tareas
const listarTareas = async (req, res) => {
  try {
    const tareas = await Tarea.find().populate("empleadoId", "nombre email");
    res.json(tareas);
  } catch (error) {
    console.error("Error en listarTareas:", error);
    res.status(500).json({ error: "No se pudieron leer las tareas" });
  }
};

// Crear tarea
const crearTarea = async (req, res) => {
  try {
    const {
      titulo,
      descripcion,
      areaId,
      empleadoId,
      prioridad,
      fechaVencimiento,
      tipoTarea,
      atributos,
    } = req.body;

    // Validación de campos obligatorios generales
    if (!titulo || !descripcion || !areaId || !prioridad || !tipoTarea) {
      return res.status(400).json({
        error:
          "Faltan datos obligatorios: titulo, descripcion, areaId, prioridad, tipoTarea",
      });
    }
    if (!atributosPorTarea[tipoTarea]) {
      return res
        .status(400)
        .json({ error: `Tipo de tarea no válido: ${tipoTarea}` });
    }
    // Validar atributos específicos según tipo de tarea
    const atributosNecesarios = atributosPorTarea[tipoTarea] || [];
    for (const attr of atributosNecesarios) {
      if (
        !atributos ||
        atributos[attr] === undefined ||
        atributos[attr] === null
      ) {
        return res.status(400).json({
          error: `Falta el atributo obligatorio para "${tipoTarea}": ${attr}`,
        });
      }
    }

    // Validar empleado que exista si se asigno
    let empleadoValido = null;
    if (empleadoId) {
      try {
        empleadoValido = await Empleado.findById(empleadoId);
        if (!empleadoValido)
          return res.status(400).json({ error: "Empleado asignado no existe" });
      } catch (e) {
        return res
          .status(400)
          .json({ error: "El ID de empleado no es válido" });
      }
    }

    // Validar área que exista
    const areaValida = await Area.findOne({ id: areaId });
    if (!areaValida)
      return res.status(400).json({ error: "El área especificada no existe" });

    // Crear la tarea (usando el modelo de Mongoose)
    const nuevaTarea = new Tarea({
      titulo,
      descripcion,
      areaId: parseInt(areaId),
      empleadoId: empleadoValido ? empleadoValido._id : null,
      prioridad,
      fechaVencimiento,
      tipoTarea,
      atributos: atributos || {},
    });

    await nuevaTarea.save();

    res
      .status(201)
      .json({ mensaje: "Tarea creada correctamente", tarea: nuevaTarea });
  } catch (error) {
    console.error("Error en crearTarea:", error);
    res.status(500).json({ error: "Error al crear la tarea" });
  }
};

// Editar tarea
const editarTarea = async (req, res) => {
  try {
    const tareaId = req.params.id; // _id de Mongo
    const datos = req.body;

    // --- INICIO DE VALIDACIÓN ---
    const tareaActual = await Tarea.findById(tareaId);
    if (!tareaActual) {
      return res.status(404).json({ error: "Tarea no encontrada" });
    }

    if (datos.empleadoId) {
      try {
        const empleadoValido = await Empleado.findById(datos.empleadoId);
        if (!empleadoValido) {
          return res.status(400).json({ error: "Empleado asignado no existe" });
        }
      } catch (e) {
        return res
          .status(400)
          .json({ error: "El ID de empleado no es válido" });
      }
    }

    if (datos.areaId) {
      const areaValida = await Area.findOne({ id: datos.areaId });
      if (!areaValida) {
        return res
          .status(400)
          .json({ error: "El área especificada no existe" });
      }
    }

    if (datos.tipoTarea || datos.atributos) {
      const tipoFinal = datos.tipoTarea || tareaActual.tipoTarea;
      const atributosFinales = datos.atributos || tareaActual.atributos;

      if (!atributosPorTarea[tipoFinal]) {
        return res
          .status(400)
          .json({ error: `Tipo de tarea no válido: ${tipoFinal}` });
      }

      const atributosNecesarios = atributosPorTarea[tipoFinal] || [];
      for (const attr of atributosNecesarios) {
        if (
          !atributosFinales ||
          atributosFinales[attr] === undefined ||
          atributosFinales[attr] === null
        ) {
          return res.status(400).json({
            error: `Falta el atributo obligatorio para "${tipoFinal}": ${attr}`,
          });
        }
      }
    }
    // --- FIN DE VALIDACIÓN ---

    // Excluir campos que no se deben actualizar
    delete datos.id;
    delete datos._id;
    delete datos.fechaCreacion;

    const tareaActualizada = await Tarea.findByIdAndUpdate(
      tareaId,
      { $set: datos },
      { new: true } // Devuelve el documento actualizado
    );

    res.json({
      mensaje: "Tarea actualizada correctamente",
      tarea: tareaActualizada,
    });
  } catch (error) {
    console.error("Error en editarTarea:", error);
    res.status(500).json({ error: error.message });
  }
};

// Eliminar tarea
const eliminarTarea = async (req, res) => {
  try {
    const tareaId = req.params.id;
    const tarea = await Tarea.findByIdAndDelete(tareaId);

    if (!tarea) return res.status(404).json({ error: "Tarea no encontrada" });
    res.json({ mensaje: "Tarea eliminada correctamente" });
  } catch (error) {
    console.error("Error en eliminarTarea:", error);
    res.status(500).json({ error: "Error al eliminar la tarea" });
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
      fechaFinalizacionHasta,
    } = req.query;

    let query = {};

    if (areaId) query.areaId = parseInt(areaId);
    if (estado) query.estado = estado.toLowerCase();
    if (prioridad) query.prioridad = prioridad.toLowerCase();

    // Filtros de fecha (Modo Mongoose)
    if (fechaCreacionDesde || fechaCreacionHasta) query.fechaCreacion = {};
    if (fechaCreacionDesde)
      query.fechaCreacion.$gte = new Date(fechaCreacionDesde);
    if (fechaCreacionHasta)
      query.fechaCreacion.$lte = new Date(fechaCreacionHasta);

    if (fechaVencimientoDesde || fechaVencimientoHasta)
      query.fechaVencimiento = {};
    if (fechaVencimientoDesde)
      query.fechaVencimiento.$gte = new Date(fechaVencimientoDesde);
    if (fechaVencimientoHasta)
      query.fechaVencimiento.$lte = new Date(fechaVencimientoHasta);

    if (fechaFinalizacionDesde || fechaFinalizacionHasta)
      query.fechaFinalizacion = {};
    if (fechaFinalizacionDesde)
      query.fechaFinalizacion.$gte = new Date(fechaFinalizacionDesde);
    if (fechaFinalizacionHasta)
      query.fechaFinalizacion.$lte = new Date(fechaFinalizacionHasta);

    const tareas = await Tarea.find(query);

    res.json(tareas);
  } catch (error) {
    console.error("Error filtrando tareas:", error);
    res.status(500).json({ error: "Error filtrando tareas" });
  }
};

// Obtener tarea por ID
const obtenerTarea = async (req, res) => {
  try {
    const tareaId = req.params.id;
    const tarea = await Tarea.findById(tareaId).populate(
      "empleadoId",
      "nombre email"
    );

    if (!tarea) return res.status(404).json({ error: "Tarea no encontrada" });
    res.json(tarea);
  } catch (error) {
    console.error("Error en obtenerTarea:", error);
    res.status(500).json({ error: "Error al obtener la tarea" });
  }
};

module.exports = {
  listarTareas,
  crearTarea,
  editarTarea,
  eliminarTarea,
  filtrarTareas,
  obtenerTarea,
};
