import React, { useState, useEffect } from 'react';
import { HiBars3, HiXMark } from 'react-icons/hi2';

const navLinks = [
  { name: 'Home', id: 'hero' },
  { name: 'Algorithm', id: 'algorithm' },
  { name: 'Visualizer', id: 'visualizer' },
  { name: 'Benchmark', id: 'benchmark' },
  { name: 'Performance', id: 'performance' },
  { name: 'Source Code', id: 'source-code' },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  const scrollToSection = (id) => {
    setIsOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = navLinks.map(link => document.getElementById(link.id));
      let currentActive = 'hero';
      for (const section of sections) {
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            currentActive = section.id;
            break;
          }
        }
      }
      setActiveSection(currentActive);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-gray-900/80 border-b border-gray-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0 cursor-pointer" onClick={() => scrollToSection('hero')}>
            <span className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-cyan-400">⚡</span> Parallel Radix Sort
            </span>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    activeSection === link.id
                      ? 'text-cyan-400 bg-gray-800/50'
                      : 'text-gray-300 hover:text-cyan-400 hover:bg-gray-800/30'
                  }`}
                >
                  {link.name}
                </button>
              ))}
            </div>
          </div>
          
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
            >
              {isOpen ? <HiXMark className="block h-6 w-6" /> : <HiBars3 className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-gray-900/95 backdrop-blur-lg border-b border-gray-800 absolute w-full shadow-xl">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  activeSection === link.id
                    ? 'text-cyan-400 bg-gray-800'
                    : 'text-gray-300 hover:text-cyan-400 hover:bg-gray-800'
                }`}
              >
                {link.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
