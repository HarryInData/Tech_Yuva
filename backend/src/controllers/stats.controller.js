const analyticsService = require('../services/analytics.service');
const ApiResponse = require('../utils/ApiResponse');

async function getStats(req, res, next) {
  try {
    const stats = await analyticsService.getPublicImpactStats();
    res.json(ApiResponse.success(stats));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getStats,
};
