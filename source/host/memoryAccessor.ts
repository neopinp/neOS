namespace TSOS {
  export class MemoryAccessor {
    private memory: Memory;

    constructor(memory: Memory) {
      this.memory = memory;
    }

    public write(
      address: number,
      value: number,
      base: number,
      limit: number
    ): void {
      if (address < base || address > limit) {
        throw new Error(`Memory access violation at address ${address}`);
      }
      //console.log(`Writing value ${value.toString(16)} at address ${address}`);
      this.memory.setByte(address, value);
    }

    public read(address: number, base: number, limit: number): number {
      if (address < base || address > limit) {
        throw new Error(
          `Memory access violation at address ${address}. Outside process boundaries. ${base} ${limit} ${neOS.CurrentProcess.pc}`
        );
      }
      const value = this.memory.getByte(address);
      return value;
    }

    public getMemoryArray(): number[] {
      return this.memory.getMemoryArray();
    }

  }
}