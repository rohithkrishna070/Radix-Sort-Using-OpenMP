import React, { useState, useEffect } from 'react';
import { 
  HiOutlineShieldCheck, 
  HiOutlineShieldExclamation, 
  HiOutlineServer, 
  HiOutlineCpuChip, 
  HiOutlineBolt, 
  HiOutlineGlobeAlt, 
  HiOutlinePlay, 
  HiOutlineArrowPath, 
  HiOutlineSparkles,
  HiOutlineAdjustmentsHorizontal,
  HiOutlineInformationCircle,
  HiOutlineExclamationTriangle,
  HiOutlineBuildingOffice2
} from 'react-icons/hi2';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  Legend, 
  Cell 
} from 'recharts';

const SCENARIOS = [
  {
    id: 'ddos',
    name: 'DDoS Botnet Flood',
    badge: '🚨 High Threat',
    badgeColor: 'bg-rose-950/80 text-rose-300 border-rose-700/60',
    shortDesc: '75% malicious packet flood from botnet subnets attacking port 443/80.',
    fullDesc: 'Simulates a Distributed Denial of Service (DDoS) botnet flood. Over 75% of packets originate from 3 concentrated rogue subnets (185.220.101.x, 45.142.212.x, 194.26.29.x) firing TCP SYN-Floods and UDP packets at a target server. Radix sort clusters them consecutively, allowing firewalls to detect and block the attack subnets in hardware.',
    target: 'Target Web Gateway (10.0.0.1:443)',
    keyMetric: 'Threat Detection'
  },
  {
    id: 'enterprise',
    name: 'Enterprise Corporate LAN',
    badge: '🏢 Corporate',
    badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
    shortDesc: 'Internal VLAN traffic between Finance, Engineering, and Database clusters.',
    fullDesc: 'Simulates a high-traffic corporate enterprise campus with segmented VLANs: Finance LAN (10.10.1.x), Engineering (10.10.2.x), Sales/HR (10.10.3.x), Workstations (192.168.1.x), and Database Servers (172.16.50.x). Radix sort organizes internal packets by subnet to enforce firewall security rules and Quality of Service (QoS).',
    target: 'Enterprise Core Router (172.16.0.10)',
    keyMetric: 'VLAN Segmentation'
  },
  {
    id: 'global',
    name: 'Global Internet Backbone',
    badge: '🌐 ISP Backbone',
    badgeColor: 'bg-blue-950/80 text-blue-300 border-blue-700/60',
    shortDesc: 'Uniformly distributed public IPv4 packets across global autonomous systems.',
    fullDesc: 'Simulates Tier-1 Internet Service Provider (ISP) transit backbone routing (like AT&T, Lumen, Cisco). Highly randomized worldwide IPv4 traffic across Class A, B, and C networks. Radix sort allows transit routers to group incoming packets by BGP routing prefix in strictly linear O(N) time without comparison overhead.',
    target: 'BGP Transit Border Gateway',
    keyMetric: 'Transit Routing'
  }
];

const SMALL_SIZES = [10, 25, 50, 100];
const LARGE_SIZES = [10000, 50000, 100000, 250000, 500000];
const THREAD_OPTIONS = [1, 2, 4, 8, 16];

