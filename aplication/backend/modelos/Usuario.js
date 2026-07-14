const mongoose = require("mongoose");
const estructuraUsuario = new mongoose.Schema({
    nombre: String,
    contrasena: String
})

estructuraUsuario.index({ nombre: 1, contrasena: 1}, { unique: true });

module.exports = mongoose.model("Usuario", estructuraUsuario);