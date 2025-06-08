//ROUTES > controller > model > database

var express = require("express");
var router = express.Router();

var artistaController = require("../controllers/artistaController");

router.get("/listar", function (req, res) {
    artistaController.buscarArtistas(req, res);
})

router.get("/detalhes/:id", function (req, res) {
    artistaController.buscarDetalhes(req, res);
});

router.get("/relacionados/:id", function (req, res) {
  artistaController.listarRelacionados(req, res);
});

router.post("/salvarLineup", function (req, res) {
  artistaController.salvarLineup(req, res);
});

router.put("/renomearLineup", function (req, res) {
  artistaController.renomearLineup(req, res);
});

router.get("/lineups/:idUsuario", function (req, res) {
  artistaController.listarLineups(req, res);
});

router.get("/lineup/:idLineup", function (req, res) {
  artistaController.buscarLineupPorId(req, res);
});

router.delete("/lineup/:idLineup", function (req, res) {
  artistaController.excluirLineup(req, res);
});


module.exports = router;