import React from 'react';
import { HiOutlineLightBulb, HiOutlineArrowPath, HiOutlineBars3BottomLeft, HiOutlineCpuChip, HiOutlineCubeTransparent } from 'react-icons/hi2';

const InfoCard = ({ icon: Icon, title, description, color }) => (
  <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 p-6 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:bg-gray-800/80 hover:border-gray-600 flex flex-col h-full">
    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <h3 className="text-xl font-bold text-gray-100 mb-2">{title}</h3>
    <p className="text-gray-400 text-sm leading-relaxed flex-grow">{description}</p>
  </div>
);

const AlgorithmInfo = () => {
  return (
    <section id="algorithm" className="py-20 w-full bg-[#0f172a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400 inline-block mb-4">
            Understanding Radix Sort
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-500 to-teal-500 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <InfoCard 
            icon={HiOutlineLightBulb}
            title="What is Radix Sort?"
            description="A non-comparative integer sorting algorithm that sorts data with integer keys by grouping keys by the individual digits which share the same significant position and value."
            color="bg-purple-600/80 shadow-lg shadow-purple-600/20"
          />
          <InfoCard 
            icon={HiOutlineArrowPath}
            title="How LSD Works"
            description="Least Significant Digit (LSD) radix sort processes the integer representations starting from the rightmost digit and moving to the left, using a stable sort for each position."
            color="bg-cyan-600/80 shadow-lg shadow-cyan-600/20"
          />
          <InfoCard 
            icon={HiOutlineBars3BottomLeft}
            title="Counting Sort"
            description="The underlying stable subroutine used by Radix Sort for each digit pass. It counts the occurrences of each digit (0-9) to determine their positions in the sorted output array."
            color="bg-teal-600/80 shadow-lg shadow-teal-600/20"
          />
          <InfoCard 
            icon={HiOutlineCpuChip}
            title="Serial Implementation"
            description="Executes on a single thread. The algorithm sequentially counts digit occurrences, computes prefix sums, and scatters elements to their new positions for each digit."
            color="bg-blue-600/80 shadow-lg shadow-blue-600/20"
          />
          <InfoCard 
            icon={HiOutlineCubeTransparent}
            title="Parallel with OpenMP"
            description="Distributes the workload across multiple threads. Threads independently process chunks of the array during the counting phase, then prefix sums and scattering are synchronized."
            color="bg-rose-600/80 shadow-lg shadow-rose-600/20"
          />
          
          {/* Complexity Card */}
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 p-6 rounded-xl flex flex-col justify-center h-full">
            <h3 className="text-xl font-bold text-gray-100 mb-4 border-b border-gray-700 pb-2">Complexity</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex justify-between">
                <span className="font-semibold text-gray-400">Time:</span> 
                <span className="text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded font-mono">O(d × (n + k))</span>
              </li>
              <li className="flex justify-between">
                <span className="font-semibold text-gray-400">Space:</span> 
                <span className="text-teal-400 bg-teal-400/10 px-2 py-0.5 rounded font-mono">O(n + k)</span>
              </li>
            </ul>
            <div className="mt-4 pt-3 border-t border-gray-700 text-xs text-gray-500">
              <p>Where <code className="text-gray-400">d</code> = digits, <code className="text-gray-400">n</code> = elements, <code className="text-gray-400">k</code> = radix (base)</p>
            </div>
          </div>
        </div>

        {/* Visual Flow Diagram */}
        <div className="mt-16 bg-gray-800/30 border border-gray-700/50 rounded-2xl p-8 overflow-hidden">
          <h3 className="text-lg font-semibold text-gray-300 mb-8 text-center">Sorting Flow for Array [170, 45, 75, 90, 802, 24, 2, 66]</h3>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full overflow-x-auto pb-4">
            <div className="flex flex-col items-center min-w-[140px]">
              <div className="bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 font-mono text-sm shadow-md">Input Array</div>
            </div>
            
            <div className="text-gray-500 transform rotate-90 md:rotate-0 font-bold">➔</div>
            
            <div className="flex flex-col items-center min-w-[140px]">
              <div className="bg-[#1e293b] text-cyan-300 px-4 py-3 rounded-lg border border-cyan-800 font-mono text-sm shadow-md text-center">
                Sort by Units<br/><span className="text-xs text-gray-500">(digit 1)</span>
              </div>
            </div>
            
            <div className="text-gray-500 transform rotate-90 md:rotate-0 font-bold">➔</div>
            
            <div className="flex flex-col items-center min-w-[140px]">
              <div className="bg-[#1e293b] text-teal-300 px-4 py-3 rounded-lg border border-teal-800 font-mono text-sm shadow-md text-center">
                Sort by Tens<br/><span className="text-xs text-gray-500">(digit 2)</span>
              </div>
            </div>
            
            <div className="text-gray-500 transform rotate-90 md:rotate-0 font-bold">➔</div>
            
            <div className="flex flex-col items-center min-w-[140px]">
              <div className="bg-[#1e293b] text-purple-300 px-4 py-3 rounded-lg border border-purple-800 font-mono text-sm shadow-md text-center">
                Sort by Hundreds<br/><span className="text-xs text-gray-500">(digit 3)</span>
              </div>
            </div>
            
            <div className="text-gray-500 transform rotate-90 md:rotate-0 font-bold">➔</div>
            
            <div className="flex flex-col items-center min-w-[140px]">
              <div className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white px-4 py-3 rounded-lg font-mono text-sm shadow-lg shadow-cyan-900/50">Sorted Array</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AlgorithmInfo;