export default function NetworkSimulation() {
  const [dataMode, setDataMode] = useState('large'); // 'small' or 'large'
  const [scenario, setScenario] = useState('ddos');
  const [packetCount, setPacketCount] = useState(50000);
  const [threads, setThreads] = useState(4);
  const [customIps, setCustomIps] = useState('192.168.1.105, 10.0.1.4, 185.220.101.42, 45.142.212.9, 10.0.1.88, 192.168.1.20');
  const [useCustomInput, setUseCustomInput] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('subnets'); // 'subnets', 'packets'

  // Update default packetCount when switching dataMode
  const handleModeChange = (mode) => {
    setDataMode(mode);
    if (mode === 'small') {
      setPacketCount(25);
    } else {
      setPacketCount(50000);
    }
  };

  // Run the network packet simulation
  const runSimulation = async () => {
    setLoading(true);
    setError(null);

    try {
      let payload = {
        scenario,
        threads,
        schedule: 'static' // Parallel engine uses optimal OpenMP static partitioning
      };

      if (dataMode === 'small' && useCustomInput) {
        const ips = customIps.split(',').map(s => s.trim()).filter(Boolean);
        if (ips.length === 0) {
          throw new Error('Please enter at least one valid IP address.');
        }
        payload.customPackets = ips;
        payload.count = ips.length;
      } else {
        payload.count = packetCount;
      }

      const response = await fetch('/api/network/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Simulation error:', err);
      setError(err.message || 'Failed to execute simulation');
    } finally {
      setLoading(false);
    }
  };

  // Run once on initial load for instant demo
  useEffect(() => {
    runSimulation();
  }, []);

  // Current scenario object
  const currentScenarioObj = SCENARIOS.find(s => s.id === scenario) || SCENARIOS[0];

  return (
    <div className="py-20 w-full bg-slate-900 border-t border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-cyan-950/80 border border-cyan-800/80 px-3.5 py-1 rounded-full text-xs font-semibold text-cyan-400 mb-3">
            <HiOutlineShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Real-World Application • IPv4 High-Throughput Packet Firewall</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Network Packet Traffic Analyzer
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-400 max-w-3xl mx-auto">
            See how OpenMP Parallel Radix Sort processes, sorts, and clusters millions of IPv4 packet headers in linear <span className="text-cyan-400 font-mono">O(N)</span> time to uncover DDoS botnets and manage enterprise routing.
          </p>
        </div>

        {/* Configuration Panel */}
        <div className="bg-slate-800/60 backdrop-blur border border-slate-700/60 rounded-2xl p-6 sm:p-8 shadow-2xl mb-10">
          
          {/* Top Control Bar: Mode & Scenario */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6 border-b border-slate-700/60">
            
            {/* Mode Switcher: Small Data vs Large Data */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-3 flex items-center gap-2">
                <HiOutlineAdjustmentsHorizontal className="w-4 h-4 text-cyan-400" />
                Data Scale Selection
              </label>
              <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-900/80 rounded-xl border border-slate-700">
                <button
                  type="button"
                  onClick={() => handleModeChange('small')}
                  className={`py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
                    dataMode === 'small'
                      ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🔍 Small Data (Inspector)
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange('large')}
                  className={`py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
                    dataMode === 'large'
                      ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🚀 Large Data (High-Throughput)
                </button>
              </div>
            </div>

            {/* Scenario Selector */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-3 flex items-center gap-2">
                <HiOutlineGlobeAlt className="w-4 h-4 text-purple-400" />
                Network Traffic Scenario
              </label>
              <div className="grid grid-cols-3 gap-2">
                {SCENARIOS.map(sc => (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => setScenario(sc.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      scenario === sc.id
                        ? 'border-cyan-400 bg-cyan-950/40 text-white shadow-lg shadow-cyan-950/30'
                        : 'border-slate-700 bg-slate-900/50 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className="text-xs font-bold truncate">{sc.name}</div>
                    <span className={`inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded border ${sc.badgeColor}`}>
                      {sc.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Lower Control Bar: Packet Volume & Threads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            
            {/* Packet Count / Custom Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Packet Count
                </label>
                {dataMode === 'small' && (
                  <button
                    type="button"
                    onClick={() => setUseCustomInput(!useCustomInput)}
                    className="text-[11px] text-cyan-400 hover:underline"
                  >
                    {useCustomInput ? 'Use Presets' : 'Custom IPs'}
                  </button>
                )}
              </div>

              {useCustomInput && dataMode === 'small' ? (
                <div>
                  <input
                    type="text"
                    value={customIps}
                    onChange={(e) => setCustomIps(e.target.value)}
                    placeholder="Comma-separated IPv4 addresses"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Enter IPs like 192.168.1.1, 10.0.0.5</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(dataMode === 'small' ? SMALL_SIZES : LARGE_SIZES).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setPacketCount(s)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors ${
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
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={runSimulation}
              disabled={loading}
              className={`px-8 py-3.5 rounded-xl font-extrabold text-sm sm:text-base flex items-center gap-3 transition-all transform hover:scale-[1.02] shadow-xl ${
                loading
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 text-slate-950 hover:brightness-110 shadow-cyan-500/20'
              }`}
            >
              {loading ? (
                <>
                  <HiOutlineArrowPath className="w-5 h-5 animate-spin" />
                  <span>Processing Packets via OpenMP...</span>
                </>
              ) : (
                <>
                  <HiOutlinePlay className="w-5 h-5" />
                  <span>Run OpenMP Packet Sorter</span>
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

            {/* Performance Metric Cards: Serial vs OpenMP Parallel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Card 1: Serial Execution */}
              <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Baseline (Sequential)</span>
                    <span className="text-xs px-2.5 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">1 Core</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">Serial Radix Sort</h3>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold font-mono text-amber-400">
                      {(result.serialTime * 1000).toFixed(3)}
                    </span>
                    <span className="text-sm text-slate-400">ms</span>
                  </div>
                </div>
                <div className="mt-5 pt-3 border-t border-slate-700/80 text-xs text-slate-400">
                  Processes {result.inputSize.toLocaleString()} packet headers sequentially on a single CPU core.
                </div>
              </div>

              {/* Card 2: OpenMP Parallel Execution */}
              <div className="bg-gradient-to-b from-cyan-950/50 to-slate-800/50 border-2 border-cyan-500/80 rounded-2xl p-6 flex flex-col justify-between relative shadow-xl shadow-cyan-950/40">
                <div className="absolute -top-3 right-4 bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                  ⚡ OpenMP Parallel
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Multi-Threaded</span>
                    <span className="text-xs px-2.5 py-0.5 rounded bg-cyan-900/60 text-cyan-300 font-mono font-bold">
                      {result.threadsUsed} Threads
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white">OpenMP Parallel Radix Sort</h3>
                  <div className="mt-4 flex items-baseline gap-3">
                    <span className="text-4xl font-extrabold font-mono text-cyan-400">
                      {(result.staticTime * 1000).toFixed(3)}
                    </span>
                    <span className="text-sm text-slate-400">ms</span>
                    <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full border ${
                      result.speedupStatic >= 1.0
                        ? 'bg-emerald-950/80 text-emerald-400 border-emerald-700/60'
                        : 'bg-amber-950/80 text-amber-400 border-amber-700/60'
                    }`}>
                      {result.speedupStatic.toFixed(2)}x Speedup
                    </span>
                  </div>
                </div>
                <div className="mt-5 pt-3 border-t border-slate-700/80 text-xs text-cyan-200 flex items-center justify-between">
                  <span>Throughput: {Math.round(result.inputSize / Math.max(0.000001, result.staticTime)).toLocaleString()} packets/sec</span>
                  <span className="font-mono text-slate-400">{result.threadsUsed} cores engaged</span>
                </div>
              </div>

            </div>

            {/* Over-Parallelization / Amdahl's Law Explanation Banner (when Speedup < 1.0) */}
            {result.speedupStatic < 1.0 && (
              <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-600/60 text-amber-200 flex items-start gap-3 shadow-lg">
                <HiOutlineExclamationTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <span className="font-bold text-amber-300 text-sm block mb-1">
                    Why is Serial faster than Parallel for this run? (Amdahl's Law & Thread Overhead)
                  </span>
                  For <strong>{result.inputSize.toLocaleString()} packets</strong>, the total data size is only ~{((result.inputSize * 4) / 1024).toFixed(0)} KB. This fits completely within a single CPU core's fast L2 cache and executes in just ~{(result.serialTime * 1000).toFixed(1)} ms sequentially.
                  Dividing this tiny workload among <strong>{result.threadsUsed} threads</strong> gives each core only ~{Math.floor(result.inputSize / result.threadsUsed).toLocaleString()} packets, but forces OpenMP to execute multiple barrier synchronizations across all cores. The barrier synchronization overhead (~5-8 ms) exceeds the computation time.
                  <span className="block mt-1 font-semibold text-amber-300">
                    💡 Solution: Select <strong>2T or 4T</strong>, or increase packet count to <strong>250k - 500k</strong> to see parallel speedup dominate!
                  </span>
                </div>
              </div>
            )}

            {/* DEDICATED SIMULATION GRAPHS (DIRECTLY VISIBLE ON SCREEN) */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 shadow-2xl">
              <div className="mb-6 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>📊 Dedicated Network Simulation Performance Graphs</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live execution timing and subnet traffic concentration radar for this simulation run.
                  </p>
                </div>
                <span className="text-xs bg-slate-900 px-3 py-1 rounded-full border border-slate-700 text-cyan-300 font-mono">
                  {result.inputSize.toLocaleString()} Packets • {result.threadsUsed} OpenMP Threads
                </span>
              </div>

              {/* Responsive 2-Column Graph Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* GRAPH 1: Execution Time Comparison (Serial vs OpenMP Parallel) */}
                <div className="min-w-0 bg-slate-900/80 border border-slate-700/60 rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>Execution Time Comparison</span>
                      </h4>
                      <span className="text-[11px] font-mono text-cyan-400">Lower is better</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-4">
                      Serial (Amber) vs OpenMP Parallel (Cyan) in milliseconds.
                    </p>
                  </div>
                  
                  <div className="w-full h-64 min-w-0">
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart 
                        data={[
                          {
                            name: `${result.threadsUsed} Threads`,
                            'Serial Sort': Number((result.serialTime * 1000).toFixed(2)),
                            'OpenMP Parallel': Number((result.staticTime * 1000).toFixed(2))
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
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Bar dataKey="Serial Sort" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="OpenMP Parallel" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* GRAPH 2: Traffic Concentration by Subnet (Top Talkers & Threats) */}
                <div className="min-w-0 bg-slate-900/80 border border-slate-700/60 rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>Traffic Concentration by Subnet</span>
                      </h4>
                      <span className="text-[11px] font-semibold text-rose-400">🔴 Threat: &gt;15% traffic</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-4">
                      Packet volume per /24 subnet. Concentrated DDoS botnets highlighted in crimson red.
                    </p>
                  </div>

                  <div className="w-full h-64 min-w-0">
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart 
                        data={result.subnetStats.slice(0, 8)} 
                        margin={{ top: 15, right: 15, left: 0, bottom: 25 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis 
                          dataKey="subnet" 
                          stroke="#94a3b8" 
                          fontSize={10} 
                          interval={0} 
                          angle={-25} 
                          textAnchor="end" 
                        />
                        <YAxis stroke="#94a3b8" fontSize={11} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                          formatter={(val, name, item) => [`${val.toLocaleString()} packets (${item.payload.percentage}%)`, 'Traffic Volume']}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                          {result.subnetStats.slice(0, 8).map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.isThreat ? '#f43f5e' : '#06b6d4'} 
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

            </div>

            {/* DETAILED EXPLANATION OF THE 3 NETWORK SCENARIOS */}
            <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6 shadow-xl">
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <HiOutlineInformationCircle className="w-5 h-5 text-cyan-400" />
                <span>Understanding the 3 Network Traffic Scenarios</span>
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Each scenario tests Radix Sort under real-world traffic patterns found in modern networking and cybersecurity:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {SCENARIOS.map(sc => (
                  <div 
                    key={sc.id} 
                    className={`p-5 rounded-xl border transition-all flex flex-col justify-between ${
                      scenario === sc.id
                        ? 'bg-cyan-950/30 border-cyan-500/80 shadow-lg'
                        : 'bg-slate-900/60 border-slate-700/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${sc.badgeColor}`}>
                          {sc.badge}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">{sc.keyMetric}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white mb-2">{sc.name}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">{sc.fullDesc}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-cyan-400">
                      🎯 {sc.target}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Subnet Analysis & Packet Inspector Tabs */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
              
              {/* Tab Switcher */}
              <div className="flex border-b border-slate-700 bg-slate-900/70 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('subnets')}
                  className={`py-3 px-6 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'subnets'
                      ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  🛡️ Subnet & Threat Clusters
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('packets')}
                  className={`py-3 px-6 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'packets'
                      ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  📋 Packet Stream Inspector ({dataMode === 'small' ? 'All Rows' : 'Top 100 Sample'})
                </button>
              </div>

              {/* TAB 1: Subnet Analysis & Threat Clustering */}
              {activeTab === 'subnets' && (
                <div className="p-6">
                  <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-base font-bold text-white flex items-center gap-2">
                        <span>Grouped /24 Subnets & Threat Detection</span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Radix Sort partitions packets consecutively into subnets, immediately isolating concentrated attack sources.
                      </p>
                    </div>
                    <span className="text-xs bg-slate-900 px-3 py-1 rounded-full border border-slate-700 text-slate-300">
                      Total Analyzed: {result.inputSize.toLocaleString()} Packets
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {result.subnetStats.map((sub, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border transition-all ${
                          sub.isThreat
                            ? 'bg-rose-950/30 border-rose-600/70 shadow-lg shadow-rose-950/30'
                            : 'bg-slate-900/50 border-slate-700/60'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <code className="text-xs font-mono font-bold text-cyan-300">{sub.subnet}</code>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                              sub.threatLevel.includes('CRITICAL')
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                                : sub.threatLevel.includes('SUSPICIOUS')
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {sub.threatLevel}
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between mt-3">
                          <div>
                            <span className="text-2xl font-bold font-mono text-white">{sub.count.toLocaleString()}</span>
                            <span className="text-xs text-slate-400 ml-1">pkts</span>
                          </div>
                          <span className="text-xs font-mono font-semibold text-slate-300">
                            {sub.percentage}% of traffic
                          </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              sub.isThreat ? 'bg-rose-500' : 'bg-cyan-500'
                            }`}
                            style={{ width: `${Math.min(100, sub.percentage * 2)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* IPv4 4-Pass Radix Sort Explainer */}
                  <div className="p-4 bg-slate-900/70 rounded-xl border border-slate-700/70">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
                      <HiOutlineSparkles className="w-4 h-4 text-cyan-400" />
                      How Radix Sort Powers IPv4 Packet Routing
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-2.5 bg-slate-800/60 rounded-lg border border-slate-700/40">
                        <div className="font-bold text-cyan-400">Pass 1 • Byte 4</div>
                        <div className="text-slate-400 text-[11px] mt-1">Sorts host identifier (e.g. .105). Zero branch penalties.</div>
                      </div>
                      <div className="p-2.5 bg-slate-800/60 rounded-lg border border-slate-700/40">
                        <div className="font-bold text-cyan-400">Pass 2 • Byte 3</div>
                        <div className="text-slate-400 text-[11px] mt-1">Clusters local /24 subnets consecutively together.</div>
                      </div>
                      <div className="p-2.5 bg-slate-800/60 rounded-lg border border-slate-700/40">
                        <div className="font-bold text-cyan-400">Pass 3 • Byte 2</div>
                        <div className="text-slate-400 text-[11px] mt-1">Groups /16 enterprise campus networks.</div>
                      </div>
                      <div className="p-2.5 bg-slate-800/60 rounded-lg border border-slate-700/40">
                        <div className="font-bold text-cyan-400">Pass 4 • Byte 1</div>
                        <div className="text-slate-400 text-[11px] mt-1">Finalizes Class A prefixes. 100% sorted in 4 passes.</div>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: Packet Table (Small or Sampled) */}
              {activeTab === 'packets' && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        Sorted IPv4 Packet Stream
                      </h4>
                      <p className="text-xs text-slate-400">
                        {dataMode === 'small' && result.allSortedPackets
                          ? `Showing all ${result.allSortedPackets.length} sorted packets.`
                          : `Showing first 100 packets sorted numerically by Source IP.`}
                      </p>
                    </div>
                    <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded border border-cyan-800">
                      Key: Source IP (32-bit uint)
                    </span>
                  </div>

                  <div className="overflow-x-auto max-h-96 border border-slate-700 rounded-xl">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-slate-900 text-slate-300 sticky top-0 border-b border-slate-700">
                        <tr>
                          <th className="py-2.5 px-3">#</th>
                          <th className="py-2.5 px-3 text-cyan-300 font-bold">Source IP (Sorted)</th>
                          <th className="py-2.5 px-3">Destination IP</th>
                          <th className="py-2.5 px-3">Protocol</th>
                          <th className="py-2.5 px-3">Port</th>
                          <th className="py-2.5 px-3">Size</th>
                          <th className="py-2.5 px-3">Subnet</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 bg-slate-950/60">
                        {(dataMode === 'small' && result.allSortedPackets ? result.allSortedPackets : result.sampleSorted).map((pkt, i) => (
                          <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                            <td className="py-2 px-3 text-slate-500">{i + 1}</td>
                            <td className="py-2 px-3 text-cyan-400 font-bold">{pkt.srcIp}</td>
                            <td className="py-2 px-3 text-slate-300">{pkt.destIp}</td>
                            <td className="py-2 px-3">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                pkt.protocol === 'TCP' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                                pkt.protocol === 'UDP' ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                                'bg-amber-950 text-amber-300 border border-amber-800'
                              }`}>
                                {pkt.protocol}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-slate-300">{pkt.port}</td>
                            <td className="py-2 px-3 text-slate-400">{pkt.packetSize} B</td>
                            <td className="py-2 px-3 text-slate-400">{pkt.subnet}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
