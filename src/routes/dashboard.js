var express = require("express");
var router = express.Router();

var dashboardController = require("../controllers/dashboardController");

router.post("/getKpi", function (req, res) {
    dashboardController.getKpi(req, res);
})

module.exports = router;