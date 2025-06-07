var express = require("express");
var router = express.Router();

var dashboardController = require("../controllers/dashboardController");

router.post("/getKpi", function (req, res) {
    dashboardController.getKpi(req, res);
});

router.post("/getArtistaRelacionado", function (req, res) {
    dashboardController.getArtistaRelacionado(req, res);
});

router.post("/getPlays", function (req, res) {
    dashboardController.getPlays(req, res);
});

router.post("/compararArtistas", function (req, res) {
    dashboardController.compararArtistas(req, res);
});

module.exports = router;