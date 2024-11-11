/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */
// TODO: Write a base class / prototype for system services and let Shell inherit from it.
var TSOS;
(function (TSOS) {
    class SystemService {
        name;
        status;
        constructor(name) {
            this.name = name;
            this.status = "stopped";
        }
        start() {
            this.status = "running";
            neOS.StdOut.putText(`${this.name} service started.`);
        }
        stop() {
            this.status = "stopped";
            neOS.StdOut.putText(`${this.name} service stopped.`);
        }
        log(msg) {
            neOS.StdOut.putText(`${this.name}: ${msg}`);
        }
        handleError(msg) {
            neOS.StdOut.putText(`Error in ${this.name}: ${msg}`);
            this.stop();
        }
    }
    TSOS.SystemService = SystemService;
})(TSOS || (TSOS = {}));
(function (TSOS) {
    class Shell extends TSOS.SystemService {
        //properties for tab completion of similar letters
        lastTabInput = "";
        tabCompletionMatches = [];
        tabCompletionPointer = 0;
        //properties for tab completion
        commandHistory = [];
        historyPointer = -1;
        // Properties
        promptStr = ">";
        commandList = [];
        curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
        apologies = "[sorry]";
        detailedCommands = {
            help: "Help displays a list of all available commands",
            ver: "Displays version data and personal details (name/course).",
            shutdown: "Shuts down the virtual OS but leaves the underlying host / hardware simulation running.",
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
        init() {
            var sc;
            //
            // Load the command list.
            // ver
            sc = new TSOS.ShellCommand(this.shellVer, "ver", "- Display version and details.");
            this.commandList[this.commandList.length] = sc;
            // help
            sc = new TSOS.ShellCommand(this.shellHelp, "help", "- Find help if you can.");
            this.commandList[this.commandList.length] = sc;
            // shutdown
            sc = new TSOS.ShellCommand(this.shellShutdown, "shutdown", "- Shuts down the OS.");
            this.commandList[this.commandList.length] = sc;
            // cls
            sc = new TSOS.ShellCommand(this.shellCls, "cls", "- Clears the screen.");
            this.commandList[this.commandList.length] = sc;
            // man <topic>
            sc = new TSOS.ShellCommand((args) => this.shellMan(args), "man", "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;
            // trace <on | off>
            sc = new TSOS.ShellCommand(this.shellTrace, "trace", "- Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;
            // rot13 <string>
            sc = new TSOS.ShellCommand(this.shellRot13, "rot13", "- Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;
            // prompt <string>
            sc = new TSOS.ShellCommand(this.shellPrompt, "prompt", "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellDate, "date", " - Displays the current date.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellWhereAmI, "whereami", " - Displays your current location.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellRiddle, "riddle", " - Make your choice.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellStatus, "status", " - Set status.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellBSOD, "bsod", " - triggers a BSOD for testing");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellRun, // The run command
            "run", // Command name
            "<process_name> - Starts a new process.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(() => this.shellLoad(), "load", " - Load a user program");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellKill, "kill", "<string> - Kills the specificed process id.");
            this.commandList[this.commandList.length] = sc;
            // ps  - list the running processes and their IDs
            // new shell command
            sc = new TSOS.ShellCommand(this.shellListPCB, "list", "<string> - List running processes.");
            this.commandList[this.commandList.length] = sc;
            // kill <id> - kills the specified process id.
            // new shell command
            // test new command functionalities
            // list + kill
            this.putPrompt(); // Display the initial prompt.
        }
        putPrompt() {
            if (neOS.StdOut.currentXPosition !== 0) {
                neOS.StdOut.advanceLine(); // Only advance the line if we are not at the start
            }
            neOS.StdOut.putText(this.promptStr);
        }
        handleInput(buffer) {
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
            var index = 0;
            var found = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                }
                else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args); // Note that args is always supplied, though it might be empty.
            }
            else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + TSOS.Utils.rot13(cmd) + "]") >= 0) {
                    // Check for curses.
                    this.execute(this.shellCurse);
                }
                else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {
                    // Check for apologies.
                    this.execute(this.shellApology);
                }
                else {
                    // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        }
        handleArrowKeys(keyCode) {
            if (keyCode === 38) {
                // Move up in the history if possible
                if (this.historyPointer > 0) {
                    this.historyPointer--;
                    neOS.Console.buffer = this.commandHistory[this.historyPointer];
                    this.redrawInput();
                }
            }
            else if (keyCode === 40) {
                // Move down in the history if possible
                if (this.historyPointer < this.commandHistory.length - 1) {
                    this.historyPointer++;
                    neOS.Console.buffer = this.commandHistory[this.historyPointer];
                    this.redrawInput();
                }
                else {
                    neOS.Console.buffer = "";
                    this.redrawInput();
                }
            }
        }
        redrawInput() {
            neOS.Console.clearCurrentLine(); // Assuming you have a method to clear the current line
            neOS.StdOut.putText(this.promptStr);
            neOS.StdOut.putText(neOS.Console.buffer); // Draw the current buffer
        }
        // Note: args is an optional parameter, ergo the ? which allows TypeScript to understand that.
        execute(fn, args) {
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
        parseInput(buffer) {
            var retVal = new TSOS.UserCommand();
            // 1. Remove leading and trailing spaces.
            buffer = TSOS.Utils.trim(buffer);
            // 2. Lower-case it.
            buffer = buffer.toLowerCase();
            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");
            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift(); // Yes, you can do that to an array in JavaScript. See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = TSOS.Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;
            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = TSOS.Utils.trim(tempList[i]);
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
        shellInvalidCommand() {
            neOS.StdOut.putText("Invalid Command. ");
            if (neOS.SarcasticMode) {
                neOS.StdOut.putText("Unbelievable. You, [subject name here],");
                neOS.StdOut.advanceLine();
                neOS.StdOut.putText("must be the pride of [subject hometown here].");
            }
            else {
                neOS.StdOut.putText("Type 'help' for, well... help.");
            }
        }
        shellCurse() {
            neOS.StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            neOS.StdOut.advanceLine();
            neOS.StdOut.putText("Bitch.");
            neOS.SarcasticMode = true;
        }
        shellApology() {
            if (neOS.SarcasticMode) {
                neOS.StdOut.putText("I think we can put our differences behind us.");
                neOS.StdOut.advanceLine();
                neOS.StdOut.putText("For science . . . You monster.");
                neOS.SarcasticMode = false;
            }
            else {
                neOS.StdOut.putText("For what?");
            }
        }
        // Although args is unused in some of these functions, it is always provided in the
        // actual parameter list when this function is called, so I feel like we need it.
        shellVer(args) {
            neOS.StdOut.advanceLine();
            neOS.StdOut.putText(neOS.APP_NAME + " version " + APP_VERSION);
            neOS.StdOut.advanceLine();
            neOS.StdOut.putText("Developed by: Neo Pi");
            neOS.StdOut.advanceLine();
            neOS.StdOut.putText("Course: CMPT 424 - Operating Systems");
        }
        shellHelp(args) {
            neOS.StdOut.putText("Commands:");
            neOS.StdOut.advanceLine(); // Move to a new line for the list of commands.
            // Loop through each command in the commandList and print it without any extra lines.
            for (var i in neOS.OsShell.commandList) {
                const command = neOS.OsShell.commandList[i].command;
                const description = neOS.OsShell.commandList[i].description;
                // Combine the command and description, and print them on the same line.
                neOS.StdOut.putText(command + " " + description);
                // After printing the command and description, advance the line.
                neOS.StdOut.advanceLine();
            }
        }
        shellShutdown(args) {
            neOS.StdOut.putText("Shutting down...");
            // Call Kernel shutdown routine.
            neOS.Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed. If possible. Not a high priority. (Damn OCD!)
        }
        shellCls(args) {
            neOS.StdOut.clearScreen();
            neOS.StdOut.resetXY();
        }
        shellTrace(args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (neOS.Trace && neOS.SarcasticMode) {
                            neOS.StdOut.putText("Trace is already on, doofus.");
                        }
                        else {
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
            }
            else {
                neOS.StdOut.putText("Usage: trace <on | off>");
            }
        }
        shellRot13(args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                neOS.StdOut.putText(args.join(" ") + " = '" + TSOS.Utils.rot13(args.join(" ")) + "'");
            }
            else {
                neOS.StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }
        shellPrompt(args) {
            if (args.length > 0) {
                neOS.OsShell.promptStr = args[0];
            }
            else {
                neOS.StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }
        shellDate(args) {
            const currentDate = new Date().toLocaleString();
            neOS.StdOut.advanceLine();
            neOS.StdOut.putText("Current Date & Time: " + currentDate);
        }
        shellWhereAmI(args) {
            neOS.StdOut.advanceLine();
            neOS.StdIn.putText("You are stuck in the Matrix.");
        }
        shellRiddle(args) {
            const riddle = "Red or Blue pill?";
            neOS.StdOut.putText(riddle);
            neOS.StdOut.advanceLine();
            neOS.StdOut.putText("Type your answer:");
            neOS.StdOut.advanceLine();
            neOS.waitingForRiddleAnswer = true;
            neOS.correctAnswer = "red";
        }
        checkRiddleAnswer(answer) {
            const trimmedAnswer = answer.toLowerCase().trim();
            // Check if the answer is valid
            if (trimmedAnswer === "red" || trimmedAnswer === "red pill") {
                neOS.StdOut.advanceLine();
                neOS.StdOut.putText("Good choice...");
            }
            else if (trimmedAnswer === "blue" || trimmedAnswer === "blue pill") {
                neOS.StdOut.advanceLine();
                this.showBluePillGiff();
            }
            else {
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
        shellStatus(args) {
            if (args.length > 0) {
                let statusMessage = args.join(" ");
                neOS.StatusMessage = statusMessage;
                neOS.StdOut.putText(`Status set to: ${statusMessage}`);
                // Manually update the taskbar element directly for testing
                document.getElementById("taskbar-status").textContent = statusMessage;
            }
            else {
                neOS.StdOut.putText("Usage: status <string>. Please supply a status message.");
            }
        }
        shellLoad() {
            const programInput = document.getElementById("taProgramInput").value.trim();
            const isValidHex = /^[0-9a-fA-F\s]+$/.test(programInput);
            if (isValidHex) {
                const programBytes = programInput.replace(/\s+/g, "").match(/.{1,2}/g);
                if (programBytes) {
                    const program = programBytes.map((byte) => parseInt(byte, 16));
                    const { pid } = neOS.MemoryManager.storeProgram(program);
                    if (pid >= 0) {
                        // Retrieve the newly created PCB from the residentQueue
                        const newPCB = neOS.residentQueue.find((p) => p.pid === pid);
                        if (newPCB) {
                            neOS.CurrentProcess = newPCB;
                            neOS.ProcessList.push(newPCB); // Add to the global ProcessList
                            console.log("Current Process set:", neOS.CurrentProcess);
                            console.log("Base Address:", neOS.CurrentProcess.base);
                            console.log("Limit Address:", neOS.CurrentProcess.limit);
                        }
                        TSOS.Control.updatePCBDisplay();
                        neOS.StdOut.putText(`Program loaded with PID ${pid}`);
                    }
                    else {
                        neOS.StdOut.putText("Error: Could not load the program into memory.");
                    }
                }
            }
            else {
                neOS.StdOut.putText("Error: Invalid hexadecimal input.");
            }
        }
        shellBSOD(args) {
            neOS.Kernel.krnTrapError("Manual BSOD trigger.");
        }
        shellListPCB(args) {
            if (neOS.ProcessList.length > 0) {
                neOS.StdOut.advanceLine();
                neOS.StdOut.putText("PID  \tBase  \tLimit  \tState");
                neOS.StdOut.advanceLine();
                for (let i = 0; i < neOS.ProcessList.length; i++) {
                    const pcb = neOS.ProcessList[i];
                    // Format base and limit as four-character hex strings with a leading '$'
                    const base = "$" + pcb.base.toString(16).padStart(4, "0").toUpperCase();
                    const limit = "$" + pcb.limit.toString(16).padStart(4, "0").toUpperCase();
                    neOS.StdOut.putText(`${pcb.pid}   \t${base} \t${limit} \t${pcb.state}`);
                    neOS.StdOut.advanceLine();
                }
            }
            else {
                neOS.StdOut.advanceLine();
                neOS.StdOut.putText("No running Processes.");
            }
        }
        shellRun(args) {
            if (args.length > 0) {
                const pid = parseInt(args[0], 10);
                const pcb = neOS.residentQueue.find((p) => p.pid === pid);
                if (pcb) {
                    if (pcb.state === "Terminated") {
                        neOS.StdOut.putText(`Error: Process ${pid} has already terminated.`);
                    }
                    else if (pcb.state === "Running") {
                        neOS.StdOut.putText(`Error: Process ${pid} is already running.`);
                    }
                    else {
                        // Set the process to "Running"
                        neOS.CurrentProcess = pcb;
                        // Set the process state to "Running"
                        pcb.state = "Running";
                        // Set CPU registers to match the PCB
                        neOS.CPU.PC = pcb.pc;
                        neOS.CPU.Acc = pcb.acc;
                        neOS.CPU.Xreg = pcb.xReg;
                        neOS.CPU.Yreg = pcb.yReg;
                        neOS.CPU.Zflag = pcb.zFlag;
                        neOS.CPU.isExecuting = true;
                        neOS.StdOut.putText(`Process ${pid} is now running.`);
                    }
                }
                else {
                    neOS.StdOut.putText(`Error: No process found with PID ${pid}`);
                }
            }
            else {
                neOS.StdOut.putText("Usage: run <pid>");
            }
        }
        shellRunAll(args) {
            while (!neOS.residentQueue.isEmpty()) {
                const pcb = neOS.residentQueue.dequeue();
                pcb.state = "ready";
                neOS.readyQueue.enqueue(pcb);
            }
            neOS.Scheduler.schedule();
        }
        shellPS(args) {
            neOS.StdOut.advanceLine();
            neOS.readyQueue.forEach((pcb) => {
                neOS.StdOut.putText(`PID: ${pcb.pid}, State: ${pcb.state}`);
                neOS.StdOut.advanceLine();
            });
        }
        shellKill(args) {
            const pid = parseInt(args[0]);
            const pcb = neOS.ProcessList.find((p) => p.pid === pid);
            if (pcb) {
                pcb.state = "Terminated";
                neOS.CPU.isExecuting = false;
                neOS.StdOut.putText(`Process ${pid} killed.`);
            }
            else {
                neOS.StdOut.putText(`No process found with PID ${pid}.`);
            }
            TSOS.Control.updatePCBDisplay();
        }
        shellQuantum(args) {
            const newQuantum = parseInt(args[0]);
            if (newQuantum > 0) {
                neOS.Scheduler.defaultQuantum = newQuantum;
                neOS.StdOut.putText(`Quantum set to ${newQuantum} cycles.`);
            }
            else {
                neOS.StdOut.putText("Invalid quantum value.");
            }
        }
        shellMan(args) {
            if (args.length > 0) {
                var topic = TSOS.Utils.trim(args[0].toLowerCase());
                if (this.detailedCommands[topic]) {
                    neOS.StdOut.putText(this.detailedCommands[topic]);
                }
                else {
                    neOS.StdOut.putText("No manual entry for " + topic + ".");
                }
            }
            else {
                neOS.StdOut.putText("Usage: man <topic>. Please supply a topic.");
            }
        }
        handleTabCompletion() {
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
        showBluePillGiff() {
            console.log("displaying blue pill gif");
            const gifContainer = document.getElementById("bluePillGif");
            gifContainer.style.display = "flex";
        }
    }
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));
// code tutor gpt
//# sourceMappingURL=shell.js.map