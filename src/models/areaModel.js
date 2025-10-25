const mongoose = require("mongoose");
const AreaSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    nombre: { type: String, required: true },
  },
  { collection: "areas" }
);
module.exports = mongoose.model("Area", AreaSchema);
