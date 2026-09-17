import React from 'react';
import { HiOutlineUser, HiOutlineUsers, HiInformationCircle } from 'react-icons/hi2';

const Comparison = () => {
  return (
    <section id="comparison" className="py-20 w-full bg-[#1e293b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Serial vs Parallel Comparison
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-cyan-500 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Side-by-side Cards */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-gray-800/60 backdrop-blur border border-gray-700/50 p-6 rounded-xl flex items-start gap-4 hover:border-gray-600 transition-colors">
              <div className="bg-blue-900/50 p-3 rounded-lg text-blue-400 shrink-0">
                <HiOutlineUser className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-100 mb-1">Serial Execution</h3>
                <p className="text-gray-400 text-sm">Processes one element at a time sequentially. Optimal for small datasets where parallel overhead exceeds computational gains.</p>
              </div>
            </div>

            <div className="bg-gray-800/60 backdrop-blur border border-gray-700/50 p-6 rounded-xl flex items-start gap-4 hover:border-cyan-800/50 transition-colors">
              <div className="bg-cyan-900/50 p-3 rounded-lg text-cyan-400 shrink-0">
                <HiOutlineUsers className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-100 mb-1">Parallel (OpenMP)</h3>
                <p className="text-gray-400 text-sm">Divides dataset among threads. Essential for large arrays to significantly reduce execution time by utilizing multi-core processors.</p>
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="lg:col-span-2 bg-gray-800/40 backdrop-blur border border-gray-700/50 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="bg-gray-900/50 border-b border-gray-700 text-gray-300 text-sm uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">Feature</th>
                    <th className="px-6 py-4 font-semibold text-blue-300">Serial</th>
                    <th className="px-6 py-4 font-semibold text-cyan-300">Parallel (OpenMP)</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-400">
                  <tr className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-300">Execution</td>
                    <td className="px-6 py-4">Sequential</td>
                    <td className="px-6 py-4">Concurrent</td>
                  </tr>
                  <tr className="border-b border-gray-700/50 bg-gray-800/20 hover:bg-gray-700/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-300">Threads</td>
                    <td className="px-6 py-4">1</td>
                    <td className="px-6 py-4">
                      <span className="text-cyan-400 font-mono bg-cyan-400/10 rounded px-2 py-0.5 whitespace-nowrap">Multiple (configurable)</span>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-300">Algorithm</td>
                    <td className="px-6 py-4">LSD Radix Sort</td>
                    <td className="px-6 py-4">LSD Radix Sort + OpenMP</td>
                  </tr>
                  <tr className="border-b border-gray-700/50 bg-gray-800/20 hover:bg-gray-700/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-300">Output</td>
                    <td className="px-6 py-4">Deterministic</td>
                    <td className="px-6 py-4">Same (deterministic)</td>
                  </tr>
                  <tr className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-300">Best For</td>
                    <td className="px-6 py-4">Small datasets</td>
                    <td className="px-6 py-4 text-cyan-400">Large datasets</td>
                  </tr>
                  <tr className="hover:bg-gray-700/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-300">Overhead</td>
                    <td className="px-6 py-4 text-green-400">Minimal</td>
                    <td className="px-6 py-4 text-amber-400">Thread creation/sync</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <p className="text-gray-400 text-center max-w-3xl mx-auto mb-8 text-lg">
          Both implementations produce the same sorted output. The difference is in how the computation is performed, leveraging modern multi-core architecture to accelerate the counting and distribution phases.
        </p>

        {/* Important Notice */}
        <div className="bg-amber-900/20 border border-amber-700/50 rounded-xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 max-w-4xl mx-auto shadow-lg shadow-amber-900/10">
          <HiInformationCircle className="w-8 h-8 text-amber-500 shrink-0 mt-1" />
          <div>
            <h4 className="text-amber-400 font-bold mb-2">Important Notice</h4>
            <p className="text-amber-200/80 text-sm leading-relaxed">
              Interactive visualization is implemented in JavaScript for browser-based demonstration. Actual performance benchmarking and parallel execution are performed using <strong>C and OpenMP</strong> in the backend server.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Comparison;
