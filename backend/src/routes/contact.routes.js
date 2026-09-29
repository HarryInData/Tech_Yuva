const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contact.controller');
const validate = require('../middleware/validate');
const { contactMessageSchema, newsletterSubscribeSchema } = require('../validators/contact.validator');
const { strictFormLimiter } = require('../middleware/rateLimit');

// Public contact submission
router.post('/', strictFormLimiter, validate(contactMessageSchema), contactController.submitContact);

// Public newsletter subscription
router.post('/newsletter', strictFormLimiter, validate(newsletterSubscribeSchema), contactController.subscribeNewsletter);

module.exports = router;
