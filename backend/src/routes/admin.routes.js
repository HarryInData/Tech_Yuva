const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const validate = require('../middleware/validate');
const { updateApplicationStatusSchema } = require('../validators/community.validator');
const { auth } = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

// All admin routes require authentication and staff privileges
router.use(auth);

// Overview metrics (accessible to mentor & admin)
router.get('/overview', requireRole('mentor', 'admin'), adminController.getOverview);

// Applications management
router.get('/applications', requireRole('mentor', 'admin'), adminController.getApplications);
router.patch(
  '/applications/:id',
  requireRole('mentor', 'admin'),
  validate(updateApplicationStatusSchema),
  adminController.updateApplicationStatus
);

// CSV Data Exports (Admin only)
router.get('/events/:eventId/attendees/export', requireRole('admin'), adminController.exportAttendeesCsv);
router.get('/applications/export', requireRole('admin'), adminController.exportApplicationsCsv);

// User & Role Management (Admin only)
router.get('/users', requireRole('admin'), adminController.getUsers);
router.patch('/users/:id/role', requireRole('admin'), adminController.updateUserRole);

module.exports = router;
