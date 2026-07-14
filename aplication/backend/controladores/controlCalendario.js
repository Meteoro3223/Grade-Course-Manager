const mongoose = require("mongoose");
const Calendario = require("../modelos/Calendario");

function idValido(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// Registrar evento
exports.registrar = async (req, res) => {
  try {
    const { fecha, texto } = req.body;

    if (!fecha || !texto) {
      return res.status(400).json({
        message: "Faltan la fecha o el texto del evento.",
      });
    }

    const evento = await Calendario.create({
      fecha: String(fecha),
      texto: String(texto).trim(),
    });

    res.json(evento);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error al registrar el evento.",
      error: error.message,
    });
  }
};

// Obtener todos los eventos
exports.obtenerEventos = async (req, res) => {
  try {

    const eventos = await Calendario.find().sort({ fecha: 1 });

    res.json(eventos);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error al obtener los eventos.",
      error: error.message,
    });
  }
};

// Eliminar evento
exports.eliminar = async (req, res) => {
  try {

    const { id } = req.params;

    if (!idValido(id)) {
      return res.status(400).json({
        message: "Id de evento no válido.",
      });
    }

    const evento = await Calendario.findByIdAndDelete(id);

    if (!evento) {
      return res.status(404).json({
        message: "Evento no encontrado.",
      });
    }

    res.json({
      message: "Evento eliminado correctamente.",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error al eliminar el evento.",
      error: error.message,
    });
  }
};