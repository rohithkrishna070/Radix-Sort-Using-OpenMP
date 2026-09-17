import React, { useState } from 'react';

const Results = ({ result }) => {
  const [showOutput, setShowOutput] = useState(false);

  if (!result) {
    return (
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-8 text-center w-full max-w-4xl mx-auto mt-6">
        <p className="text-gray-400 text-lg">Run a benchmark to see results here</p>
      </div>
    );
  }

  const speedupVal = parseFloat(result.speedup);
  const getSpeedupColor = (val) => {
    if (val > 1.5) return 'text-green-400';
    if (val >= 0.8) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSpeedupBorder = (val) => {
    if (val > 1.5) return 'border-green-500/30 bg-green-900/10';
    if (val >= 0.8) return 'border-yellow-500/30 bg-yellow-900/10';
    return 'border-red-500/30 bg-red-900/10';
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-6 text-white w-full max-w-4xl mx-auto mt-6 shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-teal-400">Benchmark Results</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        
        <div className="bg-gray-900/80 border border-gray-700 rounded-lg p-4 flex flex-col">
          <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Input Size</div>
          <div className="text-2xl font-light text-white mt-auto">
            {Number(result.inputSize || result.size).toLocaleString()}
          </div>
        </div>

        <div className="bg-gray-900/80 border border-gray-700 rounded-lg p-4 flex flex-col">
          <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Serial Time</div>
          <div className="text-2xl font-light text-orange-300 mt-auto">
            {Number(result.serialTime).toFixed(6)} <span className="text-sm text-gray-500">s</span>
          </div>
        </div>

        <div className="bg-gray-900/80 border border-gray-700 rounded-lg p-4 flex flex-col">
          <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Parallel Time</div>
          <div className="text-2xl font-light text-cyan-300 mt-auto">
            {Number(result.parallelTime).toFixed(6)} <span className="text-sm text-gray-500">s</span>
          </div>
        </div>

        <div className={`border rounded-lg p-4 flex flex-col ${getSpeedupBorder(speedupVal)}`}>
          <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Speedup</div>
          <div className={`text-3xl font-bold mt-auto ${getSpeedupColor(speedupVal)}`}>
            {speedupVal.toFixed(2)}x
          </div>
        </div>

        <div className="bg-gray-900/80 border border-gray-700 rounded-lg p-4 flex flex-col">
          <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Threads Used</div>
          <div className="text-2xl font-light text-teal-200 mt-auto">
            {result.threadsUsed || result.threads}
          </div>
        </div>

        <div className="bg-gray-900/80 border border-gray-700 rounded-lg p-4 flex flex-col">
          <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Efficiency</div>
          <div className="text-2xl font-light text-purple-300 mt-auto">
            {Number(result.efficiency).toFixed(1)}%
          </div>
        </div>

        <div className="bg-gray-900/80 border border-gray-700 rounded-lg p-4 flex flex-col md:col-span-2 xl:col-span-2">
          <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Results Match</div>
          <div className="text-xl font-medium mt-auto flex items-center h-full">
            {(result.resultsMatch !== undefined ? result.resultsMatch : result.match) ? (
              <span className="text-green-400 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Yes, correctly sorted
              </span>
            ) : (
              <span className="text-red-400 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                No, output mismatch
              </span>
            )}
          </div>
        </div>

      </div>

      {speedupVal < 1 && (
        <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-4 mb-6 flex gap-3 text-blue-200 text-sm">
          <svg className="w-5 h-5 flex-shrink-0 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <p>
            Parallel overhead can make execution slower for small datasets. OpenMP thread creation and synchronization adds overhead that isn't justified for small inputs. Try a larger dataset size (e.g., 100K+) to see parallel benefits.
          </p>
        </div>
      )}

      {(result.serialSorted || result.sorted_array) && (
        <div className="mt-4 border border-gray-700 rounded-lg overflow-hidden">
          <button 
            onClick={() => setShowOutput(!showOutput)}
            className="w-full bg-gray-900/50 hover:bg-gray-800 p-3 text-left flex justify-between items-center transition"
          >
            <span className="font-medium text-gray-300">View Sorted Output ({Number(result.inputSize || result.size).toLocaleString()} elements)</span>
            <svg className={`w-5 h-5 text-gray-500 transform transition-transform ${showOutput ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          
          {showOutput && (
            <div className="p-4 bg-gray-950 max-h-60 overflow-y-auto font-mono text-sm text-gray-400 break-words">
              {(() => {
                const sorted = result.serialSorted || result.sorted_array;
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
