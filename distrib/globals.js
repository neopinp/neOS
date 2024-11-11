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
const APP_VERSION = "0.07"; // What did you expect?
const TIMER_IRQ = 0; // Pages 23 (timer), 9 (interrupts), and 561 (interrupt priority).
// NOTE: The timer is different from hardware/host clock pulses. Don't confuse these.
const KEYBOARD_IRQ = 1;
const INTERRUPT_PROCESS_KILL = 1;
const INTERRUPT_CONTEXT_SWITCH = 2;
//
// Global Variables
// TODO: Make a global object and use that instead of the "_" naming convention in the global namespace.
var neOS = {
    CPU_CLOCK_INTERVAL: 200,
    APP_NAME: "TSOS",
    CPU: null,
    OSclock: 0,
    Mode: 0,
    Canvas: null,
    DrawingContext: null,
    DefaultFontFamily: 'sans',
    DefaultFontSize: 13,
    FontHeightMargin: 4,
    Trace: true,
    Kernel: null,
    KernelInterruptQueue: null,
    KernelInputQueue: null,
    KernelBuffers: [],
    StdIn: null,
    StdOut: null,
    Console: null,
    OsShell: null,
    Memory: null,
    MemoryAccessor: null,
    MemoryManager: null,
    SarcasticMode: false,
    krnKeyboardDriver: null,
    hardwareClockID: null,
    Glados: null,
    GLaDOS: null,
    waitingForRiddleAnswer: false,
    StatusMessage: '',
    correctAnswer: '',
    CurrentProcess: null,
    ProcessList: [],
    readyQueue: null,
    residentQueue: null,
    Scheduler: null,
    Dispatcher: null,
    onDocumentLoad: function () {
        TSOS.Control.hostInit();
    }
};
//# sourceMappingURL=globals.js.map