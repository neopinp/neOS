namespace TSOS {
  export class MemoryManager {
    private memoryAccessor: MemoryAccessor;
    private nextPID: number;
    private partitions: {
      pid: number | null;
      base: number;
      limit: number;
      occupied: boolean;
    }[];
    private currentPartitionIndex: number;

    constructor(memoryAccessor: MemoryAccessor) {
      this.memoryAccessor = memoryAccessor;
      this.nextPID = 0;
      this.currentPartitionIndex = 0;

      // Initialize partitions with base and limit addresses
      this.partitions = [
        { pid: -1, base: 0, limit: 255, occupied: false },
        { pid: -1, base: 256, limit: 511, occupied: false },
        { pid: -1, base: 512, limit: 767, occupied: false },
      ];
    }

    // Store a program in memory and return the process info
    public storeProgram(program: number[]): { pid: number } {
      const programSize = program.length;
      console.log("Storing program of size:", program.length);

      for (let i = 0; i < this.partitions.length; i++) {
        const partitionIndex =
          (this.currentPartitionIndex + i) % this.partitions.length;
        const partition = this.partitions[partitionIndex];

        if (
          !partition.occupied &&
          programSize <= partition.limit - partition.base + 1
        ) {
          const base = partition.base;
          const limit = partition.limit;

          console.log(
            `Using partition ${partitionIndex}, Base: ${base}, Limit: ${limit}`
          );

          // Write the program into memory
          for (let j = 0; j < programSize; j++) {
            this.memoryAccessor.write(base + j, program[j], base, limit);
          }

          // Display memory contents after writing
          this.memoryAccessor.displayMemory();

          partition.occupied = true;
          const pid = this.nextPID++;
          partition.pid = pid;

          const newPCB = new TSOS.PCB(
            pid,
            base,
            limit,
            1,
            partitionIndex,
            neOS.Scheduler.defaultQuantum
          );
          newPCB.state = "Resident";
          neOS.residentQueue.enqueue(newPCB);
          TSOS.Control.updatePCBDisplay();

          if (!neOS.CurrentProcess) {
            neOS.CurrentProcess = newPCB;
          }

          this.currentPartitionIndex =
            (partitionIndex + 1) % this.partitions.length;

          return { pid };
        }
      }

      console.error("No available partition to store the program");
      return { pid: -1 };
    }

    // Free a partition when a process terminates
    public freeProcessMemory(pid: number): void {
      // Find the partition based on PID and free it
      const partition = this.partitions.find(
        (partition) => partition.pid === pid
      );
      if (partition) {
        partition.occupied = false;
        partition.pid = null;
        neOS.ProcessList = [];
      }
    }
  }
}
