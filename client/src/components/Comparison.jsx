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

        {/* 4 Direct Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          
          <div className="bg-gray-800/60 backdrop-blur border border-gray-700/50 p-5 rounded-xl flex flex-col justify-between hover:border-gray-600 transition-colors">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-blue-900/50 p-2.5 rounded-lg text-blue-400 shrink-0">
                  <HiOutlineUser className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-100">Serial</h3>
                  <span className="text-xs text-gray-400 font-mono">1 Core Baseline</span>
                </div>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">
                Processes elements sequentially on a single core. Optimal for tiny arrays (&lt; 500 items) where thread setup latency exceeds sorting time.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-700/60 text-xs text-gray-400">
              <span className="text-amber-400 font-semibold">Overhead:</span> None (Sequential)
            </div>
          </div>

          <div className="bg-gradient-to-b from-cyan-950/40 to-gray-800/60 backdrop-blur border-2 border-cyan-500/80 p-5 rounded-xl flex flex-col justify-between shadow-xl relative">
            <div className="absolute -top-2.5 right-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-extrabold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
              ⭐ Recommended
            </div>
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-cyan-900/50 p-2.5 rounded-lg text-cyan-400 shrink-0">
                  <HiOutlineUsers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-100">OpenMP Static</h3>
                  <code className="text-xs text-cyan-300 font-mono">schedule(static)</code>
                </div>
              </div>
              <p className="text-gray-300 text-xs leading-relaxed">
                Partitions contiguous slices per CPU core in shared RAM. Maintains L1/L2 cache locality across passes with zero work-queue mutex locking.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-700/60 text-xs text-gray-300">
              <span className="text-emerald-400 font-semibold">Verdict:</span> Optimal for Single PC
            </div>
          </div>

          <div className="bg-gray-800/60 backdrop-blur border border-purple-700/50 p-5 rounded-xl flex flex-col justify-between hover:border-purple-600 transition-colors">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-purple-900/50 p-2.5 rounded-lg text-purple-400 shrink-0">
                  <HiOutlineQueueList className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-100">OpenMP Dynamic</h3>
                  <code className="text-xs text-purple-300 font-mono">schedule(dynamic)</code>
                </div>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">
                Threads pull chunks on-demand from a centralized queue. Incurs atomic synchronization latency and inter-core cache thrashing on uniform workloads.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-700/60 text-xs text-gray-400">
              <span className="text-rose-400 font-semibold">Overhead:</span> Task Queue Mutex
            </div>
          </div>

          <div className="bg-gray-800/60 backdrop-blur border border-emerald-700/50 p-5 rounded-xl flex flex-col justify-between hover:border-emerald-600 transition-colors">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-emerald-950 p-2.5 rounded-lg text-emerald-400 shrink-0 border border-emerald-800">
                  <HiOutlineBolt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-100">MPI Distributed</h3>
                  <code className="text-xs text-emerald-300 font-mono">MPI_Alltoallv</code>
                </div>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">
                Independent OS processes with isolated memories. Scales across clusters, but incurs buffer marshalling and IPC communication costs on a single machine.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-700/60 text-xs text-gray-400">
              <span className="text-amber-400 font-semibold">Overhead:</span> IPC / Buffer Copying
            </div>
          </div>

        </div>

        {/* 4-Column Direct Comparison Matrix Table */}
        <div className="bg-gray-800/40 backdrop-blur border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl mb-10">
          <div className="p-5 bg-gray-900/60 border-b border-gray-700">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <HiOutlineBolt className="w-5 h-5 text-cyan-400" />
              Comprehensive 4-Way Architecture Matrix
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="bg-gray-900/40 text-gray-300 text-xs uppercase tracking-wider border-b border-gray-700">
                  <th className="px-5 py-4 font-semibold">Architectural Property</th>
                  <th className="px-5 py-4 font-semibold text-blue-300">Serial</th>
                  <th className="px-5 py-4 font-semibold text-teal-300 bg-teal-950/20">OpenMP Static ⭐</th>
                  <th className="px-5 py-4 font-semibold text-purple-300 bg-purple-950/20">OpenMP Dynamic</th>
                  <th className="px-5 py-4 font-semibold text-emerald-300 bg-emerald-950/20">MPI Distributed</th>
                </tr>
              </thead>
              <tbody className="text-xs text-gray-300 divide-y divide-gray-700/50">
                <tr className="hover:bg-gray-700/20">
                  <td className="px-5 py-3.5 font-bold text-gray-200">Memory Architecture</td>
                  <td className="px-5 py-3.5">Single Private Memory</td>
                  <td className="px-5 py-3.5 text-teal-300 bg-teal-950/10">Shared RAM (All threads)</td>
                  <td className="px-5 py-3.5 text-purple-300 bg-purple-950/10">Shared RAM (All threads)</td>
                  <td className="px-5 py-3.5 text-emerald-300 bg-emerald-950/10">Distributed (Private RAM per proc)</td>
                </tr>
                <tr className="hover:bg-gray-700/20">
                  <td className="px-5 py-3.5 font-bold text-gray-200">Execution Mechanism</td>
                  <td className="px-5 py-3.5">1 Process, 1 Thread</td>
                  <td className="px-5 py-3.5 text-teal-300 bg-teal-950/10">Multi-Thread Contiguous</td>
                  <td className="px-5 py-3.5 text-purple-300 bg-purple-950/10">Multi-Thread Dynamic Queue</td>
                  <td className="px-5 py-3.5 text-emerald-300 bg-emerald-950/10">Multi-Process Message Passing</td>
                </tr>
                <tr className="hover:bg-gray-700/20">
                  <td className="px-5 py-3.5 font-bold text-gray-200">Communication Mode</td>
                  <td className="px-5 py-3.5">None</td>
                  <td className="px-5 py-3.5 text-teal-300 bg-teal-950/10 font-semibold">Direct RAM Pointer Reads</td>
                  <td className="px-5 py-3.5 text-purple-300 bg-purple-950/10">Direct RAM (Atomic locks)</td>
                  <td className="px-5 py-3.5 text-emerald-300 bg-emerald-950/10">Kernel Pipes / Network (<code className="text-emerald-400">MPI_Alltoallv</code>)</td>
                </tr>
                <tr className="hover:bg-gray-700/20">
                  <td className="px-5 py-3.5 font-bold text-gray-200">Data Reorganization Cost</td>
                  <td className="px-5 py-3.5">Zero</td>
                  <td className="px-5 py-3.5 text-teal-300 bg-teal-950/10 font-semibold">Zero Copies (In-place scatter)</td>
                  <td className="px-5 py-3.5 text-purple-300 bg-purple-950/10">Zero Copies (Queue locks only)</td>
                  <td className="px-5 py-3.5 text-amber-300 bg-emerald-950/10 font-semibold">Buffer Pack + IPC Transfer Copy</td>
                </tr>
                <tr className="hover:bg-gray-700/20">
                  <td className="px-5 py-3.5 font-bold text-gray-200">Hardware Cache Locality</td>
                  <td className="px-5 py-3.5">High (Single Core)</td>
                  <td className="px-5 py-3.5 text-teal-300 bg-teal-950/10 font-semibold">Maximum (Cores retain cache)</td>
                  <td className="px-5 py-3.5 text-amber-400 bg-purple-950/10">Low (Chunks hop cores)</td>
                  <td className="px-5 py-3.5 text-emerald-300 bg-emerald-950/10">Good local cache, but buffer pollution</td>
                </tr>
                <tr className="hover:bg-gray-700/20">
                  <td className="px-5 py-3.5 font-bold text-gray-200">Cluster Scalability</td>
                  <td className="px-5 py-3.5">1 Core Only</td>
                  <td className="px-5 py-3.5 text-teal-300 bg-teal-950/10">Single Node (4 - 128 cores)</td>
                  <td className="px-5 py-3.5 text-purple-300 bg-purple-950/10">Single Node (4 - 128 cores)</td>
                  <td className="px-5 py-3.5 text-emerald-400 font-bold bg-emerald-950/10">Unlimited (1,000s of cluster nodes)</td>
                </tr>
                <tr className="hover:bg-gray-700/20">
                  <td className="px-5 py-3.5 font-bold text-gray-200">Speedup on Single Machine</td>
                  <td className="px-5 py-3.5">1.0x Baseline</td>
                  <td className="px-5 py-3.5 font-bold text-emerald-400 bg-teal-950/10">Highest (~3.2x on 4 cores)</td>
                  <td className="px-5 py-3.5 text-purple-300 bg-purple-950/10">Moderate (~2.3x on 4 cores)</td>
                  <td className="px-5 py-3.5 text-emerald-300 bg-emerald-950/10">High (~2.5x, slightly below Static)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Concise Key Takeaway Notice */}
        <div className="bg-amber-900/20 border border-amber-700/50 rounded-xl p-5 flex flex-col sm:flex-row items-center sm:items-start gap-4 max-w-4xl mx-auto shadow-lg shadow-amber-900/10">
          <HiInformationCircle className="w-7 h-7 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-amber-400 font-bold text-sm mb-1">Key Takeaway for Radix Sort</h4>
            <p className="text-amber-200/80 text-xs leading-relaxed">
              On a single computer, <strong>OpenMP Static is the uncontested champion</strong> because threads share memory directly with zero message-passing copies and zero queue locks. <strong>MPI</strong> provides crucial cluster scaling across thousands of separate machines, but incurs serialization and IPC buffer copying overhead on a single PC.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Comparison;
