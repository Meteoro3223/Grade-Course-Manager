const mongoose = require("mongoose");
const estructuraProfesorado = new mongoose.Schema({
    nombre: String,
    departamento: String
})

estructuraProfesorado.index({ nombre: 1, departamento: 1 }, { unique: true });

module.exports = mongoose.model("Profesor", estructuraProfesorado);