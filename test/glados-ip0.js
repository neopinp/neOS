//
// glados.js - It's for testing. And enrichment.
//

function Glados() {
   this.version = 2112;

   this.init = function() {
      var msg = "Hello [subject name here]. Let's test project ZERO.\n";
      msg += "Before we start, however, keep in mind that although fun and learning are our primary goals, serious injuries may occur. ";
      msg += "Cake, and grief counseling, will be available at the conclusion of the test.";
      alert(msg);
   };

   this.afterStartup = function() {

      // Test the 'help' command.
      neOS.KernelInputQueue.enqueue('h');
      neOS.KernelInputQueue.enqueue('e');
      neOS.KernelInputQueue.enqueue('l');
      neOS.KernelInputQueue.enqueue('p');
      TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false]);

   };
}