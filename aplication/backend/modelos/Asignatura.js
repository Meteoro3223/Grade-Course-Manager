const mongoose = require("mongoose");

const estructuraAsignatura = new mongoose.Schema(
  {
    codigo: {
      type: Number,
      required: true,
    },

    nombre: {
      type: String,
      required: true,
      trim: true,
    },

    curso: Number,
    cuatrimestre: Number,
    creditos: Number,

    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
      index: true,
    },

    profesores: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Profesor",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Una misma cuenta no puede tener dos veces la misma asignatura.
// Pero otro usuario sí puede tener el mismo código.
estructuraAsignatura.index({ usuario: 1, codigo: 1 }, { unique: true });

module.exports = mongoose.model("Asignatura", estructuraAsignatura);