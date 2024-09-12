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
            this.memory = new Memory(256);
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
            neOS.Kernel.krnTrace('CPU cycle');
            let opcode = this.memory.readByte(this.PC);
            switch (opcode) {
                case 0xA9:
                    this.executeLDA();
                    break;
                case 0x8D:
                    this.executeSTA();
                    break;
                default:
                    throw new Error(`Unknown opcode: ${opcode.toString(16)}`);
            }
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
        }
        executeLDA() {
            let value = this.memory.readByte(this.PC + 1);
            this.Acc = value;
            this.PC += 2;
        }
        executeSTA() {
            let address = this.memory.readByte(this.PC + 1);
            this.memory.writeByte(address, this.Acc);
            this.PC += 2;
        }
    }
    TSOS.Cpu = Cpu;
    class Memory {
        memory;
        constructor(size) {
            this.memory = new Array(size).fill(0);
        }
        readByte(address) {
            return this.memory[address];
        }
        writeByte(address, value) {
            this.memory[address] = value;
        }
    }
})(TSOS || (TSOS = {}));
//# sourceMappingURL=cpu.js.map