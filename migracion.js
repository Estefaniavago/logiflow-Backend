/*
 * SCRIPT DE MIGRACIÓN ÚNICA
 * Lee los archivos JSON de /data y los inserta en MongoDB.
 */
const mongoose = require("mongoose");
const fs = require("fs").promises;
const path = require("path");

// Importa los NUEVOS modelos de Mongoose
const Empleado = require("./src/models/empleadosModel");
const Tarea = require("./src/models/tareasModel");
const Area = require("./src/models/areaModel");
const Rol = require("./src/models/rolModel");
const conectarDB = require("./src/config/db");

// Función principal de migración
const migrar = async () => {
  try {
    await conectarDB();
    console.log("Conectado a MongoDB para migración...");

    // --- Limpieza (Opcional: bueno para re-intentar la migración) ---
    console.log("Limpiando colecciones existentes...");
    await Empleado.deleteMany({});
    await Tarea.deleteMany({});
    await Area.deleteMany({});
    await Rol.deleteMany({});

    // --- 1. Migrar Áreas ---
    const areasData = await fs.readFile(
      path.join(__dirname, "./data/areas.json"),
      "utf8"
    );
    const areas = JSON.parse(areasData);
    await Area.insertMany(areas);
    console.log("Áreas migradas exitosamente.");

    // --- 2. Migrar Roles ---
    const rolesData = await fs.readFile(
      path.join(__dirname, "./data/roles.json"),
      "utf8"
    );
    const roles = JSON.parse(rolesData);
    await Rol.insertMany(roles);
    console.log("Roles migrados exitosamente.");

    // --- 3. Migrar Empleados ---
    const empleadosData = await fs.readFile(
      path.join(__dirname, "./data/empleados.json"),
      "utf8"
    );
    const empleadosJSON = JSON.parse(empleadosData);

    // Mapeo para guardar la relación entre el ID numérico antiguo y el nuevo _id de Mongo
    const mapaEmpleados = {};

    // Usamos un bucle en serie para guardar uno por uno y capturar el _id
    console.log("Migrando empleados...");
    for (const empJson of empleadosJSON) {
      const idAntiguo = empJson.id;

      // Creamos la nueva instancia de Mongoose (quitando el id antiguo)
      const nuevoEmpleado = new Empleado({
        nombre: empJson.nombre,
        dni: empJson.dni,
        email: empJson.email,
        telefono: empJson.telefono,
        areaId: empJson.areaId,
        rolId: empJson.rolId,
        fechaIngreso: new Date(empJson.fechaIngreso), // Convertir a Date
        activo: empJson.activo,
      });

      const empleadoGuardado = await nuevoEmpleado.save();

      // Guardamos la referencia
      mapaEmpleados[idAntiguo] = empleadoGuardado._id;
    }
    console.log("Empleados migrados exitosamente.");

    // --- 4. Migrar Tareas ---
    const tareasData = await fs.readFile(
      path.join(__dirname, "./data/tareas.json"),
      "utf8"
    );
    const tareasJSON = JSON.parse(tareasData);

    const tareasFormateadas = tareasJSON.map((tareaJson) => {
      const idEmpleadoAntiguo = tareaJson.empleadoId;
      const objectIdEmpleado = mapaEmpleados[idEmpleadoAntiguo] || null;

      
      delete tareaJson.id;

      return {
        ...tareaJson, 
        empleadoId: objectIdEmpleado, 
      };
    });

    await Tarea.insertMany(tareasFormateadas);
    console.log("Tareas migradas exitosamente.");

    console.log("\n¡MIGRACIÓN COMPLETADA!");
    process.exit(0); // Termina el script
  } catch (error) {
    console.error("ERROR DURANTE LA MIGRACIÓN:", error);
    process.exit(1);
  }
};

// Iniciar la migración
migrar();
