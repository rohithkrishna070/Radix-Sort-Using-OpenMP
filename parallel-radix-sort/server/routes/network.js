const express = require('express');
const router = express.Router();
const networkSimulator = require('../services/networkSimulator');

/**
 * POST /api/network/generate-preview
 * Generate a preview of unsorted network packets
 */
router.post('/generate-preview', (req, res, next) => {
  try {
    const count = parseInt(req.body.count, 10) || 20;
    const scenario = req.body.scenario || 'ddos';
    const packets = networkSimulator.generatePackets(Math.min(count, 100), scenario);
    res.json({ packets });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/network/simulate
 * Run OpenMP Radix Sort simulation on small or large network packets
 */
router.post('/simulate', (req, res, next) => {
  try {
    const { count, scenario, threads, schedule, customPackets } = req.body;
    const numCount = parseInt(count, 10) || 10000;
    const numThreads = parseInt(threads, 10) || 4;
    const scheduleMode = schedule || 'both';

    const result = networkSimulator.simulateNetworkSort({
      count: Math.min(Math.max(numCount, 5), 1000000),
      scenario: scenario || 'ddos',
      threads: numThreads,
      schedule: scheduleMode,
      customPackets
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
