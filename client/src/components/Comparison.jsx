import React from 'react';
import { 
  HiOutlineUser, 
  HiOutlineUsers, 
  HiOutlineQueueList, 
  HiInformationCircle, 
  HiOutlineBolt 
} from 'react-icons/hi2';

const Comparison = () => {
  return (
    <section id="comparison" className="py-20 w-full bg-[#1e293b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest bg-cyan-950/80 px-3 py-1 rounded-full border border-cyan-800/80">
            Performance Analysis
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mt-3 mb-4">
            Direct Comparison
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-base">
            Comparing Serial execution with OpenMP Static and Dynamic scheduling strategies for Radix Sort.
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-teal-500 via-cyan-500 to-purple-500 mx-auto rounded-full mt-4"></div>
        </div>

        {/* 3 Direct Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          <div className="bg-gray-800/60 backdrop-blur border border-gray-700/50 p-6 rounded-xl flex flex-col justify-between hover:border-gray-600 transition-colors">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-blue-900/50 p-3 rounded-lg text-blue-400 shrink-0">
                  <HiOutlineUser className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-100">Serial</h3>
                  <span className="text-xs text-gray-400 font-mono">1 Thread</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Processes elements sequentially on a single core. Optimal for tiny arrays (&lt; 500 items) where parallel thread initialization exceeds sorting time.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-700/60 text-xs text-gray-400">
              <span className="text-amber-400 font-semibold">Overhead:</span> None
            </div>
          </div>

          <div className="bg-gradient-to-b from-cyan-950/40 to-gray-800/60 backdrop-blur border-2 border-cyan-500/80 p-6 rounded-xl flex flex-col justify-between shadow-xl relative">
            <div className="absolute -top-3 right-4 bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              ⭐ Recommended
            </div>
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-cyan-900/50 p-3 rounded-lg text-cyan-400 shrink-0">
                  <HiOutlineUsers className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-100">OpenMP Static</h3>
                  <code className="text-xs text-cyan-300 font-mono">schedule(static)</code>
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Partitions the array into contiguous slices per CPU core. Maintains high L1/L2 cache locality across digit passes with zero runtime queue lock contention.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-700/60 text-xs text-gray-300">
              <span className="text-emerald-400 font-semibold">Verdict:</span> Optimal for Radix Sort (Highest Speedup)
            </div>
          </div>

          <div className="bg-gray-800/60 backdrop-blur border border-purple-700/50 p-6 rounded-xl flex flex-col justify-between hover:border-purple-600 transition-colors">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-purple-900/50 p-3 rounded-lg text-purple-400 shrink-0">
                  <HiOutlineQueueList className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-100">OpenMP Dynamic</h3>
                  <code className="text-xs text-purple-300 font-mono">schedule(dynamic)</code>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Threads pull chunks on-demand from a centralized queue. Incurs atomic synchronization latency and inter-core cache thrashing on uniform workloads.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-700/60 text-xs text-gray-400">
              <span className="text-rose-400 font-semibold">Overhead:</span> High (Queue Contention & Cache Misses)
            </div>
          </div>

        </div>

        {/* Direct Comparison Table */}
        <div className="bg-gray-800/40 backdrop-blur border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl mb-10">
          <div className="p-5 bg-gray-900/60 border-b border-gray-700">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <HiOutlineBolt className="w-5 h-5 text-cyan-400" />
              Direct Comparison Matrix
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-gray-900/40 text-gray-300 text-xs uppercase tracking-wider border-b border-gray-700">
                  <th className="px-6 py-4 font-semibold">Feature</th>
                  <th className="px-6 py-4 font-semibold text-blue-300">Serial</th>
                  <th className="px-6 py-4 font-semibold text-teal-300 bg-teal-950/20">OpenMP Static (Optimal)</th>
                  <th className="px-6 py-4 font-semibold text-purple-300 bg-purple-950/20">OpenMP Dynamic</th>
                </tr>
              </thead>
              <tbody className="text-xs text-gray-300 divide-y divide-gray-700/50">
                <tr className="hover:bg-gray-700/20">
                  <td className="px-6 py-4 font-bold text-gray-200">Execution Mode</td>
                  <td className="px-6 py-4">Single-Core Sequential</td>
                  <td className="px-6 py-4 text-teal-300 bg-teal-950/10">Multi-Core Contiguous</td>
                  <td className="px-6 py-4 text-purple-300 bg-purple-950/10">Multi-Core Dynamic Queue</td>
                </tr>
                <tr className="hover:bg-gray-700/20">
                  <td className="px-6 py-4 font-bold text-gray-200">Loop Partitioning</td>
                  <td className="px-6 py-4">None ($1$ loop)</td>
                  <td className="px-6 py-4 text-teal-300 bg-teal-950/10">Deterministic $N / T$ chunks</td>
                  <td className="px-6 py-4 text-purple-300 bg-purple-950/10">On-demand runtime chunks</td>
                </tr>
                <tr className="hover:bg-gray-700/20">
                  <td className="px-6 py-4 font-bold text-gray-200">Queue Synchronization</td>
                  <td className="px-6 py-4 text-green-400">Zero</td>
                  <td className="px-6 py-4 text-teal-300 bg-teal-950/10 font-semibold">Zero (Pre-allocated)</td>
                  <td className="px-6 py-4 text-rose-400 bg-purple-950/10">High (Atomic queue locks)</td>
                </tr>
                <tr className="hover:bg-gray-700/20">
                  <td className="px-6 py-4 font-bold text-gray-200">L1/L2 Cache Locality</td>
                  <td className="px-6 py-4">High (Single Core)</td>
                  <td className="px-6 py-4 text-teal-300 bg-teal-950/10 font-semibold">Maximum (Cores keep data warm)</td>
                  <td className="px-6 py-4 text-amber-400 bg-purple-950/10">Poor (Chunks hop across cores)</td>
                </tr>
                <tr className="hover:bg-gray-700/20">
                  <td className="px-6 py-4 font-bold text-gray-200">Ideal Workload</td>
                  <td className="px-6 py-4">Tiny inputs (&lt; 500)</td>
                  <td className="px-6 py-4 text-teal-300 bg-teal-950/10">Uniform $O(1)$ tasks (Radix Sort)</td>
                  <td className="px-6 py-4 text-purple-300 bg-purple-950/10">Irregular/uneven tasks (Fractals, Raytracing)</td>
                </tr>
                <tr className="hover:bg-gray-700/20">
                  <td className="px-6 py-4 font-bold text-gray-200">Radix Sort Speedup</td>
                  <td className="px-6 py-4">1.0x Baseline</td>
                  <td className="px-6 py-4 font-bold text-emerald-400 bg-teal-950/10">Peak Speedup (25% - 50% faster than Dynamic)</td>
                  <td className="px-6 py-4 text-amber-400 bg-purple-950/10">Lower Speedup (Reduced by queue & cache overhead)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Concise Key Takeaway Notice */}
        <div className="bg-amber-900/20 border border-amber-700/50 rounded-xl p-5 flex flex-col sm:flex-row items-center sm:items-start gap-4 max-w-4xl mx-auto shadow-lg shadow-amber-900/10">
          <HiInformationCircle className="w-7 h-7 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-amber-400 font-bold text-sm mb-1">Key Takeaway</h4>
            <p className="text-amber-200/80 text-xs leading-relaxed">
              Because Radix Sort performs strictly uniform $O(1)$ operations on every single number, there is zero workload imbalance among threads. Therefore, <strong>Static Scheduling is decisively superior</strong> because it avoids the runtime queue synchronization and cache thrashing caused by dynamic dispatch.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Comparison;
