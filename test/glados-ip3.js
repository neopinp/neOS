//
// glados.js - It's for testing. And enrichment.
//

function Glados() {
   this.version = 2112;

   this.init = function() {
      var msg = "Hello [subject name here]. Let's test project THREE.\n";
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
      neOS.KernelInputQueue.enqueue('C');
      neOS.KernelInputQueue.enqueue('a');
      neOS.KernelInputQueue.enqueue('k');
      neOS.KernelInputQueue.enqueue('e');
      TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false]);
      
      // Load some invalid user program code
      document.getElementById("taProgramInput").value="This is NOT hex.";
      neOS.KernelInputQueue.enqueue('l');
      neOS.KernelInputQueue.enqueue('o');
      neOS.KernelInputQueue.enqueue('a');
      neOS.KernelInputQueue.enqueue('d');
      TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false]);

      // Load THREE (slightly different) valid user programs code and run them. The differences are . . .                                          . . .                                        here                                                        . . .                                                                                                                                   . . . and here.
      var code1 = "A9 00 8D 7B 00 A9 00 8D 7B 00 A9 00 8D 7C 00 A9 00 8D 7C 00 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 39 A0 7D A2 02 FF AC 7B 00 A2 01 FF AD 7B 00 8D 7A 00 A9 01 6D 7A 00 8D 7B 00 A9 03 AE 7B 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 01 EC 7A 00 D0 05 A9 01 8D 7C 00 A9 00 AE 7C 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 AC A0 7F A2 02 FF 00 00 00 00 61 00 61 64 6F 6E 65 00";
      var code2 = "A9 00 8D 7B 00 A9 00 8D 7B 00 A9 00 8D 7C 00 A9 00 8D 7C 00 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 39 A0 7D A2 02 FF AC 7B 00 A2 01 FF AD 7B 00 8D 7A 00 A9 01 6D 7A 00 8D 7B 00 A9 06 AE 7B 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 01 EC 7A 00 D0 05 A9 01 8D 7C 00 A9 00 AE 7C 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 AC A0 7F A2 02 FF 00 00 00 00 62 00 62 64 6F 6E 65 00";
      var code3 = "A9 00 8D 7B 00 A9 00 8D 7B 00 A9 00 8D 7C 00 A9 00 8D 7C 00 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 39 A0 7D A2 02 FF AC 7B 00 A2 01 FF AD 7B 00 8D 7A 00 A9 01 6D 7A 00 8D 7B 00 A9 09 AE 7B 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 01 EC 7A 00 D0 05 A9 01 8D 7C 00 A9 00 AE 7C 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 AC A0 7F A2 02 FF 00 00 00 00 63 00 63 64 6F 6E 65 00";

      /*
	Approximate Turnaround Time and Wait Time values, +/- 1 quantum (6 cycles)
	Process 0 - Turnaround Time = 366 cycles, Wait Time = 240 cycles
	Process 1 - Turnaround Time = 570 cycles, Wait Time = 348 cycles
	Process 2 - Turnaround Time = 666 cycles, Wait Time = 348 cycles     
      

		setTimeout(function(){ document.getElementById("taProgramInput").value = code1;
								     neOS.KernelInputQueue.enqueue('l');
								     neOS.KernelInputQueue.enqueue('o');
								     neOS.KernelInputQueue.enqueue('a');
								     neOS.KernelInputQueue.enqueue('d');
								     TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false]);           	   				
									}, 1000);

		setTimeout(function(){ document.getElementById("taProgramInput").value = code2;
								     neOS.KernelInputQueue.enqueue('l');
								     neOS.KernelInputQueue.enqueue('o');
								     neOS.KernelInputQueue.enqueue('a');
								     neOS.KernelInputQueue.enqueue('d');
								     TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false]);           	   				
									}, 2000);

		setTimeout(function(){ document.getElementById("taProgramInput").value = code3;
								     neOS.KernelInputQueue.enqueue('l');
								     neOS.KernelInputQueue.enqueue('o');
								     neOS.KernelInputQueue.enqueue('a');
								     neOS.KernelInputQueue.enqueue('d');
								     TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false]);           	   				
									}, 3000);

   /*
   Manual tests:
   
   Memory access bounds/limit checking:
   A9 A9 A2 01 EC 13 00 AC 0B 00 8D F0 00 EE 0B 00 D0 F5 00 00
   
   Invalid op code:
   A9 A9 DD 01 00
   
   */
	   
   };
		
}
