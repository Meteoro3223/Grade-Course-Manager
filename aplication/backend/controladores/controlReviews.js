const mongoose = require("mongoose");
const Review = require("../modelos/Review");
const Profesor = require("../modelos/Profesor");
const Usuario = require("../modelos/Usuario");
const Asignatura = require("../modelos/Asignatura");

function idValido(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

async function buscarUsuario(usuario) {
  if (!usuario) return null;

  if (idValido(usuario)) {
    const usuarioPorId = await Usuario.findById(usuario);
    if (usuarioPorId) return usuarioPorId;
  }

  return await Usuario.findOne({ nombre: usuario });
}

// Registrar review.
// Solo permite una review por usuario y profesor.
// Si ya existe, devuelve error. Para cambiarla, el usuario debe borrarla primero.
exports.registrar = async (req, res) => {
  try {
    const { usuario, profesor, asignatura, puntuacion, comentarios } = req.body;

    const usuarioEncontrado = await buscarUsuario(usuario);

    if (!usuarioEncontrado) {
      return res.status(404).json({
        message: "El usuario no existe.",
      });
    }

    const profesorEncontrado = await Profesor.findOne({
      nombre: profesor?.nombre,
      departamento: profesor?.departamento,
    });

    if (!profesorEncontrado) {
      return res.status(404).json({
        message: "El profesor no existe.",
      });
    }

    // Comprobamos si este usuario ya tiene una review para este profesor.
    // No se permite actualizar directamente: primero tiene que eliminarla.
    const reviewExistente = await Review.findOne({
      usuario: usuarioEncontrado._id,
      profesor: profesorEncontrado._id,
    });

    if (reviewExistente) {
      return res.status(409).json({
        message:
          "Ya has dejado una review para este profesor. Elimínala antes de crear otra.",
      });
    }

    const filtroAsignatura = idValido(asignatura)
      ? { _id: asignatura }
      : { nombre: asignatura };

    // El usuario solo puede dejar review si la asignatura es suya
    // y esa asignatura tiene asignado este profesor.
    const asignaturaEncontrada = await Asignatura.findOne({
      ...filtroAsignatura,
      usuario: usuarioEncontrado._id,
      profesores: profesorEncontrado._id,
    });

    if (!asignaturaEncontrada) {
      return res.status(403).json({
        message:
          "Solo puedes dejar una review si tienes este profesor en una de tus asignaturas.",
      });
    }

    const review = await Review.create({
      usuario: usuarioEncontrado._id,
      profesor: profesorEncontrado._id,
      asignatura: asignaturaEncontrada._id,
      puntuacion: Number(puntuacion),
      comentarios: String(comentarios || "").trim(),
    });

    const reviewPopulada = await Review.findById(review._id)
      .populate("usuario", "nombre")
      .populate("profesor", "nombre departamento")
      .populate("asignatura", "nombre codigo");

    res.json(reviewPopulada);
  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "Ya has dejado una review para este profesor. Elimínala antes de crear otra.",
      });
    }

    res.status(500).json({
      message: "Error al registrar la review.",
      error: error.message,
    });
  }
};

// Obtener todas las reviews
exports.obtenerReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("usuario", "nombre")
      .populate("profesor", "nombre departamento")
      .populate("asignatura", "nombre codigo")
      .sort({ updatedAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error al obtener las reviews.",
      error: error.message,
    });
  }
};

// Obtener reviews de un profesor
exports.obtenerReviewsDeProfesor = async (req, res) => {
  try {
    const { id } = req.params;

    if (!idValido(id)) {
      return res.status(400).json({
        message: "Id de profesor no válido.",
      });
    }

    const reviews = await Review.find({ profesor: id })
      .populate("usuario", "nombre")
      .populate("profesor", "nombre departamento")
      .populate("asignatura", "nombre codigo")
      .sort({ updatedAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error al obtener las reviews del profesor.",
      error: error.message,
    });
  }
};

// Eliminar review.
// Solo permite borrar la review si pertenece al usuario que la solicita.
exports.eliminar = async (req, res) => {
  try {
    const { id } = req.params;
    const { usuario } = req.query;

    if (!idValido(id)) {
      return res.status(400).json({
        message: "Id de review no válido.",
      });
    }

    const usuarioEncontrado = await buscarUsuario(usuario);

    if (!usuarioEncontrado) {
      return res.status(400).json({
        message: "Usuario no válido.",
      });
    }

    const review = await Review.findOneAndDelete({
      _id: id,
      usuario: usuarioEncontrado._id,
    });

    if (!review) {
      return res.status(403).json({
        message: "No puedes eliminar reviews de otros usuarios.",
      });
    }

    res.json({
      message: "Review eliminada correctamente.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error al eliminar la review.",
      error: error.message,
    });
  }
};