import React, { useState } from 'react';

const serialCode = `#include <stdio.h>
#include <stdlib.h>
#include <omp.h>

/*
    Find the largest value in the array.

    Radix Sort needs the maximum value to know how many digit
    positions must be processed.
*/
int getMax(int arr[], int n)
{
    int max = arr[0];

    for (int i = 1; i < n; i++)
    {
        if (arr[i] > max)
        {
            max = arr[i];
        }
    }

    return max;
}

/*
    Perform Counting Sort based on the current digit.

    exp = 1    -> units digit
    exp = 10   -> tens digit
    exp = 100  -> hundreds digit
*/
void countingSort(int arr[], int n, long long exp)
{
    int *output = (int *)malloc(n * sizeof(int));

    if (output == NULL)
    {
        fprintf(stderr, "Memory allocation failed\\n");
        exit(1);
    }

    int count[10] = {0};

    /* Count the frequency of each digit */
    for (int i = 0; i < n; i++)
    {
        int digit = (arr[i] / exp) % 10;
        count[digit]++;
    }

    /*
        Convert frequency count into cumulative positions.
    */
    for (int i = 1; i < 10; i++)
    {
        count[i] += count[i - 1];
    }

    /*
        Build the output array.

        We move from right to left to maintain stability,
        which is important for Radix Sort.
    */
    for (int i = n - 1; i >= 0; i--)
    {
        int digit = (arr[i] / exp) % 10;

        output[count[digit] - 1] = arr[i];
        count[digit]--;
    }

    /* Copy the sorted values back to the original array */
    for (int i = 0; i < n; i++)
    {
        arr[i] = output[i];
    }

    free(output);
}

/*
    LSD Radix Sort.

    The array is sorted digit by digit, starting from
    the least significant digit.
*/
void radixSort(int arr[], int n)
{
    int max = getMax(arr, n);

    for (long long exp = 1; max / exp > 0; exp *= 10)
    {
        countingSort(arr, n, exp);
    }
}

int main()
{
    int n;

    /*
        Input format:

        n
        number1 number2 number3 ...

        Example:
        8
        170 45 75 90 802 24 2 66
    */
    if (scanf("%d", &n) != 1 || n <= 0)
    {
        fprintf(stderr, "Invalid input size\\n");
        return 1;
    }

    int *arr = (int *)malloc(n * sizeof(int));

    if (arr == NULL)
    {
        fprintf(stderr, "Memory allocation failed\\n");
        return 1;
    }

    for (int i = 0; i < n; i++)
    {
        if (scanf("%d", &arr[i]) != 1 || arr[i] < 0)
        {
            fprintf(stderr, "Invalid input\\n");
            free(arr);
            return 1;
        }
    }

    /*
        omp_get_wtime() is used only as a high-resolution timer.

        This program itself is completely serial.
        No OpenMP parallel directives are used.
    */
    double startTime = omp_get_wtime();

    radixSort(arr, n);

    double endTime = omp_get_wtime();

    /* Output execution time for the backend */
    printf("TIME:%.9f\\n", endTime - startTime);

    /* Print the sorted array */
    printf("SORTED:");

    for (int i = 0; i < n; i++)
    {
        printf("%d", arr[i]);

        if (i < n - 1)
        {
            printf(",");
        }
    }

    printf("\\n");

    free(arr);

    return 0;
}`;

