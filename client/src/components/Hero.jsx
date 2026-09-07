import React, { useEffect, useState } from 'react';
import { HiPlay, HiChartBar } from 'react-icons/hi2';

const Hero = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-[#0a1128] to-gray-900 pt-16">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
      
      <div className={`relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4">
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 pb-2">
            Parallel Radix Sort
          </span>
        </h1>
        
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-300 mb-6">
          Using <span className="text-teal-400">OpenMP</span>
        </h2>
        
        <p className="mt-4 max-w-2xl text-lg md:text-xl text-gray-400 mx-auto mb-10 leading-relaxed">
          A Comparative Analysis of Serial and Parallel Radix Sort Implementations. 
          Explore how multi-threading accelerates non-comparative integer sorting algorithms.
        </p>
        
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4 mb-16">
          <button 
            onClick={() => scrollTo('visualizer')}
            className="flex items-center justify-center gap-2 px-8 py-3.5 border border-transparent text-base font-medium rounded-full text-white bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 shadow-lg shadow-cyan-500/30 transition-all duration-300 hover:scale-105"
          >
            <HiPlay className="w-5 h-5" />
            Try Visualizer
          </button>
          <button 
            onClick={() => scrollTo('benchmark')}
            className="flex items-center justify-center gap-2 px-8 py-3.5 border border-gray-600 text-base font-medium rounded-full text-gray-300 bg-gray-800/50 hover:bg-gray-700 hover:text-white backdrop-blur-sm transition-all duration-300 hover:scale-105"
          >
            <HiChartBar className="w-5 h-5" />
            Run Benchmark
          </button>
        </div>
        
        <div className="flex flex-wrap justify-center gap-3 md:gap-6 mt-8">
          {['Real C Execution', 'OpenMP Parallel', 'Live Benchmarking', 'Interactive Visualization'].map((feature, idx) => (
            <span 
              key={idx} 
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-800/80 border border-gray-700 text-cyan-300 backdrop-blur"
              style={{ transitionDelay: `${mounted ? (idx + 2) * 150 : 0}ms` }}
            >
              {feature}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
