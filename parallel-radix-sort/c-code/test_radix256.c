#include <stdio.h>
#include <stdlib.h>
#include <omp.h>

void radixSortBase256Serial(unsigned int arr[], int n) {
    unsigned int *output = (unsigned int *)malloc(n * sizeof(unsigned int));
    int count[256];

    for (int shift = 0; shift < 32; shift += 8) {
        for (int i = 0; i < 256; i++) count[i] = 0;
        for (int i = 0; i < n; i++) {
            count[(arr[i] >> shift) & 0xFF]++;
        }
        for (int i = 1; i < 256; i++) {
            count[i] += count[i - 1];
        }
        for (int i = n - 1; i >= 0; i--) {
            int byte = (arr[i] >> shift) & 0xFF;
            output[--count[byte]] = arr[i];
        }
        for (int i = 0; i < n; i++) {
            arr[i] = output[i];
        }
    }
    free(output);
}

void radixSortBase256Parallel(unsigned int arr[], int n, int numThreads) {
    unsigned int *output = (unsigned int *)malloc(n * sizeof(unsigned int));
    int *localCount = (int *)malloc(numThreads * 256 * sizeof(int));
    int *startPos = (int *)malloc(numThreads * 256 * sizeof(int));
    int totalCount[256];

    #pragma omp parallel num_threads(numThreads)
    {
        int tid = omp_get_thread_num();
        int *myCount = &localCount[tid * 256];

        for (int shift = 0; shift < 32; shift += 8) {
            for (int i = 0; i < 256; i++) myCount[i] = 0;

            #pragma omp for schedule(static)
            for (int i = 0; i < n; i++) {
                myCount[(arr[i] >> shift) & 0xFF]++;
            }

            #pragma omp single
            {
                for (int b = 0; b < 256; b++) totalCount[b] = 0;
                for (int t = 0; t < numThreads; t++) {
                    for (int b = 0; b < 256; b++) {
                        totalCount[b] += localCount[t * 256 + b];
                    }
                }
                for (int b = 1; b < 256; b++) {
                    totalCount[b] += totalCount[b - 1];
                }
                for (int b = 0; b < 256; b++) {
                    int p = (b == 0) ? 0 : totalCount[b - 1];
                    for (int t = 0; t < numThreads; t++) {
                        startPos[t * 256 + b] = p;
                        p += localCount[t * 256 + b];
                    }
                }
            } // barrier

            int pos[256];
            for (int b = 0; b < 256; b++) {
                pos[b] = startPos[tid * 256 + b];
            }

            #pragma omp for schedule(static)
            for (int i = 0; i < n; i++) {
                int byte = (arr[i] >> shift) & 0xFF;
                output[pos[byte]++] = arr[i];
            }

            #pragma omp for schedule(static)
            for (int i = 0; i < n; i++) {
                arr[i] = output[i];
            }
        }
    }

    free(output);
    free(localCount);
    free(startPos);
}

int main() {
    int n = 1000000;
    unsigned int *arr1 = (unsigned int *)malloc(n * sizeof(unsigned int));
    unsigned int *arr2 = (unsigned int *)malloc(n * sizeof(unsigned int));

    for (int i = 0; i < n; i++) {
        arr1[i] = ((rand() & 0xFF) << 24) | ((rand() & 0xFF) << 16) | ((rand() & 0xFF) << 8) | (rand() & 0xFF);
        arr2[i] = arr1[i];
    }

    double t0 = omp_get_wtime();
    radixSortBase256Serial(arr1, n);
    double t1 = omp_get_wtime();
    double serTime = t1 - t0;

    printf("Serial 256 (1 Million): %.6f s\n", serTime);

    for (int t = 1; t <= 16; t *= 2) {
        for (int i = 0; i < n; i++) arr2[i] = arr1[i];
        double p0 = omp_get_wtime();
        radixSortBase256Parallel(arr2, n, t);
        double p1 = omp_get_wtime();
        printf("%dT Parallel 256: %.6f s (Speedup: %.2fx)\n", t, p1 - p0, serTime / (p1 - p0));
    }
    return 0;
}
