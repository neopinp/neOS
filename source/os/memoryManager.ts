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
      this.memoryAccessor = memoryAccessor; 
      this.nextPID = 0; 
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
            block.start === segmentStart &&
            block.end - block.start + 1 >= programSize
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

    // Store a program in memory and return the new PCB
    public storeProgram(program: number[]): PCB | null {
      const programSize = program.length;

      // Find a free memory block with enough space
      const baseAddress = this.findFreeMemoryBlock(programSize);

      if (baseAddress !== null) {
        for (let i = 0; i < programSize; i++) {
          this.memoryAccessor.write(baseAddress + i, program[i]);
        }

        this.updateFreeMemory(baseAddress, programSize);

        const pid = this.nextPID++;
        const segment = this.calculateSegment(baseAddress);
        const limit = baseAddress + 255;

        const pcb = new TSOS.PCB(
          pid,
          baseAddress,
          limit,
          1, //priority
          `Program_${pid}`,
          segment
        );

        pcb.state = "Resident";

        // Add PCB to the global process list
        neOS.ProcessList.push(pcb);
        return pcb;
      }
      return null; // No memory available
    }

    private calculateSegment(baseAddress: number): number {
      if (baseAddress === 0x0000) return 1;
      if (baseAddress === 0x0100) return 2;
      if (baseAddress === 0x0200) return 3;
      return -1;
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
      const pcb = neOS.ProcessList.find(p => p.pid === pid);
      if (!pcb) {
        console.log(`Error: No process found with PID ${pid}.`);
        return;
      }
    
      const baseAddress = pcb.base;
      const limit = pcb.limit;
    
      for (let i = baseAddress; i <= limit; i++) {
        this.memoryAccessor.write(i, 0);
      }
      // Make free block findable again
      this.freeMemoryBlocks.push({ start: baseAddress, end: limit});
  
      // Remove the process from the ProcessList
      const processIndex = neOS.ProcessList.findIndex(p => p.pid === pid);
      if (processIndex !== -1) {
        neOS.ProcessList.splice(processIndex, 1);
      }
      TSOS.Control.updatePCBDisplay();
      neOS.MemoryAccessor.displayMemory();
    
      console.log(`Memory for process ${pid} has been successfully freed.`);
    }
    

    public resetFreeMemoryBlocks(): void {
      this.freeMemoryBlocks = [
        { start: 0, end: 255 },
        { start: 256, end: 511 },
        { start: 512, end: 767 },
      ];
    }
    
  }
}
