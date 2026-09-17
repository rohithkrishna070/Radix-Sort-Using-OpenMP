# Parallel Radix Sort

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![C](https://img.shields.io/badge/c-%2300599C.svg?style=for-the-badge&logo=c&logoColor=white)
![OpenMP](https://img.shields.io/badge/OpenMP-%2331659C.svg?style=for-the-badge)

## Project Overview

Parallel Radix Sort is a high-performance educational and benchmarking application designed to demonstrate the immense performance benefits of parallel computing. By utilizing OpenMP to parallelize the Radix Sort algorithm and presenting the data through a modern React web interface, this project serves as a comprehensive tool for analyzing algorithm performance, measuring CPU scaling efficiency, and understanding how data size impacts computational bottlenecks. It is designed for students, educators, and software engineers interested in low-level optimizations and high-performance computing (HPC) concepts in C.

## Features

- **Interactive Visualization**: See a visual representation of performance differences between serial and parallel execution.
- **Custom Array Sorting**: Submit your own custom array of numbers to be sorted and see real-time output.
- **Automated Benchmarking**: Run large-scale randomized benchmarks up to 1,000,000 elements.
- **Dynamic Charts**: Beautifully rendered Recharts visualizations of execution time, speedup, and thread scaling.
- **Multi-threaded Backend**: Allows dynamic assignment of thread counts (1-16) to observe hardware scaling.
- **Correctness Verification**: Automatically verifies the sorted output of the parallel algorithm against the serial implementation to ensure zero data corruption.
- **Full-Stack Integration**: Seamless API layer bridging a Node.js serverless backend with high-performance C binaries.

## Tech Stack

| Category | Technologies |
| --- | --- |
| **Frontend** | React, Vite, Tailwind CSS, Lucide Icons |
| **Backend** | Node.js, Express, Vercel Serverless Functions |
| **Algorithm Core** | C11, OpenMP API |
| **Charts & Data** | Recharts |

## Project Architecture

```
parallel-radix-sort/
├── api/                  # Vercel Serverless Functions
│   ├── benchmark.js
│   ├── health.js
│   └── sort.js
├── c-code/               # C Source Code and Compiled Binaries
│   ├── bin/
│   │   ├── radix_parallel
│   │   └── radix_serial
│   ├── radix_parallel.c
│   ├── radix_serial.c
│   └── Makefile
├── client/               # React Vite Frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── server/               # Local Development Express Server
│   ├── index.js
│   └── package.json
├── .github/workflows/    # CI/CD pipelines
├── vercel.json           # Vercel Deployment Config
└── README.md
```

## Screenshots

<!-- Add screenshot of the main dashboard here -->
<!-- ![Dashboard Screenshot](./assets/dashboard.png) -->

<!-- Add screenshot of the benchmarking charts here -->
<!-- ![Benchmark Chart Screenshot](./assets/benchmark.png) -->

## Prerequisites

To run and compile this project locally, you will need:
- Node.js (v16+ recommended)
- npm or yarn
- GCC Compiler with OpenMP support

## Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/parallel-radix-sort.git
   cd parallel-radix-sort
   ```

2. **Frontend Setup**
   ```bash
   cd client
   npm install
   ```

3. **Backend Setup**
   ```bash
   cd ../server
   npm install
   ```

4. **C Compilation**
   ```bash
   cd ../c-code
   # For Linux/macOS
   make
   # Or manually compile
   gcc radix_serial.c -o bin/radix_serial -O2 -fopenmp -lm
   gcc radix_parallel.c -o bin/radix_parallel -O2 -fopenmp -lm
   ```

## Running Locally

**Start the Backend Server (Port 5000):**
```bash
cd server
npm run dev
```

**Start the Frontend Client (Port 5173):**
```bash
cd client
cp .env.example .env  # Ensure VITE_API_URL points to localhost
npm run dev
```

Navigate to `http://localhost:5173` in your browser.

## API Documentation

### POST `/api/sort`
Sorts a custom array of numbers.
**Request Body:**
```json
{
  "numbers": [170, 45, 75, 90, 802, 24, 2, 66],
  "threads": 4
}
```
**Response:**
```json
{
  "serial_time": 0.000123,
  "parallel_time": 0.000045,
  "sorted_array": [2, 24, 45, 66, 75, 90, 170, 802],
  "threads": 4,
  "speedup": 2.73,
  "match": true
}
```

### POST `/api/benchmark`
Runs a benchmark on randomly generated data.
**Request Body:**
```json
{
  "size": 100000,
  "min": 0,
  "max": 10000,
  "threads": 8
}
```
**Response:**
```json
{
  "size": 100000,
  "serial_time": 0.015,
  "parallel_time": 0.004,
  "threads": 8,
  "speedup": 3.75,
  "match": true,
  "simulated": false
}
```

## Benchmarking Methodology

Execution times are calculated entirely within the C programs to avoid Node.js runtime and inter-process communication overhead.
- **Timing**: `omp_get_wtime()` is used for high-resolution timing.
- **Speedup**: Calculated as `Serial Time / Parallel Time`.
- **Efficiency**: Calculated as `Speedup / Number of Threads`. 

*Note: For extremely small arrays, the overhead of spawning threads via OpenMP may result in a speedup < 1. The parallel algorithm demonstrates its superiority at $N > 10,000$.*

## Deployment

This project is optimized for deployment on Vercel as a single monorepo.

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project root directory.
3. Configure the project parameters (defaults will read from `vercel.json`).

### Environment Variables
No specific environment variables are strictly required for production deployment, as `vercel.json` rewrites API requests directly to the serverless functions. 

### GitHub Actions
A `.github/workflows/build-binaries.yml` action is included to automatically compile Linux-compatible binaries upon pushing changes to `c-code/*.c`. This ensures the Vercel serverless environment (which runs on Amazon Linux) always has up-to-date execution targets.

## GCC and OpenMP Setup

**Windows (MinGW/MSYS2)**
1. Install MSYS2
2. Open MSYS2 terminal and run: `pacman -S mingw-w64-x86_64-gcc`
3. Ensure GCC is added to your Windows PATH.

**Linux (Ubuntu/Debian)**
```bash
sudo apt update
sudo apt install gcc libomp-dev
```

**macOS (Homebrew)**
Apple's clang does not support OpenMP out of the box. Use Homebrew's GCC:
```bash
brew install gcc
# Run using gcc-12 or the latest version installed
```

## Future Improvements

- GPU Acceleration using CUDA or OpenCL.
- Implementing Distributed Sorting via MPI (Message Passing Interface).
- Adding more parallel algorithms (e.g., Merge Sort, Bitonic Sort) for direct comparisons.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
