/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it.

namespace TSOS {
  export class SystemService {
    public name: string;
    public status: string;

    constructor(name: string) {
      this.name = name;
      this.status = "stopped";
    }
    public start(): void {
      this.status = "running";
      neOS.StdOut.putText(`${this.name} service started.`);
    }
    public stop(): void {
      this.status = "stopped";
      neOS.StdOut.putText(`${this.name} service stopped.`);
    }
    public log(msg: string): void {
      neOS.StdOut.putText(`${this.name}: ${msg}`);
    }
    public handleError(msg: string): void {
      neOS.StdOut.putText(`Error in ${this.name}: ${msg}`);
      this.stop();
    }
  }
}

namespace TSOS {
  export class Shell extends SystemService {
    //properties for tab completion of similar letters
    private lastTabInput: string = "";
    private tabCompletionMatches: string[] = [];
    private tabCompletionPointer: number = 0;
    //properties for tab completion
    private commandHistory: string[] = [];
    private historyPointer: number = -1;
    // Properties
    public promptStr = ">";
    public commandList = [];
    public curses =
      "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
    public apologies = "[sorry]";

    public detailedCommands = {
      help: "Help displays a list of all available commands",
      ver: "Displays version data and personal details (name/course).",
      shutdown:
        "Shuts down the virtual OS but leaves the underlying host / hardware simulation running.",
      cls: "Clears the screen and resets the cursor position.",
      man: "Displays the manual page for a command. Usage: man <command>",
      trace: "Turns the OS trace on or off. Usage: trace <on | off>",
      rot13: "Does rot13 obfuscation on <string>. Usage: rot13 <string>",
      prompt: "Sets the prompt. Usage: prompt <string>",
      date: "Displays the current date",
      whereami: "Displays your current location",
      riddle: "Outputs a serious question. Make the right choice.",
      status: "Set a status to be displayed",
      load: "Load a program from user input and validate it to make sure that it only contains hex digits and spaces",
      bsod: "Manually trigger a blue screen that signifies an error",
      list: "List all the running processes and the corresponding IDS <string>.",
      kill: "Kills the specified process id <string>",
    };

    constructor() {
      super("Shell");
    }

    public init() {
      var sc: ShellCommand;
      //
      // Load the command list.

      // ver
      sc = new ShellCommand(
        this.shellVer,
        "ver",
        "- Display version and details."
      );
      this.commandList[this.commandList.length] = sc;

      // help
      sc = new ShellCommand(this.shellHelp, "help", "- Find help if you can.");
      this.commandList[this.commandList.length] = sc;

      // shutdown
      sc = new ShellCommand(
        this.shellShutdown,
        "shutdown",
        "- Shuts down the OS."
      );
      this.commandList[this.commandList.length] = sc;

      // cls
      sc = new ShellCommand(this.shellCls, "cls", "- Clears the screen.");
      this.commandList[this.commandList.length] = sc;

      // man <topic>
      sc = new ShellCommand(
        (args) => this.shellMan(args),
        "man",
        "<topic> - Displays the MANual page for <topic>."
      );
      this.commandList[this.commandList.length] = sc;

      // trace <on | off>
      sc = new ShellCommand(
        this.shellTrace,
        "trace",
        "- Turns the OS trace on or off."
      );
      this.commandList[this.commandList.length] = sc;

      // rot13 <string>
      sc = new ShellCommand(
        this.shellRot13,
        "rot13",
        "- Does rot13 obfuscation on <string>."
      );
      this.commandList[this.commandList.length] = sc;

      // prompt <string>
      sc = new ShellCommand(
        this.shellPrompt,
        "prompt",
        "<string> - Sets the prompt."
      );
      this.commandList[this.commandList.length] = sc;

      sc = new ShellCommand(
        this.shellDate,
        "date",
        " - Displays the current date."
      );
      this.commandList[this.commandList.length] = sc;

      sc = new ShellCommand(
        this.shellWhereAmI,
        "whereami",
        " - Displays your current location."
      );
      this.commandList[this.commandList.length] = sc;

      sc = new ShellCommand(this.shellRiddle, "riddle", " - Make your choice.");
      this.commandList[this.commandList.length] = sc;

      sc = new ShellCommand(this.shellStatus, "status", " - Set status.");
      this.commandList[this.commandList.length] = sc;

      sc = new ShellCommand(
        this.shellBSOD,
        "bsod",
        " - triggers a BSOD for testing"
      );
      this.commandList[this.commandList.length] = sc;

      sc = new ShellCommand(
        this.shellRun, // The run command
        "run", // Command name
        "<process_name> - Starts a new process."
      );
      this.commandList[this.commandList.length] = sc;

      sc = new ShellCommand(
        () => this.shellLoad(),
        "load",
        " - Load a user program"
      );
      this.commandList[this.commandList.length] = sc;

      sc = new ShellCommand(
        this.shellKill,
        "kill",
        "<string> - Kills the specificed process id."
      );
      this.commandList[this.commandList.length] = sc;
      // ps  - list the running processes and their IDs
      // new shell command
      sc = new ShellCommand(
        this.shellListPCB,
        "list",
        "<string> - List running processes."
      );
      this.commandList[this.commandList.length] = sc;

      // kill <id> - kills the specified process id.
      // new shell command

      // test new command functionalities
      // list + kill

      this.putPrompt(); // Display the initial prompt.
    }

