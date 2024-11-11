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
        partition;
        location;
        quantumRemaining;
        constructor(pid, base, limit, priority = 1, partition, quantumRemaining = 6, location = 'Memory') {
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
            this.partition = partition;
            this.location = location;
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
            console.log(`Context saved for PID ${this.pid}:`);
            console.log(`  PC (relative): ${this.pc}`);
            console.log(`  Acc: ${this.acc}, X: ${this.xReg}, Y: ${this.yReg}, Z: ${this.zFlag}`);
            console.log(`  State: ${this.state}, Base: ${this.base}, Limit: ${this.limit}`);
            console.log(`  Quantum Remaining: ${this.quantumRemaining}`);
            TSOS.Control.updatePCBDisplay();
        }
        /**
         * Load the PCB state into the CPU registers
         */
        loadContext(cpu) {
            cpu.PC = this.pc + this.base;
            cpu.instructionRegister = this.ir;
            cpu.Acc = this.acc;
            cpu.Xreg = this.xReg;
            cpu.Yreg = this.yReg;
            cpu.Zflag = this.zFlag;
            this.state = "Running"; // Set state to Running when loaded
            console.log(`Context loaded for PID ${this.pid}:`);
            console.log(`  PC (absolute): ${cpu.PC}`);
            console.log(`  Acc: ${cpu.Acc}, X: ${cpu.Xreg}, Y: ${cpu.Yreg}, Z: ${cpu.Zflag}`);
            console.log(`  State: ${this.state}, Base: ${this.base}, Limit: ${this.limit}`);
            console.log(`  Quantum Remaining: ${this.quantumRemaining}`);
            TSOS.Control.updatePCBDisplay();
        }
    }
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=pcb.js.map