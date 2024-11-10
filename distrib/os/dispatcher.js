var TSOS;
(function (TSOS) {
    class Dispatcher {
        static loadProcessState(process) {
            neOS.CPU.PC = process.pc;
            neOS.CPU.Acc = process.acc;
            neOS.CPU.Xreg = process.xReg;
            neOS.CPU.Yreg = process.yReg;
            neOS.CPU.Zflag = process.zFlag;
            neOS.CPU.instructionRegister = process.ir;
            neOS.CPU.isExecuting = true;
        }
        static saveCurrentProcessState() {
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
        static contextSwitch() {
            if (neOS.CurrentProcess) {
                this.saveCurrentProcessState();
                if (neOS.CurrentProcess.state !== "Terminated")
                    TSOS.Scheduler.readyQueue = TSOS.Scheduler.readyQueue.filter((process) => process.pid !== neOS.CurrentProcess.pid);
                if (neOS.CurrentProcess.state !== "Terminated") {
                    neOS.CurrentProcess.state = "Ready";
                    TSOS.Scheduler.addToReadyQueue(neOS.CurrentProcess);
                }
            }
            const nextProcess = TSOS.Scheduler.getNextProcess();
            if (nextProcess) {
                nextProcess.state = "Running";
                neOS.CurrentProcess = nextProcess;
                this.loadProcessState(nextProcess);
                TSOS.Scheduler.quantumCounter = 0;
            }
            else {
                neOS.CPU.isExecuting = false; // No more processes to run
            }
        }
        static terminateCurrentProcess() {
            const currentProcess = neOS.CurrentProcess;
            if (currentProcess) {
                currentProcess.state = "Terminated";
                neOS.MemoryManager.freeProcessMemory(currentProcess.pid);
                TSOS.Control.updatePCBDisplay();
                neOS.MemoryAccessor.displayMemory();
                console.log(`Process ${currentProcess.pid} has terminated.`);
                //remove from ready queue
                TSOS.Scheduler.readyQueue = TSOS.Scheduler.readyQueue.filter((process) => process.pid !== currentProcess.pid);
                neOS.CurrentProcess = null;
                TSOS.Dispatcher.contextSwitch();
            }
        }
        static terminateProcessById(pid) {
            const pcb = neOS.ProcessList.find((p) => p.pid === pid);
            if (pcb) {
                pcb.state = "Terminated";
                neOS.MemoryManager.freeProcessMemory(pid);
                TSOS.Control.updatePCBDisplay();
                neOS.MemoryAccessor.displayMemory();
                TSOS.Scheduler.readyQueue = TSOS.Scheduler.readyQueue.filter((process) => process.pid !== pid);
                if (neOS.CurrentProcess && neOS.CurrentProcess.pid === pid) {
                    neOS.CPU.isExecuting = false;
                    neOS.CurrentProcess = null;
                    TSOS.Dispatcher.contextSwitch();
                }
            }
            else {
                neOS.StdOut.putText(`Error: No process found with PID ${pid}`);
            }
        }
    }
    TSOS.Dispatcher = Dispatcher;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=dispatcher.js.map