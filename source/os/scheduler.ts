namespace TSOS {
  export class Scheduler {
    public defaultQuantum: number = 6;

    public schedule(): void {
      if (neOS.readyQueue.isEmpty()) {
        console.log("No processes in the ready queue.");
        neOS.CPU.isExecuting = false;
        return;
      }
    }

    public scheduleNextProcess(saveCurrentProcess: boolean = true): void {
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

      // Peek at the next process without dequeuing
      const nextProcess = neOS.readyQueue.peek();
      if (!nextProcess) {
        console.error("No next process found in the ready queue.");
        return;
      }

      // If the process is on the disk, roll it in
      if (nextProcess.location === "Disk") {
        console.log(`Next process PID ${nextProcess.pid} is on the disk.`);

        // Check if memory is full and roll out a victim if necessary
        if (neOS.MemoryManager.isMemoryFull()) {
          console.log(
            "Memory is full. Selecting a victim process to roll out."
          );
          const victimProcess = neOS.MemoryManager.selectVictimProcess();
          if (victimProcess) {
            this.rollOut(victimProcess);
          } else {
            console.error("Failed to find a victim process to roll out.");
            return; // Can't proceed without freeing memory
          }
        }

        // Roll in the next process
        this.rollIn(nextProcess.pid);
      }

      // Dequeue the next process (now guaranteed to be in memory)
      const processToExecute = neOS.readyQueue.dequeue();
      if (processToExecute) {
        console.log(`Dequeued process PID: ${processToExecute.pid}`);
        neOS.CurrentProcess = processToExecute;
        neOS.Dispatcher.dispatch(neOS.CurrentProcess);

        // Reset the quantum for the newly scheduled process
        neOS.CurrentProcess.quantumRemaining = this.defaultQuantum;
        console.log(
          `Switched to process PID: ${neOS.CurrentProcess.pid} with quantum set to ${this.defaultQuantum}`
        );
        neOS.CPU.isExecuting = true;
      } else {
        console.log("No process found in the ready queue to schedule.");
        neOS.CPU.isExecuting = false;
      }
    }

    // ROLL IN AND ROLL OUT FUNCTIONS FROM DISK

    public rollOut(victimProcess: PCB): void {
      console.log(`Rolling out process PID: ${victimProcess.pid}`);

      // Save the process context to the PCB
      victimProcess.saveContext(neOS.CPU);

      // Serialize and save the process state to disk
      const processState = JSON.stringify(victimProcess);
      const programID = neOS.DiskDriver.allocateBlocksForProgram([
        processState,
      ]);

      if (programID !== -1) {
        // Update the process location to "Disk"
        victimProcess.location = "Disk";

        // Free the memory partition used by this process
        neOS.MemoryManager.freePartition(victimProcess.base);

        console.log(
          `Process PID: ${victimProcess.pid} rolled out to disk with Program ID: ${programID}`
        );

        // Clear the process data from memory
        for (let i = victimProcess.base; i <= victimProcess.limit; i++) {
          neOS.MemoryAccessor.write(
            i,
            0,
            victimProcess.base,
            victimProcess.limit
          );
        }

        // Optionally update the PCB display to reflect the new state
        TSOS.Control.updatePCBDisplay();
        TSOS.Control.displayMemory();
      } else {
        console.error(
          `Failed to roll out process PID: ${victimProcess.pid}. No disk space available.`
        );

        // Handle failure (e.g., retry with another victim or terminate the process)
        victimProcess.state = "Terminated";
        TSOS.Control.updatePCBDisplay();
      }
    }

    public rollIn(programID: number): void {
      console.log(`Rolling in process with Program ID: ${programID}`);

      // Retrieve the process data from disk
      const programData = neOS.DiskDriver.retrieveProgram(programID);
      if (programData.length > 0) {
        // Parse the saved process state
        const processState = JSON.parse(programData[0]);

        // Extract the program bytes (excluding the state JSON)
        const programBytes = programData
          .slice(1)
          .map((data) => parseInt(data, 16));

        // Reuse the existing PCB
        const existingPCB = Object.assign(
          new PCB(0, 0, 0, 1, "Disk", -1),
          processState
        );

        // Store the program into memory
        const result = neOS.MemoryManager.storeProgram(
          programBytes,
          existingPCB
        );

        if (result.pid !== -1) {
          console.log(
            `Process PID: ${existingPCB.pid} rolled in with Base: ${existingPCB.base}, Limit: ${existingPCB.limit}`
          );
          neOS.readyQueue.enqueue(existingPCB);
        } else {
          console.error(
            `Failed to roll in process with Program ID: ${programID}. No available memory.`
          );
        }
      } else {
        console.error(
          `Failed to retrieve program data for Program ID: ${programID}`
        );
      }
    }

    public contextSwitch(): void {
      if (neOS.CurrentProcess && neOS.CurrentProcess.state !== "Terminated") {
        // Save context only if not terminated
        console.log(`Saving context for PID ${neOS.CurrentProcess.pid}`);
        neOS.CurrentProcess.saveContext(neOS.CPU);
        neOS.readyQueue.enqueue(neOS.CurrentProcess);
      }

      // Schedule the next process
      this.scheduleNextProcess(false);
    }

    public handleTerminatedProcess(pid: number): void {
      console.log(`Handling termination of process PID: ${pid}`);

      // Find the terminated process in the process list
      const terminatedProcess = neOS.ProcessList.find(
        (process) => process.pid === pid
      );

      if (!terminatedProcess) {
        console.error(`Process PID: ${pid} not found in the process list.`);
        return;
      }

      // Free the memory associated with the process
      neOS.MemoryManager.freePartition(terminatedProcess.base);

      // Clear the memory contents
      for (
        let address = terminatedProcess.base;
        address <= terminatedProcess.limit;
        address++
      ) {
        neOS.MemoryAccessor.write(
          address,
          0,
          terminatedProcess.base,
          terminatedProcess.limit
        );
      }

      console.log(`Memory freed for terminated process PID: ${pid}`);
      TSOS.Control.displayMemory(); // Update memory display
      TSOS.Control.updatePCBDisplay(); // Update the PCB display
    }
  }
}
