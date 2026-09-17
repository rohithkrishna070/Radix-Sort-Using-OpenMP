import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine 
} from 'recharts';

const sampleData = [
  { size: '100', sizeVal: 100, serial: 0.000015, parallel: 0.000028, speedup: 0.54, efficiency: 13.5, threads: 4 },
  { size: '1K', sizeVal: 1000, serial: 0.00012, parallel: 0.00010, speedup: 1.20, efficiency: 30.0, threads: 4 },
  { size: '10K', sizeVal: 10000, serial: 0.00150, parallel: 0.00078, speedup: 1.92, efficiency: 48.0, threads: 4 },
  { size: '100K', sizeVal: 100000, serial: 0.01800, parallel: 0.00620, speedup: 2.90, efficiency: 72.5, threads: 4 },
  { size: '1M', sizeVal: 1000000, serial: 0.18500, parallel: 0.05100, speedup: 3.63, efficiency: 90.7, threads: 4 }
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 border border-gray-700 p-3 rounded-lg shadow-xl text-xs space-y-1">
        <p className="text-gray-300 font-bold mb-1 border-b border-gray-800 pb-1">Input Size: {label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="font-mono">
            <span className="font-semibold">{entry.name}:</span>{' '}
            {typeof entry.value === 'number' 
              ? (entry.name.includes('Time') ? `${entry.value.toFixed(6)}s` : `${entry.value.toFixed(2)}${entry.name.includes('Efficiency') ? '%' : 'x'}`)
              : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const PerformanceChart = ({ benchmarkResults = [] }) => {
  const [useSample, setUseSample] = useState(benchmarkResults.length === 0);

  useEffect(() => {
    if (benchmarkResults.length > 0) {
      setUseSample(false);
    }
  }, [benchmarkResults.length]);

  const rawData = useSample ? sampleData : benchmarkResults;
  
  const data = rawData.map((d, index) => {
    let sizeLabel = d.inputSize || d.size;
    if (typeof sizeLabel === 'number') {
      if (sizeLabel >= 1000000) sizeLabel = `${(sizeLabel / 1000000).toFixed(1)}M`;
      else if (sizeLabel >= 1000) sizeLabel = `${(sizeLabel / 1000).toFixed(0)}K`;
      else sizeLabel = sizeLabel.toString();
    }

    return {
      name: `#${index + 1} (${sizeLabel})`,
      sizeLabel: sizeLabel,
      serial: d.serialTime !== undefined ? Number(d.serialTime) : d.serial,
      parallel: d.parallelTime !== undefined ? Number(d.parallelTime) : d.parallel,
      speedup: d.speedup !== undefined ? Number(d.speedup.toFixed(2)) : d.speedup,
      efficiency: d.efficiency !== undefined ? Number(d.efficiency.toFixed(1)) : d.efficiency,
      threads: d.threadsUsed || d.threads || 4
    };
  });

  return (
    <div className="py-12 px-4 max-w-6xl mx-auto text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-cyan-400">Performance Benchmarking Charts</h2>
          <p className="text-gray-400 text-sm mt-1">
            Execution time, speedup metrics, and thread efficiency comparison.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${!useSample ? 'bg-teal-900/60 text-teal-300 border-teal-500' : 'bg-gray-800 text-gray-400 border-gray-700'}`}>
            {!useSample ? `Live Session Data (${benchmarkResults.length} runs)` : 'Sample Baseline Data'}
          </span>
          <button 
            onClick={() => setUseSample(!useSample)}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-xs font-medium transition"
          >
            Switch to {useSample ? 'Live Data' : 'Sample Data'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Execution Time */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-5 shadow-xl">
          <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center justify-between">
            <span>Execution Time (Lower is Better)</span>
            <span className="text-xs text-gray-400 font-normal">Seconds</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="serial" name="Serial Time (s)" stroke="#F59E0B" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="parallel" name="Parallel Time (s)" stroke="#06B6D4" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Speedup Factor */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-5 shadow-xl">
          <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center justify-between">
            <span>Parallel Speedup (Serial Time / Parallel Time)</span>
            <span className="text-xs text-gray-400 font-normal">Higher is Better</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={1.0} stroke="#EF4444" strokeDasharray="4 4" label={{ value: '1.0x (Baseline)', fill: '#EF4444', fontSize: 10, position: 'insideTopRight' }} />
                <Bar dataKey="speedup" name="Speedup Factor (x)" fill="#14B8A6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;
