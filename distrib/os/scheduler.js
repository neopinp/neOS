var TSOS;
(function (TSOS) {
    class Scheduler {
        static residentList = [];
        // state added directly on load (storeprogram method)
        static quantum = 6;
        static quantumCounter = 0;
        static readyQueue = [];
        static isScheduling = true;
        static addtoResidentList(pcb) {
            this.residentList.push(pcb);
            console.log(`Process ${pcb.pid} added to Resident List.`);
        }
        // Ready Queue
        static addToReadyQueue(pcb) {
            pcb.state = "Ready";
            this.readyQueue.push(pcb);
            console.log(`Process ${pcb.pid} added to Ready Queue.`);
        }
        static clearReadyQueue() {
            this.readyQueue = [];
        }
        static removeFromReadyQueue(pid) {
            this.readyQueue = this.readyQueue.filter(pcb => pcb.pid !== pid);
        }
        static startScheduling() {
            const firstProcess = this.getNextProcess();
            if (firstProcess) {
                this.dispatchProcess(firstProcess);
                neOS.StdOut.putText(`Started Round Robin scheduling.`);
            }
            else {
                neOS.StdOut.putText(`No processes found to run.`);
            }
        }
        static getNextProcess() {
            return this.readyQueue.length > 0 ? this.readyQueue.shift() : null;
        }
        static dispatchProcess(pcb) {
            pcb.state = "Running";
            neOS.CurrentProcess = pcb;
            TSOS.Dispatcher.loadProcessState(pcb);
            neOS.CPU.isExecuting = true;
        }
        //quantum
        static incrementQuantumCounter() {
            this.quantumCounter++;
            if (this.quantumCounter >= this.quantum) {
                this.handleQuantumExpiration();
            }
        }
        static handleQuantumExpiration() {
            TSOS.Dispatcher.contextSwitch();
        }
    }
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=scheduler.js.map