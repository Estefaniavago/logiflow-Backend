const mongoose = require("mongoose");
const Usuario = require("../models/usuarioModel");
const conectarDB = require("../config/db");

const crearAdmin = async () => {
  try {
    conectarDB();
    
    // Esperar a que se conecte
    await new Promise(resolve => setTimeout(resolve, 2000));

    const email = process.argv[2] || "admin@logiflow.com";
    const password = process.argv[3] || "admin123";
    const nombre = process.argv[4] || "Administrador";

    // Verificar si ya existe
    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      console.log(`❌ Ya existe un usuario con el email: ${email}`);
      process.exit(1);
    }

    // Crear usuario administrador
    const admin = new Usuario({
      nombre,
      email,
      password,
      rol: "admin",
      activo: true
    });

    await admin.save();

    console.log("\n✅ Usuario administrador creado exitosamente:");
    console.log(`   Email: ${email}`);
    console.log(`   Contraseña: ${password}`);
    console.log(`   Rol: admin\n`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error al crear administrador:", error);
    process.exit(1);
  }
};

crearAdmin();

