namespace TSOS {
  export class MemoryManager {
    private memoryAccessor: MemoryAccessor;
    public nextPID: number;
    public partitions: {
      pid: number | null;
      base: number;
      limit: number;
      occupied: boolean;
    }[];
    public currentPartitionIndex: number;

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
    public storeProgram(program: number[], existingPCB?: PCB): { pid: number } {
      const programSize = program.length;
      console.log(`Storing program of size: ${programSize}`);

      // Use existing PID if provided, or generate a new one
      const pid = existingPCB ? existingPCB.pid : this.nextPID++;

      // Allocate a partition for the program
      const partition = this.allocatePartition(pid);

      if (partition) {
        const { base, limit } = partition;

        console.log(
          `Storing program in Partition Base: ${base}, Limit: ${limit}`
        );

        // Write the program into memory using the allocated partition
        for (let i = 0; i < programSize; i++) {
          this.memoryAccessor.write(base + i, program[i], base, limit);
        }

        // Display memory contents after writing
        TSOS.Control.displayMemory();

        // Find the index of the allocated partition
        const assignedPartitionIndex = this.partitions.findIndex(
          (p) => p.base === base && p.limit === limit
        );

        if (assignedPartitionIndex === -1) {
          console.error(
            "Failed to find the allocated partition in partitions."
          );
          return { pid: -1 };
        }

        // Create or update the PCB
        const pcb =
          existingPCB || new TSOS.PCB(pid, base, limit, 1, "Memory", pid);
        pcb.base = base;
        pcb.limit = limit;
        pcb.location = "Memory";
        pcb.state = "Resident";
        pcb.partition = assignedPartitionIndex; // Use the partition index

        // Enqueue the PCB in the resident queue
        if (!existingPCB) {
          neOS.residentQueue.enqueue(pcb);
        }

        // Update the PCB display
        TSOS.Control.updatePCBDisplay();

        console.log(
          `Program stored with PID: ${pid}, Base: ${base}, Limit: ${limit}`
        );

        return { pid };
      }

      // Handle the case where no partition is available
      console.error("Failed to store program: No available partition.");
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

    public isMemoryFull(): boolean {
      console.log("Checking if memory is full.");
      for (let i = 0; i < this.partitions.length; i++) {
        const partition = this.partitions[i];
        console.log(
          `Partition ${i} - Base: ${partition.base}, Limit: ${partition.limit}, Occupied: ${partition.occupied}`
        );
        if (!partition.occupied) {
          console.log("Found an available partition. Memory is not full.");
          return false;
        }
      }
      console.log("No available partitions. Memory is full.");
      return true;
    }

    // Partitioning logic for rollin/rollout
    public allocatePartition(
      pid: number
    ): { base: number; limit: number } | null {
      for (let i = 0; i < this.partitions.length; i++) {
        const partitionIndex =
          (this.currentPartitionIndex + i) % this.partitions.length;
        const partition = this.partitions[partitionIndex];

        if (!partition.occupied) {
          partition.occupied = true;
          partition.pid = pid;

          console.log(
            `Allocated partition ${partitionIndex} for PID ${pid}. Base: ${partition.base}, Limit: ${partition.limit}`
          );

          // Update the partition index for next allocation
          this.currentPartitionIndex =
            (partitionIndex + 1) % this.partitions.length;

          return { base: partition.base, limit: partition.limit };
        }
      }

      console.error("No available partition for allocation.");
      return null; // No available partition
    }

    public freePartition(base: number): void {
      const partition = this.partitions.find((p) => p.base === base);

      if (partition) {
        partition.occupied = false;
        partition.pid = null;
        console.log(
          `Freed partition with Base: ${base}, Limit: ${partition.limit}`
        );
      } else {
        console.error(`Partition with Base ${base} not found.`);
      }
    }
    public selectVictimProcess(): PCB | null {
      // Select the process with the smallest PID - FIFO
      const occupiedPartitions = this.partitions.filter(
        (partition) => partition.occupied
      );

      if (occupiedPartitions.length > 0) {
        const victimPartition = occupiedPartitions[0]; // FIFO
        const victimProcess = neOS.ProcessList.find(
          (process) => process.pid === victimPartition.pid
        );

        if (victimProcess) {
          console.log(`Selected victim process PID: ${victimProcess.pid}`);
          return victimProcess;
        }
      }

      console.error("No suitable victim process found.");
      return null;
    }
    public handleTerminatedProcess(pid: number): void {
      console.log(`Handling termination of process PID: ${pid}`);

      // Find the terminated process in the process list
      const terminatedProcess = neOS.ProcessList.find(
        (process) => process.pid === pid
      );

      if (!terminatedProcess) {
        console.error(`Process PID: ${pid} not found in the process list.`);
        return;
      }

      // Free the partition associated with the process
      neOS.MemoryManager.freePartition(terminatedProcess.base);

      // Clear the memory contents
      for (
        let address = terminatedProcess.base;
        address <= terminatedProcess.limit;
        address++
      ) {
        neOS.MemoryAccessor.write(
          address,
          0,
          terminatedProcess.base,
          terminatedProcess.limit
        );
      }

      console.log(`Memory freed for terminated process PID: ${pid}`);
      TSOS.Control.displayMemory(); // Update memory display
      TSOS.Control.updatePCBDisplay(); // Update the PCB display
    }
    public extractProgramFromMemory(
      base: number,
      limit: number
    ): number[] | null {
      const memoryArray = neOS.MemoryAccessor.getMemoryArray(); // Get the memory contents
      if (base < 0 || limit >= memoryArray.length || base > limit) {
        console.error("Invalid base or limit for extracting program data.");
        return null;
      }

      let lastUsedAddress = base; // Initialize the last-used address to base

      // Find the last non-zero address
      for (let i = base; i <= limit; i++) {
        const value = neOS.MemoryAccessor.read(i, base, limit);
        if (value !== 0) {
          lastUsedAddress = i;
        }
      }

      const programData: number[] = [];

      // Extract data up to the last-used address
      for (let i = base; i <= lastUsedAddress; i++) {
        const value = neOS.MemoryAccessor.read(i, base, limit);
        programData.push(value);
      }

      console.log(`Extracted program data from memory: ${programData}`);
      return programData;
    }
  }
}
