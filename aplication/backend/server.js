const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
mongoose.connect(process.env.MONGO_URI);

const app = express();

app.use(cors()); app.use(express.json());


mongoose.connect(process.env.MONGO_URI);

app.get("/", (req, res) => {
    res.send("Servidor funcionando");
});

app.listen(3000, () => {
    console.log("Servidor iniciado en puerto 3000");
});

//rutas
const conexionUsuarios = require("./rutas/conexionUsuarios");
const conexionAsignaturas = require("./rutas/conexionAsignaturas");
const conexionProfesores = require("./rutas/conexionProfesores");
const conexionNotas = require("./rutas/conexionNotas");
const conexionReviews = require("./rutas/conexionReviews");
const conexionGuias = require("./rutas/conexionGuias");
const conexionCalendario = require("./rutas/conexionCalendario");

app.use("/api/usuarios", conexionUsuarios);
app.use("/api/asignaturas", conexionAsignaturas);
app.use("/api/profesores", conexionProfesores);
app.use("/api/notas", conexionNotas);
app.use("/api/reviews", conexionReviews);   
app.use("/api/guias", conexionGuias);
app.use("/api/calendario", conexionCalendario);