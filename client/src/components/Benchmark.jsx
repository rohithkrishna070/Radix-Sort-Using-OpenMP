import React, { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '';

const Benchmark = ({ onResult }) => {
  const [mode, setMode] = useState('custom'); // custom, random
  const [customInput, setCustomInput] = useState('');
  const [randomSize, setRandomSize] = useState('100000');
  const [minVal, setMinVal] = useState('0');
  const [maxVal, setMaxVal] = useState('1000000');
  const [threads, setThreads] = useState('Auto');
  
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState('');

  const sizes = [
    { label: '10', value: '10' },
    { label: '100', value: '100' },
    { label: '1K', value: '1000' },
    { label: '10K', value: '10000' },
    { label: '100K', value: '100000' },
    { label: '1M', value: '1000000' }
  ];

  const threadOptions = ['Auto', '2', '4', '8'];

  const validateCustomInput = (val) => {
    const parts = val.split(',').map(s => s.trim()).filter(s => s !== '');
    if (parts.length > 100000) return 'Maximum 100,000 elements allowed';
    if (parts.some(s => isNaN(s) || parseInt(s) < 0 || !Number.isInteger(parseFloat(s)))) {
      return 'Please enter non-negative integers only';
    }
    return '';
  };

  const handleRun = async () => {
    setError('');
    let payload = {};
    let endpoint = '';

    const actualThreads = threads === 'Auto' ? 0 : parseInt(threads, 10);

    if (mode === 'custom') {
      const err = validateCustomInput(customInput);
      if (err) {
        setError(err);
        return;
      }
      const numbers = customInput.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
      if (numbers.length === 0) {
        setError('Please enter some numbers');
        return;
      }
      payload = { numbers, threads: actualThreads };
      endpoint = `${API_URL}/api/sort`;
    } else {
      payload = {
        size: parseInt(randomSize, 10),
        min: parseInt(minVal, 10) || 0,
        max: parseInt(maxVal, 10) || 1000000,
        threads: actualThreads
      };
      endpoint = `${API_URL}/api/benchmark`;
    }

    setLoading(true);
    setLoadingStep(1); // Preparing dataset

    // Simulate multi-step loading for UX
    const timers = [
      setTimeout(() => setLoadingStep(2), 500), // Running Serial
      setTimeout(() => setLoadingStep(3), 1500), // Running Parallel
      setTimeout(() => setLoadingStep(4), 2500)  // Calculating
    ];

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const result = await response.json();
      
      timers.forEach(clearTimeout);
      setLoading(false);
      
      if (onResult) onResult(result);

    } catch (err) {
      timers.forEach(clearTimeout);
      setLoading(false);
      
      if (err.message.includes('fetch') || err.message.includes('Failed to fetch')) {
        setError('Could not connect to the backend server. Make sure the server is running.');
      } else if (err.message.includes('timeout')) {
        setError('Benchmark timed out. Try a smaller dataset.');
      } else {
        setError(`Error: ${err.message}`);
      }
    }
  };

  const loadingMessages = [
    '',
    'Preparing dataset...',
    'Running Serial Radix Sort (C)...',
    'Running Parallel Radix Sort (OpenMP)...',
    'Calculating results...'
  ];

  return (
    <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-6 text-white w-full max-w-4xl mx-auto shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-cyan-400">Benchmark Configuration</h2>
      
      <div className="flex gap-4 border-b border-gray-700 mb-6">
        <button 
          className={`py-2 px-4 font-medium transition-colors ${mode === 'custom' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-gray-300'}`}
          onClick={() => setMode('custom')}
        >
          Custom Input
        </button>
        <button 
          className={`py-2 px-4 font-medium transition-colors ${mode === 'random' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-gray-300'}`}
          onClick={() => setMode('random')}
        >
          Random Dataset
        </button>
      </div>

      {mode === 'custom' && (
        <div className="space-y-4 mb-6">
          <label className="block text-sm font-medium text-gray-300">Enter Array (comma-separated):</label>
          <textarea
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="e.g. 170, 45, 75, 90, 802, 24, 2, 66"
            className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500 min-h-32"
          />
          <button 
            onClick={() => setCustomInput('170, 45, 75, 90, 802, 24, 2, 66')}
            className="text-sm text-cyan-400 hover:text-cyan-300 underline transition"
          >
            Use Sample
          </button>
        </div>
      )}

      {mode === 'random' && (
        <div className="space-y-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Dataset Size:</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {sizes.map(s => (
                <button
                  key={s.value}
                  onClick={() => setRandomSize(s.value)}
                  className={`px-4 py-1.5 rounded-full text-sm transition ${
                    randomSize === s.value 
                      ? 'bg-cyan-600 text-white shadow-[0_0_10px_rgba(6,182,212,0.5)]' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 max-w-xs">
              <span className="text-gray-400 text-sm">Custom:</span>
              <input
                type="number"
                value={randomSize}
                onChange={(e) => setRandomSize(e.target.value)}
                min="1" max="10000000"
                className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Min Value:</label>
              <input
                type="number" value={minVal} onChange={(e) => setMinVal(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Max Value:</label>
              <input
                type="number" value={maxVal} onChange={(e) => setMaxVal(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-300 mb-2">OpenMP Threads:</label>
        <div className="flex flex-wrap gap-2 items-center">
          {threadOptions.map(t => (
            <button
              key={t}
              onClick={() => setThreads(t)}
              className={`px-4 py-1.5 rounded-full text-sm transition ${
                threads === t 
                  ? 'bg-teal-600 text-white shadow-[0_0_10px_rgba(20,184,166,0.5)]' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {t}
            </button>
          ))}
          <div className="ml-4 flex items-center gap-2">
            <span className="text-gray-400 text-sm">Custom:</span>
            <input
              type="number"
              value={threads !== 'Auto' && !['2','4','8'].includes(threads) ? threads : ''}
              onChange={(e) => setThreads(e.target.value || 'Auto')}
              min="1" max="64"
              placeholder="e.g. 16"
              className="w-20 bg-gray-900 border border-gray-600 rounded-lg p-1.5 text-white focus:outline-none focus:border-teal-500 text-sm"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-800/50 text-red-200 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <button
        onClick={handleRun}
        disabled={loading}
        className="w-full py-4 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 text-lg"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {loadingMessages[loadingStep]}
          </>
        ) : (
          'Run Benchmark'
        )}
      </button>

      <p className="mt-6 text-xs text-gray-500 text-center">
        Interactive visualization is implemented in JavaScript for browser-based demonstration. Actual performance benchmarking and parallel execution are performed using C and OpenMP.
      </p>
    </div>
  );
};

export default Benchmark;
