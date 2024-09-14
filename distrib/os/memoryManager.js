var TSOS;
(function (TSOS) {
    class MemoryManager {
        memorySize;
        memoryAccessor;
        nextPID;
        allocatedMemoryBlocks; // Store allocated memory
        freeMemoryBlocks; // Track free memory
        constructor(memorySize, memoryAccessor) {
            this.memorySize = memorySize;
            this.memoryAccessor = memoryAccessor; // Use MemoryAccessor to access memory
            this.nextPID = 0; // Start with PID: 0
            this.allocatedMemoryBlocks = []; // Track memory allocation
            this.freeMemoryBlocks = [{ start: 0, end: memorySize - 1 }]; // Initially, the whole memory is free
        }
        // Find a free memory block, prefer baseAddress if provided (for $0000)
        findFreeMemoryBlock(programSize, baseAddress) {
            // Try to use the provided base address (if available) first
            if (baseAddress !== undefined) {
                const block = this.freeMemoryBlocks.find((block) => block.start === baseAddress &&
                    block.end - block.start + 1 >= programSize);
                if (block) {
                    return baseAddress;
                }
            }
            // Otherwise, find the first available free block that fits the program size
            for (const block of this.freeMemoryBlocks) {
                const blockSize = block.end - block.start + 1;
                if (blockSize >= programSize) {
                    return block.start;
                }
            }
            return null; // Return null if no free memory block is found
        }
        // Update the free memory block list after allocating memory
        updateFreeMemory(baseAddress, programSize) {
            this.freeMemoryBlocks = this.freeMemoryBlocks
                .map((block) => {
                if (block.start === baseAddress) {
                    const remainingBlockStart = block.start + programSize;
                    if (remainingBlockStart <= block.end) {
                        return { start: remainingBlockStart, end: block.end };
                    }
                    else {
                        return null;
                    }
                }
                else {
                    return block;
                }
            })
                .filter((block) => block !== null);
        }
        // Store a program in memory and return PID and base address
        storeProgram(program) {
            const programSize = program.length;
            // Always try to load at $0000 if it's the first program
            const baseAddress = this.findFreeMemoryBlock(programSize, 0x0000);
            if (baseAddress !== null) {
                // Load the program into memory via the MemoryAccessor
                for (let i = 0; i < programSize; i++) {
                    this.memoryAccessor.write(baseAddress + i, program[i]);
                }
                // Create a new process with a unique PID
                const pid = this.nextPID++;
                this.allocatedMemoryBlocks.push({
                    pid,
                    start: baseAddress,
                    end: baseAddress + programSize - 1,
                });
                // Update the free memory blocks to reflect the new allocation
                this.updateFreeMemory(baseAddress, programSize);
                return { pid, baseAddress }; // Return the PID and base address of the new process
            }
            return { pid: -1, baseAddress: -1 }; // Return -1 if not enough memory to load the program
        }
        // Retrieve a loaded program by PID
        retrieveProgram(pid) {
            const memoryBlock = this.allocatedMemoryBlocks.find((block) => block.pid === pid);
            if (memoryBlock) {
                return this.memoryAccessor.readBlock(memoryBlock.start, memoryBlock.end);
            }
            return null;
        }
        freeProcessMemory(pid) {
            const memoryBlock = this.allocatedMemoryBlocks.find((block) => block.pid === pid);
            if (memoryBlock) {
                // Mark the memory as free by adding it back to the free memory blocks
                this.freeMemoryBlocks.push({
                    start: memoryBlock.start,
                    end: memoryBlock.end,
                });
                // Remove the memory block from allocated memory blocks
                this.allocatedMemoryBlocks = this.allocatedMemoryBlocks.filter((block) => block.pid !== pid);
            }
        }
    }
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryManager.js.map