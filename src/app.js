const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const path = require("path");
const { validarDatos, manejarErrores } = require("./middlewares/logger");
const { autenticarVista } = require("./middlewares/auth");
const conectarDB = require("./config/db");

conectarDB();

// CONFIGURACIÓN PUG 

app.set('view engine', 'pug');

app.set('views', path.join(__dirname, 'views'));


app.set('json spaces', 2);

// Middlewares globales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(validarDatos);

// Rutas de autenticación (públicas)
const authRoutes = require("./routes/authRoutes");
app.use("/auth", authRoutes);

// Rutas API protegidas
const tareasRoutes = require("./routes/tareasRoutes");
const empleadosRoutes = require("./routes/empleadosRoutes");

app.use("/tareas", tareasRoutes);
app.use("/empleados", empleadosRoutes);

//  RUTAS PARA VISTAS (protegidas)
const viewsRoutes = require('./routes/viewsRoutes');
app.use("/vistas", autenticarVista, viewsRoutes);

// Ruta principal - Dashboard (protegida)
const viewsController = require('./controllers/viewsController');
app.get("/", autenticarVista, viewsController.mostrarInicio);

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
