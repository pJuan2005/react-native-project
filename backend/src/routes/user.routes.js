const express = require('express');
const router = express.Router();
const { getUser, updateUser, uploadAvatar } = require('../controllers/user.controller');
const upload = require('../web/middlewares/uploadBooking.middleware');

router.get('/users/:id', getUser);
router.put('/users/:id', updateUser);
router.post('/users/:id/avatar', upload.single('avatar'), uploadAvatar);

module.exports = router;

