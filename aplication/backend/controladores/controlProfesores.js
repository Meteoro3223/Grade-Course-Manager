const mongoose = require("mongoose");
const Profesor = require("../modelos/Profesor");

function idValido(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// Registrar profesores
exports.registrar = async (req, res) => {
  try {
    const { nombre, departamento } = req.body;

    if (!nombre || !departamento) {
      return res.status(400).json({
        message: "Faltan nombre o departamento.",
      });
    }

    let profesor = await Profesor.findOne({
      nombre: String(nombre).trim(),
      departamento: String(departamento).trim(),
    });

    if (!profesor) {
      profesor = await Profesor.create({
        nombre: String(nombre).trim(),
        departamento: String(departamento).trim(),
      });
    }

    res.json(profesor);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error al registrar el profesor.",
      error: error.message,
    });
  }
};

// Obtener todos los profesores
exports.obtenerProfesores = async (req, res) => {
  try {
    const profesores = await Profesor.find().sort({ nombre: 1 });
    res.json(profesores);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error al obtener los profesores.",
      error: error.message,
    });
  }
};

// Obtener profesor por id
exports.obtenerProfesorPorId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!idValido(id)) {
      return res.status(400).json({
        message: "Id de profesor no válido.",
      });
    }

    const profesor = await Profesor.findById(id);

    if (!profesor) {
      return res.status(404).json({
        message: "Profesor no encontrado.",
      });
    }

    res.json(profesor);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error al obtener el profesor.",
      error: error.message,
    });
  }
};

// Eliminar profesores
exports.eliminar = async (req, res) => {
  try {
    const { id } = req.params;

    if (!idValido(id)) {
      return res.status(400).json({
        message: "Id de profesor no válido.",
      });
    }

    const profesor = await Profesor.findByIdAndDelete(id);

    if (!profesor) {
      return res.status(404).json({
        message: "Profesor no encontrado.",
      });
    }

    res.json({
      message: "Profesor eliminado correctamente.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error al eliminar el profesor.",
      error: error.message,
    });
  }
};