    public putPrompt() {
      if (neOS.StdOut.currentXPosition !== 0) {
        neOS.StdOut.advanceLine(); // Only advance the line if we are not at the start
      }
      neOS.StdOut.putText(this.promptStr);
    }

    public handleInput(buffer: string) {
      if (buffer.trim() !== "") {
        this.commandHistory.push(buffer);
        this.historyPointer = this.commandHistory.length;
      }
      neOS.Kernel.krnTrace("Shell Command~" + buffer);
      if (neOS.waitingForRiddleAnswer) {
        this.checkRiddleAnswer(buffer);
        return;
      }
      //
      // Parse the input...
      if (buffer.trim() !== "") {
        this.commandHistory.push(buffer);
        this.historyPointer = this.commandHistory.length;
      }
      var userCommand = this.parseInput(buffer);
      // ... and assign the command and args to local variables.
      var cmd = userCommand.command;
      var args = userCommand.args;
      //
      // Determine the command and execute it.
      //
      // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
      // command list in attempt to find a match.
      // TODO: Is there a better way? Probably. Someone work it out and tell me in class.
      var index: number = 0;
      var found: boolean = false;
      var fn = undefined;
      while (!found && index < this.commandList.length) {
        if (this.commandList[index].command === cmd) {
          found = true;
          fn = this.commandList[index].func;
        } else {
          ++index;
        }
      }
      if (found) {
        this.execute(fn, args); // Note that args is always supplied, though it might be empty.
      } else {
        // It's not found, so check for curses and apologies before declaring the command invalid.
        if (this.curses.indexOf("[" + Utils.rot13(cmd) + "]") >= 0) {
          // Check for curses.
          this.execute(this.shellCurse);
        } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {
          // Check for apologies.
          this.execute(this.shellApology);
        } else {
          // It's just a bad command. {
          this.execute(this.shellInvalidCommand);
        }
      }
    }

    public handleArrowKeys(keyCode: number): void {
      if (keyCode === 38) {
        // Move up in the history if possible
        if (this.historyPointer > 0) {
          this.historyPointer--;
          neOS.Console.buffer = this.commandHistory[this.historyPointer];
          this.redrawInput();
        }
      } else if (keyCode === 40) {
        // Move down in the history if possible
        if (this.historyPointer < this.commandHistory.length - 1) {
          this.historyPointer++;
          neOS.Console.buffer = this.commandHistory[this.historyPointer];
          this.redrawInput();
        } else {
          neOS.Console.buffer = "";
          this.redrawInput();
        }
      }
    }
    private redrawInput(): void {
      neOS.Console.clearCurrentLine(); // Assuming you have a method to clear the current line
      neOS.StdOut.putText(this.promptStr);
      neOS.StdOut.putText(neOS.Console.buffer); // Draw the current buffer
    }

    // Note: args is an optional parameter, ergo the ? which allows TypeScript to understand that.
    public execute(fn, args?) {
      // We just got a command, so advance the line...
      // ... call the command function passing in the args with some über-cool functional programming ...
      fn(args);
      // Check to see if we need to advance the line again
      if (neOS.StdOut.currentXPosition > 0) {
        neOS.StdOut.advanceLine();
      }
      // ... and finally write the prompt again.
      this.putPrompt();
    }

