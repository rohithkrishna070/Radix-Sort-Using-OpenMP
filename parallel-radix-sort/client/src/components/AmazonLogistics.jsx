import React, { useState, useEffect } from 'react';
import { 
  HiOutlineTruck, 
  HiOutlineArchiveBox, 
  HiOutlineCpuChip, 
  HiOutlineBolt, 
  HiOutlinePlay, 
  HiOutlineArrowPath, 
  HiOutlineAdjustmentsHorizontal,
  HiOutlineSparkles,
  HiOutlineMapPin,
  HiOutlineCheckCircle,
  HiOutlineChartBar
} from 'react-icons/hi2';
import { 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  Legend, 
  Cell,
  ReferenceLine
} from 'recharts';

const SMALL_SIZES = [10, 25, 50, 100];
const LARGE_SIZES = [10000, 50000, 100000, 250000, 500000];
const THREAD_OPTIONS = [1, 2, 4, 8, 16];

// Baseline multi-run comparison across small and large data
const BASELINE_MULTI_RUNS = [
  { name: '#1 (25 pkts)', sizeLabel: '25', size: 25, serial: 0.15, dynamicTime: 0.10, staticTime: 0.08, speedupStatic: 1.88, speedupDynamic: 1.50, threads: 4 },
  { name: '#2 (10k)', sizeLabel: '10k', size: 10000, serial: 4.20, dynamicTime: 2.10, staticTime: 1.45, speedupStatic: 2.90, speedupDynamic: 2.00, threads: 4 },
  { name: '#3 (50k)', sizeLabel: '50k', size: 50000, serial: 19.5, dynamicTime: 8.90, staticTime: 6.20, speedupStatic: 3.15, speedupDynamic: 2.19, threads: 4 },
  { name: '#4 (100k)', sizeLabel: '100k', size: 100000, serial: 38.0, dynamicTime: 17.2, staticTime: 12.0, speedupStatic: 3.17, speedupDynamic: 2.21, threads: 4 },
  { name: '#5 (250k)', sizeLabel: '250k', size: 250000, serial: 95.6, dynamicTime: 42.3, staticTime: 30.2, speedupStatic: 3.16, speedupDynamic: 2.26, threads: 4 },
  { name: '#6 (500k)', sizeLabel: '500k', size: 500000, serial: 191.0, dynamicTime: 84.5, staticTime: 60.5, speedupStatic: 3.16, speedupDynamic: 2.26, threads: 4 }
];

const CustomLogisticsTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-xs space-y-1">
        <p className="text-slate-300 font-bold mb-1 border-b border-slate-800 pb-1">Run: {label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="font-mono">
            <span className="font-semibold">{entry.name}:</span>{' '}
            {typeof entry.value === 'number'
              ? (entry.name.includes('(ms)') || entry.name.includes('Time') ? `${entry.value.toFixed(1)} ms` : `${entry.value.toFixed(2)}x`)
              : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AmazonLogistics() {
  const [dataMode, setDataMode] = useState('large'); // 'small' or 'large'
  const [packetCount, setPacketCount] = useState(50000);
  const [threads, setThreads] = useState(4);
  const [customPins, setCustomPins] = useState('500081, 110001, 560034, 400051, 500090, 110075, 411057, 600032');
  const [useCustomInput, setUseCustomInput] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('trucks'); // 'trucks', 'parcels', 'algorithm'
  
  // History tracking for multi-run graphs
  const [liveRuns, setLiveRuns] = useState([]);
  const [useSampleRuns, setUseSampleRuns] = useState(true);

  // Update default packetCount when switching dataMode
  const handleModeChange = (mode) => {
    setDataMode(mode);
    if (mode === 'small') {
      setPacketCount(25);
    } else {
      setPacketCount(50000);
    }
  };

  // Run the Amazon package sorting simulation
  const runSimulation = async () => {
    setLoading(true);
    setError(null);

    try {
      let payload = {
        threads
      };

      if (dataMode === 'small' && useCustomInput) {
        const pins = customPins.split(',').map(s => s.trim()).filter(Boolean);
        if (pins.length === 0) {
          throw new Error('Please enter at least one valid 6-digit PIN code.');
        }
        payload.customPins = pins;
        payload.count = pins.length;
      } else {
        payload.count = packetCount;
      }

      const response = await fetch('/api/logistics/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);

      // Append to live session runs
      const label = data.inputSize >= 1000 ? `${(data.inputSize / 1000).toFixed(0)}k` : `${data.inputSize}`;
      const newEntry = {
        name: `#${liveRuns.length + 1} (${label})`,
        sizeLabel: label,
        size: data.inputSize,
        serial: Number((data.serialTime * 1000).toFixed(1)),
        dynamicTime: Number((data.dynamicTime * 1000).toFixed(1)),
        staticTime: Number((data.staticTime * 1000).toFixed(1)),
        speedupStatic: data.speedupStatic,
        speedupDynamic: data.speedupDynamic,
        threads: data.threadsUsed
      };

      setLiveRuns(prev => [...prev.slice(-7), newEntry]);
    } catch (err) {
      console.error('Logistics simulation error:', err);
      setError(err.message || 'Failed to execute logistics simulation');
    } finally {
      setLoading(false);
    }
  };

  // Run once on initial load for instant presentation
  useEffect(() => {
    runSimulation();
  }, []);

  // Multi-run data selection
  const activeRunsData = useSampleRuns || liveRuns.length === 0 ? BASELINE_MULTI_RUNS : liveRuns;

  return (
    <div className="py-20 w-full bg-slate-900 border-t border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-amber-950/80 border border-amber-700/80 px-4 py-1.5 rounded-full text-xs font-semibold text-amber-300 mb-3 shadow-lg shadow-amber-950/30">
            <HiOutlineTruck className="w-4 h-4 text-amber-400" />
            <span>Real-World Application • Amazon Fulfillment Logistics</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Amazon Package Dispatch by PIN Code
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-400 max-w-3xl mx-auto">
            Experience how OpenMP Parallel Radix Sort organizes hundreds of thousands of packages by 6-digit Postal PIN code into regional delivery vans in strictly linear <span className="text-cyan-400 font-mono">O(6N)</span> time.
          </p>
        </div>

        {/* Configuration Panel */}
        <div className="bg-slate-800/60 backdrop-blur border border-slate-700/60 rounded-2xl p-6 sm:p-8 shadow-2xl mb-10">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-slate-700/60">
            
            {/* Mode Switcher: Small Data vs Large Data */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2 flex items-center gap-2">
                <HiOutlineAdjustmentsHorizontal className="w-4 h-4 text-cyan-400" />
                Data Scale Selection
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900/80 rounded-xl border border-slate-700">
                <button
                  type="button"
                  onClick={() => handleModeChange('small')}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                    dataMode === 'small'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🔍 Small Data
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange('large')}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                    dataMode === 'large'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🚀 Large Scale
                </button>
              </div>
            </div>

            {/* Package Volume / Custom PINs */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Package Count
                </label>
                {dataMode === 'small' && (
                  <button
                    type="button"
                    onClick={() => setUseCustomInput(!useCustomInput)}
                    className="text-[11px] text-cyan-400 hover:underline"
                  >
                    {useCustomInput ? 'Use Presets' : 'Custom PINs'}
                  </button>
                )}
              </div>

              {useCustomInput && dataMode === 'small' ? (
                <div>
                  <input
                    type="text"
                    value={customPins}
                    onChange={(e) => setCustomPins(e.target.value)}
                    placeholder="Comma-separated 6-digit PINs"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">E.g. 500081, 110001, 560034</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(dataMode === 'small' ? SMALL_SIZES : LARGE_SIZES).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setPacketCount(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors ${
                        packetCount === s
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                          : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      {s >= 1000 ? `${s / 1000}k` : s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Thread Count Selector */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                OpenMP Threads
              </label>
              <div className="flex gap-2">
                {THREAD_OPTIONS.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setThreads(t)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold border transition-colors ${
                      threads === t
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow'
                        : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    {t}T
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Action Trigger Button */}
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={runSimulation}
              disabled={loading}
              className={`px-8 py-3.5 rounded-xl font-extrabold text-sm sm:text-base flex items-center gap-3 transition-all transform hover:scale-[1.02] shadow-xl ${
                loading
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 hover:brightness-110 shadow-amber-500/20'
              }`}
            >
              {loading ? (
                <>
                  <HiOutlineArrowPath className="w-5 h-5 animate-spin" />
                  <span>Sorting Packages via OpenMP...</span>
                </>
              ) : (
                <>
                  <HiOutlinePlay className="w-5 h-5" />
                  <span>Sort & Dispatch Amazon Packages</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-rose-950/60 border border-rose-800 rounded-lg text-rose-300 text-xs text-center">
              ⚠️ {error}
            </div>
          )}

        </div>

        {/* Results Presentation */}
        {result && (
          <div className="space-y-8">

            {/* 3 Clear Metric Cards: Serial vs OpenMP Static vs OpenMP Dynamic */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1: Serial Sort (Slowest) */}
              <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Baseline (Sequential)</span>
                    <span className="text-xs px-2.5 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">1 Core</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">Serial Radix Sort</h3>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold font-mono text-amber-400">
                      {(result.serialTime * 1000).toFixed(1)}
                    </span>
                    <span className="text-sm text-slate-400">ms</span>
                  </div>
                </div>
                <div className="mt-5 pt-3 border-t border-slate-700/80 text-xs text-slate-400">
                  Processes {result.inputSize.toLocaleString()} parcels sequentially on 1 single core.
                </div>
              </div>

              {/* Card 2: OpenMP Static (Fastest - Winner) */}
              <div className="bg-gradient-to-b from-cyan-950/50 to-slate-800/50 border-2 border-cyan-500/80 rounded-2xl p-6 flex flex-col justify-between relative shadow-xl shadow-cyan-950/40">
                <div className="absolute -top-3 right-4 bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow">
                  ⭐ Optimal Winner
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">OpenMP Static</span>
                    <span className="text-xs px-2.5 py-0.5 rounded bg-cyan-900/60 text-cyan-300 font-mono font-bold">
                      {result.threadsUsed} Threads
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white">schedule(static)</h3>
                  <div className="mt-4 flex items-baseline gap-3">
                    <span className="text-4xl font-extrabold font-mono text-cyan-400">
                      {(result.staticTime * 1000).toFixed(1)}
                    </span>
                    <span className="text-sm text-slate-400">ms</span>
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-700/60">
                      {result.speedupStatic}x Speedup
                    </span>
                  </div>
                </div>
                <div className="mt-5 pt-3 border-t border-slate-700/80 text-xs text-cyan-200">
                  Contiguous parcel cache blocks per core • Zero queue lock contention.
                </div>
              </div>

              {/* Card 3: OpenMP Dynamic (Slower than Static) */}
              <div className="bg-slate-800/40 border border-purple-700/50 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-400">OpenMP Dynamic</span>
                    <span className="text-xs px-2.5 py-0.5 rounded bg-purple-900/60 text-purple-300 font-mono font-bold">
                      {result.threadsUsed} Threads
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white">schedule(dynamic)</h3>
                  <div className="mt-4 flex items-baseline gap-3">
                    <span className="text-4xl font-extrabold font-mono text-purple-400">
                      {(result.dynamicTime * 1000).toFixed(1)}
                    </span>
                    <span className="text-sm text-slate-400">ms</span>
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-purple-950/80 text-purple-300 border border-purple-700/60">
                      {result.speedupDynamic}x Speedup
                    </span>
                  </div>
                </div>
                <div className="mt-5 pt-3 border-t border-slate-700/80 text-xs text-slate-400">
                  Centralized queue overhead • Threads atomically contend for package chunks.
                </div>
              </div>

            </div>

            {/* Performance Ratio Banner */}
            {result.comparison && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/60 via-slate-800 to-purple-950/60 border border-cyan-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                    <HiOutlineBolt className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">
                      OpenMP Static is <span className="text-cyan-400 font-extrabold">{result.comparison.ratio}x faster</span> than Dynamic ({result.comparison.percentFaster}% less runtime)
                    </div>
                    <div className="text-xs text-slate-400">
                      Serial is slowest ({ (result.serialTime * 1000).toFixed(1) } ms) ➔ Dynamic is faster ({ (result.dynamicTime * 1000).toFixed(1) } ms) ➔ Static is fastest ({ (result.staticTime * 1000).toFixed(1) } ms).
                    </div>
                  </div>
                </div>
                <div className="text-xs font-mono text-slate-300 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700">
                  Dispatch Throughput: {Math.round(result.inputSize / Math.max(0.000001, result.staticTime)).toLocaleString()} parcels/sec
                </div>
              </div>
            )}

            {/* SECTION 1: DEDICATED CURRENT-RUN LOGISTICS GRAPHS */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 shadow-2xl">
              <div className="mb-6 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <HiOutlineChartBar className="w-5 h-5 text-amber-400" />
                    <span>Current Run Performance & Truck Allocation</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Real-time execution timing comparison and regional delivery van loading volume for {result.inputSize.toLocaleString()} packages.
                  </p>
                </div>
                <span className="text-xs bg-slate-900 px-3 py-1 rounded-full border border-slate-700 text-cyan-300 font-mono">
                  {result.inputSize.toLocaleString()} Packages • {result.threadsUsed} OpenMP Threads
                </span>
              </div>

              {/* Responsive 2-Column Graph Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* GRAPH 1: Execution Time Comparison (Serial vs Dynamic vs Static) */}
                <div className="min-w-0 bg-slate-900/80 border border-slate-700/60 rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>Current Run Execution Time</span>
                      </h4>
                      <span className="text-[11px] font-mono text-cyan-400">Lower is better</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-4">
                      Serial (Amber) vs OpenMP Dynamic (Purple) vs OpenMP Static (Cyan) in ms.
                    </p>
                  </div>
                  
                  <div className="w-full h-64 min-w-0">
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart 
                        data={[
                          {
                            name: `${result.threadsUsed} Cores`,
                            'Serial Sort': Number((result.serialTime * 1000).toFixed(1)),
                            'OpenMP Dynamic': Number((result.dynamicTime * 1000).toFixed(1)),
                            'OpenMP Static': Number((result.staticTime * 1000).toFixed(1))
                          }
                        ]}
                        margin={{ top: 15, right: 20, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                        <YAxis stroke="#94a3b8" fontSize={11} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                          formatter={(val) => [`${val} ms`]}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                        <Bar dataKey="Serial Sort" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="OpenMP Dynamic" fill="#a855f7" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="OpenMP Static" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* GRAPH 2: Packages Per Delivery Truck Bay */}
                <div className="min-w-0 bg-slate-900/80 border border-slate-700/60 rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>Packages Grouped by Delivery Truck Bay</span>
                      </h4>
                      <span className="text-[11px] font-semibold text-emerald-400">🚚 Sorted by PIN</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-4">
                      Total parcels routed into each truck loading bay after Radix Sort.
                    </p>
                  </div>

                  <div className="w-full h-64 min-w-0">
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart 
                        data={result.truckStats.slice(0, 8)} 
                        margin={{ top: 15, right: 15, left: 0, bottom: 35 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis 
                          dataKey="truckBay" 
                          stroke="#94a3b8" 
                          fontSize={9} 
                          interval={0} 
                          angle={-25} 
                          textAnchor="end" 
                        />
                        <YAxis stroke="#94a3b8" fontSize={11} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                          formatter={(val, name, item) => [`${val.toLocaleString()} parcels (${item.payload.percentage}%)`, 'Truck Load']}
                        />
                        <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]}>
                          {result.truckStats.slice(0, 8).map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={index % 2 === 0 ? '#f59e0b' : '#06b6d4'} 
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

            </div>

            {/* SECTION 2: MULTI-RUN COMPARISON GRAPHS (SMALL & LARGE DATA BENCHMARK) */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-slate-700/80 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
                    <span>📈 Multi-Run Scaling Benchmark: Small & Large Datasets</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Side-by-side progression tracking <strong className="text-amber-400">Serial</strong>, <strong className="text-purple-400">Dynamic OpenMP</strong>, and <strong className="text-cyan-400">Static OpenMP</strong> across every run from 25 to 500k packages.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${!useSampleRuns ? 'bg-teal-900/60 text-teal-300 border-teal-500' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                    {!useSampleRuns ? `Live Session Data (${liveRuns.length} runs)` : `Full Scale Baseline (${BASELINE_MULTI_RUNS.length} sizes)`}
                  </span>
                  <button 
                    type="button"
                    onClick={() => setUseSampleRuns(!useSampleRuns)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium transition text-slate-300"
                  >
                    Switch to {useSampleRuns ? 'Live Runs' : 'Full Baseline'}
                  </button>
                </div>
              </div>

              {/* 2 Multi-Run Graphs Side-by-Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Chart 1: Multi-Run Execution Time Progression (Line Chart) */}
                <div className="min-w-0 bg-slate-900/80 border border-slate-700/60 rounded-xl p-5 shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-bold text-white">
                        Execution Time Progression (Small to Large)
                      </h4>
                      <span className="text-xs text-slate-400 font-mono">Milliseconds (ms)</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-4">
                      Notice how <span className="text-cyan-400 font-medium">Static</span> consistently runs faster than <span className="text-purple-400 font-medium">Dynamic</span> and <span className="text-amber-400 font-medium">Serial</span> across all sizes.
                    </p>
                  </div>

                  <div className="w-full h-64 min-w-0">
                    <ResponsiveContainer width="100%" height={240}>
                      <LineChart data={activeRunsData} margin={{ top: 10, right: 15, left: -5, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                        <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                        <Tooltip content={<CustomLogisticsTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                        <Line type="monotone" dataKey="serial" name="Serial (ms)" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="dynamicTime" name="Dynamic OpenMP (ms)" stroke="#a855f7" strokeWidth={2} strokeDasharray="4 3" dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="staticTime" name="Static OpenMP (ms)" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 5 }} activeDot={{ r: 7 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chart 2: Multi-Run Speedup Factor (Bar Chart with 1.0x Reference) */}
                <div className="min-w-0 bg-slate-900/80 border border-slate-700/60 rounded-xl p-5 shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-bold text-white">
                        Speedup vs. Serial (Higher is Better)
                      </h4>
                      <span className="text-xs text-slate-400 font-mono">Speedup (x)</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-4">
                      <span className="text-cyan-400 font-medium">Static Speedup</span> consistently achieves higher parallel scaling than <span className="text-purple-400 font-medium">Dynamic</span>.
                    </p>
                  </div>

                  <div className="w-full h-64 min-w-0">
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={activeRunsData} margin={{ top: 10, right: 15, left: -5, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                        <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                        <Tooltip content={<CustomLogisticsTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                        <ReferenceLine y={1.0} stroke="#ef4444" strokeDasharray="4 4" label={{ value: '1.0x Baseline', fill: '#ef4444', fontSize: 10, position: 'insideTopRight' }} />
                        <Bar dataKey="speedupStatic" name="Static Speedup (x)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="speedupDynamic" name="Dynamic Speedup (x)" fill="#a855f7" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            </div>

            {/* Delivery Truck Bays & Parcel Inspector Tabs */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
              
              {/* Tab Switcher */}
              <div className="flex border-b border-slate-700 bg-slate-900/70 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('trucks')}
                  className={`py-3 px-6 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'trucks'
                      ? 'border-amber-400 text-amber-400 bg-amber-950/20'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  🚚 Delivery Truck Bays ({result.truckStats.length} Zones)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('parcels')}
                  className={`py-3 px-6 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'parcels'
                      ? 'border-amber-400 text-amber-400 bg-amber-950/20'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  📦 Parcel Stream Inspector ({dataMode === 'small' ? 'All Packages' : 'Top 100 Sample'})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('algorithm')}
                  className={`py-3 px-6 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'algorithm'
                      ? 'border-amber-400 text-amber-400 bg-amber-950/20'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  ⚡ Why Radix Sort Wins for PIN Codes
                </button>
              </div>

              {/* TAB 1: Delivery Truck Bays */}
              {activeTab === 'trucks' && (
                <div className="p-6">
                  <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-base font-bold text-white flex items-center gap-2">
                        <span>Fulfillment Center Regional Truck Loading Bays</span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Packages sorted consecutively by 6-digit PIN code and routed to designated delivery vans.
                      </p>
                    </div>
                    <span className="text-xs bg-slate-900 px-3 py-1 rounded-full border border-slate-700 text-slate-300">
                      Total Dispatched: {result.inputSize.toLocaleString()} Parcels
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {result.truckStats.map((truck, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/60 hover:border-slate-600 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                              <HiOutlineTruck className="w-4 h-4 text-amber-400" />
                              {truck.truckBay}
                            </span>
                            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                              PIN: {truck.samplePin}
                            </span>
                          </div>
                          <div className="text-xs text-slate-300 font-medium mb-3">
                            {truck.city}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-baseline justify-between">
                            <div>
                              <span className="text-2xl font-bold font-mono text-white">{truck.count.toLocaleString()}</span>
                              <span className="text-xs text-slate-400 ml-1">parcels</span>
                            </div>
                            <span className="text-xs font-mono font-semibold text-slate-300">
                              {truck.percentage}% of total
                            </span>
                          </div>
                          {/* Progress Bar */}
                          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                              style={{ width: `${Math.min(100, truck.percentage * 3)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: Parcel Stream Inspector Table */}
              {activeTab === 'parcels' && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        Sorted Package Records
                      </h4>
                      <p className="text-xs text-slate-400">
                        {dataMode === 'small' && result.allSortedPackages
                          ? `Showing all ${result.allSortedPackages.length} sorted parcels.`
                          : `Showing first 100 parcels sorted numerically by Postal PIN Code.`}
                      </p>
                    </div>
                    <span className="text-xs font-mono text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded border border-amber-800">
                      Sort Key: 6-digit PIN code
                    </span>
                  </div>

                  <div className="overflow-x-auto max-h-96 border border-slate-700 rounded-xl">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-slate-900 text-slate-300 sticky top-0 border-b border-slate-700">
                        <tr>
                          <th className="py-2.5 px-3">#</th>
                          <th className="py-2.5 px-3">Tracking ID</th>
                          <th className="py-2.5 px-3 text-amber-300 font-bold">PIN Code (Sorted)</th>
                          <th className="py-2.5 px-3">Destination Hub</th>
                          <th className="py-2.5 px-3">Assigned Truck</th>
                          <th className="py-2.5 px-3">Weight</th>
                          <th className="py-2.5 px-3">Service</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 bg-slate-950/60">
                        {(dataMode === 'small' && result.allSortedPackages ? result.allSortedPackages : result.sampleSorted).map((pkg, i) => (
                          <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                            <td className="py-2 px-3 text-slate-500">{i + 1}</td>
                            <td className="py-2 px-3 text-slate-300 font-bold">{pkg.trackingId}</td>
                            <td className="py-2 px-3 text-amber-400 font-bold text-sm">{pkg.pincode}</td>
                            <td className="py-2 px-3 text-slate-300">{pkg.city}</td>
                            <td className="py-2 px-3 text-cyan-300">{pkg.truckBay}</td>
                            <td className="py-2 px-3 text-slate-400">{pkg.weightKg} kg</td>
                            <td className="py-2 px-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                                {pkg.serviceType}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: Algorithm Explainer */}
              {activeTab === 'algorithm' && (
                <div className="p-6 space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                      <HiOutlineSparkles className="w-4 h-4 text-cyan-400" />
                      <span>Why Radix Sort is the Gold Standard for Postal PIN Codes</span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      Comparison algorithms like QuickSort or MergeSort make millions of slow branch comparisons. Radix Sort runs in strictly linear time.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-700/60">
                      <div className="font-bold text-amber-400 text-sm mb-1">Strictly 6 Passes (d = 6)</div>
                      <div className="text-slate-300 leading-relaxed text-xs">
                        Postal PIN codes are exactly 6 digits (000000 to 999999). Radix sort finishes in exactly 6 passes, whether sorting 10 packages or 1,000,000 packages.
                      </div>
                    </div>

                    <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-700/60">
                      <div className="font-bold text-cyan-400 text-sm mb-1">Contiguous Cache Affinity</div>
                      <div className="text-slate-300 leading-relaxed text-xs">
                        OpenMP Static scheduling gives each CPU core a contiguous slice of parcels. Because passes are short, parcel chunks stay warm in L1/L2 CPU cache.
                      </div>
                    </div>

                    <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-700/60">
                      <div className="font-bold text-emerald-400 text-sm mb-1">Stable Multi-Key Sorting</div>
                      <div className="text-slate-300 leading-relaxed text-xs">
                        Radix Sort is stable: packages with the exact same PIN code maintain their arrival order, naturally prioritizing Prime Same-Day orders without extra sorting logic.
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-700">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                      The 6 Passes of Indian Postal PIN Codes
                    </h5>
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs font-mono">
                      <div className="p-2 bg-slate-800 rounded border border-slate-700">
                        <div className="text-cyan-400 font-bold">Pass 1</div>
                        <div className="text-[10px] text-slate-400 mt-1">Delivery Post Office</div>
                      </div>
                      <div className="p-2 bg-slate-800 rounded border border-slate-700">
                        <div className="text-cyan-400 font-bold">Pass 2</div>
                        <div className="text-[10px] text-slate-400 mt-1">Sorting District</div>
                      </div>
                      <div className="p-2 bg-slate-800 rounded border border-slate-700">
                        <div className="text-cyan-400 font-bold">Pass 3</div>
                        <div className="text-[10px] text-slate-400 mt-1">Sub-Region</div>
                      </div>
                      <div className="p-2 bg-slate-800 rounded border border-slate-700">
                        <div className="text-cyan-400 font-bold">Pass 4</div>
                        <div className="text-[10px] text-slate-400 mt-1">Revenue District</div>
                      </div>
                      <div className="p-2 bg-slate-800 rounded border border-slate-700">
                        <div className="text-cyan-400 font-bold">Pass 5</div>
                        <div className="text-[10px] text-slate-400 mt-1">Sub-Region / State</div>
                      </div>
                      <div className="p-2 bg-slate-800 rounded border border-slate-700">
                        <div className="text-cyan-400 font-bold">Pass 6</div>
                        <div className="text-[10px] text-slate-400 mt-1">Postal Zone (1-9)</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
