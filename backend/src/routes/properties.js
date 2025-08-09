const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validate, validateQuery } = require('../utils/validation');
const { propertySchema, updatePropertySchema, propertyQuerySchema } = require('../utils/validation');
const {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  getUserProperties
} = require('../controllers/propertyController');

const router = express.Router();

// Public routes
router.get('/', validateQuery(propertyQuerySchema), getProperties);
router.get('/:id', getProperty);

// Protected routes
router.post('/', 
  authenticateToken, 
  requireRole(['AGENT', 'ADMIN']), 
  validate(propertySchema), 
  createProperty
);

router.put('/:id', 
  authenticateToken, 
  requireRole(['AGENT', 'ADMIN']), 
  validate(updatePropertySchema), 
  updateProperty
);

router.delete('/:id', 
  authenticateToken, 
  requireRole(['AGENT', 'ADMIN']), 
  deleteProperty
);

// User's properties
router.get('/user/my-properties', 
  authenticateToken, 
  requireRole(['AGENT', 'ADMIN']), 
  getUserProperties
);

module.exports = router;