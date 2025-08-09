const express = require('express');
const geocodingService = require('../services/geocodingService');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/geocoding/geocode:
 *   post:
 *     summary: Convert address to coordinates
 *     tags: [Geocoding]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               address:
 *                 type: string
 *                 description: Address to geocode
 *             required:
 *               - address
 *     responses:
 *       200:
 *         description: Address geocoded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     lat:
 *                       type: number
 *                     lng:
 *                       type: number
 *                     formattedAddress:
 *                       type: string
 *                     county:
 *                       type: string
 *                     city:
 *                       type: string
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
router.post('/geocode', async (req, res) => {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({
        success: false,
        error: 'Address is required'
      });
    }

    const result = await geocodingService.geocodeAddress(address);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Geocoding API error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to geocode address'
    });
  }
});

/**
 * @swagger
 * /api/geocoding/reverse:
 *   post:
 *     summary: Convert coordinates to address
 *     tags: [Geocoding]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lat:
 *                 type: number
 *                 description: Latitude
 *               lng:
 *                 type: number
 *                 description: Longitude
 *             required:
 *               - lat
 *               - lng
 *     responses:
 *       200:
 *         description: Coordinates reverse geocoded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     formattedAddress:
 *                       type: string
 *                     county:
 *                       type: string
 *                     city:
 *                       type: string
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
router.post('/reverse', async (req, res) => {
  try {
    const { lat, lng } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }

    const result = await geocodingService.reverseGeocode(lat, lng);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Reverse geocoding API error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to reverse geocode coordinates'
    });
  }
});

/**
 * @swagger
 * /api/geocoding/nearby:
 *   post:
 *     summary: Find nearby amenities
 *     tags: [Geocoding]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lat:
 *                 type: number
 *                 description: Latitude
 *               lng:
 *                 type: number
 *                 description: Longitude
 *               type:
 *                 type: string
 *                 description: Place type (restaurant, school, hospital, etc.)
 *               radius:
 *                 type: number
 *                 description: Search radius in meters
 *                 default: 5000
 *             required:
 *               - lat
 *               - lng
 *               - type
 *     responses:
 *       200:
 *         description: Nearby amenities found successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       rating:
 *                         type: number
 *                       priceLevel:
 *                         type: number
 *                       vicinity:
 *                         type: string
 *                       types:
 *                         type: array
 *                         items:
 *                           type: string
 *                       location:
 *                         type: object
 *                         properties:
 *                           lat:
 *                             type: number
 *                           lng:
 *                             type: number
 *                       distance:
 *                         type: number
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
router.post('/nearby', async (req, res) => {
  try {
    const { lat, lng, type, radius = 5000 } = req.body;

    if (!lat || !lng || !type) {
      return res.status(400).json({
        success: false,
        error: 'Latitude, longitude, and type are required'
      });
    }

    const result = await geocodingService.findNearbyAmenities(lat, lng, type, radius);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Nearby amenities API error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to find nearby amenities'
    });
  }
});

/**
 * @swagger
 * /api/geocoding/distance:
 *   post:
 *     summary: Calculate distance between two points
 *     tags: [Geocoding]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lat1:
 *                 type: number
 *                 description: First point latitude
 *               lng1:
 *                 type: number
 *                 description: First point longitude
 *               lat2:
 *                 type: number
 *                 description: Second point latitude
 *               lng2:
 *                 type: number
 *                 description: Second point longitude
 *             required:
 *               - lat1
 *               - lng1
 *               - lat2
 *               - lng2
 *     responses:
 *       200:
 *         description: Distance calculated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     distance:
 *                       type: number
 *                       description: Distance in kilometers
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
router.post('/distance', async (req, res) => {
  try {
    const { lat1, lng1, lat2, lng2 } = req.body;

    if (!lat1 || !lng1 || !lat2 || !lng2) {
      return res.status(400).json({
        success: false,
        error: 'All coordinates (lat1, lng1, lat2, lng2) are required'
      });
    }

    const distance = geocodingService.calculateDistance(lat1, lng1, lat2, lng2);

    res.json({
      success: true,
      data: { distance }
    });
  } catch (error) {
    console.error('Distance calculation API error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to calculate distance'
    });
  }
});

module.exports = router;