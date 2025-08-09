const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const {
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  checkFavorite,
  getFavoriteStats
} = require('../controllers/favoriteController');

const router = express.Router();

// All favorite routes require authentication
router.use(authenticateToken);

// Get user's favorites
router.get('/', getFavorites);

// Get favorite statistics
router.get('/stats', getFavoriteStats);

// Check if property is favorite
router.get('/check/:propertyId', checkFavorite);

// Add to favorites
router.post('/', addToFavorites);

// Remove from favorites
router.delete('/:propertyId', removeFromFavorites);

module.exports = router;