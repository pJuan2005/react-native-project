const express = require('express');
const router = express.Router();
const {
  getFavorites,
  toggleFavorite,
  removeFavorite,
} = require('../controllers/favorite.controller');

// Lấy danh sách yêu thích
router.get('/favorites', getFavorites);

// Bật / Tắt yêu thích một homestay (body: { homestayId })
router.post('/favorites/toggle', toggleFavorite);
router.post('/favorites', toggleFavorite);

// Xóa khỏi danh sách yêu thích
router.delete('/favorites/:homestayId', removeFavorite);

module.exports = router;
