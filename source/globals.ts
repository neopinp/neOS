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
var neOS = {
   CPU: null as TSOS.Cpu,
   OSclock: 0,
   Mode: 0,
   Canvas: null as HTMLCanvasElement,
   DrawingContext: null as any,
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
   Glados: null as any,
   GLaDOS: null as any,
   waitingForRiddleAnswer: false,
   correctAnswer: '',
   ProcessList: [] as { pid: number, name: string}[],
   onDocumentLoad: function() {
      TSOS.Control.hostInit();
   }
}





