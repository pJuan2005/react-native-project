var express = require("express");
var router = express.Router();

var property = require("../controllers/property.controller");

router.get("/", property.getAllProperties);

router.get("/:id/availability", property.getPropertyAvailability);

router.get("/:id/unavailable-dates", property.getPropertyUnavailableDates);

router.get("/:id", property.getPropertyById);

module.exports = router;