const parallelCode = `#include <stdio.h>
#include <stdlib.h>
#include <omp.h>

/*
    Find the maximum element using OpenMP reduction.

    Each thread processes part of the array, and OpenMP combines
    the local maximum values at the end.
*/
int getMaxParallel(int arr[], int n)
{
    int max = arr[0];

    #pragma omp parallel for reduction(max:max)
    for (int i = 1; i < n; i++)
    {
        if (arr[i] > max)
        {
            max = arr[i];
        }
    }

    return max;
}

/*
    Parallel version of LSD Radix Sort.

    For every digit position:
    1. Each thread counts digits in its own local count array.
    2. Local counts are combined.
    3. Starting positions are calculated for every thread.
    4. Threads place elements into the output array safely.
    5. Output is copied back to the original array.
*/
void radixSortParallel(int arr[], int n)
{
    int max = getMaxParallel(arr, n);

    /*
        omp_get_max_threads() gives the maximum number of threads
        available for the parallel regions.
    */
    int numThreads = omp_get_max_threads();

    for (long long exp = 1; max / exp > 0; exp *= 10)
    {
        int *output = (int *)malloc(n * sizeof(int));

        /*
            Each thread gets 10 counters, one for each digit 0-9.

            Layout:

            Thread 0 -> localCount[0 ... 9]
            Thread 1 -> localCount[10 ... 19]
            Thread 2 -> localCount[20 ... 29]
        */
        int *localCount =
            (int *)calloc(numThreads * 10, sizeof(int));

        if (output == NULL || localCount == NULL)
        {
            fprintf(stderr, "Memory allocation failed\\n");

            free(output);
            free(localCount);

            exit(1);
        }

        /*
            STEP 1:
            Each thread counts the digits in its assigned
            portion of the array.
        */
        #pragma omp parallel
        {
            int threadId = omp_get_thread_num();

            int *count = &localCount[threadId * 10];

            #pragma omp for schedule(static)
            for (int i = 0; i < n; i++)
            {
                int digit = (arr[i] / exp) % 10;

                count[digit]++;
            }
        }

        /*
            STEP 2:
            Combine all thread-local counts into one global count.
        */
        int totalCount[10] = {0};

        for (int thread = 0; thread < numThreads; thread++)
        {
            for (int digit = 0; digit < 10; digit++)
            {
                totalCount[digit] +=
                    localCount[thread * 10 + digit];
            }
        }

        /*
            Convert the counts into cumulative counts.
        */
        for (int digit = 1; digit < 10; digit++)
        {
            totalCount[digit] += totalCount[digit - 1];
        }

        /*
            STEP 3:
            Calculate the starting position for each thread
            and each digit.

            This prevents multiple threads from writing to
            the same output location.
        */
        int *startPosition =
            (int *)calloc(numThreads * 10, sizeof(int));

        if (startPosition == NULL)
        {
            fprintf(stderr, "Memory allocation failed\\n");

            free(output);
            free(localCount);

            exit(1);
        }

        for (int digit = 0; digit < 10; digit++)
        {
            /*
                First position for this digit.
            */
            int position =
                (digit == 0) ? 0 : totalCount[digit - 1];

            /*
                Assign a separate range to every thread.
            */
            for (int thread = 0;
                 thread < numThreads;
                 thread++)
            {
                startPosition[thread * 10 + digit] =
                    position;

                position +=
                    localCount[thread * 10 + digit];
            }
        }

        /*
            STEP 4:
            Place elements into the output array in parallel.

            Every thread uses its own position counters,
            so there are no race conditions.
        */
        #pragma omp parallel
        {
            int threadId = omp_get_thread_num();

            int position[10];

            /*
                Copy the starting positions for this thread.
            */
            for (int digit = 0; digit < 10; digit++)
            {
                position[digit] =
                    startPosition[threadId * 10 + digit];
            }

            #pragma omp for schedule(static)
            for (int i = 0; i < n; i++)
            {
                int digit = (arr[i] / exp) % 10;

                output[position[digit]] = arr[i];

                position[digit]++;
            }
        }

        /*
            STEP 5:
            Copy the result back to the original array.
        */
        #pragma omp parallel for schedule(static)
        for (int i = 0; i < n; i++)
        {
            arr[i] = output[i];
        }

        free(output);
        free(localCount);
        free(startPosition);
    }
}

int main()
{
    int n;

    /*
        Input format:

        n
        number1 number2 number3 ...

        Example:
        8
        170 45 75 90 802 24 2 66
    */
    if (scanf("%d", &n) != 1 || n <= 0)
    {
        fprintf(stderr, "Invalid input size\\n");
        return 1;
    }

    int *arr = (int *)malloc(n * sizeof(int));

    if (arr == NULL)
    {
        fprintf(stderr, "Memory allocation failed\\n");
        return 1;
    }

    for (int i = 0; i < n; i++)
    {
        if (scanf("%d", &arr[i]) != 1 || arr[i] < 0)
        {
            fprintf(stderr, "Invalid input\\n");

            free(arr);

            return 1;
        }
    }

    /*
        Start measuring execution time.
    */
    double startTime = omp_get_wtime();

    radixSortParallel(arr, n);

    double endTime = omp_get_wtime();

    /*
        Print execution time.
    */
    printf("TIME:%.9f\\n", endTime - startTime);

    /*
        Print the number of OpenMP threads available.
    */
    printf("THREADS:%d\\n", omp_get_max_threads());

    /*
        Print sorted output.
    */
    printf("SORTED:");

    for (int i = 0; i < n; i++)
    {
        printf("%d", arr[i]);

        if (i < n - 1)
        {
            printf(",");
        }
    }

    printf("\\n");

    free(arr);

    return 0;
}`;

