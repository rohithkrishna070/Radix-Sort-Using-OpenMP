import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AlgorithmInfo from './components/AlgorithmInfo';
import Visualizer from './components/Visualizer';
import Comparison from './components/Comparison';
import Benchmark from './components/Benchmark';
import Results from './components/Results';
import PerformanceChart from './components/PerformanceChart';
import Footer from './components/Footer';

function App() {
  const [benchmarkResults, setBenchmarkResults] = useState([]);
  const [latestResult, setLatestResult] = useState(null);

  const addBenchmarkResult = (result) => {
    setBenchmarkResults(prev => [...prev, result]);
    setLatestResult(result);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      <Navbar />
      
      <main>
        <section id="hero">
          <Hero />
        </section>

        <section id="algorithm">
          <AlgorithmInfo />
        </section>

        <section id="visualizer">
          <Visualizer />
        </section>

        <section id="comparison">
          <Comparison />
        </section>

        <section id="benchmark">
          <Benchmark onResult={addBenchmarkResult} />
        </section>

        <section id="results">
          <Results result={latestResult} />
        </section>

        <section id="performance">
          <PerformanceChart benchmarkResults={benchmarkResults} />
        </section>

      </main>

      <Footer />
    </div>
  );
}

export default App;
