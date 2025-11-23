const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UsuarioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
      minlength: [2, "El nombre debe tener al menos 2 caracteres"],
      maxlength: [50, "El nombre no puede exceder 50 caracteres"]
    },
    email: {
      type: String,
      required: [true, "El email es obligatorio"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Por favor ingrese un email válido"]
    },
    password: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
      minlength: [6, "La contraseña debe tener al menos 6 caracteres"],
      select: false // No incluir password por defecto en las consultas
    },
    rol: {
      type: String,
      enum: ["admin", "usuario", "supervisor"],
      default: "usuario"
    },
    activo: {
      type: Boolean,
      default: true
    },
    fechaCreacion: {
      type: Date,
      default: Date.now
    },
    ultimoAcceso: {
      type: Date
    }
  },
  { collection: "usuarios" }
);

// Hash de la contraseña antes de guardar
UsuarioSchema.pre("save", async function (next) {
  // Solo hashear si la contraseña fue modificada
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar contraseñas
UsuarioSchema.methods.compararPassword = async function (passwordIngresada) {
  return await bcrypt.compare(passwordIngresada, this.password);
};

// Método para obtener usuario sin password
UsuarioSchema.methods.toJSON = function () {
  const usuario = this.toObject();
  delete usuario.password;
  return usuario;
};

module.exports = mongoose.model("Usuario", UsuarioSchema);

