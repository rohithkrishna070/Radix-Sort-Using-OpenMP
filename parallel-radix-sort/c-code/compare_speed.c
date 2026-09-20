#include <stdio.h>
#include <stdlib.h>
#include <omp.h>

void radixSortBase10Parallel(unsigned int arr[], int n, int numThreads) {
    unsigned int *output = (unsigned int *)malloc(n * sizeof(unsigned int));
    int *localCount = (int *)malloc(numThreads * 10 * sizeof(int));
    int *startPosition = (int *)malloc(numThreads * 10 * sizeof(int));
    int totalCount[10];

    unsigned int max = arr[0];
    for (int i = 1; i < n; i++) if (arr[i] > max) max = arr[i];

    for (unsigned long long exp = 1; max / exp > 0; exp *= 10) {
        #pragma omp parallel num_threads(numThreads)
        {
            int threadId = omp_get_thread_num();
            int *count = &localCount[threadId * 10];
            for (int d = 0; d < 10; d++) count[d] = 0;

            #pragma omp for schedule(static)
            for (int i = 0; i < n; i++) {
                int digit = (arr[i] / exp) % 10;
                count[digit]++;
            }

            #pragma omp single
            {
                for (int d = 0; d < 10; d++) totalCount[d] = 0;
                for (int t = 0; t < numThreads; t++) {
                    for (int d = 0; d < 10; d++) totalCount[d] += localCount[t * 10 + d];
                }
                for (int d = 1; d < 10; d++) totalCount[d] += totalCount[d - 1];
                for (int d = 0; d < 10; d++) {
                    int pos = (d == 0) ? 0 : totalCount[d - 1];
                    for (int t = 0; t < numThreads; t++) {
                        startPosition[t * 10 + d] = pos;
                        pos += localCount[t * 10 + d];
                    }
                }
            }

            int pos[10];
            for (int d = 0; d < 10; d++) pos[d] = startPosition[threadId * 10 + d];

            #pragma omp for schedule(static)
            for (int i = 0; i < n; i++) {
                int digit = (arr[i] / exp) % 10;
                output[pos[digit]++] = arr[i];
            }

            #pragma omp for schedule(static)
            for (int i = 0; i < n; i++) {
                arr[i] = output[i];
            }
        }
    }
    free(output); free(localCount); free(startPosition);
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
                    for (int b = 0; b < 256; b++) totalCount[b] += localCount[t * 256 + b];
                }
                for (int b = 1; b < 256; b++) totalCount[b] += totalCount[b - 1];
                for (int b = 0; b < 256; b++) {
                    int p = (b == 0) ? 0 : totalCount[b - 1];
                    for (int t = 0; t < numThreads; t++) {
                        startPos[t * 256 + b] = p;
                        p += localCount[t * 256 + b];
                    }
                }
            }

            int pos[256];
            for (int b = 0; b < 256; b++) pos[b] = startPos[tid * 256 + b];

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
    free(output); free(localCount); free(startPos);
}

void radixSortBase256Serial(unsigned int arr[], int n) {
    unsigned int *output = (unsigned int *)malloc(n * sizeof(unsigned int));
    int count[256];

    for (int shift = 0; shift < 32; shift += 8) {
        for (int i = 0; i < 256; i++) count[i] = 0;
        for (int i = 0; i < n; i++) count[(arr[i] >> shift) & 0xFF]++;
        for (int i = 1; i < 256; i++) count[i] += count[i - 1];
        for (int i = n - 1; i >= 0; i--) {
            int byte = (arr[i] >> shift) & 0xFF;
            output[--count[byte]] = arr[i];
        }
        for (int i = 0; i < n; i++) arr[i] = output[i];
    }
    free(output);
}

int main() {
    int n = 250000;
    unsigned int *a1 = (unsigned int *)malloc(n * sizeof(unsigned int));
    unsigned int *a2 = (unsigned int *)malloc(n * sizeof(unsigned int));
    unsigned int *a3 = (unsigned int *)malloc(n * sizeof(unsigned int));

    for (int i = 0; i < n; i++) {
        a1[i] = ((rand() & 0xFF) << 24) | ((rand() & 0xFF) << 16) | ((rand() & 0xFF) << 8) | (rand() & 0xFF);
        a2[i] = a1[i];
        a3[i] = a1[i];
    }

    double t0 = omp_get_wtime();
    radixSortBase256Serial(a1, n);
    double t1 = omp_get_wtime();
    printf("Serial 256: %.4f s (%.1f ms)\n", t1 - t0, (t1 - t0) * 1000);

    double t2 = omp_get_wtime();
    radixSortBase10Parallel(a2, n, 2);
    double t3 = omp_get_wtime();
    printf("Old Base-10 Parallel (2T): %.4f s (%.1f ms)\n", t3 - t2, (t3 - t2) * 1000);

    double t4 = omp_get_wtime();
    radixSortBase256Parallel(a3, n, 2);
    double t5 = omp_get_wtime();
    printf("New Base-256 Parallel (2T): %.4f s (%.1f ms)\n", t5 - t4, (t5 - t4) * 1000);

    for (int t = 4; t <= 16; t *= 2) {
        for (int i = 0; i < n; i++) a3[i] = a1[i];
        double p0 = omp_get_wtime();
        radixSortBase256Parallel(a3, n, t);
        double p1 = omp_get_wtime();
        printf("New Base-256 Parallel (%dT): %.4f s (%.1f ms) - Speedup: %.2fx\n", t, p1 - p0, (p1 - p0) * 1000, (t1 - t0) / (p1 - p0));
    }
    return 0;
}
