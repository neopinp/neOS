var TSOS;
(function (TSOS) {
    class Cpu {
        PC;
        Acc;
        Xreg;
        Yreg;
        Zflag;
        isExecuting;
        memoryAccessor; // Use the memoryAccessor instead of a direct memory instance
        instructionRegister = 0;
        constructor(PC = 0, Acc = 0, Xreg = 0, Yreg = 0, Zflag = 0, isExecuting = false) {
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
            console.log("neOS.MemoryAccessor before assignment in CPU:", neOS.MemoryAccessor);
            // Check if MemoryAccessor is null before assigning
            if (neOS.MemoryAccessor === null) {
                console.error("MemoryAccessor is null in CPU constructor! Aborting initialization.");
            }
            else {
                this.memoryAccessor = neOS.MemoryAccessor;
                console.log("MemoryAccessor in CPU constructor:", this.memoryAccessor); // Debug statement
            }
        }
        init() {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.instructionRegister = 0;
            this.isExecuting = false;
        }
        cycle() {
            if (!this.isExecuting) {
                neOS.Kernel.krnTrace("CPU is idle, not executing any instruction.");
                return;
            }
            // Ensure we have a valid current process
            if (!neOS.CurrentProcess) {
                console.error("No current process found. Stopping execution.");
                this.isExecuting = false;
                return;
            }
            const { base, limit } = neOS.CurrentProcess;
            // Ensure base and limit are properly defined
            if (typeof base === "undefined" || typeof limit === "undefined") {
                console.error(`Invalid process boundaries: base=${base}, limit=${limit}`);
                this.isExecuting = false;
                return;
            }
            console.log(`Fetching instruction at PC: ${this.PC}, Base: ${base}, Limit: ${limit}`);
            // Fetch the next instruction
            let instruction;
            const physicalAddress = base + this.PC;
            try {
                console.log(`Attempting to read memory at address: ${physicalAddress}`);
                // Check if the physical address is within bounds
                if (physicalAddress < base || physicalAddress > limit) {
                    console.error(`Address ${physicalAddress} is out of bounds.`);
                    throw new Error(`Memory access violation at address ${physicalAddress}.`);
                }
                // Attempt to read the memory
                instruction = this.memoryAccessor.read(physicalAddress, base, limit);
                // Check if the instruction is undefined
                if (typeof instruction === "undefined") {
                    console.error(`Fetched instruction is undefined at address ${physicalAddress}`);
                    throw new Error(`Undefined instruction at address ${physicalAddress}`);
                }
                console.log(`Fetched instruction: ${instruction.toString(16)} at address: ${physicalAddress}`);
                this.instructionRegister = instruction;
            }
            catch (error) {
                console.error("Memory read error:", error);
                this.isExecuting = false;
                return;
            }
            // Execute the instruction
            try {
                this.execute(instruction);
            }
            catch (error) {
                console.error("Execution error:", error);
                this.isExecuting = false;
                return;
            }
            // Update the current process PCB state
            neOS.CurrentProcess.pc = this.PC;
            neOS.CurrentProcess.acc = this.Acc;
            neOS.CurrentProcess.xReg = this.Xreg;
            neOS.CurrentProcess.yReg = this.Yreg;
            neOS.CurrentProcess.zFlag = this.Zflag;
            neOS.CurrentProcess.ir = this.instructionRegister;
            TSOS.Control.updatePCBDisplay();
            TSOS.Control.updateCPUDisplay(this);
        }
        // Helper to get the memory address (combine two bytes)
        getAddress() {
            const base = neOS.CurrentProcess.base;
            const limit = neOS.CurrentProcess.limit;
            const lowByte = this.memoryAccessor.read(base + this.PC + 1, base, limit);
            const highByte = this.memoryAccessor.read(base + this.PC + 2, base, limit);
            let address = (highByte << 8) | lowByte; // Combine the two bytes
            address += base;
            return address;
        }
        // Execute the fetched instruction
        execute(instruction) {
            let address;
            let memoryValue;
            let value;
            console.log(`Executing instruction: ${instruction.toString(16)}`);
            switch (instruction) {
                case 0xa9: // LDA: Load Accumulator with a constant
                    console.log(`LDA: Loading value from address ${neOS.CurrentProcess.base + this.PC + 1}`);
                    value = this.memoryAccessor.read(neOS.CurrentProcess.base + this.PC + 1, neOS.CurrentProcess.base, neOS.CurrentProcess.limit);
                    console.log(`LDA: Loaded value ${value}`);
                    this.Acc = value;
                    this.PC += 2;
                    break;
                case 0x8d: // STA: Store Accumulator in memory
                    address = this.getAddress(); // Get the memory address to store the Accumulator value
                    console.log(`STA: Storing Acc value ${this.Acc} at address ${address + neOS.CurrentProcess.base}`);
                    this.memoryAccessor.write(address, this.Acc, neOS.CurrentProcess.base, neOS.CurrentProcess.limit); // Write the Accumulator value to memory
                    this.PC += 3;
                    this.memoryAccessor.displayMemory();
                    break;
                case 0x6d: // ADC: Add with Carry
                    address = this.getAddress();
                    memoryValue = this.memoryAccessor.read(address, neOS.CurrentProcess.base, neOS.CurrentProcess.limit);
                    this.Acc += memoryValue;
                    this.PC += 3;
                    break;
                case 0xa2: // LDX: Load X register with a constant
                    console.log(`LDX: Loading value from address ${neOS.CurrentProcess + this.PC + 1}`);
                    value = this.memoryAccessor.read(neOS.CurrentProcess.base + this.PC + 1, neOS.CurrentProcess.base, neOS.CurrentProcess.limit);
                    this.Xreg = value;
                    this.PC += 2;
                    break;
                case 0xae: // LDX: Load X register from memory
                    address = this.getAddress();
                    memoryValue = this.memoryAccessor.read(address, neOS.CurrentProcess.base, neOS.CurrentProcess.limit);
                    this.Xreg = memoryValue;
                    this.PC += 3;
                    break;
                case 0xa0: // LDY: Load Y register with a constant
                    value = this.memoryAccessor.read(neOS.CurrentProcess.base + this.PC + 1, neOS.CurrentProcess.base, neOS.CurrentProcess.limit);
                    this.Yreg = value;
                    this.PC += 2;
                    break;
                case 0xac: // LDY: Load Y register from memory
                    address = this.getAddress();
                    memoryValue = this.memoryAccessor.read(address, neOS.CurrentProcess.base, neOS.CurrentProcess.limit);
                    this.Yreg = memoryValue;
                    this.PC += 3;
                    break;
                case 0xea: // NOP: No operation
                    this.PC += 1;
                    break;
                case 0x00: // BRK: End of process
                    neOS.StdOut.advanceLine();
                    neOS.StdOut.putText(`Process ${neOS.CurrentProcess.pid} has terminated.`);
                    neOS.StdOut.advanceLine(); // Move to a new line after termination message
                    neOS.CurrentProcess.state = "Terminated";
                    this.isExecuting = false;
                    neOS.OsShell.putPrompt();
                    break;
                case 0xec: // CPX: Compare a byte in memory to the X register
                    address = this.getAddress();
                    memoryValue = this.memoryAccessor.read(address, neOS.CurrentProcess.base, neOS.CurrentProcess.limit);
                    this.Zflag = this.Xreg === memoryValue ? 1 : 0; // Set Z flag if equal
                    this.PC += 3;
                    break;
                case 0xd0: // BNE: Branch if Z flag is not set
                    const branchOffset = this.memoryAccessor.read(neOS.CurrentProcess.base + this.PC + 1, neOS.CurrentProcess.base, neOS.CurrentProcess.limit);
                    console.log(`DEBUG: BNE - Current Z flag: ${this.Zflag}, Branch Offset: ${branchOffset}`);
                    if (this.Zflag === 0) {
                        if (branchOffset > 127) {
                            this.PC -= 256 - branchOffset; // Handle negative offset
                        }
                        else {
                            this.PC += branchOffset; // Positive offset
                        }
                        console.log(`DEBUG: Branch taken, new PC: ${this.PC}`);
                    }
                    else {
                        console.log(`DEBUG: No branch taken.`);
                    }
                    this.PC += 2;
                    break;
                case 0xee: // INC: Increment the value of a byte in memory
                    address = this.getAddress();
                    memoryValue = this.memoryAccessor.read(address, neOS.CurrentProcess.base, neOS.CurrentProcess.limit);
                    memoryValue++;
                    this.memoryAccessor.write(address, memoryValue, neOS.CurrentProcess.base, neOS.CurrentProcess.limit);
                    this.PC += 3;
                    break;
                case 0xff: // SYS: System Call
                    if (this.Xreg === 1) {
                        neOS.StdOut.putText(this.Yreg.toString());
                    }
                    else if (this.Xreg === 2) {
                        let strAddress = this.Yreg;
                        let outputStr = "";
                        let currentChar = this.memoryAccessor.read(strAddress + neOS.CurrentProcess.base, neOS.CurrentProcess.base, neOS.CurrentProcess.limit);
                        while (currentChar !== 0x00) {
                            outputStr += String.fromCharCode(currentChar);
                            strAddress++;
                            currentChar = this.memoryAccessor.read(strAddress + neOS.CurrentProcess.base, neOS.CurrentProcess.base, neOS.CurrentProcess.limit);
                        }
                        neOS.StdOut.putText(outputStr);
                    }
                    this.PC += 1;
                    break;
                default:
                    neOS.Kernel.krnTrace(`Unknown instruction: ${instruction.toString(16)}`);
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
        setPC(address) {
            this.PC = address;
        }
    }
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=cpu.js.map