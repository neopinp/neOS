namespace TSOS {
  export class MemoryAccessor {
    private memory: Memory;

    constructor(memory: Memory) {
      this.memory = memory;
    }

    // Read a byte from memory
    public read(address: number): number {
      if (address >= 0 && address < this.memory.memoryArray.length) {
        return this.memory.getByte(address); 
        throw new Error("Memory access violation at address " + address);
      }
    }

    // Write a byte to memory
    public write(address: number, value: number): void {
      if (address >= 0 && address < this.memory.memoryArray.length) {
        this.memory.setByte(address, value);  
      } else {
        throw new Error("Memory access violation at address " + address);
      }
    }

    // Read a block of memory (for retrieving programs)
    public readBlock(startAddress: number, endAddress: number): number[] {
      if (startAddress >= 0 && endAddress < this.memory.memoryArray.length) {
        return this.memory.memoryArray.slice(startAddress, endAddress + 1);
      } else {
        throw new Error(
          "Memory access violation between addresses " + startAddress + " and " + endAddress
        );
      }
    }
  }
}
