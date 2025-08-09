const express = require('express');
const router = express.Router();
const {
  trackPropertyView,
  markRegistrationPromptShown,
  getBrowsingSession,
  linkSessionToUser
} = require('../controllers/browsingSessionController');

// Track property view
router.post('/track-view', trackPropertyView);

// Mark registration prompt as shown
router.post('/mark-prompt-shown', markRegistrationPromptShown);

// Get browsing session data
router.get('/:sessionId', getBrowsingSession);

// Link session to user after registration/login
router.post('/link-user', linkSessionToUser);

module.exports = router;