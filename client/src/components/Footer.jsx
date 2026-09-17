import React from 'react';
import { SiReact, SiVite, SiTailwindcss, SiNodedotjs, SiExpress, SiC } from 'react-icons/si';

const Footer = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 text-gray-400 py-10 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* Left: Project Info */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h3 className="text-lg font-bold text-gray-200 flex items-center justify-center md:justify-start gap-2 mb-2">
              <span className="text-cyan-400">⚡</span> Parallel Radix Sort
            </h3>
            <p className="text-sm text-gray-500 max-w-xs">
              High-performance non-comparative integer sorting visualizer and benchmark tool.
            </p>
          </div>

          {/* Center: Tech Stack */}
          <div className="flex flex-col items-center">
            <h4 className="text-xs uppercase tracking-wider text-gray-600 font-semibold mb-3">Powered By</h4>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex flex-col items-center gap-1 group" title="React">
                <SiReact className="w-6 h-6 text-gray-500 group-hover:text-[#61DAFB] transition-colors" />
              </div>
              <div className="flex flex-col items-center gap-1 group" title="Vite">
                <SiVite className="w-6 h-6 text-gray-500 group-hover:text-[#646CFF] transition-colors" />
              </div>
              <div className="flex flex-col items-center gap-1 group" title="Tailwind CSS">
                <SiTailwindcss className="w-6 h-6 text-gray-500 group-hover:text-[#38B2AC] transition-colors" />
              </div>
              <div className="flex flex-col items-center gap-1 group" title="Node.js">
                <SiNodedotjs className="w-6 h-6 text-gray-500 group-hover:text-[#339933] transition-colors" />
              </div>
              <div className="flex flex-col items-center gap-1 group" title="Express">
                <SiExpress className="w-6 h-6 text-gray-500 group-hover:text-white transition-colors" />
              </div>
              <div className="flex flex-col items-center gap-1 group" title="C / OpenMP">
                <SiC className="w-6 h-6 text-gray-500 group-hover:text-[#A8B9CC] transition-colors" />
              </div>
            </div>
          </div>

        </div>

        {/* Bottom: Copyright */}
        <div className="mt-8 pt-6 border-t border-gray-800/50 flex justify-center">
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} Parallel Radix Sort Project. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
