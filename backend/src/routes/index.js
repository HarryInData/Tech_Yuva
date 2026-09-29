const express = require('express');
const router = express.Router();

const communityRoutes = require('./community.routes');
const eventsRoutes = require('./events.routes');
const cohortsRoutes = require('./cohorts.routes');
const statsRoutes = require('./stats.routes');
const contactRoutes = require('./contact.routes');
const adminRoutes = require('./admin.routes');

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'tech-yuva-api',
    version: '1.0.0',
  });
});

// Mount modular sub-routers
router.use('/community', communityRoutes);
router.use('/events', eventsRoutes);
router.use('/cohorts', cohortsRoutes);
router.use('/stats', statsRoutes);
router.use('/contact', contactRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
