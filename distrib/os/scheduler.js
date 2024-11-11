var TSOS;
(function (TSOS) {
    class Scheduler {
        defaultQuantum = 6;
        schedule() {
            if (neOS.readyQueue.isEmpty()) {
                return;
            }
            const nextProcess = neOS.readyQueue.dequeue();
            if (nextProcess) {
                neOS.CurrentProcess = nextProcess;
                neOS.CurrentProcess.state = "Running";
                TSOS.Dispatcher.loadFromPCB(neOS.CurrentProcess);
            }
        }
        contextSwitch() {
            if (neOS.CurrentProcess) {
                // Save the current process state
                TSOS.Dispatcher.saveToPCB(neOS.CurrentProcess);
                // Move the process back to the ready queue if needed
                neOS.readyQueue.enqueue(neOS.CurrentProcess);
                // Schedule the next process
                this.schedule();
            }
        }
    }
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=scheduler.js.map