namespace TSOS {
  export class Scheduler {
    public static residentList: TSOS.PCB[] = [];
    // state added directly on load (storeprogram method)
    public static quantum: number = 6;
    public static quantumCounter: number = 0;
    public static readyQueue: TSOS.PCB[] = [];
    public static isScheduling = true;



    public static addtoResidentList(pcb: TSOS.PCB): void {
      this.residentList.push(pcb);
      console.log(`Process ${pcb.pid} added to Resident List.`);
    }
    // Ready Queue

    public static addToReadyQueue(pcb: TSOS.PCB): void {
      pcb.state = "Ready";
      this.readyQueue.push(pcb);
      console.log(`Process ${pcb.pid} added to Ready Queue.`);
    }
    public static clearReadyQueue() {
      this.readyQueue = [];
    }
    

    public static removeFromReadyQueue(pid: number): void {
      this.readyQueue = this.readyQueue.filter(pcb => pcb.pid !== pid);
    }
    

    public static startScheduling(): void {
      const firstProcess = this.getNextProcess();
      if (firstProcess) {
        this.dispatchProcess(firstProcess);
        neOS.StdOut.putText(`Started Round Robin scheduling.`);
      } else {
        neOS.StdOut.putText(`No processes found to run.`);
      }
    }

    public static getNextProcess(): TSOS.PCB | null {
      return this.readyQueue.length > 0 ? this.readyQueue.shift() : null;
    }

    public static dispatchProcess(pcb: TSOS.PCB): void {
      pcb.state = "Running";
      neOS.CurrentProcess = pcb;
      TSOS.Dispatcher.loadProcessState(pcb);
      neOS.CPU.isExecuting = true;
    }

    //quantum
    public static incrementQuantumCounter(): void {
      this.quantumCounter++;
      if (this.quantumCounter >= this.quantum) {
        this.handleQuantumExpiration();
      }
    }
    public static handleQuantumExpiration(): void {
      TSOS.Dispatcher.contextSwitch();
      
    }
  }
}
