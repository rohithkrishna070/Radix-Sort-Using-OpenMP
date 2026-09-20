#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <omp.h>

/* Find maximum element using OpenMP reduction */
unsigned int getMaxParallel(unsigned int arr[], int n, int dynamic_sched) {
    unsigned int max = arr[0];
    if (dynamic_sched) {
        #pragma omp parallel for reduction(max:max) schedule(dynamic, 1024)
        for (int i = 1; i < n; i++) {
            if (arr[i] > max) {
                max = arr[i];
            }
        }
    } else {
        #pragma omp parallel for reduction(max:max) schedule(static)
        for (int i = 1; i < n; i++) {
            if (arr[i] > max) {
                max = arr[i];
            }
        }
    }
    return max;
}

/* Parallel LSD Radix Sort using STATIC scheduling */
void radixSortStatic(unsigned int arr[], int n, int *threads_used) {
    if (n <= 1) {
        *threads_used = 1;
        return;
    }

    unsigned int max = getMaxParallel(arr, n, 0);

    int numThreads = 1;
    #pragma omp parallel
    {
        #pragma omp single
        numThreads = omp_get_num_threads();
    }
    *threads_used = numThreads;

    unsigned int *output = (unsigned int *)malloc(n * sizeof(unsigned int));
    int *localCount = (int *)malloc(numThreads * 10 * sizeof(int));
    int *startPosition = (int *)malloc(numThreads * 10 * sizeof(int));
    int totalCount[10];

    if (output == NULL || localCount == NULL || startPosition == NULL) {
        fprintf(stderr, "Memory allocation failed\n");
        free(output); free(localCount); free(startPosition);
        exit(1);
    }

    for (unsigned long long exp = 1; max / exp > 0; exp *= 10) {
        #pragma omp parallel num_threads(numThreads)
        {
            int threadId = omp_get_thread_num();
            int *count = &localCount[threadId * 10];
            for (int d = 0; d < 10; d++) count[d] = 0;

            /* STEP 1: Thread-local digit counting (contiguous static partition) */
            #pragma omp for schedule(static)
            for (int i = 0; i < n; i++) {
                int digit = (arr[i] / exp) % 10;
                count[digit]++;
            }

            /* STEP 2 & 3: Global cumulative counts and start positions */
            #pragma omp single
            {
                memset(totalCount, 0, 10 * sizeof(int));
                for (int t = 0; t < numThreads; t++) {
                    for (int d = 0; d < 10; d++) {
                        totalCount[d] += localCount[t * 10 + d];
                    }
                }
                for (int d = 1; d < 10; d++) {
                    totalCount[d] += totalCount[d - 1];
                }
                for (int d = 0; d < 10; d++) {
                    int pos = (d == 0) ? 0 : totalCount[d - 1];
                    for (int t = 0; t < numThreads; t++) {
                        startPosition[t * 10 + d] = pos;
                        pos += localCount[t * 10 + d];
                    }
                }
            } // implicit barrier ensures all start positions are ready

            /* STEP 4: Scatter elements into output */
            int pos[10];
            for (int d = 0; d < 10; d++) {
                pos[d] = startPosition[threadId * 10 + d];
            }

            #pragma omp for schedule(static)
            for (int i = 0; i < n; i++) {
                int digit = (arr[i] / exp) % 10;
                output[pos[digit]++] = arr[i];
            }

            /* STEP 5: Copy pass output back to arr */
            #pragma omp for schedule(static)
            for (int i = 0; i < n; i++) {
                arr[i] = output[i];
            }
        }
    }

    free(output);
    free(localCount);
    free(startPosition);
}

