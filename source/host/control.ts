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

        public static hostInit(): void {
            // This is called from index.html's onLoad event via the onDocumentLoad function pointer.

            // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
            neOS.Canvas = <HTMLCanvasElement>document.getElementById('display');

            // Get a global reference to the drawing context.
            neOS.DrawingContext = neOS.Canvas.getContext("2d");

            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            CanvasTextFunctions.enable(neOS.DrawingContext);   // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun, so we'll keep it.

            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement>document.getElementById("taHostLog")).value = "";

            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement>document.getElementById("btnStartOS")).focus();

            // Check for our testing and enrichment core, which
            // may be referenced here (from index.html) as function Glados().
            if (typeof Glados === "function") {
                // function Glados() is here, so instantiate Her into
                // the global (and properly capitalized) neOS.GLaDOS variable.
                neOS.GLaDOS = new Glados();
                neOS.GLaDOS.init();
            }
            setInterval(Control.updateTaskBar, 1000);
        }

        public static hostLog(msg: string, source: string = "?"): void {
            // Note the OS CLOCK.
            var clock: number = neOS.OSclock;

            // Note the REAL clock in milliseconds since January 1, 1970.
            var now: number = new Date().getTime();

            // Build the log string.
            var str: string = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now + " })" + "\n";

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
            (<HTMLButtonElement>document.getElementById("btnHaltOS")).disabled = false;
            (<HTMLButtonElement>document.getElementById("btnReset")).disabled = false;

            // .. set focus on the OS console display ...
            document.getElementById("display").focus();

            console.log("Initializing Memory...");
            neOS.Memory = new TSOS.Memory(256); 
            neOS.Memory.init(); 

            console.log("Memory initialized:", neOS.Memory);
        
            // Initialize MemoryAccessor
            console.log("Initializing MemoryAccessor...");
            neOS.MemoryAccessor = new TSOS.MemoryAccessor(neOS.Memory); 
            console.log("MemoryAccessor initialized:", neOS.MemoryAccessor);
        

            neOS.CPU = new TSOS.Cpu();  
            neOS.CPU.init(); 

        


            neOS.Kernel = new TSOS.Kernel();
            neOS.Kernel.krnBootstrap(); 
        
            neOS.hardwareClockID = setInterval(Devices.hostClockPulse, neOS.CPU_CLOCK_INTERVAL) as unknown as number;
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

        public static hostBtnReset_click(btn): void {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload();
        }
        public static updateTaskBar(): void {
            const now = new Date();
            const dateString = now.toLocaleDateString();
            const timeString = now.toLocaleTimeString();
            const dateTimeString = `${dateString} ${timeString}`;
        
            const taskbarDateTimeElement = document.getElementById("taskbar-date-time");
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