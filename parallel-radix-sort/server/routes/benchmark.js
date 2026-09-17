const express = require('express');
const router = express.Router();
const { validateSortInput, validateBenchmarkInput } = require('../middleware/validation');
const runner = require('../services/runner');

router.post('/sort', validateSortInput, (req, res, next) => {
  try {
    const { numbers, threads } = req.body;
    const result = runner.runSort(numbers, threads);
    
    // For small arrays (< 20 elements), include the sorted arrays in response
    // For larger arrays, only include first 100 elements of sorted output
    if (result.inputSize >= 20) {
      if (result.serialSorted) {
        result.serialSorted = result.serialSorted.slice(0, 100);
      }
      if (result.parallelSorted) {
        result.parallelSorted = result.parallelSorted.slice(0, 100);
      }
    }
    
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/benchmark', validateBenchmarkInput, (req, res, next) => {
  try {
    const { size, min, max, threads } = req.body;
    const arrayMin = min !== undefined ? min : 0;
    const arrayMax = max !== undefined ? max : 1000000;
    
    const numbers = runner.generateRandomArray(size, arrayMin, arrayMax);
    const result = runner.runSort(numbers, threads);
    
    // Do NOT return sorted arrays for large benchmarks (too much data)
    delete result.serialSorted;
    delete result.parallelSorted;
    
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
