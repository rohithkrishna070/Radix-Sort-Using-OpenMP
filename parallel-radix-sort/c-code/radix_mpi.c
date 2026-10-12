#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <mpi.h>

/* Local counting sort on current digit position */
void localCountingSort(unsigned int *arr, int n, unsigned long long exp) {
    if (n <= 1) return;
    unsigned int *output = (unsigned int *)malloc(n * sizeof(unsigned int));
    if (!output) return;

    int count[10] = {0};
    for (int i = 0; i < n; i++) {
        int digit = (arr[i] / exp) % 10;
        count[digit]++;
    }

    for (int i = 1; i < 10; i++) {
        count[i] += count[i - 1];
    }

    for (int i = n - 1; i >= 0; i--) {
        int digit = (arr[i] / exp) % 10;
        output[count[digit] - 1] = arr[i];
        count[digit]--;
    }

    memcpy(arr, output, n * sizeof(unsigned int));
    free(output);
}

int main(int argc, char **argv) {
    MPI_Init(&argc, &argv);

    int rank, numProcs;
    MPI_Comm_rank(MPI_COMM_WORLD, &rank);
    MPI_Comm_size(MPI_COMM_WORLD, &numProcs);

    int n = 0;
    unsigned int *globalArr = NULL;

    if (rank == 0) {
        if (scanf("%d", &n) != 1 || n <= 0) {
            fprintf(stderr, "Invalid input size\n");
            MPI_Abort(MPI_COMM_WORLD, 1);
            return 1;
        }

        globalArr = (unsigned int *)malloc(n * sizeof(unsigned int));
        if (!globalArr) {
            fprintf(stderr, "Memory allocation failed\n");
            MPI_Abort(MPI_COMM_WORLD, 1);
            return 1;
        }

        for (int i = 0; i < n; i++) {
            if (scanf("%u%*[, \t\n\r]", &globalArr[i]) != 1) {
                fprintf(stderr, "Invalid input at index %d\n", i);
                free(globalArr);
                MPI_Abort(MPI_COMM_WORLD, 1);
                return 1;
            }
        }
    }

    /* Broadcast n to all ranks */
    MPI_Bcast(&n, 1, MPI_INT, 0, MPI_COMM_WORLD);

    int *sendCounts = (int *)malloc(numProcs * sizeof(int));
    int *displs = (int *)malloc(numProcs * sizeof(int));

    int base = n / numProcs;
    int rem = n % numProcs;
    int offset = 0;
    for (int p = 0; p < numProcs; p++) {
        sendCounts[p] = base + (p < rem ? 1 : 0);
        displs[p] = offset;
        offset += sendCounts[p];
    }

    int localN = sendCounts[rank];
    unsigned int *localArr = (unsigned int *)malloc(localN * sizeof(unsigned int));

    MPI_Barrier(MPI_COMM_WORLD);
    double startTime = MPI_Wtime();

    /* Step 1: Scatter data chunk to all processes */
    MPI_Scatterv(globalArr, sendCounts, displs, MPI_UNSIGNED,
                 localArr, localN, MPI_UNSIGNED, 0, MPI_COMM_WORLD);

    /* Step 2: Find global maximum */
    unsigned int localMax = 0;
    for (int i = 0; i < localN; i++) {
        if (localArr[i] > localMax) localMax = localArr[i];
    }

    unsigned int globalMax = 0;
    MPI_Allreduce(&localMax, &globalMax, 1, MPI_UNSIGNED, MPI_MAX, MPI_COMM_WORLD);

    /* Step 3: LSD Radix Sort across 10-base digits */
    for (unsigned long long exp = 1; globalMax / exp > 0; exp *= 10) {
        int localHist[10] = {0};
        for (int i = 0; i < localN; i++) {
            int digit = (localArr[i] / exp) % 10;
            localHist[digit]++;
        }

        int globalHist[10] = {0};
        MPI_Allreduce(localHist, globalHist, 10, MPI_INT, MPI_SUM, MPI_COMM_WORLD);

        int digitToProc[10];
        int targetPerProc = (n + numProcs - 1) / numProcs;
        int currentProc = 0;
        int currentCount = 0;

        for (int d = 0; d < 10; d++) {
            digitToProc[d] = currentProc;
            currentCount += globalHist[d];
            if (currentCount >= targetPerProc && currentProc < numProcs - 1) {
                currentProc++;
                currentCount = 0;
            }
        }

        int *msgSendCounts = (int *)calloc(numProcs, sizeof(int));
        for (int i = 0; i < localN; i++) {
            int digit = (localArr[i] / exp) % 10;
            msgSendCounts[digitToProc[digit]]++;
        }

        int *msgRecvCounts = (int *)calloc(numProcs, sizeof(int));
        MPI_Alltoall(msgSendCounts, 1, MPI_INT, msgRecvCounts, 1, MPI_INT, MPI_COMM_WORLD);

        int *sDispls = (int *)calloc(numProcs, sizeof(int));
        int *rDispls = (int *)calloc(numProcs, sizeof(int));
        int totalRecv = 0;

        for (int p = 0; p < numProcs; p++) {
            totalRecv += msgRecvCounts[p];
            if (p > 0) {
                sDispls[p] = sDispls[p - 1] + msgSendCounts[p - 1];
                rDispls[p] = rDispls[p - 1] + msgRecvCounts[p - 1];
            }
        }

        unsigned int *sendBuf = (unsigned int *)malloc(localN * sizeof(unsigned int));
        int *bucketPos = (int *)calloc(numProcs, sizeof(int));

        for (int i = 0; i < localN; i++) {
            int digit = (localArr[i] / exp) % 10;
            int dest = digitToProc[digit];
            sendBuf[sDispls[dest] + bucketPos[dest]] = localArr[i];
            bucketPos[dest]++;
        }

        unsigned int *recvBuf = (unsigned int *)malloc(totalRecv * sizeof(unsigned int));
        MPI_Alltoallv(sendBuf, msgSendCounts, sDispls, MPI_UNSIGNED,
                      recvBuf, msgRecvCounts, rDispls, MPI_UNSIGNED,
                      MPI_COMM_WORLD);

        free(localArr);
        localArr = recvBuf;
        localN = totalRecv;

        localCountingSort(localArr, localN, exp);

        free(sendBuf);
        free(bucketPos);
        free(msgSendCounts);
        free(msgRecvCounts);
        free(sDispls);
        free(rDispls);
    }

    /* Step 4: Gather sorted partitions to rank 0 */
    int *finalCounts = NULL;
    int *finalDispls = NULL;
    if (rank == 0) {
        finalCounts = (int *)malloc(numProcs * sizeof(int));
        finalDispls = (int *)malloc(numProcs * sizeof(int));
    }

    MPI_Gather(&localN, 1, MPI_INT, finalCounts, 1, MPI_INT, 0, MPI_COMM_WORLD);

    if (rank == 0) {
        int gOffset = 0;
        for (int p = 0; p < numProcs; p++) {
            finalDispls[p] = gOffset;
            gOffset += finalCounts[p];
        }
    }

    MPI_Gatherv(localArr, localN, MPI_UNSIGNED,
                globalArr, finalCounts, finalDispls, MPI_UNSIGNED,
                0, MPI_COMM_WORLD);

    MPI_Barrier(MPI_COMM_WORLD);
    double endTime = MPI_Wtime();
    double mpiTime = endTime - startTime;

    if (rank == 0) {
        printf("TIME:%.9f\n", mpiTime);
        printf("MPI_TIME:%.9f\n", mpiTime);
        printf("PROCESSES:%d\n", numProcs);
        printf("SORTED:");
        for (int i = 0; i < n; i++) {
            printf("%u", globalArr[i]);
            if (i < n - 1) printf(",");
        }
        printf("\n");

        free(globalArr);
        free(finalCounts);
        free(finalDispls);
    }

    free(localArr);
    free(sendCounts);
    free(displs);

    MPI_Finalize();
    return 0;
}
