namespace TSOS {
  export class Cpu {
    public memoryAccessor: MemoryAccessor; // Use the memoryAccessor instead of a direct memory instance
    public instructionRegister: number = 0;

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
      if (!this.isExecuting) {
        console.log("CPU is idle, not executing any instruction.");
        return;
      }

      // Ensure we have a valid current process
      if (!neOS.CurrentProcess) {
        console.error("No current process found. Stopping execution.");
        this.isExecuting = false;
        return;
      }

      console.log(`\n=== CPU Cycle Start ===`);
      console.log(`Running process PID: ${neOS.CurrentProcess.pid}`);
      console.log(`  Current PC: ${this.PC}`);
      console.log(
        `  Quantum Remaining: ${neOS.CurrentProcess.quantumRemaining}`
      );

      const { base, limit } = neOS.CurrentProcess;
      let instruction: number;
      const physicalAddress = base + this.PC;

      // Fetch the next instruction
      try {
        instruction = this.memoryAccessor.read(physicalAddress, base, limit);
        console.log(
          `Fetched instruction: ${instruction.toString(
            16
          )} at address: ${physicalAddress}`
        );
        this.instructionRegister = instruction;
      } catch (error) {
        console.error("Memory read error:", error);
        neOS.CurrentProcess.state = "Terminated";
        neOS.Scheduler.scheduleNextProcess(false);
        return;
      }

      // Execute the fetched instruction
      try {
        this.execute(instruction);
      } catch (error) {
        console.error("Execution error:", error);
        neOS.CurrentProcess.state = "Terminated";
        neOS.Scheduler.scheduleNextProcess(false);
        return;
      }

      // Check if the process terminated during execution
      if (neOS.CurrentProcess.state === "Terminated") {
        console.log(`Process PID ${neOS.CurrentProcess.pid} has terminated.`);
        neOS.Scheduler.scheduleNextProcess(false);
        return;
      }

      // Decrease the quantum and check if it has expired
      neOS.CurrentProcess.quantumRemaining--;
      console.log(
        `Quantum remaining for PID ${neOS.CurrentProcess.pid}: ${neOS.CurrentProcess.quantumRemaining}`
      );

      // Perform a context switch if the quantum has expired
      if (neOS.CurrentProcess.quantumRemaining <= 0) {
        console.log(`Quantum expired for PID ${neOS.CurrentProcess.pid}`);

        // Save context and requeue the current process if not terminated
        if (neOS.CurrentProcess.state !== "Terminated") {
          console.log(`Re-enqueuing process PID: ${neOS.CurrentProcess.pid}`);
          neOS.CurrentProcess.saveContext(this);
          neOS.readyQueue.enqueue(neOS.CurrentProcess);
        }
        neOS.Scheduler.scheduleNextProcess(false);
        return;
      }

      // Update PCB and CPU displays after execution
      TSOS.Control.updatePCBDisplay();
      TSOS.Control.updateCPUDisplay(this);
    }

    // Helper to get the memory address (combine two bytes)
    public getAddress(): number {
      const base = neOS.CurrentProcess.base;
      const limit = neOS.CurrentProcess.limit;
      const lowByte = this.memoryAccessor.read(base + this.PC + 1, base, limit);
      const highByte = this.memoryAccessor.read(
        base + this.PC + 2,
        base,
        limit
      );

      let address = (highByte << 8) | lowByte; // Combine the two bytes

      address += base;
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
          address = this.getAddress();
          console.log(
            `STA: Storing Acc value ${this.Acc} at address ${address}`
          );
          this.memoryAccessor.write(
            address,
            this.Acc,
            neOS.CurrentProcess.base,
            neOS.CurrentProcess.limit
          );
          this.PC += 3;
          break;

        case 0x6d: // ADC: Add with Carry
          address = this.getAddress();
          memoryValue = this.memoryAccessor.read(
            address,
            neOS.CurrentProcess.base,
            neOS.CurrentProcess.limit
          );
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
          this.Xreg = this.memoryAccessor.read(
            address,
            neOS.CurrentProcess.base,
            neOS.CurrentProcess.limit
          );
          console.log(
            `LDX Absolute: Loaded value ${this.Xreg} from address ${address}`
          );
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
          this.Yreg = this.memoryAccessor.read(
            address,
            neOS.CurrentProcess.base,
            neOS.CurrentProcess.limit
          );
          console.log(
            `LDY Absolute: Loaded value ${this.Yreg} from address ${address}`
          );
          this.PC += 3;
          break;
        case 0xea: // NOP: No operation
          this.PC += 1;
          break;

        case 0xec: // CPX: Compare memory to X register
          address = this.getAddress();
          memoryValue = this.memoryAccessor.read(
            address,
            neOS.CurrentProcess.base,
            neOS.CurrentProcess.limit
          );
          this.Zflag = this.Xreg === memoryValue ? 1 : 0;
          console.log(
            `CPX: Compared X register with value ${memoryValue}, Zflag = ${this.Zflag}`
          );
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
            neOS.StdOut.putText(this.Yreg.toString());
          } else if (this.Xreg === 2) {
            let strAddress = this.Yreg;
            let outputStr = "";
            let currentChar = this.memoryAccessor.read(
              strAddress + neOS.CurrentProcess.base,
              neOS.CurrentProcess.base,
              neOS.CurrentProcess.limit
            );
            while (currentChar !== 0x00) {
              outputStr += String.fromCharCode(currentChar);
              strAddress++;
              currentChar = this.memoryAccessor.read(
                strAddress + neOS.CurrentProcess.base,
                neOS.CurrentProcess.base,
                neOS.CurrentProcess.limit
              );
            }
            neOS.StdOut.putText(outputStr);
          }
          this.PC += 1;
          break;

        default:
          console.error(`Unknown opcode: ${instruction.toString(16)}`);
          throw new Error(`Unknown opcode: ${instruction.toString(16)}`);
      }
    }
  }
}
