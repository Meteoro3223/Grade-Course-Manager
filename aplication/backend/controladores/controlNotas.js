const mongoose = require("mongoose");
const Nota = require("../modelos/Nota");
const Asignatura = require("../modelos/Asignatura");
const Usuario = require("../modelos/Usuario");

function idValido(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function limpiarEvaluaciones(evaluaciones) {
  if (!Array.isArray(evaluaciones)) return [];

  return evaluaciones
    .map((e) => {
      const notaVacia =
        e.nota === "" || e.nota === null || e.nota === undefined;

      return {
        nombre: String(e.nombre || "").trim(),
        porcentaje: Number(e.porcentaje),
        nota: notaVacia ? null : Number(e.nota),
      };
    })
    .filter((e) => {
      const porcentajeValido =
        !Number.isNaN(e.porcentaje) &&
        e.porcentaje >= 0 &&
        e.porcentaje <= 100;

      const notaValida =
        e.nota === null ||
        (!Number.isNaN(e.nota) && e.nota >= 0 && e.nota <= 10);

      return e.nombre && porcentajeValido && notaValida;
    });
}

// Registrar o actualizar notas
exports.registrar = async (req, res) => {
  try {
    const { asignatura, usuario, evaluaciones } = req.body;

    if (!asignatura || !usuario) {
      return res.status(400).json({
        message: "Faltan asignatura o usuario.",
      });
    }

    let asignaturaEncontrada = null;

    if (idValido(asignatura)) {
      asignaturaEncontrada = await Asignatura.findById(asignatura);
    }

    if (!asignaturaEncontrada) {
      asignaturaEncontrada = await Asignatura.findOne({ nombre: asignatura });
    }

    if (!asignaturaEncontrada) {
      return res.status(404).json({
        message: "La asignatura no existe.",
      });
    }

    let usuarioEncontrado = null;

    if (idValido(usuario)) {
      usuarioEncontrado = await Usuario.findById(usuario);
    }

    if (!usuarioEncontrado) {
      usuarioEncontrado = await Usuario.findOne({ nombre: usuario });
    }

    if (!usuarioEncontrado) {
      return res.status(404).json({
        message: "El usuario no existe.",
      });
    }

    const evaluacionesLimpias = limpiarEvaluaciones(evaluaciones);

    if (!evaluacionesLimpias.length) {
      return res.status(400).json({
        message: "Debe haber al menos una evaluación válida.",
      });
    }

    const nota = await Nota.findOneAndUpdate(
      {
        asignatura: asignaturaEncontrada._id,
        usuario: usuarioEncontrado._id,
      },
      {
        $set: {
          asignatura: asignaturaEncontrada._id,
          usuario: usuarioEncontrado._id,
          evaluaciones: evaluacionesLimpias,
        },
      },
      {
        returnDocument: "after",
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    )
      .populate("usuario", "nombre")
      .populate("asignatura", "nombre codigo");

    res.json(nota);
  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Ya existe una nota para este usuario y esta asignatura.",
      });
    }

    res.status(500).json({
      message: "Error al registrar la nota.",
      error: error.message,
    });
  }
};

// Obtener todas las notas
exports.obtenerNotas = async (req, res) => {
  try {
    const notas = await Nota.find()
      .populate("usuario", "nombre")
      .populate("asignatura", "nombre codigo")
      .sort({ updatedAt: -1 });

    res.json(notas);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error al obtener las notas.",
      error: error.message,
    });
  }
};

// Obtener notas por asignatura
exports.obtenerNotasPorAsignatura = async (req, res) => {
  try {
    const { id } = req.params;

    if (!idValido(id)) {
      return res.status(400).json({
        message: "El id de la asignatura no es válido.",
      });
    }

    const notas = await Nota.find({ asignatura: id })
      .populate("usuario", "nombre")
      .populate("asignatura", "nombre codigo")
      .sort({ updatedAt: -1 });

    res.json(notas);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error al obtener las notas de la asignatura.",
      error: error.message,
    });
  }
};

// Eliminar notas
exports.eliminar = async (req, res) => {
  try {
    const { id } = req.params;

    if (!idValido(id)) {
      return res.status(400).json({
        message: "El id de la nota no es válido.",
      });
    }

    const nota = await Nota.findByIdAndDelete(id);

    if (!nota) {
      return res.status(404).json({
        message: "Nota no encontrada.",
      });
    }

    res.json({
      message: "Nota eliminada correctamente.",
      nota,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error al eliminar la nota.",
      error: error.message,
    });
  }
};