namespace TSOS {
  export class PCB {
    public pid: number;
    public base: number;
    public limit: number;
    public pc: number;
    public ir: number;
    public acc: number;
    public xReg: number;
    public yReg: number;
    public zFlag: number;
    public state: string;
    public priority: number;
    public name: string;
    public quantumRemaining: number;

    constructor(
      pid: number,
      base: number,
      limit: number,
      priority: number = 1,
      name: string = "UnnamedProcess",
      quantumRemaining: number = 6
    ) {
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
    public reset(): void {
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
    public saveContext(cpu: Cpu): void {
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
    public loadContext(cpu: Cpu): void {
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
}
