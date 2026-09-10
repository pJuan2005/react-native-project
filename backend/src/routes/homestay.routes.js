const express = require('express');
const router = express.Router();
const { getHomestays, getHomestayById } = require('../controllers/homestay.controller');

router.get('/homestays', getHomestays);
router.get('/homestays/:id', getHomestayById);

module.exports = router;
