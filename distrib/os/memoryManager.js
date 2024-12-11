var TSOS;
(function (TSOS) {
    class MemoryManager {
        memoryAccessor;
        nextPID;
        partitions;
        currentPartitionIndex;
        constructor(memoryAccessor) {
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
        storeProgram(program, existingPCB) {
            const programSize = program.length;
            console.log(`Storing program of size: ${programSize}`);
            // Use existing PID if provided, or generate a new one
            const pid = existingPCB ? existingPCB.pid : this.nextPID++;
            // Allocate a partition for the program
            const partition = this.allocatePartition(pid);
            if (partition) {
                const { base, limit } = partition;
                console.log(`Storing program in Partition Base: ${base}, Limit: ${limit}`);
                // Write the program into memory using the allocated partition
                for (let i = 0; i < programSize; i++) {
                    this.memoryAccessor.write(base + i, program[i], base, limit);
                }
                // Display memory contents after writing
                TSOS.Control.displayMemory();
                // Create or update the PCB
                const pcb = existingPCB || new TSOS.PCB(pid, base, limit, 1, "Memory", pid);
                pcb.base = base;
                pcb.limit = limit;
                pcb.location = "Memory";
                pcb.state = "Resident";
                // Enqueue the PCB in the resident queue
                if (!existingPCB) {
                    neOS.residentQueue.enqueue(pcb);
                }
                // Update the PCB display
                TSOS.Control.updatePCBDisplay();
                console.log(`Program stored with PID: ${pid}, Base: ${base}, Limit: ${limit}`);
                return { pid };
            }
            // Handle the case where no partition is available
            console.error("Failed to store program: No available partition.");
            return { pid: -1 };
        }
        // Free a partition when a process terminates
        freeProcessMemory(pid) {
            // Find the partition based on PID and free it
            const partition = this.partitions.find((partition) => partition.pid === pid);
            if (partition) {
                partition.occupied = false;
                partition.pid = null;
                neOS.ProcessList = [];
            }
        }
        isMemoryFull() {
            console.log("Checking if memory is full.");
            for (let i = 0; i < this.partitions.length; i++) {
                const partition = this.partitions[i];
                console.log(`Partition ${i} - Base: ${partition.base}, Limit: ${partition.limit}, Occupied: ${partition.occupied}`);
                if (!partition.occupied) {
                    console.log("Found an available partition. Memory is not full.");
                    return false;
                }
            }
            console.log("No available partitions. Memory is full.");
            return true;
        }
        // Partitioning logic for rollin/rollout
        allocatePartition(pid) {
            for (let i = 0; i < this.partitions.length; i++) {
                const partitionIndex = (this.currentPartitionIndex + i) % this.partitions.length;
                const partition = this.partitions[partitionIndex];
                if (!partition.occupied) {
                    partition.occupied = true;
                    partition.pid = pid;
                    console.log(`Allocated partition ${partitionIndex} for PID ${pid}. Base: ${partition.base}, Limit: ${partition.limit}`);
                    // Update the partition index for next allocation
                    this.currentPartitionIndex =
                        (partitionIndex + 1) % this.partitions.length;
                    return { base: partition.base, limit: partition.limit };
                }
            }
            console.error("No available partition for allocation.");
            return null; // No available partition
        }
        freePartition(base) {
            const partition = this.partitions.find((p) => p.base === base);
            if (partition) {
                partition.occupied = false;
                partition.pid = null;
                console.log(`Freed partition with Base: ${base}, Limit: ${partition.limit}`);
            }
            else {
                console.error(`Partition with Base ${base} not found.`);
            }
        }
        selectVictimProcess() {
            // Select the process with the smallest PID - FIFO
            const occupiedPartitions = this.partitions.filter((partition) => partition.occupied);
            if (occupiedPartitions.length > 0) {
                const victimPartition = occupiedPartitions[0]; // FIFO
                const victimProcess = neOS.ProcessList.find((process) => process.pid === victimPartition.pid);
                if (victimProcess) {
                    console.log(`Selected victim process PID: ${victimProcess.pid}`);
                    return victimProcess;
                }
            }
            console.error("No suitable victim process found.");
            return null;
        }
        handleTerminatedProcess(pid) {
            console.log(`Handling termination of process PID: ${pid}`);
            // Find the terminated process in the process list
            const terminatedProcess = neOS.ProcessList.find((process) => process.pid === pid);
            if (!terminatedProcess) {
                console.error(`Process PID: ${pid} not found in the process list.`);
                return;
            }
            // Free the partition associated with the process
            neOS.MemoryManager.freePartition(terminatedProcess.base);
            // Clear the memory contents
            for (let address = terminatedProcess.base; address <= terminatedProcess.limit; address++) {
                neOS.MemoryAccessor.write(address, 0, terminatedProcess.base, terminatedProcess.limit);
            }
            console.log(`Memory freed for terminated process PID: ${pid}`);
            TSOS.Control.displayMemory(); // Update memory display
            TSOS.Control.updatePCBDisplay(); // Update the PCB display
        }
    }
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryManager.js.map