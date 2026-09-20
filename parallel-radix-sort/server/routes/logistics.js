const express = require('express');
const router = express.Router();
const amazonLogistics = require('../services/amazonLogistics');

/**
 * POST /api/logistics/simulate
 * Run Amazon logistics package sorting simulation
 */
router.post('/simulate', (req, res, next) => {
  try {
    const { count, threads, customPins } = req.body;
    const numCount = parseInt(count, 10) || 50000;
    const numThreads = parseInt(threads, 10) || 4;

    const result = amazonLogistics.simulateAmazonSorting({
      count: Math.min(Math.max(numCount, 5), 1000000),
      threads: numThreads,
      customPins
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
