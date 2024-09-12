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

namespace TSOS {

    export class Cpu {
        private memory: Memory;

        constructor(public PC: number = 0,
            public Acc: number = 0,
            public Xreg: number = 0,
            public Yreg: number = 0,
            public Zflag: number = 0,
            public isExecuting: boolean = false) {
            this.memory = new Memory(256);
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
        public executeLDA(): void {
            let value = this.memory.readByte(this.PC + 1);
            this.Acc = value;
            this.PC += 2;
        }
        public executeSTA(): void {
            let address = this.memory.readByte(this.PC + 1);
            this.memory.writeByte(address, this.Acc);
            this.PC += 2;
        }
    }
    class Memory {
        private memory: number[];

        constructor(size: number) {
            this.memory = new Array(size).fill(0);
        }
        public readByte(address: number): number {
            return this.memory[address];
        }
        public writeByte(address: number, value: number): void {
            this.memory[address] = value;
        }
    }
}
