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
    public partition: number;
    public location: string;
    public quantumRemaining: number;

    constructor(
      pid: number,
      base: number,
      limit: number,
      priority: number = 1,
      partition: number,
      location: string = "Memory"
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
      this.partition = partition;
      this.location = location;
      this.quantumRemaining = neOS.Scheduler.defaultQuantum;
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
      // Ensure PC is within valid range before subtracting base
      this.pc = cpu.PC;

      this.ir = cpu.instructionRegister;
      this.acc = cpu.Acc;
      this.xReg = cpu.Xreg;
      this.yReg = cpu.Yreg;
      this.zFlag = cpu.Zflag;
      this.state = "Ready";
      console.log(`--- Saving Context for PID ${this.pid} ---`);
      console.log(
        `Saved PC (relative): ${this.pc}, Base: ${this.base}, Limit: ${this.limit}`
      );
      console.log(
        `Acc: ${this.acc}, X: ${this.xReg}, Y: ${this.yReg}, Z: ${this.zFlag}`
      );
      console.log(
        `State: ${this.state}, Quantum Remaining: ${this.quantumRemaining}`
      );
      console.log(neOS.CurrentProcess);
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
      this.state = "Running";

      // Add logging to debug
      console.log(`--- Loading Context for PID ${this.pid} ---`);
      console.log(
        `Loaded PC (absolute): ${cpu.PC}, Base: ${this.base}, Limit: ${this.limit}`
      );
      console.log(
        `Acc: ${cpu.Acc}, X: ${cpu.Xreg}, Y: ${cpu.Yreg}, Z: ${cpu.Zflag}`
      );
      console.log(
        `State: ${this.state}, Quantum Remaining: ${this.quantumRemaining}`
      );
      console.log(neOS.CurrentProcess);
    }
  }
}
