/* ------------
     Control.ts

     Routines for the hardware simulation, NOT for our client OS itself.
     These are static because we are never going to instantiate them, because they represent the hardware.
     In this manner, it's A LITTLE BIT like a hypervisor, in that the Document environment inside a browser
     is the "bare metal" (so to speak) for which we write code that hosts our client OS.
     But that analogy only goes so far, and the lines are blurred, because we are using TypeScript/JavaScript
     in both the host and client environments.

     This (and other host/simulation scripts) is the only place that we should see "web" code, such as
     DOM manipulation and event handling, and so on.  (Index.html is -- obviously -- the only place for markup.)

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

//
// Control Services
//
declare var Glados: any;
namespace TSOS {
  export class Control {
    public static singleStepMode: boolean = false;

    public static updatePCBDisplay(): void {
      let pcbDisplayElement = document.querySelector("#pcbTableBody");
      if (pcbDisplayElement) {
        pcbDisplayElement.innerHTML = ""; // Clear the table body before updating

        neOS.ProcessList.forEach((pcb) => {
          let row = document.createElement("tr");

          // Process ID (PID)
          let pidCell = document.createElement("td");
          pidCell.textContent = pcb.pid.toString(); // PID should always exist

          // Program Counter (PC)
          let pcCell = document.createElement("td");
          pcCell.textContent =
            pcb.pc !== undefined && pcb.pc !== null
              ? `0x${pcb.pc.toString(16).toUpperCase().padStart(2, "0")}`
              : `0x00`;

          // Instruction Register (IR)
          let irCell = document.createElement("td");
          irCell.textContent =
            pcb.ir !== undefined && pcb.ir !== null
              ? `0x${pcb.ir.toString(16).toUpperCase().padStart(2, "0")}`
              : `0x00`;

          // Accumulator (ACC)
          let accCell = document.createElement("td");
          accCell.textContent =
            pcb.acc !== undefined && pcb.acc !== null
              ? `0x${pcb.acc.toString(16).toUpperCase().padStart(2, "0")}`
              : `0x00`;

          // X Register (Xreg)
          let xRegCell = document.createElement("td");
          xRegCell.textContent =
            pcb.xReg !== undefined && pcb.xReg !== null
              ? `0x${pcb.xReg.toString(16).toUpperCase().padStart(2, "0")}`
              : `0x00`;

          // Y Register (Yreg)
          let yRegCell = document.createElement("td");
          yRegCell.textContent =
            pcb.yReg !== undefined && pcb.yReg !== null
              ? `0x${pcb.yReg.toString(16).toUpperCase().padStart(2, "0")}`
              : `0x00`;

          // Zero Flag (Zflag) - just a number, so `0` makes sense here
          let zFlagCell = document.createElement("td");
          zFlagCell.textContent =
            pcb.zFlag !== undefined && pcb.zFlag !== null
              ? pcb.zFlag.toString()
              : `0`;

          // State (Running, Terminated, etc.)
          let stateCell = document.createElement("td");
          stateCell.textContent = pcb.state || "Unknown"; // Fallback to "Unknown" if state is undefined

          // Append cells to the row
          row.appendChild(pidCell);
          row.appendChild(pcCell);
          row.appendChild(irCell);
          row.appendChild(accCell);
          row.appendChild(xRegCell);
          row.appendChild(yRegCell);
          row.appendChild(zFlagCell);
          row.appendChild(stateCell);

          // Add the row to the table body
          pcbDisplayElement.appendChild(row);
        });
      } else {
        console.error("PCB display table body not found.");
      }
    }

    public static updateCPUDisplay(cpu: Cpu): void {
      const cpuTable = document.getElementById('cpuTableBody');
      if (cpuTable) {
        cpuTable.innerHTML = `
            <tr>
            <td>0x${cpu.PC.toString(16).padStart(2, '0').toUpperCase()}</td>
            <td>0x${cpu.instructionRegister.toString(16).padStart(2, '0').toUpperCase()}</td>
            <td>0x${cpu.Acc.toString(16).padStart(2, '0').toUpperCase()}</td>
            <td>0x${cpu.Xreg.toString(16).padStart(2, '0').toUpperCase()}</td>
            <td>0x${cpu.Yreg.toString(16).padStart(2, '0').toUpperCase()}</td>
            <td>${cpu.Zflag}</td>
          </tr>`;
      }
    }

    public static hostInit(): void {
      // This is called from index.html's onLoad event via the onDocumentLoad function pointer.

      // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
      neOS.Canvas = <HTMLCanvasElement>document.getElementById("display");

      // Get a global reference to the drawing context.
      neOS.DrawingContext = neOS.Canvas.getContext("2d");

      // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
      CanvasTextFunctions.enable(neOS.DrawingContext); // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun, so we'll keep it.

      // Clear the log text box.
      // Use the TypeScript cast to HTMLInputElement
      (<HTMLInputElement>document.getElementById("taHostLog")).value = "";

      // Set focus on the start button.
      // Use the TypeScript cast to HTMLInputElement
      (<HTMLInputElement>document.getElementById("btnStartOS")).focus();

      document.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.key === 'c') {
            const pid = neOS.CurrentProcess ? neOS.CurrentProcess.pid : null;
            if (pid !== null) {
                neOS.OsShell.shellKill([pid.toString()]); 
                neOS.StdOut.advanceLine(); 
                neOS.OsShell.putPrompt(); 
            }
        }
    });

    // More init


      // Check for our testing and enrichment core, which
      // may be referenced here (from index.html) as function Glados().
      if (typeof Glados === "function") {
        // function Glados() is here, so instantiate Her into
        // the global (and properly capitalized) neOS.GLaDOS variable.
        neOS.GLaDOS = new Glados();
        neOS.GLaDOS.init();
      }
      Control.singleStepToggle();
      Control.executeStep();
      setInterval(Control.updateTaskBar, 1000);
    }

    public static hostLog(msg: string, source: string = "?"): void {
      // Note the OS CLOCK.
      var clock: number = neOS.OSclock;

      // Note the REAL clock in milliseconds since January 1, 1970.
      var now: number = new Date().getTime();

      // Build the log string.
      var str: string =
        "({ clock:" +
        clock +
        ", source:" +
        source +
        ", msg:" +
        msg +
        ", now:" +
        now +
        " })" +
        "\n";

      // Update the log console.
      var taLog = <HTMLInputElement>document.getElementById("taHostLog");
      taLog.value = str + taLog.value;

      // TODO in the future: Optionally update a log database or some streaming service.
    }

    //
    // Host Events
    //
    public static hostBtnStartOS_click(btn): void {
      // Disable the (passed-in) start button...
      btn.disabled = true;

      // .. enable the Halt and Reset buttons ...
      (<HTMLButtonElement>document.getElementById("btnHaltOS")).disabled =
        false;
      (<HTMLButtonElement>document.getElementById("btnReset")).disabled = false;

      // .. set focus on the OS console display ...
      document.getElementById("display").focus();

      //console.log("Initializing Memory...");
      neOS.Memory = new TSOS.Memory();
      neOS.Memory.init();

      //console.log("Memory initialized:", neOS.Memory);

      neOS.MemoryAccessor = new TSOS.MemoryAccessor(neOS.Memory);
      //console.log("MemoryAccessor initialized:", neOS.MemoryAccessor);

      neOS.CPU = new TSOS.Cpu();
      neOS.CPU.init();

      neOS.Kernel = new TSOS.Kernel();
      neOS.Kernel.krnBootstrap();

      if (!this.singleStepMode) {
        neOS.hardwareClockID = setInterval(
          Devices.hostClockPulse,
          neOS.CPU_CLOCK_INTERVAL
        ) as unknown as number;  
      } else {
        neOS.CPU.isExecuting = false;
      }


    }

    public static hostBtnHaltOS_click(btn): void {
      Control.hostLog("Emergency halt", "host");
      Control.hostLog("Attempting Kernel shutdown.", "host");
      // Call the OS shutdown routine.
      neOS.Kernel.krnShutdown();
      // Stop the interval that's simulating our clock pulse.
      clearInterval(neOS.hardwareClockID);
      // TODO: Is there anything else we need to do here?
    }

 public static singleStepToggle(): void {
      const singleStepButton = document.getElementById('singleStep');
      if (singleStepButton) {
        singleStepButton.addEventListener('click', () => {
          this.singleStepMode = !this.singleStepMode;
          singleStepButton.textContent = this.singleStepMode ? "Disable Single Step" : "Enable Single Step";
          
          // Reset the CPU state
          if (this.singleStepMode) {
            neOS.CPU.isExecuting = false; // Stop executing immediately if enabling single-step mode
          } else {
            neOS.CPU.isExecuting = true;
          }
        });
      }
    }

    public static executeStep(): void {
      const stepButton = document.getElementById('stepElement');
      if (stepButton) {
        stepButton.addEventListener('click', () => {
          if (this.singleStepMode) {
            // Only execute if the current process is valid
            if (neOS.CurrentProcess && neOS.CurrentProcess.state !== "Terminated") {
              const instruction = neOS.MemoryAccessor.read(neOS.CPU.PC, neOS.CurrentProcess.base, neOS.CurrentProcess.limit);


    
              // Execute the instruction
              try {
                neOS.CPU.execute(instruction);
                const hexInstruction = instruction.toString(16).padStart(2, '0').toUpperCase();
                neOS.Kernel.krnTrace(`Step Button Pressed - Execute: 0x${hexInstruction}`);
              } catch (error) {
                return; 
              }
    
              // After execution, check if the process is still valid
              if (neOS.CurrentProcess.state === "Terminated") {
                neOS.Kernel.krnTrace(`Process ${neOS.CurrentProcess.pid} has terminated.`);
              }
            } else {
              neOS.Kernel.krnTrace("No valid process to execute or process is terminated.");
            }
          } else {
            neOS.Kernel.krnTrace("Single step mode is not enabled.");
          }
        });
      }
    }
    
    
    

    public static hostBtnReset_click(btn): void {
      // The easiest and most thorough way to do this is to reload (not refresh) the document.
      location.reload();
    }


    public static updateTaskBar(): void {
      const now = new Date();
      const dateString = now.toLocaleDateString();
      const timeString = now.toLocaleTimeString();
      const dateTimeString = `${dateString} ${timeString}`;

      const taskbarDateTimeElement =
        document.getElementById("taskbar-date-time");
      const taskbarStatusElement = document.getElementById("taskbar-status");

      if (taskbarDateTimeElement) {
        taskbarDateTimeElement.textContent = dateTimeString;
      }

      if (taskbarStatusElement) {
        taskbarStatusElement.textContent = neOS.StatusMessage; // Hardcoded test
      }
    }


  }
}