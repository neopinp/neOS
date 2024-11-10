namespace TSOS {
  export class MemoryManager {
    private memoryAccessor: MemoryAccessor;
    public nextPID: number;

    constructor(memoryAccessor: MemoryAccessor) {
      this.memoryAccessor = memoryAccessor;
      this.nextPID = 0;
    }

    public storeProgram(program: number[]): PCB | null {
      const programSize = program.length;

      // Find a free segment (0x0000, 0x0100, 0x0200)
      const baseAddress = this.findFreeSegment(256);
      if (baseAddress === null) {
        console.error("No available memory segment.");
        return null;
      }

      // Create a PCB for the new process
      const pid = this.nextPID++;
      const segment = this.calculateSegment(baseAddress);
      const pcb = new TSOS.PCB(
        pid,
        baseAddress,
        baseAddress + 255,
        1,
        `program_${pid}`,
        segment
      );
      pcb.state = "Resident";
      // TMRW - WITHOUT THIS LINE BELOW, PROCESSES ARE NOT CORRECTLY ADDED TO MEMORY IN PROPER LOCATION - WHY DOES THE FIRST PROCESS LOAD ANYWAYS IF THE BELOW LINE IS ABSENT  
      // THERE IS A LOT OF USE OF PROCESSLIST - SHOULD I BE USING A DIF METHOD OR READY/RESIDENT INSTEAD
      neOS.ProcessList.push(pcb);

      for (let i = 0; i < programSize; i++) {
        this.memoryAccessor.write(baseAddress + i, program[i], pcb);
      }
      TSOS.Control.updatePCBDisplay();
      neOS.MemoryAccessor.displayMemory();
      return pcb;
    }
    

    private calculateSegment(baseAddress: number): number {
      if (baseAddress === 0x0000) return 1;
      if (baseAddress === 0x0100) return 2;
      if (baseAddress === 0x0200) return 3;
      return -1;
    }

    // Find a free memory block, prefer baseAddress if provided (for $0000)
    private findFreeSegment(programSize: number): number | null {
      const segmentSize = 256;
      const segments = [0x0000, 0x0100, 0x0200];

      for (const segment of segments) {
        const occupied = neOS.ProcessList.some((pcb) => pcb.base === segment);
        if (!occupied && programSize <= segmentSize) {
          return segment;
        }
      }
      return null; // No free segment available
    }

    public freeProcessMemory(pid: number): void {
      const pcb = neOS.ProcessList.find((p) => p.pid === pid);
      if (pcb) {
        for (let i = pcb.base; i <= pcb.limit; i++) {
          this.memoryAccessor.write(i, 0); // Clear memory
        }
        neOS.ProcessList = neOS.ProcessList.filter((p) => p.pid !== pid);
      }
    }
  }
}
