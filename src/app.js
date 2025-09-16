const express = require('express');
const app = express();
const PORT = 3000;

// Middleware para recibir JSON
app.use(express.json());

// Importar rutas
const tareasRoutes = require('./routes/tareasRoutes');
app.use('/tareas', tareasRoutes);

app.get('/', (req, res) => {
  res.send('Servidor Logiflow funcionando correctamente ');
});


app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
