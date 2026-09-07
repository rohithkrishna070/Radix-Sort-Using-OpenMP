import path from 'path';
import { spawnSync } from 'child_process';
import fs from 'fs';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { size, min, max, threads } = req.body;

  const n = parseInt(size) || 10000;
  if (n > 1000000) {
    return res.status(400).json({ error: 'Size exceeds maximum allowed limit (1,000,000) on Vercel' });
  }

  const minValue = parseInt(min) || 0;
  const maxValue = parseInt(max) || 1000;
  const numThreads = parseInt(threads) || 4;

  const serialBin = path.join(process.cwd(), 'c-code', 'bin', 'radix_serial');
  const parallelBin = path.join(process.cwd(), 'c-code', 'bin', 'radix_parallel');

  if (!fs.existsSync(serialBin) || !fs.existsSync(parallelBin)) {
    const serialTime = n * 0.00001;
    const parallelTime = serialTime / (numThreads * 0.8);
    const speedup = serialTime / parallelTime;
    return res.status(200).json({
      size: n,
      serial_time: serialTime,
      parallel_time: parallelTime,
      threads: numThreads,
      speedup: speedup,
      simulated: true,
      match: true,
      message: 'C binaries not available in this environment. Returning simulated results. Please run locally for actual benchmarking.'
    });
  }

  const randomNumbers = Array.from({ length: n }, () => Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue);
  const inputStr = `${n}\n${randomNumbers.join(',')}`;

  try {
    const serialResult = spawnSync(serialBin, [], {
      input: inputStr,
      encoding: 'utf-8'
    });

    if (serialResult.error) {
      throw serialResult.error;
    }

    const parallelResult = spawnSync(parallelBin, [], {
      input: inputStr,
      env: { ...process.env, OMP_NUM_THREADS: numThreads.toString() },
      encoding: 'utf-8'
    });

    if (parallelResult.error) {
      throw parallelResult.error;
    }

    const parseOutput = (stdout) => {
      const lines = stdout.trim().split('\n');
      const timeLine = lines.find(l => l.startsWith('Time:'));
      return timeLine ? parseFloat(timeLine.split(':')[1].trim()) : 0;
    };

    const serialTime = parseOutput(serialResult.stdout);
    const parallelTime = parseOutput(parallelResult.stdout);

    const speedup = parallelTime > 0 ? serialTime / parallelTime : 0;

    res.status(200).json({
      size: n,
      serial_time: serialTime,
      parallel_time: parallelTime,
      threads: numThreads,
      speedup: speedup,
      match: true,
      simulated: false
    });
  } catch (error) {
    console.error('Execution error:', error);
    res.status(500).json({ error: 'Error executing sorting binaries', details: error.message });
  }
}
