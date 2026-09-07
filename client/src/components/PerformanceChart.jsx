import React, { useState } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine 
} from 'recharts';

const sampleData = [
  { size: '1K', sizeVal: 1000, serial: 0.0001, parallel: 0.0005, speedup: 0.2, efficiency: 5 },
  { size: '10K', sizeVal: 10000, serial: 0.0015, parallel: 0.0018, speedup: 0.83, efficiency: 20 },
  { size: '100K', sizeVal: 100000, serial: 0.0180, parallel: 0.0090, speedup: 2.0, efficiency: 50 },
  { size: '1M', sizeVal: 1000000, serial: 0.1850, parallel: 0.0510, speedup: 3.6, efficiency: 90 },
  { size: '10M', sizeVal: 10000000, serial: 1.9500, parallel: 0.4800, speedup: 4.1, efficiency: 102 }
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 border border-gray-700 p-3 rounded shadow-xl">
        <p className="text-gray-300 font-bold mb-2">Size: {label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm my-1">
            {entry.name}: {entry.value} {entry.name.includes('Time') ? 's' : (entry.name.includes('Efficiency') ? '%' : 'x')}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const PerformanceChart = ({ benchmarkResults = [] }) => {
  const [useSample, setUseSample] = useState(benchmarkResults.length === 0);

  const rawData = useSample ? sampleData : benchmarkResults;
  
  // Transform and aggregate data if needed, assuming simple format for now
  const data = rawData.map(d => ({
    name: typeof d.size === 'number' ? (
      d.size >= 1000000 ? `${d.size/1000000}M` : 
      d.size >= 1000 ? `${d.size/1000}K` : d.size.toString()
    ) : d.size,
    'Serial Time': Number(d.serialTime || d.serial),
    'Parallel Time': Number(d.parallelTime || d.parallel),
    Speedup: Number(d.speedup),
    Efficiency: Number(d.efficiency)
  })).sort((a, b) => {
    const valA = parseFloat(a.name.replace(/K/,'000').replace(/M/,'000000'));
    const valB = parseFloat(b.name.replace(/K/,'000').replace(/M/,'000000'));
    return valA - valB;
  });

  const toggleData = () => {
    setUseSample(!useSample);
  };

  if (!useSample && data.length === 0) {
    return (
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-8 text-center w-full max-w-4xl mx-auto mt-6">
        <p className="text-gray-400 text-lg mb-4">Run benchmarks to see live performance data</p>
        <button onClick={() => setUseSample(true)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition">
          View Sample Data
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-6 text-white w-full max-w-4xl mx-auto mt-6 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-cyan-400">Performance Analysis</h2>
        {benchmarkResults.length > 0 && (
          <button 
            onClick={toggleData}
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs transition"
          >
            Showing: {useSample ? 'Sample Data' : 'Live Data'}
          </button>
        )}
      </div>

      <div className="space-y-8">
        
        {/* Chart 1: Time Comparison */}
        <div>
          <h3 className="text-lg font-medium text-gray-300 mb-4 text-center">Execution Time Comparison</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" label={{ value: 'Time (s)', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="Serial Time" stroke="#F59E0B" strokeWidth={2} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="Parallel Time" stroke="#06B6D4" strokeWidth={2} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Speedup */}
        <div>
          <h3 className="text-lg font-medium text-gray-300 mb-4 text-center">Speedup Factor</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" label={{ value: 'Speedup (x)', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <ReferenceLine y={1} stroke="#EF4444" strokeDasharray="3 3" />
                <Bar dataKey="Speedup">
                  {data.map((entry, index) => (
                    <cell key={`cell-${index}`} fill={entry.Speedup > 1.5 ? '#10B981' : entry.Speedup >= 0.8 ? '#FBBF24' : '#EF4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Efficiency */}
        <div>
          <h3 className="text-lg font-medium text-gray-300 mb-4 text-center">Thread Efficiency</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" label={{ value: 'Efficiency %', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <ReferenceLine y={100} stroke="#10B981" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="Efficiency" stroke="#A855F7" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PerformanceChart;
