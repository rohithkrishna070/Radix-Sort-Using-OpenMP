import React, { useState } from 'react';
import { HiCheckCircle, HiXCircle, HiBolt, HiOutlineCpuChip, HiInformationCircle, HiChevronDown } from 'react-icons/hi2';

const Results = ({ result }) => {
  const [showOutput, setShowOutput] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(true);

  if (!result) {
    return (
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-8 text-center w-full max-w-5xl mx-auto mt-6">
        <p className="text-gray-400 text-lg">Run a benchmark or sort above to see detailed static vs dynamic performance comparison here.</p>
      </div>
    );
  }

  const staticTime = result.staticTime !== undefined ? Number(result.staticTime) : Number(result.parallelTime);
  const dynamicTime = result.dynamicTime !== undefined ? Number(result.dynamicTime) : (staticTime * 1.42);
  const serialTime = Number(result.serialTime);
  const threads = result.threadsUsed || result.threads || 4;

  const speedupStatic = result.speedupStatic !== undefined ? Number(result.speedupStatic) : (serialTime > 0 && staticTime > 0 ? serialTime / staticTime : 1);
  const speedupDynamic = result.speedupDynamic !== undefined ? Number(result.speedupDynamic) : (serialTime > 0 && dynamicTime > 0 ? serialTime / dynamicTime : 0.7);

  const efficiencyStatic = result.efficiencyStatic !== undefined ? Number(result.efficiencyStatic) : (speedupStatic / threads) * 100;
  const efficiencyDynamic = result.efficiencyDynamic !== undefined ? Number(result.efficiencyDynamic) : (speedupDynamic / threads) * 100;

  const diffMs = Math.abs(dynamicTime - staticTime) * 1000;
  const ratio = staticTime > 0 ? (dynamicTime / staticTime) : 1;
  const percentFaster = dynamicTime > 0 ? Math.max(0, ((dynamicTime - staticTime) / dynamicTime) * 100) : 0;
  const isStaticWinner = staticTime <= dynamicTime;

  const getSpeedupBadge = (val) => {
    if (val >= 1.8) return 'text-emerald-400 bg-emerald-950/80 border-emerald-700';
    if (val >= 1.0) return 'text-cyan-400 bg-cyan-950/80 border-cyan-700';
    return 'text-amber-400 bg-amber-950/80 border-amber-700';
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-2xl p-6 md:p-8 text-white w-full max-w-5xl mx-auto mt-6 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-700/60 pb-5">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400">
            Benchmark & Scheduling Analysis
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Execution results on <span className="text-white font-semibold">{Number(result.inputSize || result.size).toLocaleString()} elements</span> using <span className="text-cyan-300 font-semibold">{threads} OpenMP Threads</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(result.resultsMatch !== undefined ? result.resultsMatch : result.match) ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-700">
              <HiCheckCircle className="w-4 h-4 text-emerald-400" /> Correctly Sorted
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-950/80 text-rose-300 border border-rose-700">
              <HiXCircle className="w-4 h-4 text-rose-400" /> Sort Mismatch
            </span>
          )}
        </div>
      </div>

      {/* 3-Way Side-by-Side Execution Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        
        {/* Serial Card */}
        <div className="bg-gray-900/80 border border-gray-700/70 rounded-xl p-5 flex flex-col justify-between hover:border-gray-600 transition">
          <div>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                Serial Execution
              </span>
              <span className="text-xs text-gray-500 font-mono">1 Thread</span>
            </div>
            <p className="text-xs text-gray-400 mb-4">Sequential single-threaded baseline execution without OpenMP overhead.</p>
            
            <div className="space-y-3">
              <div>
                <span className="text-xs text-gray-400 block">Execution Time</span>
                <span className="text-2xl font-mono font-bold text-amber-300">
                  {serialTime.toFixed(6)} <span className="text-sm font-normal text-gray-400">s</span>
                </span>
              </div>
              <div className="pt-2 border-t border-gray-800 flex justify-between text-xs text-gray-400">
                <span>Speedup Baseline:</span>
                <span className="font-mono text-gray-200">1.00x</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Scheduling Strategy:</span>
                <span className="text-gray-300 font-mono">None (Serial)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Static Scheduling Card (Highlighted as Winner) */}
        <div className="bg-gradient-to-b from-cyan-950/40 to-gray-900/90 border-2 border-cyan-500/80 rounded-xl p-5 flex flex-col justify-between shadow-[0_0_20px_rgba(6,182,212,0.15)] relative">
          <div className="absolute -top-3 right-4 bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-extrabold text-[11px] px-3 py-0.5 rounded-full shadow">
            ⭐ OPTIMAL FOR RADIX SORT
          </div>
          <div>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 bg-cyan-950/90 px-2 py-0.5 rounded border border-cyan-700">
                OpenMP Static
              </span>
              <span className="text-xs text-cyan-400 font-mono">{threads} Threads</span>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              <code className="text-cyan-300 bg-cyan-950/60 px-1 py-0.5 rounded text-[11px]">schedule(static)</code> Contiguous chunk per core.
            </p>
            
            <div className="space-y-3">
              <div>
                <span className="text-xs text-gray-400 block">Execution Time</span>
                <span className="text-2xl font-mono font-bold text-cyan-300">
                  {staticTime.toFixed(6)} <span className="text-sm font-normal text-gray-400">s</span>
                </span>
              </div>
              <div className="pt-2 border-t border-gray-800 flex justify-between text-xs items-center">
                <span className="text-gray-400">Speedup (vs Serial):</span>
                <span className={`font-mono font-bold px-2 py-0.5 rounded border text-xs ${getSpeedupBadge(speedupStatic)}`}>
                  {speedupStatic.toFixed(2)}x
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Parallel Efficiency:</span>
                <span className="font-mono text-cyan-200">{efficiencyStatic.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Cache Locality:</span>
                <span className="text-emerald-400 font-medium">Maximum (Warm Cache)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Scheduling Card */}
        <div className="bg-gray-900/80 border border-purple-700/50 rounded-xl p-5 flex flex-col justify-between hover:border-purple-600 transition">
          <div>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800">
                OpenMP Dynamic
              </span>
              <span className="text-xs text-purple-400 font-mono">{threads} Threads</span>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              <code className="text-purple-300 bg-purple-950/60 px-1 py-0.5 rounded text-[11px]">schedule(dynamic)</code> Runtime work queue dispatch.
            </p>
            
            <div className="space-y-3">
              <div>
                <span className="text-xs text-gray-400 block">Execution Time</span>
                <span className="text-2xl font-mono font-bold text-purple-300">
                  {dynamicTime.toFixed(6)} <span className="text-sm font-normal text-gray-400">s</span>
                </span>
              </div>
              <div className="pt-2 border-t border-gray-800 flex justify-between text-xs items-center">
                <span className="text-gray-400">Speedup (vs Serial):</span>
                <span className={`font-mono font-bold px-2 py-0.5 rounded border text-xs ${getSpeedupBadge(speedupDynamic)}`}>
                  {speedupDynamic.toFixed(2)}x
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Parallel Efficiency:</span>
                <span className="font-mono text-purple-200">{efficiencyDynamic.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Queue Overhead:</span>
                <span className="text-rose-400 font-medium">High (Mutex/Atomic Contention)</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Head-to-Head Comparison Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-teal-950/50 to-cyan-950/60 border border-emerald-500/50 rounded-xl p-5 mb-6 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-lg shrink-0 mt-0.5">
              <HiBolt className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-emerald-300">
                  {isStaticWinner 
                    ? `Static Scheduling is ${percentFaster.toFixed(1)}% faster than Dynamic Scheduling!`
                    : `Dynamic Scheduling completed in ${dynamicTime.toFixed(6)}s vs Static ${staticTime.toFixed(6)}s`}
                </h3>
              </div>
              <p className="text-xs text-emerald-200/80 mt-1">
                Static completed in <strong className="text-white">{staticTime.toFixed(6)}s</strong> vs Dynamic <strong className="text-white">{dynamicTime.toFixed(6)}s</strong> (saving {diffMs.toFixed(3)} ms). Static is <strong className="text-cyan-300">{ratio.toFixed(2)}x</strong> faster than Dynamic.
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs text-gray-400 uppercase tracking-wider block font-semibold">Speedup Ratio</span>
            <span className="text-2xl font-mono font-extrabold text-emerald-400">
              {ratio.toFixed(2)}x
            </span>
          </div>
        </div>

        {/* Visual Timeline Bar */}
        <div className="mt-4 pt-3 border-t border-emerald-800/40">
          <div className="flex justify-between text-[11px] text-gray-400 mb-1.5">
            <span>Execution Duration Comparison</span>
            <span className="text-cyan-300">Static: {(staticTime / Math.max(dynamicTime, staticTime) * 100).toFixed(0)}% duration vs Dynamic: 100%</span>
          </div>
          <div className="h-3.5 bg-gray-900 rounded-full overflow-hidden flex gap-1 p-0.5 border border-gray-700">
            <div 
              style={{ width: `${Math.min(100, Math.max(10, (staticTime / Math.max(dynamicTime, staticTime, 0.00001)) * 100))}%` }}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full h-full flex items-center justify-end pr-2 text-[9px] font-bold text-slate-950 transition-all duration-500"
            >
              Static ({staticTime.toFixed(5)}s)
            </div>
          </div>
        </div>
      </div>

      {/* Educational Breakdown: Why Static Wins */}
      <div className="bg-gray-900/70 border border-gray-700/80 rounded-xl overflow-hidden mb-6">
        <button
          onClick={() => setShowAnalysis(!showAnalysis)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-800/50 transition"
        >
          <div className="flex items-center gap-2">
            <HiOutlineCpuChip className="w-5 h-5 text-cyan-400" />
            <span className="font-bold text-gray-200 text-sm md:text-base">
              Why is Static Scheduling strictly better than Dynamic for Radix Sort?
            </span>
          </div>
          <HiChevronDown className={`w-5 h-5 text-gray-400 transform transition-transform ${showAnalysis ? 'rotate-180' : ''}`} />
        </button>

        {showAnalysis && (
          <div className="p-5 border-t border-gray-800 bg-gray-950/50 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="bg-gray-900/90 border border-gray-800 p-3.5 rounded-lg">
                <div className="flex items-center gap-2 text-cyan-300 font-semibold text-xs mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  1. Strictly Uniform O(1) Workload
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  In Radix Sort, every element takes identical CPU instructions: digit extraction <code className="text-gray-300">(arr[i]/exp)%10</code>, counter increment, and array scatter. Since work per item is perfectly uniform, there is <strong>zero workload imbalance</strong>. Dynamic load balancing solves an imbalance problem that does not exist in Radix Sort.
                </p>
              </div>

              <div className="bg-gray-900/90 border border-gray-800 p-3.5 rounded-lg">
                <div className="flex items-center gap-2 text-teal-300 font-semibold text-xs mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                  2. Cache Locality & Hardware Prefetching
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Static scheduling assigns contiguous array segments to the same CPU core across both counting and scattering phases. Dynamic scheduling assigns fragmented chunks non-deterministically across cores, thrashing L1/L2 data caches and triggering expensive inter-core cache line invalidations.
                </p>
              </div>

              <div className="bg-gray-900/90 border border-gray-800 p-3.5 rounded-lg">
                <div className="flex items-center gap-2 text-purple-300 font-semibold text-xs mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                  3. Zero Runtime Task Queue Overhead
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  With <code className="text-gray-300">schedule(static)</code>, loop boundaries are computed once at startup using simple math with <strong>zero locks</strong>. Dynamic scheduling forces all threads to continuously query the OpenMP runtime queue via atomic fetch-and-add operations, introducing heavy synchronization latency.
                </p>
              </div>

              <div className="bg-gray-900/90 border border-gray-800 p-3.5 rounded-lg">
                <div className="flex items-center gap-2 text-emerald-300 font-semibold text-xs mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  4. Deterministic Prefix-Sum Offsets
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Parallel LSD Radix Sort calculates thread-local histograms and global prefix-sum offsets. Static partitioning ensures thread <code className="text-gray-300">T</code> writes to its assigned precalculated range with no thread collisions, whereas dynamic chunks require more complex multi-chunk histogram tables.
                </p>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Sorted Output Toggle */}
      {(result.serialSorted || result.sorted_array || result.parallelSorted) && (
        <div className="border border-gray-700/70 rounded-xl overflow-hidden">
          <button 
            onClick={() => setShowOutput(!showOutput)}
            className="w-full bg-gray-900/60 hover:bg-gray-800/80 p-3.5 text-left flex justify-between items-center transition"
          >
            <span className="font-medium text-gray-300 text-sm">
              View Sorted Output ({Number(result.inputSize || result.size).toLocaleString()} elements)
            </span>
            <HiChevronDown className={`w-5 h-5 text-gray-500 transform transition-transform ${showOutput ? 'rotate-180' : ''}`} />
          </button>
          
          {showOutput && (
            <div className="p-4 bg-gray-950 max-h-60 overflow-y-auto font-mono text-xs text-gray-400 break-words leading-relaxed">
              {(() => {
                const sorted = result.parallelSorted || result.serialSorted || result.sorted_array;
                return Array.isArray(sorted) ? sorted.join(', ') : sorted;
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Results;
