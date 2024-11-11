/* ------------
     Kernel.ts

     Routines for the Operating System, NOT the host.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

namespace TSOS {
  export class Kernel {
    public memoryManager: MemoryManager;

    constructor() {
      console.log("Kernel constructed.");
    }

    // OS Startup and Shutdown Routines
    //
    public krnBootstrap() {
      // Page 8. {
      Control.hostLog("bootstrap", "host");
      // Use hostLog because we ALWAYS want this, even if neOS.
      neOS.KernelInterruptQueue = new TSOS.Queue<TSOS.Interrupt>();
      neOS.KernelInputQueue = new TSOS.Queue<string>();
      neOS.KernelBuffers = [];
      // Initialize memory manager
      this.memoryManager = new MemoryManager(neOS.MemoryAccessor);
      neOS.MemoryManager = this.memoryManager;

      // Initialize our global queues.
      neOS.KernelInterruptQueue = new TSOS.Queue<TSOS.Interrupt>();
      // A (currently) non-priority queue for interrupt requests (IRQs).
      neOS.KernelInputQueue = new TSOS.Queue<string>();

      neOS.KernelBuffers = new Array();
      // Buffers... for the kernel.
      // Where device input lands before being processed out somewhere.

      // Initialize the console.
      neOS.Console = new Console();
      // The command line interface / console I/O device.
      neOS.Console.init();

      // Initialize standard input and output to the neOS.Console.
      neOS.StdIn = neOS.Console;
      neOS.StdOut = neOS.Console;

      // Scheduling
      neOS.Scheduler = new TSOS.Scheduler();
      neOS.Dispatcher = new TSOS.Dispatcher();

      // Queues 

      neOS.readyQueue = new TSOS.Queue<TSOS.PCB>();
      neOS.residentQueue = new TSOS.Queue<TSOS.PCB>();

      // Load the Keyboard Device Driver
      this.krnTrace("Loading the keyboard device driver.");
      neOS.krnKeyboardDriver = new DeviceDriverKeyboard();
      // Construct it.
      neOS.krnKeyboardDriver.driverEntry();
      // Call the driverEntry() initialization routine.
      this.krnTrace(neOS.krnKeyboardDriver.status);

      //
      // ... more?
      //

      // Enable the OS Interrupts.  (Not the CPU clock interrupt, as that is done in the hardware sim.)
      this.krnTrace("Enabling the interrupts.");
      this.krnEnableInterrupts();

      // Launch the shell.
      this.krnTrace("Creating and Launching the shell.");
      neOS.OsShell = new Shell();
      neOS.OsShell.init();

      // Finally, initiate student testing protocol.
      if (neOS.GLaDOS) {
        neOS.GLaDOS.afterStartup();
      }
    }

    public krnShutdown() {
      this.krnTrace("begin shutdown OS");
      // TODO: Check for running processes.  If there are some, alert and stop. Else...
      // ... Disable the Interrupts.
      this.krnTrace("Disabling the interrupts.");
      this.krnDisableInterrupts();
      //
      // Unload the Device Drivers?
      // More?
      //
      this.krnTrace("end shutdown OS");
    }

    public krnOnCPUClockPulse() {
      neOS.OSclock++;
      /* This gets called from the host hardware simulation every time there is a hardware clock pulse.
               This is NOT the same as a TIMER, which causes an interrupt and is handled like other interrupts.
               This, on the other hand, is the clock pulse from the hardware / VM / host that tells the kernel
               that it has to look for interrupts and process them if it finds any.                          
            */
      // Check for an interrupt, if there are any. Page 560
      if (neOS.KernelInterruptQueue.getSize() > 0) {
        // Process the first interrupt on the interrupt queue.
        // TODO (maybe): Implement a priority queue based on the IRQ number/id to enforce interrupt priority.
        var interrupt = neOS.KernelInterruptQueue.dequeue();
        this.krnInterruptHandler(interrupt.irq, interrupt.params);
      } else if (neOS.CPU.isExecuting) {
        // If there are no interrupts then run one CPU cycle if there is anything being processed.
        neOS.CPU.cycle();
      } else {
        // If there are no interrupts and there is nothing being executed then just be idle.
        this.krnTrace("Idle");
      }
    }
    //
    // Interrupt Handling
    //
    public krnEnableInterrupts() {
      // Keyboard
      Devices.hostEnableKeyboardInterrupt();
      // Put more here.
    }

    public krnDisableInterrupts() {
      // Keyboard
      Devices.hostDisableKeyboardInterrupt();
      // Put more here.
    }

    public krnInterruptHandler(irq, params) {
      // This is the Interrupt Handler Routine.  See pages 8 and 560.
      // Trace our entrance here so we can compute Interrupt Latency by analyzing the log file later on. Page 766.
      this.krnTrace("Handling IRQ~" + irq);

      // Invoke the requested Interrupt Service Routine via Switch/Case rather than an Interrupt Vector.
      // TODO: Consider using an Interrupt Vector in the future.
      // Note: There is no need to "dismiss" or acknowledge the interrupts in our design here.
      //       Maybe the hardware simulation will grow to support/require that in the future.
      switch (irq) {
        case TIMER_IRQ:
          this.krnTimerISR(); // Kernel built-in routine for timers (not the clock).
          break;
        case KEYBOARD_IRQ:
          neOS.krnKeyboardDriver.isr(params); // Kernel mode device driver
          neOS.StdIn.handleInput();
          break;
        case INTERRUPT_PROCESS_KILL:
          this.killProcess(params[0]);
          break;
        case INTERRUPT_CONTEXT_SWITCH:
          neOS.Scheduler.contextSwitch();
          break;
        default:
          this.krnTrapError(
            "Invalid Interrupt Request. irq=" + irq + " params=[" + params + "]"
          );
      }
    }

    public krnTimerISR() {
      // The built-in TIMER (not clock) Interrupt Service Routine (as opposed to an ISR coming from a device driver). {
      // Check multiprogramming parameters and enforce quanta here. Call the scheduler / context switch here if necessary.
      // Or do it elsewhere in the Kernel. We don't really need this.
    }

    //
    // System Calls... that generate software interrupts via tha Application Programming Interface library routines.
    //
    // Some ideas:
    // - 1Console
    // - WriteConsole
    // - CreateProcess
    // - ExitProcess
    // - WaitForProcessToExit
    // - CreateFile
    // - OpenFile
    // - ReadFile
    // - WriteFile
    // - CloseFile

    //
    // OS Utility Routines
    //
    public krnTrace(msg: string) {
      // Check globals to see if trace is set ON.  If so, then (maybe) log the message.
      if (neOS.Trace) {
        if (msg === "Idle") {
          // We can't log every idle clock pulse because it would quickly lag the browser quickly.
          if (neOS.OSclock % 10 == 0) {
            // Check the CPU_CLOCK_INTERVAL in globals.ts for an
            // idea of the tick rate and adjust this line accordingly.
            Control.hostLog(msg, "OS");
          }
        } else {
          Control.hostLog(msg, "OS");
        }
      }
    }

    public krnTrapError(msg: string) {
      Control.hostLog("OS ERROR - TRAP: " + msg);

      // Clear the screen
      neOS.StdOut.clearScreen();

      // Set the color to blue for the BSOD effect
      neOS.DrawingContext.fillStyle = "blue";
      neOS.DrawingContext.fillRect(0, 0, neOS.Canvas.width, neOS.Canvas.height);

      // Set text color to white
      neOS.DrawingContext.fillStyle = "white";

      // Display the BSOD message
      neOS.StdOut.resetXY(); // Reset the cursor position
      neOS.StdOut.putText("BLUE SCREEN OF DEATH");
      neOS.StdOut.advanceLine();
      neOS.StdOut.putText("An OS error has occurred: " + msg);
      neOS.StdOut.advanceLine();
      neOS.StdOut.putText("Please restart your system.");

      // Then shut down the OS.
      this.krnShutdown();
    }
    public killProcess(pid: number): void {
      const processIndex = neOS.ProcessList.findIndex((p) => p.pid === pid);
      if (processIndex !== -1) {
        neOS.ProcessList.splice(processIndex, 1);
        neOS.StdOut.putText(`Process with PID ${pid} killed.`);
      } else {
        neOS.StdOut.putText(`No process found with PID ${pid}.`);
      }
    }
  }
}
