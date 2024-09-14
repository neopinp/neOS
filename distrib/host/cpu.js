/* ------------
     CPU.ts

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    class Cpu {
        PC;
        Acc;
        Xreg;
        Yreg;
        Zflag;
        isExecuting;
        memory;
        constructor(PC = 0, Acc = 0, Xreg = 0, Yreg = 0, Zflag = 0, isExecuting = false) {
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
            this.memory = new TSOS.Memory(256);
        }
        init() {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        }
        cycle() {
            neOS.Kernel.krnTrace("CPU cycle");
            if (this.isExecuting) {
                const instruction = neOS.MemoryAccessor.read(this.PC);
                this.execute(instruction);
                this.PC += 1;
            }
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
        }
        getAddress() {
            const lowByte = neOS.MemoryAccessor.read(this.PC + 1);
            const highByte = neOS.MemoryAccessor.read(this.PC + 2);
            const address = (highByte << 8) | lowByte; // Combine the two bytes
            this.PC += 2; // Increment PC to skip over the two address bytes
            return address;
        }
        execute(instruction) {
            switch (instruction) {
                case 0xa9: // LDA: Load Accumulator with a constant
                    const value = neOS.MemoryAccessor.read(this.PC + 1);
                    this.Acc = value;
                    this.PC += 1;
                    break;
                case 0xad: // LDA: Load Accumulator from memory
                    const address = this.getAddress();
                    const memoryValue = neOS.MemoryAccessor.read(address);
                    this.Acc = memoryValue; // Load it into the accumulator
                    break;
                case 0x8d: // STA: Store Accumulator in memory
                    const storeAddress = this.getAddress(); // Get the address to store at
                    neOS.MemoryAccessor.write(storeAddress, this.Acc); // Write Acc to memory
                    break;
                case 0x00: // BRK: End of process
                    neOS.StdOut.advanceLine();
                    neOS.StdOut.putText(`Process ${neOS.CurrentProcess.pid} has terminated.`);
                    neOS.StdOut.advanceLine(); // Move to a new line after termination message
                    neOS.CurrentProcess.state = "Terminated";
                    this.isExecuting = false;
                    neOS.OsShell.putPrompt();
                    // No prompt here, the shell should handle it after the process terminates
                    break;
                default:
                    throw new Error(`Unknown opcode: ${instruction.toString(16)}`);
            }
        }
        setPC(address) {
            this.PC = address;
        }
    }
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=cpu.js.map