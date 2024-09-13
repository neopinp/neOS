namespace TSOS {
  export class PCB {
    constructor(
      public pid: number,
      public PC: number = 0,
      public Acc: number = 0,
      public Xreg: number = 0,
      public Yreg: number = 0,
      public Zflag: number = 0,
      public base: number = 0,
      public limit: number = 0,
      public state: string = "New"
    ) {}
    public init(pid: number, base: number, limit: number): void {
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

    public saveState(
      PC: number,
      Acc: number,
      Xreg: number,
      Yreg: number,
      Zflag: number
    ): void {
      this.PC = PC;
      this.Acc = Acc;
      this.Xreg = Xreg;
      this.Yreg = Yreg;
      this.Zflag = Zflag;
    }
    public loadState(): {
      PC: number;
      Acc: number;
      Xreg: number;
      Yreg: number;
      Zflag: number;
    } {
      return {
        PC: this.PC,
        Acc: this.Acc,
        Xreg: this.Xreg,
        Yreg: this.Yreg,
        Zflag: this.Zflag,
      };
    }

    public setState(state: string): void {
      this.state = state;
    }
  }
}
