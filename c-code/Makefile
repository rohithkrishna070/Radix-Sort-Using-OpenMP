CC = gcc
CFLAGS = -O2 -fopenmp -Wall -Wextra

ifeq ($(OS),Windows_NT)
    EXT = .exe
    RM = del /Q
else
    EXT =
    RM = rm -f
endif

SERIAL_BIN = radix_serial$(EXT)
PARALLEL_BIN = radix_parallel$(EXT)
MPI_BIN = radix_mpi$(EXT)
MPICC = mpicc

.PHONY: all clean serial parallel mpi

all: serial parallel mpi

serial: radix_serial.c
	$(CC) $(CFLAGS) -o $(SERIAL_BIN) radix_serial.c

parallel: radix_parallel.c
	$(CC) $(CFLAGS) -o $(PARALLEL_BIN) radix_parallel.c

mpi: radix_mpi.c
	$(MPICC) -O2 -Wall -Wextra -o $(MPI_BIN) radix_mpi.c

clean:
	$(RM) $(SERIAL_BIN) $(PARALLEL_BIN) $(MPI_BIN)
