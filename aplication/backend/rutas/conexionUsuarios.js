const express = require("express");
const router = express.Router();
const controladorUsuarios = require("../controladores/controlUsuarios");

router.post("/registrar", controladorUsuarios.registrar);
router.post("/login", controladorUsuarios.login);
router.get("/", controladorUsuarios.obtenerUsuarios);
router.delete("/eliminar/:id", controladorUsuarios.eliminar);

module.exports = router;