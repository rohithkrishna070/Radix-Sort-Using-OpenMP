import path from 'path';
import { spawnSync } from 'child_process';
import fs from 'fs';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { numbers, threads } = req.body;

  if (!Array.isArray(numbers) || numbers.length === 0) {
    return res.status(400).json({ error: 'Invalid or missing numbers array' });
  }
  if (numbers.length > 100000) {
    return res.status(400).json({ error: 'Array size exceeds limit (100,000)' });
  }
  
  const numThreads = parseInt(threads) || 4;
  const n = numbers.length;
  
  const serialBin = path.join(process.cwd(), 'c-code', 'bin', 'radix_serial');
  const parallelBin = path.join(process.cwd(), 'c-code', 'bin', 'radix_parallel');

  if (!fs.existsSync(serialBin) || !fs.existsSync(parallelBin)) {
    return res.status(404).json({ error: 'C binaries not available in this environment. Please run locally for actual benchmarking.' });
  }

  const inputStr = `${n}\n${numbers.join(',')}`;

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
      const sortedLine = lines.find(l => l.startsWith('Sorted:'));
      
      const time = timeLine ? parseFloat(timeLine.split(':')[1].trim()) : 0;
      const sorted = sortedLine ? sortedLine.split(':')[1].trim().split(',').map(Number) : [];
      
      return { time, sorted };
    };

    const serialParsed = parseOutput(serialResult.stdout);
    const parallelParsed = parseOutput(parallelResult.stdout);

    const match = JSON.stringify(serialParsed.sorted) === JSON.stringify(parallelParsed.sorted);
    const speedup = parallelParsed.time > 0 ? serialParsed.time / parallelParsed.time : 0;

    res.status(200).json({
      serial_time: serialParsed.time,
      parallel_time: parallelParsed.time,
      sorted_array: serialParsed.sorted,
      threads: numThreads,
      speedup: speedup,
      match: match
    });
  } catch (error) {
    console.error('Execution error:', error);
    res.status(500).json({ error: 'Error executing sorting binaries', details: error.message });
  }
}
