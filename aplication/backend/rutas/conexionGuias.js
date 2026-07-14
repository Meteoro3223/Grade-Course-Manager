const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const parsearGuiaDocente = require("../scripts/parseadorDocente");

const router = express.Router();

const carpetaUploads = path.join(__dirname, "..", "uploads");

fs.mkdirSync(carpetaUploads, { recursive: true });

const upload = multer({
  dest: carpetaUploads,
});

// divide la evaluacion en filas individuales
function procesarEvaluacion(evaluacion) {
  const resultado = [];

  // recorre cada tipo de evaluacion
  for (const item of evaluacion) {
    const pesoPorActa = item.peso / item.actas;

    // crea una fila por cada acta
    for (let i = 1; i <= item.actas; i++) {
      resultado.push({
        descripcion: `${item.descripcion} ${i}`,
        acta: i,
        peso: pesoPorActa,
      });
    }
  }

  return resultado;
}

// recibe un pdf, lo procesa y devuelve la evaluacion
router.post("/procesar", upload.single("guia"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ mensaje: "no se ha subido ningun archivo" });
  }

  try {
    const evaluacion = await parsearGuiaDocente(req.file.path);
    const evaluacionProcesada = procesarEvaluacion(evaluacion);

    res.json(evaluacionProcesada);
  } catch (error) {
    res.status(500).json({
      mensaje: "error procesando la guia docente",
      error: error.message,
    });
  } finally {
    fs.unlink(req.file.path, () => {});
  }
});

module.exports = router;