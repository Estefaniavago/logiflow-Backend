const mongoose = require("mongoose");

const EmpleadoSchema = new mongoose.Schema({

  nombre: { type: String, required: true },
  dni: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: function(v) {
        return /^\d{8}$/.test(v);
      },
      message: 'El DNI debe ser exactamente 8 dígitos numéricos'
    }
  }, 
  email: { type: String, sparse: true },
  telefono: { type: String },
  areaId: { type: Number, required: true }, 
  rolId: { type: Number, required: true },
  fechaIngreso: { type: Date, default: Date.now },
  activo: { type: Boolean, default: true },
});


module.exports = mongoose.model("Empleado", EmpleadoSchema);
