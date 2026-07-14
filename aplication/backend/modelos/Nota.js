const mongoose = require("mongoose");

const estructuraNota = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },

    asignatura: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asignatura",
      required: true,
    },

    evaluaciones: [
      {
        nombre: {
          type: String,
          required: true,
          trim: true,
        },
        porcentaje: {
          type: Number,
          required: true,
          min: 0,
          max: 100,
        },
        nota: {
          type: Number,
          default: null,
          min: 0,
          max: 10,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Una sola nota por usuario y asignatura
estructuraNota.index({ usuario: 1, asignatura: 1 }, { unique: true });

module.exports = mongoose.model("Nota", estructuraNota);