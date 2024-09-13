var TSOS;
(function (TSOS) {
    class PCB {
        pid;
        base;
        limit;
        pc;
        state;
        priority;
        name; // Add a name field
        constructor(pid, base, limit, priority = 1, name = "UnnamedProcess") {
            this.pid = pid;
            this.base = base;
            this.limit = limit;
            this.pc = 0;
            this.state = "New";
            this.priority = priority;
            this.name = name; // Initialize name
        }
    }
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=pcb.js.map