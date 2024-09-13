var TSOS;
(function (TSOS) {
    class PCB {
        pid;
        PC;
        Acc;
        Xreg;
        Yreg;
        Zflag;
        base;
        limit;
        state;
        constructor(pid, PC = 0, Acc = 0, Xreg = 0, Yreg = 0, Zflag = 0, base = 0, limit = 0, state = "New") {
            this.pid = pid;
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.base = base;
            this.limit = limit;
            this.state = state;
        }
        init(pid, base, limit) {
            this.pid = pid;
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.base = base;
            this.limit = limit;
            this.state = "New";
        }
        saveState(PC, Acc, Xreg, Yreg, Zflag) {
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
        }
        loadState() {
            return {
                PC: this.PC,
                Acc: this.Acc,
                Xreg: this.Xreg,
                Yreg: this.Yreg,
                Zflag: this.Zflag,
            };
        }
        setState(state) {
            this.state = state;
        }
    }
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=pcb.js.map