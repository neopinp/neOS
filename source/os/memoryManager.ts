namespace TSOS {
  export class MemoryManager {
    private memorySize: number;
    private memory: number[];
    private nextPID: number;
    private allocatedMemoryBlocks: {
      pid: number;
      start: number;
      end: number;
    }[]; // Store allocated memory
    private freeMemoryBlocks: { start: number; end: number }[]; // Track free memory

    constructor(memorySize: number, memoryAccessor: MemoryAccessor) {
      this.memorySize = memorySize;
      this.memory = new Array(memorySize).fill(0); // Initialize memory with zeros
      this.nextPID = 0; // Start with PID: 0
      this.allocatedMemoryBlocks = []; // Track memory allocation
      this.freeMemoryBlocks = [{ start: 0, end: memorySize - 1 }]; // Initially, the whole memory is free
    }

    // Store the program starting at $0000 if possible
    public storeProgram(program: number[]): {pid: number, baseAddress: number} {
      const programSize = program.length;

      // Always try to load at $0000 if it’s the first program
      const baseAddress = this.findFreeMemoryBlock(programSize, 0x0000);

      if (baseAddress !== null) {
        // Load the program into memory starting at baseAddress
        for (let i = 0; i < programSize; i++) {
          this.memory[baseAddress + i] = program[i];
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
        return {pid, baseAddress}; // Return the PID of the new process
      }

      return {pid: -1, baseAddress: -1}; // Return -1 if not enough memory to load the program
    }

    // Find a free memory block, prefer baseAddress if provided (for $0000)
    private findFreeMemoryBlock(programSize: number, baseAddress?: number): number | null {
      // Try to use the provided base address (if available) first
      if (baseAddress !== undefined) {
        const block = this.freeMemoryBlocks.find(
          (block) => block.start === baseAddress && block.end - block.start + 1 >= programSize
        );
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
    private updateFreeMemory(baseAddress: number, programSize: number) {
      this.freeMemoryBlocks = this.freeMemoryBlocks.map((block) => {
        if (block.start === baseAddress) {
          const remainingBlockStart = block.start + programSize;
          if (remainingBlockStart <= block.end) {
            return { start: remainingBlockStart, end: block.end };
          } else {
            return null;
          }
        } else {
          return block;
        }
      }).filter(block => block !== null);
    }

    // Retrieve a loaded program by PID
    public retrieveProgram(pid: number): number[] | null {
      const memoryBlock = this.allocatedMemoryBlocks.find(
        (block) => block.pid === pid
      );
      if (memoryBlock) {
        return this.memory.slice(memoryBlock.start, memoryBlock.end + 1);
      }
      return null;
    }
  }
}
