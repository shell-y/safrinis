const express = require("express");
const router = express.Router();

const sonoraController = require("../controllers/sonoraController");

router.get("/listar", function (req, res) {
    sonoraController.listar(req, res);
});

router.get("/listar/pais", function (req, res) {
    sonoraController.listarPais(req, res);
});

router.get("/listar/relacionados", function (req, res) {
    sonoraController.listar
});

router.post("/criar", function (req, res) {
    sonoraController.criar(req, res);
});

router.put("/editar", function (req, res) {
    sonoraController.editar(req, res);
});

router.delete("/deletar/:idArtista", function (req, res) {
    sonoraController.deletar(req, res);
});

module.exports = router;