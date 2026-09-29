const express = require('express');
const router = express.Router();
const communityController = require('../controllers/community.controller');
const validate = require('../middleware/validate');
const { joinCommunitySchema } = require('../validators/community.validator');
const { auth, optionalAuth } = require('../middleware/auth');
const { strictFormLimiter } = require('../middleware/rateLimit');

// Public route to apply / join community
router.post(
  '/join',
  strictFormLimiter,
  optionalAuth,
  validate(joinCommunitySchema),
  communityController.joinCommunity
);

// Authenticated user can see their own application
router.get('/me', auth, communityController.getMyApplication);

// Public member directory
router.get('/members', communityController.getPublicMembers);

module.exports = router;
