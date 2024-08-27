/* ------------
   Globals.ts

   Global CONSTANTS and _Variables.
   (Global over both the OS and Hardware Simulation / Host.)

   This code references page numbers in our text book:
   Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
   ------------ */

//
// Global CONSTANTS (TypeScript 1.5 introduced const. Very cool.)
//
const APP_NAME: string    = "TSOS";   // 'cause Bob and I were at a loss for a better name.
const APP_VERSION: string = "0.07";   // What did you expect?

const CPU_CLOCK_INTERVAL: number = 100;   // This is in ms (milliseconds) so 1000 = 1 second.

const TIMER_IRQ: number = 0;  // Pages 23 (timer), 9 (interrupts), and 561 (interrupt priority).
                              // NOTE: The timer is different from hardware/host clock pulses. Don't confuse these.
const KEYBOARD_IRQ: number = 1;


//
// Global Variables
// TODO: Make a global object and use that instead of the "_" naming convention in the global namespace.
var neOSVars = {
   CPU: null as TSOS.Cpu,
   OSclock: 0,
   Mode: 0,
   Canvas: null as HTMLCanvasElement,
   DrawingContext: null as CanvasRenderingContext2D,
   DefaultFontFamily: 'sans',
   DefaultFontSize: 13,
   FontHeightMargin: 4,
   Trace: true,
   Kernel: null as TSOS.Kernel,
   KernelInterruptQueue: null as TSOS.Queue,
   KernelInputQueue: null as TSOS.Queue,
   KernelBuffers: [] as any[],
   StdIn: null as TSOS.Console,
   StdOut: null as TSOS.Console,
   Console: null as TSOS.Console,
   OsShell: null as TSOS.Shell,
   SarcasticMode: false,
   krnKeyboardDriver: null as TSOS.DeviceDriverKeyboard,
   hardwareClockID: null as number,
   GLaDOS: null as any,
   onDocumentLoad: function() {
      TSOS.Control.hostInit();
   }
}




var neOSVars.DefaultFontFamily: string = "sans"; // Ignored, I think. The was just a place-holder in 2008, but the HTML canvas may have use for it.
var neOSVars.DefaultFontSize: number = 13;
var neOSVars.FontHeightMargin: number = 4;       // Additional space added to font size when advancing a line.

var neOSVars.Trace: boolean = true;              // Default the OS trace to be on.

// The OS Kernel and its queues.
var neOSVars.Kernel: TSOS.Kernel;
var neOSVars.KernelInterruptQueue: TSOS.Queue = null;
var neOSVars.KernelInputQueue: TSOS.Queue = null; 
var neOSVars.KernelBuffers = null; 

// Standard input and output
var neOSVars.StdIn:  TSOS.Console = null; 
var neOSVars.StdOut: TSOS.Console = null;

// UI
var neOSVars.Console: TSOS.Console;
var neOSVars.OsShell: TSOS.Shell;

// At least this OS is not trying to kill you. (Yet.)
var neOSVars.SarcasticMode: boolean = false;

// Global Device Driver Objects - page 12
var neOSVars.krnKeyboardDriver: TSOS.DeviceDriverKeyboard  = null;

var neOSVars.hardwareClockID: number = null;

// For testing (and enrichment)...
var Glados: any = null;  // This is the function Glados() in glados-ip*.js http://alanclasses.github.io/TSOS/test/ .
var neOSVars.GLaDOS: any = null; // If the above is linked in, this is the instantiated instance of Glados.

var onDocumentLoad = function() {
	TSOS.Control.hostInit();
};
