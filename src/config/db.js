const mongoose = require("mongoose");

const MONGO_URI = "mongodb://localhost:27017/logiflow";

const conectarDB = async () => {
    try {
      await mongoose.connect(MONGO_URI);
      console.log("MongoDB Conectado localmente");
    } catch (error) {
      console.error("Error conectando a MongoDB:", error.message);

      process.exit(1);
    }
};

module.exports = conectarDB;
