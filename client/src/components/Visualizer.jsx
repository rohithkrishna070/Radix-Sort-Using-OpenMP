import React, { useState, useEffect, useRef } from 'react';
import { radixSortWithSteps } from '../utils/radixSort';

const Visualizer = () => {
  const [inputData, setInputData] = useState('');
  const [error, setError] = useState('');
  const [state, setState] = useState('idle'); // idle, ready, playing, paused, complete
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [speed, setSpeed] = useState(500);
  const intervalRef = useRef(null);

  const validateInput = (value) => {
    if (!value.trim()) return '';
    const parts = value.split(',').map(s => s.trim()).filter(s => s !== '');
    if (parts.length > 50) return 'Maximum 50 elements allowed';
    if (parts.some(s => isNaN(s) || parseInt(s) < 0 || !Number.isInteger(parseFloat(s)))) {
      return 'Please enter non-negative integers only';
    }
    return '';
  };

  const prepareSteps = (val) => {
    try {
      const arr = val.split(',').map(s => s.trim()).filter(s => s !== '').map(Number);
      if (arr.length === 0) {
        setSteps([]);
        return;
      }
      const { steps: generatedSteps } = radixSortWithSteps(arr);
      setSteps(generatedSteps || []);
      setCurrentStepIndex(0);
    } catch (e) {
      console.error("Error generating visualization steps:", e);
      setSteps([]);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputData(val);
    const err = validateInput(val);
    setError(err);
    if (!err && val.trim() !== '') {
      setState('ready');
      prepareSteps(val);
    } else {
      setState('idle');
      setSteps([]);
    }
  };

  const useSampleData = () => {
    const sample = '170, 45, 75, 90, 802, 24, 2, 66';
    setInputData(sample);
    setError('');
    setState('ready');
    prepareSteps(sample);
  };

  const generateRandom = () => {
    const size = Math.floor(Math.random() * 6) + 8; // 8-13 elements
    const arr = Array.from({ length: size }, () => Math.floor(Math.random() * 900) + 10);
    const val = arr.join(', ');
    setInputData(val);
    setError('');
    setState('ready');
    prepareSteps(val);
  };

  const startVisualization = () => {
    if (state === 'ready' || state === 'paused') {
      setState('playing');
    }
  };

  const pauseVisualization = () => {
    if (state === 'playing') {
      setState('paused');
    }
  };

  const stepNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else if (currentStepIndex === steps.length - 1) {
      setState('complete');
    }
  };

  const stepPrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      if (state === 'complete') setState('paused');
    }
  };

  const reset = () => {
    setState('ready');
    setCurrentStepIndex(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    if (state === 'playing') {
      intervalRef.current = setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev < steps.length - 1) {
            return prev + 1;
          } else {
            clearInterval(intervalRef.current);
            setState('complete');
            return prev;
          }
        });
      }, speed);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state, speed, steps.length]);

  const currentStep = steps[currentStepIndex];
  const progressPercent = steps.length > 1 ? (currentStepIndex / (steps.length - 1)) * 100 : (steps.length === 1 ? 100 : 0);
  const displayArray = currentStep ? (currentStep.arrayAfter || currentStep.arrayBefore || []) : [];
  const maxValInArray = displayArray.length > 0 ? Math.max(...displayArray, 1) : 1;

  return (
    <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-6 text-white w-full max-w-4xl mx-auto shadow-xl">
      <h2 className="text-2xl font-bold mb-4 text-cyan-400">Radix Sort Visualizer</h2>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Custom Array (comma-separated):</label>
          <input
            type="text"
            value={inputData}
            onChange={handleInputChange}
            placeholder="e.g. 170, 45, 75, 90, 802, 24, 2, 66"
            className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
          />
          {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
        </div>
        <div className="flex gap-2">
          <button onClick={useSampleData} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition font-medium">Use Sample Data</button>
          <button onClick={generateRandom} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition font-medium">Generate Random</button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-6 bg-gray-900 p-4 rounded-lg">
        <button 
          onClick={startVisualization} 
          disabled={state === 'idle' || state === 'playing' || state === 'complete' || steps.length === 0}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition"
        >
          {state === 'playing' ? '▶ Playing...' : '▶ Play'}
        </button>
        <button 
          onClick={pauseVisualization} 
          disabled={state !== 'playing'}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition"
        >
          ⏸ Pause
        </button>
        <div className="flex gap-1">
          <button 
            onClick={stepPrev} 
            disabled={currentStepIndex === 0 || steps.length === 0}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-lg transition"
          >
            ◀ Prev
          </button>
          <button 
            onClick={stepNext} 
            disabled={state === 'complete' || steps.length === 0 || currentStepIndex >= steps.length - 1}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-lg transition"
          >
            Next ▶
          </button>
        </div>
        <button 
          onClick={reset} 
          disabled={state === 'idle' || steps.length === 0}
          className="px-4 py-2 bg-red-900/50 hover:bg-red-800/50 text-red-200 disabled:opacity-50 rounded-lg transition ml-auto"
        >
          Reset
        </button>
        
        <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
          <span className="text-sm text-gray-400">Speed:</span>
          <input 
            type="range" 
            min="100" max="2000" step="100"
            value={2100 - speed}
            onChange={(e) => setSpeed(2100 - e.target.value)}
            className="w-24 accent-teal-500"
          />
        </div>
      </div>

      {steps.length > 0 && currentStep ? (
        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <h3 className="text-xl font-semibold text-teal-300">
              Pass {currentStep.pass + 1}: Sorting by {currentStep.digitName} Digit
            </h3>
            {state === 'complete' && <span className="text-green-400 font-bold">Sorting Complete! ✓</span>}
          </div>
          
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-cyan-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
          </div>
          
          <div className="flex flex-wrap items-end justify-center gap-2 min-h-36 p-4 bg-gray-900/50 border border-gray-700/50 rounded-xl overflow-x-auto">
            {displayArray.map((num, i) => {
              const height = Math.max(40, (num / maxValInArray) * 110);
              return (
                <div key={i} className="flex flex-col items-center justify-end group">
                  <div className="text-xs text-cyan-300 font-mono mb-1">{num}</div>
                  <div 
                    style={{ height: `${height}px` }} 
                    className="w-10 flex items-end justify-center rounded-t-md transition-all duration-300 bg-cyan-600 hover:bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.5)]"
                  >
                  </div>
                </div>
              );
            })}
          </div>

          {currentStep.buckets && (
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Bucket Distribution (0-9):</h4>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                {currentStep.buckets.map((bucket, i) => (
                  <div key={i} className="bg-gray-900 rounded-lg p-2 flex flex-col items-center min-h-24 border border-gray-700">
                    <div className="text-xs text-teal-400 mb-1 font-bold">Bucket {i}</div>
                    <div className="flex flex-col gap-1 w-full flex-1 justify-end">
                      {bucket.map((num, j) => (
                        <div key={j} className="bg-cyan-900/80 text-cyan-100 text-xs text-center py-1 rounded font-mono border border-cyan-700/50">
                          {num}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 border border-dashed border-gray-700 rounded-xl">
          Click <span className="text-cyan-400 font-semibold">Use Sample Data</span> or <span className="text-cyan-400 font-semibold">Generate Random</span> to start visualizing!
        </div>
      )}
    </div>
  );
};

export default Visualizer;
