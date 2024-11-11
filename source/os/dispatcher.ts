namespace TSOS {
  export class Dispatcher {
    /**
     * Load the state of a process from its PCB into the CPU.
     */
    public static loadFromPCB(pcb: PCB): void {
      neOS.CPU.PC = pcb.pc;
      neOS.CPU.Acc = pcb.acc;
      neOS.CPU.Xreg = pcb.xReg;
      neOS.CPU.Yreg = pcb.yReg;
      neOS.CPU.Zflag = pcb.zFlag;
      neOS.CPU.isExecuting = true; // Ensure the CPU starts executing
    }

    /**
     * Save the current CPU state back into the PCB.
     */
    public static saveToPCB(pcb: PCB): void {
      pcb.pc = neOS.CPU.PC;
      pcb.acc = neOS.CPU.Acc;
      pcb.xReg = neOS.CPU.Xreg;
      pcb.yReg = neOS.CPU.Yreg;
      pcb.zFlag = neOS.CPU.Zflag;
    }
  }
}
