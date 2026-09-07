export const sampleBenchmarkData = [
  { inputSize: 100, serialTime: 0.000012, parallelTime: 0.000089, speedup: 0.13, threads: 4, efficiency: 0.13 / 4 },
  { inputSize: 1000, serialTime: 0.000098, parallelTime: 0.000156, speedup: 0.63, threads: 4, efficiency: 0.63 / 4 },
  { inputSize: 10000, serialTime: 0.001200, parallelTime: 0.000890, speedup: 1.35, threads: 4, efficiency: 1.35 / 4 },
  { inputSize: 50000, serialTime: 0.006100, parallelTime: 0.003200, speedup: 1.91, threads: 4, efficiency: 1.91 / 4 },
  { inputSize: 100000, serialTime: 0.013500, parallelTime: 0.005800, speedup: 2.33, threads: 4, efficiency: 2.33 / 4 },
  { inputSize: 500000, serialTime: 0.071000, parallelTime: 0.024000, speedup: 2.96, threads: 4, efficiency: 2.96 / 4 },
  { inputSize: 1000000, serialTime: 0.145000, parallelTime: 0.046000, speedup: 3.15, threads: 4, efficiency: 3.15 / 4 },
];
