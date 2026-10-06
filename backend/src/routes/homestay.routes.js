const express = require('express');
const router = express.Router();
const { getHomestays, getHomestayById } = require('../controllers/homestay.controller');

// Standard /properties endpoints
router.get('/properties', getHomestays);
router.get('/properties/:id', getHomestayById);

// Backward compatible /homestays endpoints
router.get('/homestays', getHomestays);
router.get('/homestays/:id', getHomestayById);

module.exports = router;
