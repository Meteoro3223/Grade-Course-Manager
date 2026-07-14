const express = require("express");
const router = express.Router();
const controladorProfesores = require("../controladores/controlProfesores");

router.post("/registrar", controladorProfesores.registrar);
router.get("/", controladorProfesores.obtenerProfesores);
router.get("/:id", controladorProfesores.obtenerProfesorPorId);
router.delete("/eliminar/:id", controladorProfesores.eliminar);

module.exports = router;