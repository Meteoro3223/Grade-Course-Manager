const express = require("express");
const router = express.Router();
const controladorNotas = require("../controladores/controlNotas");

router.post("/registrar", controladorNotas.registrar);
router.get("/", controladorNotas.obtenerNotas);
router.get("/asignatura/:id", controladorNotas.obtenerNotasPorAsignatura);
router.delete("/eliminar/:id", controladorNotas.eliminar);

module.exports = router;