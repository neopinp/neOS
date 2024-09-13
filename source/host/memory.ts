namespace TSOS {
  export class Memory {
    public memoryArray: number[];

    constructor(memorySize: number) {
      this.memoryArray = new Array(256).fill(0);  // Memory of 256 bytes, adjust as needed
    }

    public init(): void {
      this.memoryArray.fill(0);  // Reset the memory
    }

    public getByte(address: number): number {
      return this.memoryArray[address];
    }

    public setByte(address: number, value: number): void {
      this.memoryArray[address] = value;
    }
  }
}
