#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <omp.h>

/* Find maximum element using OpenMP reduction */
int getMaxParallel(int arr[], int n) {
    int max = arr[0];
    #pragma omp parallel for reduction(max:max)
    for (int i = 1; i < n; i++) {
        if (arr[i] > max) {
            max = arr[i];
        }
    }
    return max;
}

/* Parallel LSD Radix Sort */
void radixSortParallel(int arr[], int n, int *threads_used) {
    if (n <= 1) {
        *threads_used = 1;
        return;
    }

    int max = getMaxParallel(arr, n);

    int numThreads = 1;
    #pragma omp parallel
    {
        #pragma omp single
        numThreads = omp_get_num_threads();
    }
    *threads_used = numThreads;

    /* Pre-allocate buffers outside loop for maximum efficiency */
    int *output = (int *)malloc(n * sizeof(int));
    int *localCount = (int *)malloc(numThreads * 10 * sizeof(int));
    int *startPosition = (int *)malloc(numThreads * 10 * sizeof(int));

    if (output == NULL || localCount == NULL || startPosition == NULL) {
        fprintf(stderr, "Memory allocation failed\n");
        free(output);
        free(localCount);
        free(startPosition);
        exit(1);
    }

    for (long long exp = 1; max / exp > 0; exp *= 10) {
        memset(localCount, 0, numThreads * 10 * sizeof(int));

        /* STEP 1: Thread-local digit counting */
        #pragma omp parallel num_threads(numThreads)
        {
            int threadId = omp_get_thread_num();
            int *count = &localCount[threadId * 10];

            #pragma omp for schedule(static)
            for (int i = 0; i < n; i++) {
                int digit = (arr[i] / exp) % 10;
                count[digit]++;
            }
        }

        /* STEP 2: Combine counts into global cumulative counts */
        int totalCount[10] = {0};
        for (int thread = 0; thread < numThreads; thread++) {
            for (int digit = 0; digit < 10; digit++) {
                totalCount[digit] += localCount[thread * 10 + digit];
            }
        }

        for (int digit = 1; digit < 10; digit++) {
            totalCount[digit] += totalCount[digit - 1];
        }

        /* STEP 3: Calculate starting offsets for each thread and digit */
        for (int digit = 0; digit < 10; digit++) {
            int position = (digit == 0) ? 0 : totalCount[digit - 1];
            for (int thread = 0; thread < numThreads; thread++) {
                startPosition[thread * 10 + digit] = position;
                position += localCount[thread * 10 + digit];
            }
        }

        /* STEP 4: Place elements into output array concurrently */
        #pragma omp parallel num_threads(numThreads)
        {
            int threadId = omp_get_thread_num();
            int position[10];

            for (int digit = 0; digit < 10; digit++) {
                position[digit] = startPosition[threadId * 10 + digit];
            }

            #pragma omp for schedule(static)
            for (int i = 0; i < n; i++) {
                int digit = (arr[i] / exp) % 10;
                output[position[digit]] = arr[i];
                position[digit]++;
            }
        }

        /* STEP 5: Copy sorted pass back to original array */
        #pragma omp parallel for schedule(static) num_threads(numThreads)
        for (int i = 0; i < n; i++) {
            arr[i] = output[i];
        }
    }

    free(output);
    free(localCount);
    free(startPosition);
}

int main() {
    int n;
    if (scanf("%d", &n) != 1 || n <= 0) {
        fprintf(stderr, "Invalid input size\n");
        return 1;
    }

    int *arr = (int *)malloc(n * sizeof(int));
    if (arr == NULL) {
        fprintf(stderr, "Memory allocation failed\n");
        return 1;
    }

    for (int i = 0; i < n; i++) {
        /* Accepts spaces, newlines, and commas */
        if (scanf("%d%*[, \t\n\r]", &arr[i]) != 1 || arr[i] < 0) {
            fprintf(stderr, "Invalid input\n");
            free(arr);
            return 1;
        }
    }

    int threads_used = 1;
    double startTime = omp_get_wtime();
    radixSortParallel(arr, n, &threads_used);
    double endTime = omp_get_wtime();

    printf("TIME:%.9f\n", endTime - startTime);
    printf("THREADS:%d\n", threads_used);
    printf("SORTED:");
    for (int i = 0; i < n; i++) {
        printf("%d", arr[i]);
        if (i < n - 1) printf(",");
    }
    printf("\n");

    free(arr);
    return 0;
}
