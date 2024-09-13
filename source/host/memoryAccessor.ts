namespace TSOS {
  export class MemoryAccessor {
    private memory: Memory;

    constructor(memory: Memory) {
      this.memory = memory;
    }

    public read(address: number): number {
      if (address >= 0 && address < neOS.Memory.memoryArray.length) {
        return neOS.Memory.getByte(address);
      } else {
        throw new Error("Memory access violation at address " + address);
      }
    }

    public write(address: number, value: number): void {
      if (address >= 0 && address < neOS.Memory.memoryArray.length) {
        neOS.Memory.setByte(address, value);
      } else {
        throw new Error("Memory access violation at address " + address);
      }
    }
  }
}
