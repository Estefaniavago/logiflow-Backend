const mongoose = require("mongoose");
const { Schema } = mongoose;

const TareaSchema = new Schema({

  titulo: { type: String, required: true }, 
  descripcion: { type: String, required: true },
  areaId: { type: Number, required: true },
  tipoTarea: { type: String, required: true },


  empleadoId: { type: Schema.Types.ObjectId, ref: "Empleado", default: null },

  atributos: { type: Schema.Types.Mixed, default: {} },
  prioridad: { type: String, required: true, enum: ["baja", "media", "alta"] },
  estado: {
    type: String,
    default: "pendiente",
    enum: ["pendiente", "en proceso", "finalizada"],
  },

  fechaCreacion: { type: Date, default: Date.now },
  fechaAsignacion: { type: Date },
  fechaVencimiento: { type: Date },
  fechaFinalizacion: { type: Date },
});


module.exports = mongoose.model("Tarea", TareaSchema);
