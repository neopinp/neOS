namespace TSOS {
  export class MemoryManager {
    private memorySize: number;
    private memoryAccessor: MemoryAccessor;
    private nextPID: number;
    private allocatedMemoryBlocks: {
      pid: number;
      start: number;
      end: number;
    }[];
    // store allocated memory
    private freeMemoryBlocks: { start: number; end: number }[];

    constructor(memorySize: number, memoryAccessor: MemoryAccessor) {
      this.memorySize = memorySize;
      this.memoryAccessor = memoryAccessor;  // Use memory accessor for all memory operations
      this.nextPID = 0; // start with PID: 0
      this.allocatedMemoryBlocks = []; // track memory allocation
      this.freeMemoryBlocks = [{ start: 0, end: memorySize - 1 }];
      // initally all array
    }

    public storeProgram(program: number[]): number {
      const programSize = program.length;
      const baseAddress = this.findFreeMemoryBlock(programSize);

      if (baseAddress !== null) {
        for (let i = 0; i < programSize; i++) {
          this.memoryAccessor.write(baseAddress + i, program[i]);  // Use memoryAccessor to write
        }

        const pid = this.nextPID++;
        this.allocatedMemoryBlocks.push({
          pid,
          start: baseAddress,
          end: baseAddress + programSize - 1,
        });
        this.updateFreeMemory(baseAddress, programSize);
        return pid;
      }
      return -1; // if not enough memory
    }

    public deallocateMemory(pid: number): boolean {
      const memoryBlock = this.allocatedMemoryBlocks.find(
        (block) => block.pid === pid
      );
      if (memoryBlock) {
        this.freeMemoryBlocks.push({
          start: memoryBlock.start,
          end: memoryBlock.end,
        });

        this.allocatedMemoryBlocks = this.allocatedMemoryBlocks.filter(
          (block) => block.pid !== pid
        );
        return true;
      }
      return false;
    }

    private findFreeMemoryBlock(programSize: number): number | null {
      for (const block of this.freeMemoryBlocks) {
        const blockSize = block.end - block.start + 1;
        if (blockSize >= programSize) {
          return block.start;
        }
      }
      return null;
    }

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
        .filter((block) => block !== null) as { start: number; end: number }[];
    }

    public retrieveProgram(pid: number): number[] | null {
      const memoryBlock = this.allocatedMemoryBlocks.find(
        (block) => block.pid === pid
      );
      if (memoryBlock) {
        const program: number[] = [];
        for (let i = memoryBlock.start; i <= memoryBlock.end; i++) {
          program.push(this.memoryAccessor.read(i));  // Use memoryAccessor to read
        }
        return program;
      }
      return null;
    }
  }
}
