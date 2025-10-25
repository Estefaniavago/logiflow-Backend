const mongoose = require("mongoose");
const RolSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    nombre: { type: String, required: true },
  },
  { collection: "roles" }
);
module.exports = mongoose.model("Rol", RolSchema);
