namespace TSOS {
  export class Dispatcher {
    public static loadProcessState(process: TSOS.PCB): void {
      neOS.CPU.PC = process.pc;
      neOS.CPU.Acc = process.acc;
      neOS.CPU.Xreg = process.xReg;
      neOS.CPU.Yreg = process.yReg;
      neOS.CPU.Zflag = process.zFlag;
      neOS.CPU.instructionRegister = process.ir;
      neOS.CPU.isExecuting = true;
    }

    public static saveCurrentProcessState(): void {
      const currentProcess = neOS.CurrentProcess;
      if (currentProcess) {
        currentProcess.pc = neOS.CPU.PC;
        currentProcess.acc = neOS.CPU.Acc;
        currentProcess.xReg = neOS.CPU.Xreg;
        currentProcess.yReg = neOS.CPU.Yreg;
        currentProcess.zFlag = neOS.CPU.Zflag;
        currentProcess.ir = neOS.CPU.instructionRegister;
      }
    }
    public static contextSwitch(): void {
      if (neOS.CurrentProcess) {
        this.saveCurrentProcessState();
        if (neOS.CurrentProcess.state !== "Terminated")
        Scheduler.readyQueue = Scheduler.readyQueue.filter(
          (process) => process.pid !== neOS.CurrentProcess.pid
        );

        if (neOS.CurrentProcess.state !== "Terminated") {
          neOS.CurrentProcess.state = "Ready";
          Scheduler.addToReadyQueue(neOS.CurrentProcess);
        }
      }
      const nextProcess = Scheduler.getNextProcess();
      if (nextProcess) {
        nextProcess.state = "Running";
        neOS.CurrentProcess = nextProcess;
        this.loadProcessState(nextProcess);
        Scheduler.quantumCounter = 0;
      } else {
        neOS.CPU.isExecuting = false; // No more processes to run
      }
    }
    public static terminateCurrentProcess(): void {
      const currentProcess = neOS.CurrentProcess;
      if (currentProcess) {
        currentProcess.state = "Terminated";

        neOS.MemoryManager.freeProcessMemory(currentProcess.pid);


        TSOS.Control.updatePCBDisplay();
        neOS.MemoryAccessor.displayMemory();

        console.log(`Process ${currentProcess.pid} has terminated.`);

        //remove from ready queue
        Scheduler.readyQueue = Scheduler.readyQueue.filter(
          (process) => process.pid !== currentProcess.pid
        );

        neOS.CurrentProcess = null;
        TSOS.Dispatcher.contextSwitch();
      }
    }

    public static terminateProcessById(pid: number): void {
      const pcb = neOS.ProcessList.find((p) => p.pid === pid);
      if (pcb) {
        pcb.state = "Terminated";
        neOS.MemoryManager.freeProcessMemory(pid);
        TSOS.Control.updatePCBDisplay();
        neOS.MemoryAccessor.displayMemory();

        Scheduler.readyQueue = Scheduler.readyQueue.filter(
          (process) => process.pid !== pid
        );

        if (neOS.CurrentProcess && neOS.CurrentProcess.pid === pid) {
          neOS.CPU.isExecuting = false;
          neOS.CurrentProcess = null;

          TSOS.Dispatcher.contextSwitch();
        }
      } else {
        neOS.StdOut.putText(`Error: No process found with PID ${pid}`);
      }
    }
  }
}
