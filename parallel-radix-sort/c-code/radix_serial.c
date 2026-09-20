#include <stdio.h>
#include <stdlib.h>
#include <omp.h>

/* Find the maximum value in the array */
unsigned int getMax(unsigned int arr[], int n) {
    unsigned int max = arr[0];
    for (int i = 1; i < n; i++) {
        if (arr[i] > max) max = arr[i];
    }
    return max;
}

/* Perform Counting Sort based on the current digit position */
void countingSort(unsigned int arr[], int n, unsigned long long exp, unsigned int *output) {
    int count[10] = {0};

    for (int i = 0; i < n; i++) {
        int digit = (arr[i] / exp) % 10;
        count[digit]++;
    }

    for (int i = 1; i < 10; i++) {
        count[i] += count[i - 1];
    }

    /* Move right to left for stable sorting */
    for (int i = n - 1; i >= 0; i--) {
        int digit = (arr[i] / exp) % 10;
        output[count[digit] - 1] = arr[i];
        count[digit]--;
    }

    for (int i = 0; i < n; i++) {
        arr[i] = output[i];
    }
}

/* LSD Radix Sort */
void radixSort(unsigned int arr[], int n) {
    if (n <= 1) return;
    unsigned int max = getMax(arr, n);

    unsigned int *output = (unsigned int *)malloc(n * sizeof(unsigned int));
    if (output == NULL) {
        fprintf(stderr, "Memory allocation failed\n");
        exit(1);
    }

    for (unsigned long long exp = 1; max / exp > 0; exp *= 10) {
        countingSort(arr, n, exp, output);
    }

    free(output);
}

int main() {
    int n;
    if (scanf("%d", &n) != 1 || n <= 0) {
        fprintf(stderr, "Invalid input size\n");
        return 1;
    }

    unsigned int *arr = (unsigned int *)malloc(n * sizeof(unsigned int));
    if (arr == NULL) {
        fprintf(stderr, "Memory allocation failed\n");
        return 1;
    }

    for (int i = 0; i < n; i++) {
        /* Accepts spaces, newlines, and commas */
        if (scanf("%u%*[, \t\n\r]", &arr[i]) != 1) {
            fprintf(stderr, "Invalid input\n");
            free(arr);
            return 1;
        }
    }

    double startTime = omp_get_wtime();
    radixSort(arr, n);
    double endTime = omp_get_wtime();

    printf("TIME:%.9f\n", endTime - startTime);
    printf("SORTED:");
    for (int i = 0; i < n; i++) {
        printf("%u", arr[i]);
        if (i < n - 1) printf(",");
    }
    printf("\n");

    free(arr);
    return 0;
}
