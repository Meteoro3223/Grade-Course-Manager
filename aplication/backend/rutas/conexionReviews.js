const express = require("express");
const router = express.Router();
const controladorReviews = require("../controladores/controlReviews");

router.post("/registrar", controladorReviews.registrar);
router.get("/", controladorReviews.obtenerReviews);
router.get("/profesor/:id", controladorReviews.obtenerReviewsDeProfesor);
router.delete("/eliminar/:id", controladorReviews.eliminar);

module.exports = router;