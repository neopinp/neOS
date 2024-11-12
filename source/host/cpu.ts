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

    public init(): void {
      this.PC = 0;
      this.Acc = 0;
      this.Xreg = 0;
      this.Yreg = 0;
      this.Zflag = 0;
      this.instructionRegister = 0;
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
        this.instructionRegister = instruction;

        // Execute the instruction
        this.execute(instruction);
        TSOS.Control.updatePCBDisplay();
        TSOS.Control.updateCPUDisplay(this); 

      } else {
        // If CPU is not executing, log it
        neOS.Kernel.krnTrace("CPU is idle, not executing any instruction.");
      }
    }

    public getAddress(): number {
      const lowByte = this.memoryAccessor.read(this.PC + 1);
      const highByte = this.memoryAccessor.read(this.PC + 2);
      const address = (highByte << 8) | lowByte; // Combine the two bytes
      return address;
    }

    // Execute the fetched instruction
    // increment quantum counter
    public execute(instruction: number): void {
      let address: number;
      let memoryValue: number;
      let value: number;

      console.log(`Executing instruction: ${instruction.toString(16)}`);

      switch (instruction) {
        case 0xa9: // LDA: Load Accumulator with a constant
          value = this.memoryAccessor.read(
            neOS.CurrentProcess.base + this.PC + 1, // do I have to make changes to how I save the context as well
            neOS.CurrentProcess.base,
            neOS.CurrentProcess.limit
          );
          console.log(`LDA: Loaded value ${value} into Accumulator`);
          this.Acc = value;
          this.PC += 2;
          break;

        case 0xad: // LDA Absolute
          address = this.getAddress();
          this.Acc = this.memoryAccessor.read(
            address,
            neOS.CurrentProcess.base,
            neOS.CurrentProcess.limit
          );
          console.log(
            `LDA Absolute: Loaded value ${this.Acc} from address ${address}`
          );
          this.PC += 3;
          break;

        case 0x8d: // STA: Store Accumulator in memory
          address = this.getAddress(); // Get the memory address to store the Accumulator value
          this.memoryAccessor.write(address, this.Acc); // Write the Accumulator value to memory
          this.PC += 3;
          break;

        case 0x6d: // ADC: Add with Carry
          address = this.getAddress();
          memoryValue = this.memoryAccessor.read(address);
          this.Acc += memoryValue;
          console.log(
            `ADC: Added value ${memoryValue} to Accumulator, new Acc = ${this.Acc}`
          );
          this.PC += 3;
          break;

        case 0xa2: // LDX: Load X Register with a constant
          value = this.memoryAccessor.read(
            neOS.CurrentProcess.base + this.PC + 1,
            neOS.CurrentProcess.base,
            neOS.CurrentProcess.limit
          );
          console.log(`LDX: Loaded value ${value} into X register`);
          this.Xreg = value;
          this.PC += 2;
          break;

        case 0xae: // LDX Absolute
          address = this.getAddress();
          memoryValue = this.memoryAccessor.read(address);
          this.Xreg = memoryValue;
          this.PC += 3;
          break;

        case 0xa0: // LDY: Load Y Register with a constant
          value = this.memoryAccessor.read(
            neOS.CurrentProcess.base + this.PC + 1,
            neOS.CurrentProcess.base,
            neOS.CurrentProcess.limit
          );
          console.log(`LDY: Loaded value ${value} into Y register`);
          this.Yreg = value;
          this.PC += 2;
          break;

        case 0xac: // LDY Absolute
          address = this.getAddress();
          memoryValue = this.memoryAccessor.read(address);
          this.Yreg = memoryValue;
          this.PC += 3;
          break;
        case 0xea: // NOP: No operation
          this.PC += 1;
          break;

        case 0xec: // CPX: Compare memory to X register
          address = this.getAddress();
          memoryValue = this.memoryAccessor.read(address);
          this.Zflag = this.Xreg === memoryValue ? 1 : 0; // Set Z flag if equal

          this.PC += 3;
          break;

        case 0xd0: // BNE: Branch if Not Equal
          const branchOffset = this.memoryAccessor.read(
            neOS.CurrentProcess.base + this.PC + 1,
            neOS.CurrentProcess.base,
            neOS.CurrentProcess.limit
          );
          console.log(
            `BNE: Branch Offset is ${branchOffset}, Zflag is ${this.Zflag}`
          );
          if (this.Zflag === 0) {
            this.PC += branchOffset > 127 ? branchOffset - 256 : branchOffset;
            console.log(`BNE: Branch taken. New PC: ${this.PC}`);
          }
          this.PC += 2;
          break;

        case 0xee: // INC: Increment value in memory
          address = this.getAddress();
          memoryValue = this.memoryAccessor.read(
            address,
            neOS.CurrentProcess.base,
            neOS.CurrentProcess.limit
          );
          memoryValue++;
          this.memoryAccessor.write(
            address,
            memoryValue,
            neOS.CurrentProcess.base,
            neOS.CurrentProcess.limit
          );
          console.log(
            `INC: Incremented value at address ${address} to ${memoryValue}`
          );
          this.PC += 3;
          break;

        case 0x00: // BRK: End of process
          if (neOS.CurrentProcess) {
            console.log(`BRK: Process ${neOS.CurrentProcess.pid} terminating`);
            neOS.CurrentProcess.state = "Terminated";

            neOS.readyQueue.q = neOS.readyQueue.q.filter(
              (process: any) => process.pid !== neOS.CurrentProcess.pid
            );

            // Check if there are remaining processes in the queue
            if (!neOS.readyQueue.isEmpty()) {
              console.log("Scheduling the next process...");
              neOS.Scheduler.scheduleNextProcess(false); // Skip saving context since it's terminated
            } else {
              console.log("All processes have terminated.");
              neOS.CPU.isExecuting = false;
              neOS.OsShell.putPrompt();
            }
          }
          return;

        // Schedule the next process if there are remaining process

        case 0xff: // SYS: System Call
          if (this.Xreg === 1) {
            // Output the numeric value in Yreg as a string
            neOS.StdOut.putText(this.Yreg.toString());
          } else if (this.Xreg === 2) {
            let strAddress = this.Yreg + neOS.CurrentProcess.base; // Adjust for base address
            let outputStr = "";
            let currentChar = this.memoryAccessor.read(strAddress);
            while (currentChar !== 0x00) {
              outputStr += String.fromCharCode(currentChar);
              strAddress++;
              currentChar = this.memoryAccessor.read(
                strAddress + neOS.CurrentProcess.base,
                neOS.CurrentProcess.base,
                neOS.CurrentProcess.limit
              );
            }

            // Output the final string
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
      if (neOS.CurrentProcess) {
        neOS.CurrentProcess.pc = this.PC;
        neOS.CurrentProcess.acc = this.Acc;
        neOS.CurrentProcess.xReg = this.Xreg;
        neOS.CurrentProcess.yReg = this.Yreg;
        neOS.CurrentProcess.zFlag = this.Zflag;
        neOS.CurrentProcess.ir = this.instructionRegister; // Capture the instruction
      }
      this.memoryAccessor.displayMemory();
      TSOS.Control.updatePCBDisplay();
    }

    public setPC(address: number): void {
      this.PC = address;
    }
  }
}
