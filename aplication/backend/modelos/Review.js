const mongoose = require("mongoose");

const estructuraReview = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },

    profesor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profesor",
      required: true,
    },

    asignatura: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asignatura",
      required: true,
    },

    puntuacion: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comentarios: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Un usuario solo puede tener una review por profesor.
// Puede borrarla y volver a crear otra, pero no tener varias a la vez.
estructuraReview.index(
  { usuario: 1, profesor: 1 },
  { unique: true }
);

module.exports = mongoose.model("Review", estructuraReview);