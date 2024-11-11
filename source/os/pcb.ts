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
      this.state = "Resident"; 
      this.priority = priority; 
      this.name = name; // Set process name
      this.quantumRemaining = quantumRemaining;
    }

    // Add a method to reset the PCB (useful for when the process is reset)
    public reset(): void {
      this.pc = 0;
      this.ir = 0;
      this.acc = 0;
      this.xReg = 0;
      this.yReg = 0;
      this.zFlag = 0;
      this.state = "Ready";
      this.quantumRemaining = 6; 
    }
  }
}
