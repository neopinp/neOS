var TSOS;
(function (TSOS) {
    class MemoryManager {
        memorySize;
        memory;
        nextPID;
        allocatedMemoryBlocks;
        // store allocated memory
        freeMemoryBlocks;
        // track free memory
        constructor(memorySize) {
            this.memorySize = memorySize;
            this.memory = new Array(memorySize).fill(0);
            this.nextPID = 0; // start with PID: 0
            this.allocatedMemoryBlocks = []; // track memory allocation
            this.freeMemoryBlocks = [{ start: 0, end: memorySize - 1 }];
            // initally all array
        }
        storeProgram(program) {
            const programSize = program.length;
            const baseAddress = this.findFreeMemoryBlock(programSize);
            if (baseAddress !== null) {
                for (let i = 0; i < programSize; i++) {
                    this.memory[baseAddress + i] = program[i];
                }
                const pid = this.nextPID++;
                this.allocatedMemoryBlocks.push({
                    pid,
                    start: baseAddress,
                    end: baseAddress + programSize - 1,
                });
                this.updateFreeMemory(baseAddress, programSize);
                // update which memory blocks are free
                return pid;
            }
            return -1; // if not enough memory
        }
        deallocateMemory(pid) {
            const memoryBlock = this.allocatedMemoryBlocks.find((block) => block.pid === pid);
            if (memoryBlock) {
                this.freeMemoryBlocks.push({
                    start: memoryBlock.start,
                    end: memoryBlock.end,
                });
                this.allocatedMemoryBlocks = this.allocatedMemoryBlocks.filter((block) => block.pid !== pid);
                return true;
            }
            return false;
        }
        findFreeMemoryBlock(programSize) {
            for (const block of this.freeMemoryBlocks) {
                const blockSize = block.end - block.start + 1;
                if (blockSize >= programSize) {
                    return block.start;
                }
            }
            return null;
        }
        updateFreeMemory(baseAddress, programSize) {
            this.freeMemoryBlocks = this.freeMemoryBlocks.map((block) => {
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
            }).filter(block => block !== null);
        }
        retrieveProgram(pid) {
            const memoryBlock = this.allocatedMemoryBlocks.find((block) => block.pid === pid);
            if (memoryBlock) {
                return this.memory.slice(memoryBlock.start, memoryBlock.end + 1);
            }
            return null;
        }
    }
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryManager.js.map