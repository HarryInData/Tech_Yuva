const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/events.controller');
const validate = require('../middleware/validate');
const { registerEventSchema, createEventSchema, updateEventSchema } = require('../validators/events.validator');
const { auth, optionalAuth } = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const { strictFormLimiter } = require('../middleware/rateLimit');

// Public event browsing
router.get('/', eventsController.getEvents);
router.get('/:slug', eventsController.getEventBySlug);

// Event registration & cancellation
router.post(
  '/:id/register',
  strictFormLimiter,
  optionalAuth,
  validate(registerEventSchema),
  eventsController.register
);

router.post('/:id/cancel', optionalAuth, eventsController.cancelRegistration);

// Staff access to attendee list
router.get('/:id/attendees', auth, requireRole('mentor', 'admin'), eventsController.getAttendees);

// Admin Event CRUD
router.post('/', auth, requireRole('admin'), validate(createEventSchema), eventsController.createEvent);
router.patch('/:id', auth, requireRole('admin'), validate(updateEventSchema), eventsController.updateEvent);
router.delete('/:id', auth, requireRole('admin'), eventsController.deleteEvent);

module.exports = router;
