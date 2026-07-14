const express = require("express");
const router = express.Router();

const controladorCalendario = require("../controladores/controlCalendario");

router.post("/registrar", controladorCalendario.registrar);

router.get("/", controladorCalendario.obtenerEventos);

router.delete("/eliminar/:id", controladorCalendario.eliminar);

module.exports = router;