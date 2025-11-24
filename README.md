# LogiFlow - Backend

Backend del Sistema de Gestión Logística (LMS) para "LogiFlow", desarrollado como trabajo integrador para la materia de Desarrollo Web Backend.

<p align="left">
   <img src="https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js" alt="Node.js">
  <img src="https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express" alt="Express.js">
  <img src="https://img.shields.io/badge/MongoDB-4.x-47A248?style=for-the-badge&logo=mongodb" alt="MongoDB">
  <img src="https://img.shields.io/badge/Mongoose-6.x-880000?style=for-the-badge&logo=mongoose" alt="Mongoose">
  <img src="https://img.shields.io/badge/Docker-blue?style=for-the-badge&logo=docker" alt="Docker">
  <img src="https://img.shields.io/badge/Pug-A86454?style=for-the-badge&logo=pug" alt="Pug">
</p>

---

## 📝 Descripción

Este proyecto gestiona empleados, tareas, áreas y roles, proveyendo una arquitectura dual:

* **API REST:** Endpoints que devuelven JSON, listos para ser consumidos por un frontend (React, Vue, etc.).
* **Vistas SSR:** Páginas HTML renderizadas en el servidor con el motor de plantillas **Pug**, en respuesta a la devolución de la primera entrega.

  ## 🚀 Características Principales

* **CRUD completo** para Tareas y Empleados.
* **Gestión de entidades** relacionadas (Roles y Áreas).
* **Validación de datos** a nivel de Schema con Mongoose (ej. DNI único).
* **Filtrado avanzado** en la API por múltiples parámetros.
* **Poblado de relaciones** (`.populate()`) para mostrar datos de empleados en las tareas.

## 🔐 Seguridad y Autenticación

El sistema implementa un esquema robusto de seguridad que incluye:

* **Autenticación JWT:** Uso de **JSON Web Tokens** para firmar y validar sesiones de forma segura.
* **Control de Acceso (RBAC):** Autorización basada en roles (`admin`, `supervisor`, `usuario`) para restringir el acceso a endpoints sensibles.
* **Protección de Vistas:** Middleware específico (`autenticarVista`) que protege las rutas de interfaz y gestiona redirecciones automáticas al login.
* **Cookies Seguras:** Almacenamiento del token en cookies `httpOnly` para mitigar riesgos de seguridad en el navegador.

## 🛠️ Stack Tecnológico

* **Entorno:** Node.js
* **Framework:** Express.js
* **Base de Datos:** MongoDB (orquestada con Docker)
* **ODM:** Mongoose
* **Motor de Plantillas:** Pug

---

## ⚙️ Instalación y Ejecución

Guía paso a paso para levantar el proyecto en un entorno local.

### 1. Prerrequisitos

* [Node.js](https://nodejs.org/) (v18 o superior)
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Debe estar **en ejecución**)

### 2. Clonar y Preparar

1.  Clona el repositorio:
    ```bash
    git clone https://github.com/Estefaniavago/logiflow-Backend.git
    ```
2.  Navega al directorio del proyecto:
    ```bash
    cd logiflow-Backend
    ```
3.  Instala las dependencias de Node.js:
    ```bash
    npm install
    ```

### 3. Levantar la Base de Datos (Docker)

Ejecuta el siguiente comando para iniciar un contenedor de MongoDB.

```bash
docker run -d --name mongo-logiflow -p 27017:27017 -v logiflow-data:/data/db mongo

### 4. Migrar Datos Iniciales

Para poblar la base de datos con los datos de la carpeta `/data`, ejecuta el script de migración **una sola vez**:

```bash
node migracion.js
```
(Si falla, asegurar que Docker este corriendo (`docker ps`)).

### 5. Iniciar el Servidor

Inicia la aplicación en modo de desarrollo (con `nodemon`).

```bash
npm run dev
```

El servidor estará corriendo en `http://localhost:3000`.

## 📂 Estructura del Proyecto

El proyecto sigue una arquitectura MVC (Modelo-Vista-Controlador):

```
/src
├── config/
│   └── db.js           # Configuración y conexión de Mongoose
├── controllers/
│   ├── empleadosController.js  # Lógica de negocio para API de Empleados
│   ├── tareasController.js     # Lógica de negocio para API de Tareas
│   └── viewsController.js      # Lógica para renderizar vistas Pug
├── middlewares/
│   └── logger.js       # Middleware de validación y errores
├── models/
│   ├── empleadosModel.js   # Schema Mongoose para Empleados
│   ├── tareasModel.js      # Schema Mongoose para Tareas
│   ├── areaModel.js        # Schema Mongoose para Áreas
│   └── rolModel.js         # Schema Mongoose para Roles
├── routes/
│   ├── empleadosRoutes.js  # Endpoints de la API /empleados
│   ├── tareasRoutes.js     # Endpoints de la API /tareas
│   └── viewsRoutes.js      # Rutas para las vistas /vistas
├── views/
│   ├── listaEmpleados.pug  # Plantilla Pug para la lista de empleados
│   └── listaTareas.pug     # Plantilla Pug para la lista de tareas
└── app.js                # Archivo principal (Express)
/data/
│   └── *.json            # Datos para la migración
└── migracion.js          # Script para poblar la DB desde JSON
```

## 🔌 Endpoints Principales

### API (JSON)

#### Módulo de Empleados

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `GET` | `/empleados` | Lista todos los empleados. |
| `POST` | `/empleados` | Crea un nuevo empleado. |
| `GET` | `/empleados/:id` | Obtiene un empleado por ID. |
| `PUT` | `/empleados/:id` | Actualiza un empleado. |
| `DELETE` | `/empleados/:id` | Elimina un empleado. |
| `GET` | `/empleados/filtrar/buscar` | Filtra empleados (`?areaId=1`). |
| `GET` | `/empleados/roles/disponibles` | Obtiene la lista de roles. |
| `GET` | `/empleados/areas/disponibles` | Obtiene la lista de áreas. |

#### Módulo de Tareas

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `GET` | `/tareas` | Lista todas las tareas (con empleado "poblado"). |
| `POST` | `/tareas` | Crea una nueva tarea. |
| `GET` | `/tareas/:id` | Obtiene una tarea por ID. |
| `PUT` | `/tareas/:id` | Actualiza una tarea. |
| `DELETE` | `/tareas/:id` | Elimina una tarea. |
| `GET` | `/tareas/filtrar` | Filtra tareas (`?estado=pendiente`). |

### Vistas (HTML/Pug)

Rutas accesibles desde un navegador web:

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `GET` | `/vistas/empleados` | Muestra una tabla HTML con todos los empleados. |
| `GET` | `/vistas/tareas` | Muestra una tabla HTML con todas las tareas. |

## 👥 Devs

Proyecto desarrollado por:

*   **Estefanía Vago**: Desarrollo del Backend, Modelado de Datos, Implementación de Vistas (Pug)
*   **Vanesa Soria**: Desarrollo de Controladores, Pruebas de Endpoints y Migración a MongoDB.
