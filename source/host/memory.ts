namespace TSOS {
  export class Memory {
    public memoryArray: number[];

    constructor(memorySize: number = 256) {  // Allow dynamic memory size, defaulting to 256 bytes
      this.memoryArray = new Array(memorySize).fill(0);
    }

    public init(): void {
      this.memoryArray.fill(0);  // Reset the memory
    }

    public getByte(address: number): number {
      const value = this.memoryArray[address];
      neOS.Kernel.krnTrace(`Reading memory at address ${address}: ${value}`); 
      return value;
    }

    public setByte(address: number, value: number): void {
      this.memoryArray[address] = value;
      neOS.Kernel.krnTrace(`Writing value ${value} to memory at address ${address}`);
    }

    public getMemoryArray(): number[] {
      return this.memoryArray;
    }
  }
}
