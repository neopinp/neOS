namespace TSOS {
  export class Memory {
    public memoryArray: number[];

    constructor(memorySize: number = 768) {  // Allow dynamic memory size, defaulting to 256 bytes
      this.memoryArray = new Array(memorySize).fill(0);
    }

    public init(): void {
      this.memoryArray.fill(0);  // Reset the memory
    }

    public getByte(address: number): number {
      const value = this.memoryArray[address];
      return value;
    }

    public setByte(address: number, value: number): void {
      this.memoryArray[address] = value;
    }

    public getMemoryArray(): number[] {
      return this.memoryArray;
    }
  }
}
