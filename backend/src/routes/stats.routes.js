const express = require('express');
const router = express.Router();
const statsController = require('../controllers/stats.controller');

// Public live impact stats
router.get('/', statsController.getStats);

module.exports = router;
