const express = require('express');
const router = express.Router();
const { getUser, updateUser } = require('../controllers/users.controller');

router.get('/users/:id', getUser);
router.put('/users/:id', updateUser);

module.exports = router;
