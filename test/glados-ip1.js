//
// glados.js - It's for testing. And enrichment.
//

function Glados() {
   this.version = 2112;

   this.init = function() {
      var msg = "Hello [subject name here]. Let's test project ONE.\n";
      // msg += "Before we start, however, keep in mind that although fun and learning are our primary goals, serious injuries may occur.";
      // msg += "Cake, and grief counseling, will be available at the conclusion of the test.";
      alert(msg);
   };

   this.afterStartup = function() {
      // Force scrolling with a few 'help' commands.
      neOS.KernelInputQueue.enqueue('h');
      neOS.KernelInputQueue.enqueue('e');
      neOS.KernelInputQueue.enqueue('l');
      neOS.KernelInputQueue.enqueue('p');
      TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false]);		
      neOS.KernelInputQueue.enqueue('h');
      neOS.KernelInputQueue.enqueue('e');
      neOS.KernelInputQueue.enqueue('l');
      neOS.KernelInputQueue.enqueue('p');
      TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false]);

      // Test the 'ver' command.
      neOS.KernelInputQueue.enqueue('v');
      neOS.KernelInputQueue.enqueue('e');
      neOS.KernelInputQueue.enqueue('r');
      TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false]);

      // Test the 'date' command.
      neOS.KernelInputQueue.enqueue('d');
      neOS.KernelInputQueue.enqueue('a');
      neOS.KernelInputQueue.enqueue('t');
      neOS.KernelInputQueue.enqueue('e');
      TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false]);

      // Test the 'whereami' command.
      neOS.KernelInputQueue.enqueue('w');
      neOS.KernelInputQueue.enqueue('h');
      neOS.KernelInputQueue.enqueue('e');
      neOS.KernelInputQueue.enqueue('r');
      neOS.KernelInputQueue.enqueue('e');
      neOS.KernelInputQueue.enqueue('a');
      neOS.KernelInputQueue.enqueue('m');
      neOS.KernelInputQueue.enqueue('i');
      TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false]);
     
      // Test the 'status' command.
      neOS.KernelInputQueue.enqueue('S');
      neOS.KernelInputQueue.enqueue('t');
      neOS.KernelInputQueue.enqueue('A');
      neOS.KernelInputQueue.enqueue('t');
      neOS.KernelInputQueue.enqueue('U');
      neOS.KernelInputQueue.enqueue('s');
      neOS.KernelInputQueue.enqueue(' ');
      neOS.KernelInputQueue.enqueue('T');
      neOS.KernelInputQueue.enqueue('h');
      neOS.KernelInputQueue.enqueue('e');
      neOS.KernelInputQueue.enqueue(' ');
      neOS.KernelInputQueue.enqueue('C');
      neOS.KernelInputQueue.enqueue('a');
      neOS.KernelInputQueue.enqueue('k');
      neOS.KernelInputQueue.enqueue('e');
      neOS.KernelInputQueue.enqueue(' ');
      neOS.KernelInputQueue.enqueue('i');
      neOS.KernelInputQueue.enqueue('s');
      neOS.KernelInputQueue.enqueue(' ');
      neOS.KernelInputQueue.enqueue('a');
      neOS.KernelInputQueue.enqueue(' ');
      neOS.KernelInputQueue.enqueue('l');
      neOS.KernelInputQueue.enqueue('i');
      neOS.KernelInputQueue.enqueue('e');
      neOS.KernelInputQueue.enqueue('!');
      TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false]);              

      // Try and load some invalid user program code.
      document.getElementById("taProgramInput").value = "This is NOT hex.";
      neOS.KernelInputQueue.enqueue('l');
      neOS.KernelInputQueue.enqueue('o');
      neOS.KernelInputQueue.enqueue('a');
      neOS.KernelInputQueue.enqueue('d');
      TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false]);

      // Try and load NO user program code. That should still casue an error.
      document.getElementById("taProgramInput").value = "";
      neOS.KernelInputQueue.enqueue('l');
      neOS.KernelInputQueue.enqueue('o');
      neOS.KernelInputQueue.enqueue('a');
      neOS.KernelInputQueue.enqueue('d');
      TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false]);
      
      // Try and load some valid user program code.
      var code = "A9 00 8D 00 00 A9 00 8D 4B 00 A9 00 8D 4B 00 A2 03 EC 4B 00 D0 07 A2 01 EC 00 00 D0 05 A2 00 EC 00 00 D0 26 A0 4C A2 02 FF AC 4B 00 A2 01 FF A9 01 6D 4B 00 8D 4B 00 A2 02 EC 4B 00 D0 05 A0 55 A2 02 FF A2 01 EC 00 00 D0 C5 00 00 63 6F 75 6E 74 69 6E 67 00 68 65 6C 6C 6F 20 77 6F 72 6C 64 00";
      document.getElementById("taProgramInput").value = code;
      neOS.KernelInputQueue.enqueue('l');
      neOS.KernelInputQueue.enqueue('o');
      neOS.KernelInputQueue.enqueue('a');
      neOS.KernelInputQueue.enqueue('d');
      TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false]);
   };
}