    public parseInput(buffer: string): UserCommand {
      var retVal = new UserCommand();

      // 1. Remove leading and trailing spaces.
      buffer = Utils.trim(buffer);

      // 2. Lower-case it.
      buffer = buffer.toLowerCase();

      // 3. Separate on spaces so we can determine the command and command-line args, if any.
      var tempList = buffer.split(" ");

      // 4. Take the first (zeroth) element and use that as the command.
      var cmd = tempList.shift(); // Yes, you can do that to an array in JavaScript. See the Queue class.
      // 4.1 Remove any left-over spaces.
      cmd = Utils.trim(cmd);
      // 4.2 Record it in the return value.
      retVal.command = cmd;

      // 5. Now create the args array from what's left.
      for (var i in tempList) {
        var arg = Utils.trim(tempList[i]);
        if (arg != "") {
          retVal.args[retVal.args.length] = tempList[i];
        }
      }
      return retVal;
    }

    //
    // Shell Command Functions. Kinda not part of Shell() class exactly, but
    // called from here, so kept here to avoid violating the law of least astonishment.
    //
    public shellInvalidCommand() {
      neOS.StdOut.putText("Invalid Command. ");
      if (neOS.SarcasticMode) {
        neOS.StdOut.putText("Unbelievable. You, [subject name here],");
        neOS.StdOut.advanceLine();
        neOS.StdOut.putText("must be the pride of [subject hometown here].");
      } else {
        neOS.StdOut.putText("Type 'help' for, well... help.");
      }
    }

    public shellCurse() {
      neOS.StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
      neOS.StdOut.advanceLine();
      neOS.StdOut.putText("Bitch.");
      neOS.SarcasticMode = true;
    }

    public shellApology() {
      if (neOS.SarcasticMode) {
        neOS.StdOut.putText("I think we can put our differences behind us.");
        neOS.StdOut.advanceLine();
        neOS.StdOut.putText("For science . . . You monster.");
        neOS.SarcasticMode = false;
      } else {
        neOS.StdOut.putText("For what?");
      }
    }

    // Although args is unused in some of these functions, it is always provided in the
    // actual parameter list when this function is called, so I feel like we need it.

    public shellVer(args: string[]) {
      neOS.StdOut.advanceLine();
      neOS.StdOut.putText(APP_NAME + " version " + APP_VERSION);
      neOS.StdOut.advanceLine();
      neOS.StdOut.putText("Developed by: Neo Pi");
      neOS.StdOut.advanceLine();
      neOS.StdOut.putText("Course: CMPT 424 - Operating Systems");
    }

    public shellHelp(args: string[]) {
      neOS.StdOut.putText("Commands:");
      neOS.StdOut.advanceLine(); // Move to a new line for the list of commands.

      // Loop through each command in the commandList and print it without any extra lines.
      for (var i in neOS.OsShell.commandList) {
        const command = neOS.OsShell.commandList[i].command;
        const description = neOS.OsShell.commandList[i].description;

        // Debugging log to check if there are any unexpected characters
        console.log(`Command: ${command} | Description: ${description}`);

        // Combine the command and description, and print them on the same line.
        neOS.StdOut.putText(command + " " + description);

        // After printing the command and description, advance the line.
        neOS.StdOut.advanceLine();
      }
    }

    public shellShutdown(args: string[]) {
      neOS.StdOut.putText("Shutting down...");
      // Call Kernel shutdown routine.
      neOS.Kernel.krnShutdown();
      // TODO: Stop the final prompt from being displayed. If possible. Not a high priority. (Damn OCD!)
    }

    public shellCls(args: string[]) {
      neOS.StdOut.clearScreen();
      neOS.StdOut.resetXY();
    }

    public shellTrace(args: string[]) {
      if (args.length > 0) {
        var setting = args[0];
        switch (setting) {
          case "on":
            if (neOS.Trace && neOS.SarcasticMode) {
              neOS.StdOut.putText("Trace is already on, doofus.");
            } else {
              neOS.Trace = true;
              neOS.StdOut.putText("Trace ON");
            }
            break;
          case "off":
            neOS.Trace = false;
            neOS.StdOut.putText("Trace OFF");
            break;
          default:
            neOS.StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
        }
      } else {
        neOS.StdOut.putText("Usage: trace <on | off>");
      }
    }

