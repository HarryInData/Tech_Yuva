const express = require('express');
const router = express.Router();
const cohortsController = require('../controllers/cohorts.controller');
const validate = require('../middleware/validate');
const { createCohortSchema, toggleAdmissionSchema } = require('../validators/cohorts.validator');
const { auth } = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

// Public route to read current cohort status and badge label
router.get('/current', cohortsController.getCurrentCohort);

// Public route to view all cohorts
router.get('/', cohortsController.listCohorts);

// Admin routes
router.post('/', auth, requireRole('admin'), validate(createCohortSchema), cohortsController.createCohort);
router.patch(
  '/:id/admission',
  auth,
  requireRole('admin'),
  validate(toggleAdmissionSchema),
  cohortsController.toggleAdmission
);

module.exports = router;
