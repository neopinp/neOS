var TSOS;
(function (TSOS) {
    class Scheduler {
        defaultQuantum = 6;
        schedule() {
            if (neOS.readyQueue.isEmpty()) {
                console.log("No processes in the ready queue.");
                neOS.CPU.isExecuting = false;
                return;
            }
        }
        scheduleNextProcess(saveCurrentProcess = true) {
            // If the ready queue is empty, there's nothing to schedule
            if (neOS.readyQueue.isEmpty()) {
                console.log("No processes in the ready queue.");
                neOS.CurrentProcess = null;
                neOS.CPU.isExecuting = false;
                TSOS.Control.updatePCBDisplay();
                return;
            }
            // Preempt the current process if needed
            if (neOS.CurrentProcess && saveCurrentProcess) {
                if (neOS.CurrentProcess.state !== "Terminated") {
                    console.log(`Preempting process PID: ${neOS.CurrentProcess.pid}`);
                    neOS.CurrentProcess.saveContext(neOS.CPU);
                    neOS.readyQueue.enqueue(neOS.CurrentProcess);
                    console.log(`Re-enqueued process PID: ${neOS.CurrentProcess.pid}`);
                }
            }
            // Fetch the next process from the ready queue
            const nextProcess = neOS.readyQueue.dequeue();
            if (nextProcess) {
                console.log(`Dequeued process PID: ${nextProcess.pid}`);
                neOS.CurrentProcess = nextProcess;
                neOS.Dispatcher.dispatch(neOS.CurrentProcess);
                // Reset the quantum for the newly scheduled process
                neOS.CurrentProcess.quantumRemaining = this.defaultQuantum;
                console.log(`Switched to process PID: ${neOS.CurrentProcess.pid} with quantum set to ${this.defaultQuantum}`);
                neOS.CPU.isExecuting = true;
            }
            else {
                console.log("No process found in the ready queue to schedule.");
                neOS.CPU.isExecuting = false;
            }
        }
        contextSwitch() {
            if (neOS.CurrentProcess && neOS.CurrentProcess.state !== "Terminated") {
                // Save context only if not terminated
                console.log(`Saving context for PID ${neOS.CurrentProcess.pid}`);
                neOS.CurrentProcess.saveContext(neOS.CPU);
                neOS.readyQueue.enqueue(neOS.CurrentProcess);
            }
            // Schedule the next process
            this.scheduleNextProcess(false);
        }
    }
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=scheduler.js.map