const express = require("express");
const app = express();
const path = require("path");
const { validarDatos, manejarErrores } = require("./middlewares/logger");

app.set('json spaces', 2);

// Middlewares globales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(validarDatos);

// Rutas
const tareasRoutes = require("./routes/tareasRoutes");
const empleadosRoutes = require("./routes/empleadosRoutes");

app.use("/tareas", tareasRoutes);
app.use("/empleados", empleadosRoutes);

// Ruta principal
app.get("/", (req, res) => {
  res.json({
    mensaje: "Servidor LogiFlow funcionando correctamente",
    endpoints: {
      tareas: "/tareas",
      empleados: "/empleados"
    }
  });
});

// Middleware para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    error: "Ruta no encontrada",
    mensaje: `La ruta ${req.originalUrl} no existe`
  });
});

// Middleware de manejo de errores
app.use(manejarErrores);

// Servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
