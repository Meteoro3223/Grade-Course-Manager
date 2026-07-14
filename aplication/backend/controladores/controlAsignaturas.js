const mongoose = require("mongoose");
const Asignatura = require("../modelos/Asignatura");
const Profesor = require("../modelos/Profesor");
const Usuario = require("../modelos/Usuario");

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

// Registrar asignatura
exports.registrar = async (req, res) => {
  try {
    const {
      nombre,
      codigo,
      curso,
      cuatrimestre,
      creditos,
      profesores = [],
      usuario,
    } = req.body;

    if (!nombre || !codigo || !usuario) {
      return res.status(400).json({
        message: "Faltan datos obligatorios de la asignatura o del usuario.",
      });
    }

    const usuarioEncontrado = await buscarUsuario(usuario);

    if (!usuarioEncontrado) {
      return res.status(404).json({
        message: "Usuario no encontrado.",
      });
    }

    const idsProfesores = [];

    for (const profesorData of profesores) {
      const nombreProfesor = String(profesorData.nombre || "").trim();
      const departamento = String(profesorData.departamento || "").trim();

      if (!nombreProfesor || !departamento) continue;

      let profesor = await Profesor.findOne({
        nombre: nombreProfesor,
        departamento,
      });

      if (!profesor) {
        profesor = await Profesor.create({
          nombre: nombreProfesor,
          departamento,
        });
      }

      idsProfesores.push(profesor._id);
    }

    const asignaturaExistente = await Asignatura.findOne({
      codigo: Number(codigo),
      usuario: usuarioEncontrado._id,
    });

    if (asignaturaExistente) {
      return res.status(409).json({
        message: "Ya tienes una asignatura con ese código.",
      });
    }

    const asignatura = await Asignatura.create({
      nombre: String(nombre).trim(),
      codigo: Number(codigo),
      curso: curso !== "" && curso !== undefined ? Number(curso) : undefined,
      cuatrimestre:
        cuatrimestre !== "" && cuatrimestre !== undefined
          ? Number(cuatrimestre)
          : undefined,
      creditos:
        creditos !== "" && creditos !== undefined ? Number(creditos) : undefined,
      usuario: usuarioEncontrado._id,
      profesores: idsProfesores,
    });

    const asignaturaPopulada = await Asignatura.findById(asignatura._id)
      .populate("profesores")
      .populate("usuario", "nombre");

    res.json(asignaturaPopulada);
  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Ya tienes una asignatura con ese código.",
      });
    }

    res.status(500).json({
      message: "Error al registrar la asignatura.",
      error: error.message,
    });
  }
};

// Obtener asignaturas del usuario
exports.obtenerAsignaturas = async (req, res) => {
  try {
    const { usuario } = req.query;

    const usuarioEncontrado = await buscarUsuario(usuario);

    if (!usuarioEncontrado) {
      return res.status(400).json({
        message: "Usuario no válido.",
      });
    }

    const asignaturas = await Asignatura.find({
      usuario: usuarioEncontrado._id,
    })
      .populate("profesores")
      .populate("usuario", "nombre")
      .sort({ createdAt: -1 });

    res.json(asignaturas);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error al obtener las asignaturas.",
      error: error.message,
    });
  }
};

// Obtener asignatura concreta del usuario por código
exports.obtenerAsignaturaPorCodigo = async (req, res) => {
  try {
    const { codigo } = req.params;
    const { usuario } = req.query;

    const usuarioEncontrado = await buscarUsuario(usuario);

    if (!usuarioEncontrado) {
      return res.status(400).json({
        message: "Usuario no válido.",
      });
    }

    const asignatura = await Asignatura.findOne({
      codigo: Number(codigo),
      usuario: usuarioEncontrado._id,
    })
      .populate("profesores")
      .populate("usuario", "nombre");

    if (!asignatura) {
      return res.status(404).json({
        message: "Asignatura no encontrada.",
      });
    }

    res.json(asignatura);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error al obtener la asignatura.",
      error: error.message,
    });
  }
};

// Eliminar asignatura
exports.eliminar = async (req, res) => {
  try {
    const { id } = req.params;
    const { usuario } = req.query;

    if (!idValido(id)) {
      return res.status(400).json({
        message: "Id de asignatura no válido.",
      });
    }

    const usuarioEncontrado = await buscarUsuario(usuario);

    if (!usuarioEncontrado) {
      return res.status(400).json({
        message: "Usuario no válido.",
      });
    }

    const asignatura = await Asignatura.findOneAndDelete({
      _id: id,
      usuario: usuarioEncontrado._id,
    });

    if (!asignatura) {
      return res.status(404).json({
        message: "Asignatura no encontrada.",
      });
    }

    res.json({
      message: "Asignatura eliminada correctamente.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error al eliminar la asignatura.",
      error: error.message,
    });
  }
};

// Actualizar profesores de una asignatura
exports.actualizarProfesores = async (req, res) => {
  try {
    const { id } = req.params;
    const { profesores, usuario } = req.body;

    if (!idValido(id)) {
      return res.status(400).json({
        message: "Id de asignatura no válido.",
      });
    }

    const usuarioEncontrado = await buscarUsuario(usuario);

    if (!usuarioEncontrado) {
      return res.status(400).json({
        message: "Usuario no válido.",
      });
    }

    const asignatura = await Asignatura.findOneAndUpdate(
      {
        _id: id,
        usuario: usuarioEncontrado._id,
      },
      {
        profesores,
      },
      {
        returnDocument: "after",
      }
    )
      .populate("profesores")
      .populate("usuario", "nombre");

    if (!asignatura) {
      return res.status(404).json({
        message: "Asignatura no encontrada.",
      });
    }

    res.json(asignatura);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error al actualizar profesores.",
      error: error.message,
    });
  }
};