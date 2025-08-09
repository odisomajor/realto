const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validate } = require('../utils/validation');
const { inquirySchema } = require('../utils/validation');
const {
  createInquiry,
  getInquiries,
  getInquiry,
  updateInquiryStatus,
  deleteInquiry,
  getUserInquiries
} = require('../controllers/inquiryController');

const router = express.Router();

// Public/Protected routes (can be used by both authenticated and non-authenticated users)
router.post('/', validate(inquirySchema), createInquiry);

// Protected routes for property owners/agents
router.get('/', 
  authenticateToken, 
  requireRole(['AGENT', 'ADMIN']), 
  getInquiries
);

router.get('/:id', 
  authenticateToken, 
  getInquiry
);

router.put('/:id/status', 
  authenticateToken, 
  requireRole(['AGENT', 'ADMIN']), 
  updateInquiryStatus
);

router.delete('/:id', 
  authenticateToken, 
  requireRole(['AGENT', 'ADMIN']), 
  deleteInquiry
);

// User's own inquiries
router.get('/user/my-inquiries', 
  authenticateToken, 
  getUserInquiries
);

module.exports = router;