var TSOS;
(function (TSOS) {
    class Dispatcher {
        /**
         * Load the state of a process from its PCB into the CPU.
         */
        static loadFromPCB(pcb) {
            neOS.CPU.PC = pcb.pc;
            neOS.CPU.Acc = pcb.acc;
            neOS.CPU.Xreg = pcb.xReg;
            neOS.CPU.Yreg = pcb.yReg;
            neOS.CPU.Zflag = pcb.zFlag;
            neOS.CPU.isExecuting = true; // Ensure the CPU starts executing
        }
        /**
         * Save the current CPU state back into the PCB.
         */
        static saveToPCB(pcb) {
            pcb.pc = neOS.CPU.PC;
            pcb.acc = neOS.CPU.Acc;
            pcb.xReg = neOS.CPU.Xreg;
            pcb.yReg = neOS.CPU.Yreg;
            pcb.zFlag = neOS.CPU.Zflag;
        }
    }
    TSOS.Dispatcher = Dispatcher;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=dispatcher.js.map