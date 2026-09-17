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

.PHONY: all clean

all: serial parallel

serial: radix_serial.c
	$(CC) $(CFLAGS) -o $(SERIAL_BIN) radix_serial.c

parallel: radix_parallel.c
	$(CC) $(CFLAGS) -o $(PARALLEL_BIN) radix_parallel.c

clean:
	$(RM) $(SERIAL_BIN) $(PARALLEL_BIN)
