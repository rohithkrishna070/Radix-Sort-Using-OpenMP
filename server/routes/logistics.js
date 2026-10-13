const express = require('express');
const router = express.Router();
const amazonLogistics = require('../services/amazonLogistics');

/**
 * POST /api/logistics/simulate
 * Run Amazon logistics package sorting simulation
 */
router.post('/simulate', handleSimulate);
router.post('/', handleSimulate);

function handleSimulate(req, res, next) {
  try {
    const { count, datasetSize, threads, numThreads, customPins, clusterMode } = req.body || {};
    const parsedCount = parseInt(count || datasetSize, 10) || 50000;
    const parsedThreads = parseInt(threads || numThreads, 10) || 4;

    const result = amazonLogistics.simulateAmazonSorting({
      count: Math.min(Math.max(parsedCount, 5), 1000000),
      threads: parsedThreads,
      customPins,
      clusterMode: Boolean(clusterMode)
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = router;