    public shellRot13(args: string[]) {
      if (args.length > 0) {
        // Requires Utils.ts for rot13() function.
        neOS.StdOut.putText(
          args.join(" ") + " = '" + Utils.rot13(args.join(" ")) + "'"
        );
      } else {
        neOS.StdOut.putText("Usage: rot13 <string>  Please supply a string.");
      }
    }

    public shellPrompt(args: string[]) {
      if (args.length > 0) {
        neOS.OsShell.promptStr = args[0];
      } else {
        neOS.StdOut.putText("Usage: prompt <string>  Please supply a string.");
      }
    }

    public shellDate(args: string[]) {
      const currentDate = new Date().toLocaleString();
      neOS.StdOut.advanceLine();
      neOS.StdOut.putText("Current Date & Time: " + currentDate);
    }

    public shellWhereAmI(args: string[]) {
      neOS.StdOut.advanceLine();
      neOS.StdIn.putText("You are stuck in the Matrix.");
    }

    public shellRiddle(args: string[]) {
      const riddle = "Red or Blue pill?";
      neOS.StdOut.putText(riddle);
      neOS.StdOut.advanceLine();
      neOS.StdOut.putText("Type your answer:");
      neOS.StdOut.advanceLine();

      neOS.waitingForRiddleAnswer = true;
      neOS.correctAnswer = "red";
    }

    public checkRiddleAnswer(answer: string) {
      const trimmedAnswer = answer.toLowerCase().trim();

      // Check if the answer is valid
      if (trimmedAnswer === "red" || trimmedAnswer === "red pill") {
        neOS.StdOut.advanceLine();
        neOS.StdOut.putText("Good choice...");
      } else if (trimmedAnswer === "blue" || trimmedAnswer === "blue pill") {
        neOS.StdOut.advanceLine();
        this.showBluePillGiff();
      } else {
        // Handle invalid input
        neOS.StdOut.advanceLine();
        neOS.StdOut.putText("red or blue dumbass.");
        neOS.StdOut.advanceLine();
        this.putPrompt(); // Show the prompt again after an invalid response
        return; // Exit the function to avoid resetting the riddle state
      }

      // Reset state after a valid response
      neOS.waitingForRiddleAnswer = false;
      neOS.correctAnswer = "";
      this.putPrompt(); // Reset the prompt after the valid response
    }

    public shellStatus(args: string[]) {
      if (args.length > 0) {
        let statusMessage = args.join(" ");
        neOS.StatusMessage = statusMessage;
        neOS.StdOut.putText(`Status set to: ${statusMessage}`);

        // Manually update the taskbar element directly for testing
        document.getElementById("taskbar-status").textContent = statusMessage;
      } else {
        neOS.StdOut.putText(
          "Usage: status <string>. Please supply a status message."
        );
      }
    }

    public shellLoad() {
      const programInput = (
        document.getElementById("taProgramInput") as HTMLTextAreaElement
      ).value;

      // Validate that the input is a valid hexadecimal string
      const isValidHex = /^[0-9a-fA-F\s]+$/.test(programInput.trim());

      if (isValidHex) {
        const program =
          programInput.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) ||
          [];

        // Load the program starting at $0000 if available
        const { pid, baseAddress } = neOS.MemoryManager.storeProgram(program);

        if (pid >= 0) {
          // Create a new PCB (Process Control Block) and add it to the process list
          const pcb = new PCB(
            pid,
            baseAddress,
            baseAddress + program.length - 1,
            1,
            `Program_${pid}`
          );
          neOS.ProcessList.push(pcb); // Store the PCB in the process list
          neOS.StdOut.advanceLine();
          neOS.StdOut.putText(`Program loaded successfully with PID: ${pid}`);
        } else {
          neOS.StdOut.putText("Error: Not enough memory to load the program");
        }
      } else {
        neOS.StdOut.putText(
          "Invalid program. Please enter a valid hexadecimal string."
        );
      }
    }

    public shellBSOD(args: string[]) {
      neOS.Kernel.krnTrapError("Manual BSOD trigger.");
    }

