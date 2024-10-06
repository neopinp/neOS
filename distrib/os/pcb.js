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
        constructor(pid, base, limit, priority = 1, name = "UnnamedProcess") {
            this.pid = pid;
            this.base = base;
            this.limit = limit;
            this.pc = 0;
            this.ir = 0;
            this.acc = 0;
            this.xReg = 0;
            this.yReg = 0;
            this.zFlag = 0;
            this.state = "Ready";
            this.priority = priority;
            this.name = name; // Set process name
        }
        // Add a method to reset the PCB (useful for when the process is reset)
        reset() {
            this.pc = 0;
            this.ir = 0;
            this.acc = 0;
            this.xReg = 0;
            this.yReg = 0;
            this.zFlag = 0;
            this.state = "Ready";
        }
    }
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=pcb.js.map