const express = require("express");
const router = express.Router();
const controladorAsignaturas = require("../controladores/controlAsignaturas");

router.post("/registrar", controladorAsignaturas.registrar);
router.get("/", controladorAsignaturas.obtenerAsignaturas);
router.get("/:codigo", controladorAsignaturas.obtenerAsignaturaPorCodigo);
router.delete("/eliminar/:id", controladorAsignaturas.eliminar);
router.patch("/actualizar/:id", controladorAsignaturas.actualizarProfesores);

module.exports = router;