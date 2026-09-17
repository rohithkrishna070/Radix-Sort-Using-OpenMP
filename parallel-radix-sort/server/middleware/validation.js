function validateSortInput(req, res, next) {
  const { numbers, threads } = req.body;

  if (!Array.isArray(numbers)) {
    return res.status(400).json({ error: "Invalid input: 'numbers' must be an array." });
  }

  if (numbers.length === 0 || numbers.length > 100000) {
    return res.status(400).json({ error: "Invalid input: 'numbers' array length must be between 1 and 100,000." });
  }

  for (let i = 0; i < numbers.length; i++) {
    const num = numbers[i];
    if (!Number.isInteger(num) || num < 0 || num > 2147483647) {
      return res.status(400).json({ error: `Invalid input: Each number must be a non-negative integer up to 2,147,483,647. Found invalid value at index ${i}: ${num}` });
    }
  }

  if (threads !== undefined) {
    if (!Number.isInteger(threads) || threads < 0 || threads > 64) {
      return res.status(400).json({ error: "Invalid input: 'threads' must be an integer between 0 and 64." });
    }
  }

  next();
}

function validateBenchmarkInput(req, res, next) {
  const { size, min, max, threads } = req.body;

  if (!Number.isInteger(size) || size < 1 || size > 5000000) {
    return res.status(400).json({ error: "Invalid input: 'size' must be an integer between 1 and 5,000,000." });
  }

  const vMin = min !== undefined ? min : 0;
  if (!Number.isInteger(vMin) || vMin < 0) {
    return res.status(400).json({ error: "Invalid input: 'min' must be a non-negative integer." });
  }

  const vMax = max !== undefined ? max : 1000000;
  if (!Number.isInteger(vMax) || vMax <= vMin || vMax > 2147483647) {
    return res.status(400).json({ error: "Invalid input: 'max' must be an integer greater than 'min' and up to 2,147,483,647." });
  }

  if (threads !== undefined) {
    if (!Number.isInteger(threads) || threads < 0 || threads > 64) {
      return res.status(400).json({ error: "Invalid input: 'threads' must be an integer between 0 and 64." });
    }
  }

  next();
}

module.exports = {
  validateSortInput,
  validateBenchmarkInput
};
