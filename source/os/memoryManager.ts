namespace TSOS {
  export class MemoryManager {
    private memorySize: number;
    private memoryAccessor: MemoryAccessor;
    public nextPID: number;
    public allocatedMemoryBlocks: {
      pid: number;
      start: number;
      end: number;
    }[]; // Store allocated memory
    public freeMemoryBlocks: { start: number; end: number }[]; // Track free memory

    constructor(memorySize: number, memoryAccessor: MemoryAccessor) {
      this.memorySize = memorySize;
      this.memoryAccessor = memoryAccessor; // Use MemoryAccessor to access memory
      this.nextPID = 0; // Start with PID: 0
      this.allocatedMemoryBlocks = []; // Track memory allocation
      this.freeMemoryBlocks = [
        { start: 0, end: 255 },
        { start: 256, end: 511 },
        { start: 512, end: 768 },
      ];
    }

    // Find a free memory block, prefer baseAddress if provided (for $0000)
    private findFreeMemoryBlock(programSize: number): number | null {
      const fixedSegments = [0x0000, 0x0100, 0x0200];
      for (const segmentStart of fixedSegments) {
        const block = this.freeMemoryBlocks.find(
          (block) => 
            block.start === segmentStart && block.end - block.start + 1 >= programSize
        );
        if (block) {
          return segmentStart;
        }
      }
      return null;
    }
    
    

    // Update the free memory block list after allocating memory
    private updateFreeMemory(baseAddress: number, programSize: number) {
      this.freeMemoryBlocks = this.freeMemoryBlocks
        .map((block) => {
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
        })
        .filter((block) => block !== null);
    }
    

    // Store a program in memory and return PID and base address
    public storeProgram(program: number[]): { pid: number; baseAddress: number } {
      const programSize = program.length;
    
      // Find a free memory block with enough space
      const baseAddress = this.findFreeMemoryBlock(programSize);
    
      if (baseAddress !== null) {
        // Write the program into memory
        for (let i = 0; i < programSize; i++) {
          this.memoryAccessor.write(baseAddress + i, program[i]);
        }
    
        // Mark this memory block as allocated
        this.updateFreeMemory(baseAddress, programSize);
    
        // Create a new process with a unique PID
        const pid = this.nextPID++;
        this.allocatedMemoryBlocks.push({
          pid,
          start: baseAddress,
          end: baseAddress + programSize - 1,
        });
    
        return { pid, baseAddress };
      }
    
      return { pid: -1, baseAddress: -1 };
    }
    
    
    

    // Retrieve a loaded program by PID
    public retrieveProgram(pid: number): number[] | null {
      const memoryBlock = this.allocatedMemoryBlocks.find(
        (block) => block.pid === pid
      );
      if (memoryBlock) {
        const blockSize = memoryBlock.end - memoryBlock.start + 1;
        if (blockSize === 256) {
          return this.memoryAccessor.readBlock(
            memoryBlock.start,
            memoryBlock.end
          );
        }
      }
      return null;
    }

    public freeProcessMemory(pid: number): void {
      const memoryBlockIndex = this.allocatedMemoryBlocks.findIndex(
        (block) => block.pid === pid
      );

      if (memoryBlockIndex !== -1) {
        const memoryBlock = this.allocatedMemoryBlocks[memoryBlockIndex];

        // Add the freed block back to freeMemoryBlocks if not already present
        const isAlreadyFree = this.freeMemoryBlocks.some(
          (block) => block.start === memoryBlock.start
        );

        if (!isAlreadyFree) {
          this.freeMemoryBlocks.push({
            start: memoryBlock.start,
            end: memoryBlock.end,
          });
        }

        // Remove the block from allocatedMemoryBlocks
        this.allocatedMemoryBlocks.splice(memoryBlockIndex, 1);
      }
    }
  }
}
