namespace TSOS {
  export class Scheduler {
    public defaultQuantum: number = 6;

    public schedule(): void {
      if (neOS.readyQueue.isEmpty()) {
        return;
      }

      const nextProcess = neOS.readyQueue.dequeue();
      if (nextProcess) {
        neOS.CurrentProcess = nextProcess;
        neOS.CurrentProcess.state = "Running";
        Dispatcher.loadFromPCB(neOS.CurrentProcess);
      }
    }

    public contextSwitch(): void {
      if (neOS.CurrentProcess) {
        // Save the current process state
        Dispatcher.saveToPCB(neOS.CurrentProcess);

        // Move the process back to the ready queue if needed
        neOS.readyQueue.enqueue(neOS.CurrentProcess);

        // Schedule the next process
        this.schedule();
      }
    }
  }
}
