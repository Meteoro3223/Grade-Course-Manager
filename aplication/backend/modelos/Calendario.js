const mongoose = require("mongoose");

const estructuraCalendario = new mongoose.Schema({
    fecha: String,
    texto: String
});

module.exports = mongoose.model("Calendario", estructuraCalendario);