// Syntax highlighting helper
function highlightLine(line) {
  let html = line
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const commentIdx = html.indexOf('//');
  
  if (commentIdx !== -1) {
    const before = html.substring(0, commentIdx);
    const comment = html.substring(commentIdx);
    html = before + '<span class="text-green-400">' + comment + '</span>';
  } else if (html.trimStart().startsWith('*') || html.trimStart().startsWith('/*') || html.trimEnd().endsWith('*/')) {
    html = '<span class="text-green-400">' + html + '</span>';
  } else if (html.trimStart().startsWith('#')) {
    html = '<span class="text-purple-400 font-semibold">' + html + '</span>';
  } else {
    const keywords = ['int', 'void', 'for', 'if', 'return', 'else', 'double', 'char', 'const', 'struct', 'sizeof', 'exit', 'long'];
    keywords.forEach(kw => {
      const regex = new RegExp('\\b' + kw + '\\b', 'g');
      html = html.replace(regex, '<span class="text-cyan-400 font-medium">' + kw + '</span>');
    });
    html = html.replace(/(pragma omp[^"]*?)(?=\s*$)/g, '<span class="text-yellow-400 font-semibold">$1</span>');
    html = html.replace(/("(?:[^"\\]|\\.)*")/g, '<span class="text-amber-300">$1</span>');
  }
  return html;
}

const SourceCode = () => {
  const [activeTab, setActiveTab] = useState('serial');
  const [copied, setCopied] = useState(false);

  const currentCode = activeTab === 'serial' ? serialCode : parallelCode;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeTab === 'serial' ? 'radix_serial.c' : 'radix_parallel.c';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const lines = currentCode.split('\n');

  return (
    <div className="py-20 px-4 max-w-6xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
        Source Code
      </h2>
      <p className="text-gray-400 text-center mb-10 max-w-2xl mx-auto">
        View, copy, or download the complete C implementations used for benchmarking.
      </p>

      <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl overflow-hidden shadow-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b border-gray-700/50 gap-3">
          <div className="flex gap-1 bg-gray-900 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('serial')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'serial' ? 'bg-cyan-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
              Serial C Code
            </button>
            <button
              onClick={() => setActiveTab('parallel')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'parallel' ? 'bg-cyan-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
              Parallel OpenMP Code
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm flex items-center gap-1.5 transition border border-gray-600"
            >
              {copied ? (
                <span className="text-green-400">✓ Copied!</span>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-2 bg-cyan-700 hover:bg-cyan-600 rounded-md text-sm flex items-center gap-1.5 transition border border-cyan-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download .c
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <pre className="font-mono text-sm leading-relaxed p-4">
            {lines.map((line, i) => (
              <div key={i} className="flex hover:bg-gray-700/30">
                <span className="text-gray-600 select-none w-12 text-right pr-4 flex-shrink-0 border-r border-gray-700/50">
                  {i + 1}
                </span>
                <span
                  className="pl-4 whitespace-pre"
                  dangerouslySetInnerHTML={{ __html: highlightLine(line) }}
                />
              </div>
            ))}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default SourceCode;