    public shellListPCB(args: string[]) {
      if (neOS.ProcessList.length > 0) {
        neOS.StdOut.advanceLine();
        neOS.StdOut.putText("PID  \tBase  \tLimit  \tState");
        neOS.StdOut.advanceLine();
        for (let i = 0; i < neOS.ProcessList.length; i++) {
          const pcb = neOS.ProcessList[i];
          // Format base and limit as four-character hex strings with a leading '$'
          const base =
            "$" + pcb.base.toString(16).padStart(4, "0").toUpperCase();
          const limit =
            "$" + pcb.limit.toString(16).padStart(4, "0").toUpperCase();
          neOS.StdOut.putText(
            `${pcb.pid}   \t${base} \t${limit} \t${pcb.state}`
          );
          neOS.StdOut.advanceLine();
        }
      } else {
        neOS.StdOut.putText("No running Processes.");
      }
    }

    // new command
    public shellKill(args: string[]): void {
      if (args.length > 0) {
        const pid = parseInt(args[0], 10);
        const pcb = neOS.ProcessList.find((p) => p.pid === pid);

        if (pcb) {
          if (pcb.state === "Terminated") {
            neOS.StdOut.advanceLine();
            neOS.StdOut.putText(`Error: Process ${pid} already terminated.`);
          } else {
            pcb.state = "Terminated";
            neOS.StdOut.putText(`Process ${pid} terminated successfully.`);
            if (neOS.CurrentProcess && neOS.CurrentProcess.pid === pid) {
              neOS.CPU.isExecuting = false;
              neOS.CurrentProcess = null;
              neOS.StdOut.putText(
                `Process ${pid} was the running process and is now terminated.`
              );
            }
            // free memory associated with termianted process
            neOS.MemoryManager.freeProcessMemory(pid);
          }
        } else {
          neOS.StdOut.putText(`Error: No process found with PID ${pid}.`);
        }
      } else {
        neOS.StdOut.putText("Usage: kill <pid>. Please supply a PID.");
      }
    }

    public shellRun(args: string[]) {
      if (args.length > 0) {
        const pid = parseInt(args[0], 10);
        const pcb = neOS.ProcessList.find((p) => p.pid === pid);
    
        if (pcb) {
          if (pcb.state === "Terminated") {
            neOS.StdOut.advanceLine();
            neOS.StdOut.putText(`Error: Process ${pid} has already terminated.`);
          } else if (pcb.state === "Running") {
            neOS.StdOut.advanceLine();
            neOS.StdOut.putText(`Error: Process ${pid} is already running.`);
          } else {
            pcb.state = "Running";
            neOS.CurrentProcess = pcb;
            neOS.CPU.setPC(pcb.base);
            neOS.CPU.isExecuting = true;
            neOS.StdOut.advanceLine();
            neOS.StdOut.putText(`Process ${pid} is now running.`);
          }
        } else {
          neOS.StdOut.advanceLine();
          neOS.StdOut.putText(`Error: No process found with PID ${pid}`);
        }
      } else {
        neOS.StdOut.advanceLine();
        neOS.StdOut.putText("Usage: run <pid>");
      }
    }
    

    public shellMan(args: string[]) {
      if (args.length > 0) {
        var topic = Utils.trim(args[0].toLowerCase());
        if (this.detailedCommands[topic]) {
          neOS.StdOut.putText(this.detailedCommands[topic]);
        } else {
          neOS.StdOut.putText("No manual entry for " + topic + ".");
        }
      } else {
        neOS.StdOut.putText("Usage: man <topic>. Please supply a topic.");
      }
    }

    public handleTabCompletion(): void {
      const input = neOS.Console.buffer.trim();

      // If the input is not empty, find matching commands
      if (input.length > 0) {
        this.tabCompletionMatches = this.commandList
          .map((cmd) => cmd.command)
          .filter((command) => command.startsWith(input));

        // If there are multiple matches, show them
        if (this.tabCompletionMatches.length > 1) {
          neOS.StdOut.advanceLine();
          neOS.StdOut.putText(this.tabCompletionMatches.join(", "));
          neOS.StdOut.advanceLine();
          this.putPrompt();
          this.redrawInput();
          return; // Don't autocomplete, just show the possible matches
        }
        // If there's exactly one match, autocomplete the command
        else if (this.tabCompletionMatches.length === 1) {
          neOS.Console.buffer = this.tabCompletionMatches[0];
          this.redrawInput();
        }
      }
    }

    private showBluePillGiff() {
      console.log("displaying blue pill gif");
      const gifContainer = document.getElementById("bluePillGif");
      gifContainer.style.display = "flex";
    }
  }
}

// code tutor gpt