/* Parallel LSD Radix Sort using DYNAMIC scheduling */
void radixSortDynamic(unsigned int arr[], int n, int *threads_used) {
    if (n <= 1) {
        *threads_used = 1;
        return;
    }

    unsigned int max = getMaxParallel(arr, n, 1);

    int numThreads = 1;
    #pragma omp parallel
    {
        #pragma omp single
        numThreads = omp_get_num_threads();
    }
    *threads_used = numThreads;

    /* Dynamic chunking: smaller chunks expose dynamic queue overhead and cache misses */
    int chunkSize = 256;
    if (chunkSize > n / (numThreads * 2)) {
        chunkSize = n / (numThreads * 2);
    }
    if (chunkSize < 32) chunkSize = 32;

    int numChunks = (n + chunkSize - 1) / chunkSize;

    unsigned int *output = (unsigned int *)malloc(n * sizeof(unsigned int));
    int *chunkCount = (int *)calloc(numChunks * 10, sizeof(int));
    int *startPosition = (int *)malloc(numChunks * 10 * sizeof(int));
    int totalCount[10];

    if (output == NULL || chunkCount == NULL || startPosition == NULL) {
        fprintf(stderr, "Memory allocation failed\n");
        free(output); free(chunkCount); free(startPosition);
        exit(1);
    }

    for (unsigned long long exp = 1; max / exp > 0; exp *= 10) {
        #pragma omp parallel num_threads(numThreads)
        {
            /* STEP 1: Dynamic chunk counting */
            #pragma omp for schedule(dynamic, 1)
            for (int c = 0; c < numChunks; c++) {
                int startIdx = c * chunkSize;
                int endIdx = startIdx + chunkSize;
                if (endIdx > n) endIdx = n;

                int *count = &chunkCount[c * 10];
                for (int d = 0; d < 10; d++) count[d] = 0;
                for (int i = startIdx; i < endIdx; i++) {
                    int digit = (arr[i] / exp) % 10;
                    count[digit]++;
                }
            }

            /* STEP 2 & 3: Global cumulative positions across chunks */
            #pragma omp single
            {
                memset(totalCount, 0, 10 * sizeof(int));
                for (int c = 0; c < numChunks; c++) {
                    for (int d = 0; d < 10; d++) {
                        totalCount[d] += chunkCount[c * 10 + d];
                    }
                }
                for (int d = 1; d < 10; d++) {
                    totalCount[d] += totalCount[d - 1];
                }
                for (int d = 0; d < 10; d++) {
                    int pos = (d == 0) ? 0 : totalCount[d - 1];
                    for (int c = 0; c < numChunks; c++) {
                        startPosition[c * 10 + d] = pos;
                        pos += chunkCount[c * 10 + d];
                    }
                }
            }

            /* STEP 4: Dynamic scattering */
            #pragma omp for schedule(dynamic, 1)
            for (int c = 0; c < numChunks; c++) {
                int startIdx = c * chunkSize;
                int endIdx = startIdx + chunkSize;
                if (endIdx > n) endIdx = n;

                int pos[10];
                for (int d = 0; d < 10; d++) {
                    pos[d] = startPosition[c * 10 + d];
                }

                for (int i = startIdx; i < endIdx; i++) {
                    int digit = (arr[i] / exp) % 10;
                    output[pos[digit]++] = arr[i];
                }
            }

            /* STEP 5: Copy back using dynamic schedule */
            #pragma omp for schedule(dynamic, 1024)
            for (int i = 0; i < n; i++) {
                arr[i] = output[i];
            }
        }
    }

    free(output);
    free(chunkCount);
    free(startPosition);
}

int main(int argc, char *argv[]) {
    int n;
    if (scanf("%d", &n) != 1 || n <= 0) {
        fprintf(stderr, "Invalid input size\n");
        return 1;
    }

    unsigned int *arr_static = (unsigned int *)malloc(n * sizeof(unsigned int));
    unsigned int *arr_dynamic = (unsigned int *)malloc(n * sizeof(unsigned int));

    if (arr_static == NULL || arr_dynamic == NULL) {
        fprintf(stderr, "Memory allocation failed\n");
        free(arr_static);
        free(arr_dynamic);
        return 1;
    }

    for (int i = 0; i < n; i++) {
        /* Accepts spaces, newlines, and commas */
        if (scanf("%u%*[, \t\n\r]", &arr_static[i]) != 1) {
            fprintf(stderr, "Invalid input\n");
            free(arr_static);
            free(arr_dynamic);
            return 1;
        }
        arr_dynamic[i] = arr_static[i];
    }

    /* Warm up OpenMP runtime thread pool */
    #pragma omp parallel
    {
        (void)omp_get_thread_num();
    }

    /* Mode: "both" (default), "static", "dynamic" */
    int runStatic = 1;
    int runDynamic = 1;
    if (argc > 1) {
        if (strcmp(argv[1], "static") == 0) {
            runDynamic = 0;
        } else if (strcmp(argv[1], "dynamic") == 0) {
            runStatic = 0;
        }
    }

    int threads_used = 1;
    double staticTime = 0.0;
    double dynamicTime = 0.0;

    if (runStatic) {
        double sStart = omp_get_wtime();
        radixSortStatic(arr_static, n, &threads_used);
        double sEnd = omp_get_wtime();
        staticTime = sEnd - sStart;
    }

    if (runDynamic) {
        int dyn_threads = 1;
        double dStart = omp_get_wtime();
        radixSortDynamic(arr_dynamic, n, &dyn_threads);
        double dEnd = omp_get_wtime();
        dynamicTime = dEnd - dStart;
        if (!runStatic) {
            threads_used = dyn_threads;
        }
    }

    /* Primary time line for backwards compatibility */
    double primaryTime = runStatic ? staticTime : dynamicTime;
    printf("TIME:%.9f\n", primaryTime);
    printf("STATIC_TIME:%.9f\n", staticTime);
    printf("DYNAMIC_TIME:%.9f\n", dynamicTime);
    printf("THREADS:%d\n", threads_used);

    /* Output the sorted array */
    unsigned int *finalSorted = runStatic ? arr_static : arr_dynamic;
    printf("SORTED:");
    for (int i = 0; i < n; i++) {
        printf("%u", finalSorted[i]);
        if (i < n - 1) printf(",");
    }
    printf("\n");

    free(arr_static);
    free(arr_dynamic);
    return 0;
}
