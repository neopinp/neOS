var TSOS;
(function (TSOS) {
    class PCB {
        pid;
        base;
        limit;
        pc;
        ir;
        acc;
        xReg;
        yReg;
        zFlag;
        state;
        priority;
        name;
        quantumRemaining;
        constructor(pid, base, limit, priority = 1, name = "UnnamedProcess", quantumRemaining = 6) {
            this.pid = pid;
            this.base = base;
            this.limit = limit;
            this.pc = 0;
            this.ir = 0;
            this.acc = 0;
            this.xReg = 0;
            this.yReg = 0;
            this.zFlag = 0;
            this.state = "Resident"; // Initialize to Resident when created
            this.priority = priority;
            this.name = name;
            this.quantumRemaining = quantumRemaining;
        }
        /**
         * Reset the PCB to its initial state
         */
        reset() {
            this.pc = 0;
            this.ir = 0;
            this.acc = 0;
            this.xReg = 0;
            this.yReg = 0;
            this.zFlag = 0;
            this.state = "";
            this.quantumRemaining = 6;
            console.log(`Process PID ${this.pid} has been reset.`);
        }
        /**
         * Save the current state of the CPU registers into the PCB
         */
        saveContext(cpu) {
            this.pc = cpu.PC;
            this.ir = cpu.instructionRegister;
            this.acc = cpu.Acc;
            this.xReg = cpu.Xreg;
            this.yReg = cpu.Yreg;
            this.zFlag = cpu.Zflag;
            this.state = "Ready"; // Change state to Ready when saving context
            console.log(`Saved context for PID ${this.pid}. State set to Ready.`);
            TSOS.Control.updatePCBDisplay();
        }
        /**
         * Load the PCB state into the CPU registers
         */
        loadContext(cpu) {
            cpu.PC = this.pc;
            cpu.instructionRegister = this.ir;
            cpu.Acc = this.acc;
            cpu.Xreg = this.xReg;
            cpu.Yreg = this.yReg;
            cpu.Zflag = this.zFlag;
            this.state = "Running"; // Set state to Running when loaded
            console.log(`Loaded context for PID ${this.pid}. State set to Running.`);
            TSOS.Control.updatePCBDisplay();
        }
    }
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=pcb.js.map