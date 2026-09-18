const express = require('express');
const router = express.Router();
const { getLocations, getLocationById } = require('../controllers/location.controller');

router.get('/locations', getLocations);
router.get('/locations/:id', getLocationById);

module.exports = router;
