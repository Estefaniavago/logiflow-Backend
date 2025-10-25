const mongoose = require("mongoose");

const EmpleadoSchema = new mongoose.Schema({

  nombre: { type: String, required: true },
  dni: { type: String, required: true, unique: true }, 
  email: { type: String, sparse: true },
  telefono: { type: String },
  areaId: { type: Number, required: true }, 
  rolId: { type: Number, required: true },
  fechaIngreso: { type: Date, default: Date.now },
  activo: { type: Boolean, default: true },
});


module.exports = mongoose.model("Empleado", EmpleadoSchema);
