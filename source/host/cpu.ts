namespace TSOS {
  export class Cpu {
    private memoryAccessor: MemoryAccessor; // Use the memoryAccessor instead of a direct memory instance

    constructor(
      public PC: number = 0,
      public Acc: number = 0,
      public Xreg: number = 0,
      public Yreg: number = 0,
      public Zflag: number = 0,
      public isExecuting: boolean = false
    ) {
      console.log(
        "neOS.MemoryAccessor before assignment in CPU:",
        neOS.MemoryAccessor
      );

      // Check if MemoryAccessor is null before assigning
      if (neOS.MemoryAccessor === null) {
        console.error(
          "MemoryAccessor is null in CPU constructor! Aborting initialization."
        );
      } else {
        this.memoryAccessor = neOS.MemoryAccessor;
        console.log("MemoryAccessor in CPU constructor:", this.memoryAccessor); // Debug statement
      }
    }

    public init(): void {
      this.PC = 0;
      this.Acc = 0;
      this.Xreg = 0;
      this.Yreg = 0;
      this.Zflag = 0;
      this.isExecuting = false;
    }

    public cycle(): void {
      // Log the state of the CPU registers

      // Ensure MemoryAccessor is not null before accessing
      if (!this.memoryAccessor) {
        console.error("MemoryAccessor is NULL in CPU cycle! Cannot execute.");
        return; // Stop execution if memoryAccessor is not set
      }

      if (this.isExecuting) {
        // Log that execution is continuing
        // Fetch the next instruction from memory
        const instruction = this.memoryAccessor.read(this.PC); // Use memoryAccessor to read memory


        // Execute the instruction
        this.execute(instruction);
      } else {
        // If CPU is not executing, log it
        neOS.Kernel.krnTrace("CPU is idle, not executing any instruction.");
      }
    }

    // Helper to get the memory address (combine two bytes)
    public getAddress(): number {
      const lowByte = this.memoryAccessor.read(this.PC + 1);
      const highByte = this.memoryAccessor.read(this.PC + 2);
      const address = (highByte << 8) | lowByte; // Combine the two bytes
      return address;
    }

    // Execute the fetched instruction
    public execute(instruction: number): void {


      let address: number;
      let memoryValue: number;
      let value: number;

      switch (instruction) {
        case 0xa9: // LDA: Load Accumulator with a constant
          value = this.memoryAccessor.read(this.PC + 1);
          neOS.Kernel.krnTrace(`LDA: Loading constant ${value} into Acc.`);
          this.Acc = value;
          this.PC += 2;
          break;

        case 0x8d: // STA: Store Accumulator in memory
          address = this.getAddress(); // Get the memory address to store the Accumulator value
          this.memoryAccessor.write(address, this.Acc); // Write the Accumulator value to memory
          this.PC += 3;
          this.memoryAccessor.displayMemory();
          break;

        case 0x6d: // ADC: Add with Carry
          address = this.getAddress();
          memoryValue = this.memoryAccessor.read(address);
          this.Acc += memoryValue;
          this.PC += 3;
          break;

        case 0xa2: // LDX: Load X register with a constant
          value = this.memoryAccessor.read(this.PC + 1);
          this.Xreg = value;
          this.PC += 2;
          break;

        case 0xae: // LDX: Load X register from memory
          address = this.getAddress();
          memoryValue = this.memoryAccessor.read(address);
          this.Xreg = memoryValue;
          this.PC += 3;
          break;

        case 0xa0: // LDY: Load Y register with a constant
          value = this.memoryAccessor.read(this.PC + 1);
          this.Yreg = value;
          this.PC += 2;
          break;

        case 0xac: // LDY: Load Y register from memory
          address = this.getAddress();
          memoryValue = this.memoryAccessor.read(address);
          this.Yreg = memoryValue;
          this.PC += 3;
          break;

        case 0xea: // NOP: No operation
          this.PC += 1;
          break;

        case 0x00: // BRK: End of process
          neOS.StdOut.advanceLine();
          neOS.StdOut.putText(
            `Process ${neOS.CurrentProcess.pid} has terminated.`
          );
          neOS.StdOut.advanceLine(); // Move to a new line after termination message
          neOS.CurrentProcess.state = "Terminated";
          this.isExecuting = false;
          neOS.OsShell.putPrompt();
          break;

        case 0xec: // CPX: Compare a byte in memory to the X register
          address = this.getAddress();
          memoryValue = this.memoryAccessor.read(address);
          this.Zflag = this.Xreg === memoryValue ? 1 : 0; // Set Z flag if equal

          this.PC += 3;
          break;

        case 0xd0: // BNE: Branch if Z flag is not set
          const branchOffset = this.memoryAccessor.read(this.PC + 1);
          console.log(
            `DEBUG: BNE - Current Z flag: ${this.Zflag}, Branch Offset: ${branchOffset}`
          );
          if (this.Zflag === 0) {
            if (branchOffset > 127) {
              this.PC -= 256 - branchOffset; // Handle negative offset
            } else {
              this.PC += branchOffset; // Positive offset
            }
            console.log(`DEBUG: Branch taken, new PC: ${this.PC}`);
          } else {
            console.log(`DEBUG: No branch taken.`);
          }
          this.PC += 2;
          break;

        case 0xee: // INC: Increment the value of a byte in memory
          address = this.getAddress();
          memoryValue = this.memoryAccessor.read(address);
          memoryValue++;
          this.memoryAccessor.write(address, memoryValue);
          this.PC += 3;
          break;

        case 0xff: // SYS: System Call
          if (this.Xreg === 1) {
            neOS.StdOut.putText(this.Yreg.toString());
          } else if (this.Xreg === 2) {
            let strAddress = this.Yreg;
            let outputStr = "";
            let currentChar = this.memoryAccessor.read(strAddress);
            while (currentChar !== 0x00) {
              outputStr += String.fromCharCode(currentChar);
              strAddress++;
              currentChar = this.memoryAccessor.read(strAddress);
            }
            neOS.StdOut.putText(outputStr);
          }
          this.PC += 1;
          break;

        default:
          neOS.Kernel.krnTrace(
            `Unknown instruction: ${instruction.toString(16)}`
          );
          throw new Error(`Unknown opcode: ${instruction.toString(16)}`);
      }

      // Always display memory after any instruction execution
      this.memoryAccessor.displayMemory();

      // Log post-execution state
    }

    public setPC(address: number): void {
      this.PC = address;
    }
  }
}

