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
        segment;
        location;
        constructor(pid, base, limit, priority, name = "UnnamedProcess", segment) {
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
            this.name = name;
            this.segment = segment;
            this.location = 'Memory';
        }
    }
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=pcb.js.map