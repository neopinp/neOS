//
// glados.js - It's for testing. And enrichment.
//

function Glados() {
   this.version = 2112;

   this.init = function() {
      var msg = "Hello [subject name here]. Let's test our FINAL PROJECT (woot woot woot woot).\n";
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
      neOS.KernelInputQueue.enqueue('F');
      neOS.KernelInputQueue.enqueue('i');
      neOS.KernelInputQueue.enqueue('N');
      neOS.KernelInputQueue.enqueue('a');
      neOS.KernelInputQueue.enqueue('L');
      TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false]);
      
      // Load some invalid user program code
      document.getElementById("taProgramInput").value="This is NOT hex.";
      neOS.KernelInputQueue.enqueue('l');
      neOS.KernelInputQueue.enqueue('o');
      neOS.KernelInputQueue.enqueue('a');
      neOS.KernelInputQueue.enqueue('d');
      TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false]);

      // Format the hard drive so we can load FOUR or more programs.
      neOS.KernelInputQueue.enqueue('f');
      neOS.KernelInputQueue.enqueue('o');
      neOS.KernelInputQueue.enqueue('r');
      neOS.KernelInputQueue.enqueue('m');
      neOS.KernelInputQueue.enqueue('a');
      neOS.KernelInputQueue.enqueue('t');
      TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false]);

      // getschedule
      neOS.KernelInputQueue.enqueue('g');
      neOS.KernelInputQueue.enqueue('e');
      neOS.KernelInputQueue.enqueue('t');
      neOS.KernelInputQueue.enqueue('s');
      neOS.KernelInputQueue.enqueue('c');
      neOS.KernelInputQueue.enqueue('h');
      neOS.KernelInputQueue.enqueue('e');
      neOS.KernelInputQueue.enqueue('d');
      neOS.KernelInputQueue.enqueue('u');
      neOS.KernelInputQueue.enqueue('l');
      neOS.KernelInputQueue.enqueue('e');
      TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false]);

      // Load FOUR different valid user programs code and run them.                                                                                                           . . . and here.
      var code1 = "A9 00 8D 7B 00 A9 00 8D 7B 00 A9 00 8D 7C 00 A9 00 8D 7C 00 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 39 A0 7D A2 02 FF AC 7B 00 A2 01 FF AD 7B 00 8D 7A 00 A9 01 6D 7A 00 8D 7B 00 A9 03 AE 7B 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 01 EC 7A 00 D0 05 A9 01 8D 7C 00 A9 00 AE 7C 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 AC A0 7F A2 02 FF 00 00 00 00 61 00 61 64 6F 6E 65 00";
      var code2 = "A9 00 8D 7B 00 A9 00 8D 7B 00 A9 00 8D 7C 00 A9 00 8D 7C 00 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 39 A0 7D A2 02 FF AC 7B 00 A2 01 FF AD 7B 00 8D 7A 00 A9 01 6D 7A 00 8D 7B 00 A9 06 AE 7B 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 01 EC 7A 00 D0 05 A9 01 8D 7C 00 A9 00 AE 7C 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 AC A0 7F A2 02 FF 00 00 00 00 62 00 62 64 6F 6E 65 00";
      var code3 = "A9 00 8D 7B 00 A9 00 8D 7B 00 A9 00 8D 7C 00 A9 00 8D 7C 00 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 39 A0 7D A2 02 FF AC 7B 00 A2 01 FF AD 7B 00 8D 7A 00 A9 01 6D 7A 00 8D 7B 00 A9 09 AE 7B 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 01 EC 7A 00 D0 05 A9 01 8D 7C 00 A9 00 AE 7C 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 AC A0 7F A2 02 FF 00 00 00 00 63 00 63 64 6F 6E 65 00";
      var code4 = "A9 00 8D 7B 00 A9 00 8D 7B 00 A9 00 8D 7C 00 A9 00 8D 7C 00 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 39 A0 7D A2 02 FF AC 7B 00 A2 01 FF AD 7B 00 8D 7A 00 A9 01 6D 7A 00 8D 7B 00 A9 0C AE 7B 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 01 EC 7A 00 D0 05 A9 01 8D 7C 00 A9 00 AE 7C 00 8D 7A 00 A9 00 EC 7A 00 D0 02 A9 01 8D 7A 00 A2 00 EC 7A 00 D0 AC A0 7F A2 02 FF 00 00 00 00 64 00 64 64 6F 6E 65 00";

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

		setTimeout(function(){ document.getElementById("taProgramInput").value = code4;
								     neOS.KernelInputQueue.enqueue('l');
								     neOS.KernelInputQueue.enqueue('o');
								     neOS.KernelInputQueue.enqueue('a');
								     neOS.KernelInputQueue.enqueue('d');
								     TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false]);           	   				
									}, 3000);

		setTimeout(function(){ neOS.KernelInputQueue.enqueue('r');
								     neOS.KernelInputQueue.enqueue('u');
								     neOS.KernelInputQueue.enqueue('n');
								     neOS.KernelInputQueue.enqueue('a');
								     neOS.KernelInputQueue.enqueue('l');      
								     neOS.KernelInputQueue.enqueue('l');            
								     TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false]);		
									}, 4000);

	   // Remind myself to test the file system.
	   neOS.KernelInputQueue.enqueue('S');
	   neOS.KernelInputQueue.enqueue('t');
	   neOS.KernelInputQueue.enqueue('A');
	   neOS.KernelInputQueue.enqueue('t');
	   neOS.KernelInputQueue.enqueue('U');
	   neOS.KernelInputQueue.enqueue('s');
	   neOS.KernelInputQueue.enqueue(' ');
	   neOS.KernelInputQueue.enqueue('T');
	   neOS.KernelInputQueue.enqueue('e');
	   neOS.KernelInputQueue.enqueue('s');
	   neOS.KernelInputQueue.enqueue('t');
	   neOS.KernelInputQueue.enqueue(' ');
	   neOS.KernelInputQueue.enqueue('t');
	   neOS.KernelInputQueue.enqueue('h');
	   neOS.KernelInputQueue.enqueue('e');
	   neOS.KernelInputQueue.enqueue(' ');
	   neOS.KernelInputQueue.enqueue('f');
	   neOS.KernelInputQueue.enqueue('i');
	   neOS.KernelInputQueue.enqueue('l');
	   neOS.KernelInputQueue.enqueue('e');
	   neOS.KernelInputQueue.enqueue(' ');
	   neOS.KernelInputQueue.enqueue('s');
	   neOS.KernelInputQueue.enqueue('y');
	   neOS.KernelInputQueue.enqueue('s');
	   neOS.KernelInputQueue.enqueue('t');
	   neOS.KernelInputQueue.enqueue('e');
	   neOS.KernelInputQueue.enqueue('m');
	   TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false]);
   };
		
}
