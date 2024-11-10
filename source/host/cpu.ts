namespace TSOS {
  export class Cpu {
    public memoryAccessor: MemoryAccessor; // Use the memoryAccessor instead of a direct memory instance
    public instructionRegister: number = 0;
    public base: number = 0;
    public limit: number;

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
    public init(): void {}

    public cycle(): void {
      if (this.isExecuting) {
        const instruction = this.memoryAccessor.read(this.PC);
        this.instructionRegister = instruction;
    
        this.execute(instruction);
        Control.updatePCBDisplay();
        Control.updateCPUDisplay(this);
    
        // Increment the quantum counter
        TSOS.Scheduler.incrementQuantumCounter();
      } else {
        neOS.Kernel.krnTrace("CPU is idle");
      }
    }
    

    public getAddress(): number {
      const lowByte = this.memoryAccessor.read(this.PC + 1);
      const highByte = this.memoryAccessor.read(this.PC + 2);
      const address = (highByte << 8) | lowByte;

      // Adjust address by the base address of the current process
      const baseAddress = neOS.CurrentProcess ? neOS.CurrentProcess.base : 0;
      const effectiveAddress = baseAddress + address;

      // Debugging to print address and effectiveAddress
      console.log(
        `DEBUG: Address = ${address}, Effective Address = ${effectiveAddress}`
      );

      // Check if address is within bounds
      if (
        effectiveAddress < baseAddress ||
        effectiveAddress > baseAddress + 255
      ) {
        console.error(`Memory access out of bounds: ${effectiveAddress}`);
        TSOS.Dispatcher.terminateProcessById(neOS.CurrentProcess.pid);
        return -1;
      }

      return effectiveAddress;
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
          address = this.getAddress();
          this.memoryAccessor.write(address, this.Acc);

          this.PC += 3;
          this.memoryAccessor.displayMemory();
          break;

        case 0x6d: // ADC: Add with Carry
          address = this.getAddress();
          if (address < this.base || address > this.limit) {
            console.error(
              `Memory access violation at address ${address} for process ${neOS.CurrentProcess.pid}`
            );
            TSOS.Dispatcher.terminateProcessById(neOS.CurrentProcess.pid);
            return;
          }
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
          if (address < this.base || address > this.limit) {
            console.error(
              `Memory access violation at address ${address} for process ${neOS.CurrentProcess.pid}`
            );
            TSOS.Dispatcher.terminateProcessById(neOS.CurrentProcess.pid);
            return;
          }
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
          if (address < this.base || address > this.limit) {
            console.error(
              `Memory access violation at address ${address} for process ${neOS.CurrentProcess.pid}`
            );
            TSOS.Dispatcher.terminateProcessById(neOS.CurrentProcess.pid);
            return;
          }
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
            // Output the numeric value in Yreg as a string
            neOS.StdOut.putText(this.Yreg.toString());
          } else if (this.Xreg === 2) {
            let strAddress = this.Yreg + neOS.CurrentProcess.base; // Adjust for base address
            let outputStr = "";
            let currentChar = this.memoryAccessor.read(strAddress);

            // Read characters from memory until a null byte (0x00) is found
            while (currentChar !== 0x00) {
              outputStr += String.fromCharCode(currentChar);
              strAddress++;
              currentChar = this.memoryAccessor.read(strAddress);
            }

            // Output the final string
            neOS.StdOut.putText(outputStr);
          }
          this.PC += 1;
          break;
      }
      if (neOS.CurrentProcess) {
        neOS.CurrentProcess.pc = this.PC;
        neOS.CurrentProcess.acc = this.Acc;
        neOS.CurrentProcess.xReg = this.Xreg;
        neOS.CurrentProcess.yReg = this.Yreg;
        neOS.CurrentProcess.zFlag = this.Zflag;
        neOS.CurrentProcess.ir = this.instructionRegister; // Capture the instruction
      }
      TSOS.Control.updatePCBDisplay();
    }

    public setPC(address: number): void {
      this.PC = address;
    }
  }
}
