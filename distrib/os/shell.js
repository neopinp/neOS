/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */
// TODO: Write a base class / prototype for system services and let Shell inherit from it.
var TSOS;
(function (TSOS) {
    class Shell {
        //properties for tab completion of similar letters
        tabCompletionMatches = [];
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
            sc = new TSOS.ShellCommand(this.shellKill, "kill", "<pid> - Kills the specificed process id.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellKillAll, "killall", "- Kills all the processes");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellPS, "ps", "<string> - List running processes.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellClearem, "clearem", "<string> - clear all memory segments");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellQuantum, "quantum", "<string> - set quantum");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellRunAll, "runall", "<string> - run all ready processes");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellFormat, "format", "- Initalize all blocks in all sectors/tracks");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellCreate, "create", "- Create the file <filename>");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellRead, "read", "- Read and display the contents of filename");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellWrite, "write", "- Write <filename> 'data'");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellDelete, "delete", "- Remove <filename> from storage");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellCopy, "copy", "- <current filename> <new filename> - copy");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellRename, "rename", "- <current filename> <new filename> - rename");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellLs, "ls", "- list the files that are currently stored on the disk ");
            this.commandList[this.commandList.length] = sc;
            // ps  - list the running processes and their IDs
            // new shell command
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
            neOS.StdOut.advanceLine();
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
                neOS.StdIn.advanceLine();
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
                    if (neOS.MemoryManager.isMemoryFull()) {
                        console.log("Memory is full. Attempting to store program on disk.");
                        const programId = neOS.DiskDriver.allocateBlocksForProgram(program.map((byte) => byte.toString(16).padStart(2, "0")));
                        if (programId >= 0) {
                            const allocation = neOS.DiskDriver.programAllocation.find((entry) => entry.programId === programId);
                            const blocks = allocation ? allocation.blocks : [];
                            console.log(`Program stored on disk with Program ID ${programId} in blocks: [${blocks.join(", ")}]`);
                            const newPCB = new TSOS.PCB(programId, 0, 0, 1, "Disk", -1);
                            newPCB.state = "Resident";
                            neOS.residentQueue.enqueue(newPCB);
                            neOS.ProcessList.push(newPCB);
                            TSOS.Control.updatePCBDisplay();
                            neOS.StdOut.advanceLine();
                        }
                        else {
                            console.error("Disk is full. Could not store the program.");
                            neOS.StdOut.putText("Error: Could not load the program. Disk is full.");
                        }
                    }
                    else {
                        console.log("Memory has space. Storing program in memory.");
                        const { pid } = neOS.MemoryManager.storeProgram(program);
                        if (pid >= 0) {
                            const newPCB = neOS.residentQueue.find((p) => p.pid === pid);
                            if (newPCB) {
                                neOS.CurrentProcess = newPCB;
                                neOS.ProcessList.push(newPCB);
                                console.log(`Program loaded to memory with PID: ${pid}, Base: ${newPCB.base}, Limit: ${newPCB.limit}`);
                            }
                            TSOS.Control.updatePCBDisplay();
                            neOS.StdOut.advanceLine();
                            neOS.StdOut.putText(`Program loaded with PID ${pid}`);
                        }
                        else {
                            console.error("Failed to store the program in memory.");
                            neOS.StdOut.putText("Error: Could not load the program into memory.");
                        }
                    }
                }
            }
            else {
                neOS.StdOut.putText("Error: Invalid hexadecimal input.");
            }
        }
        shellBSOD() {
            neOS.Kernel.krnTrapError("Manual BSOD trigger.");
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
                        neOS.CPU.Acc = pcb.acc;
                        neOS.CPU.Xreg = pcb.xReg;
                        neOS.CPU.Yreg = pcb.yReg;
                        neOS.CPU.Zflag = pcb.zFlag;
                        neOS.CPU.isExecuting = true;
                        neOS.StdOut.advanceLine();
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
        shellPS(args) {
            if (neOS.ProcessList.length > 0) {
                neOS.StdOut.advanceLine();
                neOS.StdOut.putText("PID  \tBase  \tLimit  \tState");
                neOS.StdOut.advanceLine();
                for (let i = 0; i < neOS.ProcessList.length; i++) {
                    const pcb = neOS.ProcessList[i];
                    const base = "$" + pcb.base.toString(16).padStart(4, "0").toUpperCase();
                    const limit = "$" + pcb.limit.toString(16).padStart(4, "0").toUpperCase();
                    neOS.StdOut.putText(`${pcb.pid}   \t${base} \t${limit} \t${pcb.state}`);
                    neOS.StdOut.advanceLine();
                }
            }
            else {
                neOS.StdOut.advanceLine();
                neOS.StdOut.putText("No running processes.");
            }
        }
        shellClearem() {
            neOS.StdOut.advanceLine();
            neOS.StdOut.putText(`Clearing all memory segments...`);
            // Clear all processes and reset memory
            neOS.ProcessList.forEach((pcb) => {
                neOS.MemoryManager.freeProcessMemory(pcb.pid);
                pcb.state = "Terminated";
            });
            neOS.ProcessList = [];
            TSOS.Control.updatePCBDisplay();
            TSOS.Control.displayMemory();
            neOS.StdOut.putText("Memory cleared.");
        }
        shellKill(args) {
            const pid = parseInt(args[0]);
            const pcb = neOS.ProcessList.find((p) => p.pid === pid);
            if (pcb) {
                pcb.state = "Terminated";
                neOS.CPU.isExecuting = false;
                neOS.StdIn.advanceLine();
                neOS.StdOut.putText(`Process ${pid} killed.`);
            }
            else {
                neOS.StdIn.advanceLine();
                neOS.StdOut.putText(`No process found with PID ${pid}.`);
            }
            TSOS.Control.updatePCBDisplay();
        }
        shellRunAll() {
            while (!neOS.residentQueue.isEmpty()) {
                const pcb = neOS.residentQueue.dequeue();
                pcb.state = "Ready";
                neOS.readyQueue.enqueue(pcb);
            }
            TSOS.Control.updatePCBDisplay();
            neOS.CurrentProcess = null;
            neOS.Scheduler.scheduleNextProcess();
            neOS.StdIn.advanceLine();
            neOS.StdOut.putText("All processes are now running.");
        }
        shellKillAll() {
            neOS.ProcessList.forEach((pcb) => {
                pcb.state = "Terminated";
                neOS.CPU.isExecuting = false;
            });
            TSOS.Control.updatePCBDisplay();
            neOS.StdOut.advanceLine();
            neOS.StdOut.putText("All Processes Terminated");
        }
        shellQuantum(args) {
            const newQuantum = parseInt(args[0]);
            if (newQuantum > 0) {
                neOS.Scheduler.defaultQuantum = newQuantum;
                neOS.StdIn.advanceLine();
                neOS.StdOut.putText(`Quantum set to ${newQuantum} cycles.`);
                TSOS.Control.updatePCBDisplay();
            }
            else {
                neOS.StdIn.advanceLine();
                neOS.StdOut.putText("Invalid quantum value.");
            }
            TSOS.Control.updatePCBDisplay();
        }
        shellFormat() {
            neOS.DiskDriver.initializeDisk(true);
            console.log("Disk formatted successfully.");
            TSOS.Control.updateDiskDisplay();
        }
        shellCreate(args) {
            const filename = args[0];
            if (!filename) {
                neOS.StdOut.putText("Error: Filename is required.");
                return;
            }
            if (neOS.DiskDriver.createFile(filename)) {
                neOS.DiskDriver.listofFiles.push(filename);
                console.log(neOS.DiskDriver.listofFiles);
                neOS.StdOut.advanceLine();
                neOS.StdOut.putText(`File '${filename}' created successfully.`);
            }
            else {
                neOS.StdOut.putText(`Error: Could not create file '${filename}'.`);
            }
            TSOS.Control.updateDiskDisplay();
        }
        shellRead(args) {
            const filename = args[0];
            console.log(`Starting to read file: "${filename}"`);
            let currentBlockIndex = neOS.DiskDriver.findBlockByFileName(filename);
            if (currentBlockIndex === -1) {
                console.error(`Error: File '${filename}' not found or has no content.`);
                return null;
            }
            let content = "";
            while (currentBlockIndex !== -1) {
                const blockData = neOS.DiskDriver.readBlock(currentBlockIndex);
                console.log(`Reading from block ${currentBlockIndex}: "${blockData.trim()}"`);
                content += blockData.slice(3).trim(); // Skip the pointer
                const nextPointer = blockData.slice(0, 3).trim();
                currentBlockIndex =
                    nextPointer === "---" ? -1 : parseInt(nextPointer, 10);
                console.log(`Next block pointer: "${nextPointer}", Next block index: ${currentBlockIndex}`);
            }
            console.log(`File '${filename}' read successfully. Content: "${content}"`);
            neOS.StdOut.advanceLine();
            neOS.StdOut.putText(content);
            return content;
        }
        shellWrite(args) {
            const filename = args[0];
            const data = args.slice(1).join(" ").replace(/^"|"$/g, ""); // Remove quotes from data
            if (!filename || !data) {
                neOS.StdOut.putText("Error: Filename and data are required.");
                return;
            }
            if (neOS.DiskDriver.writeToFile(filename, data)) {
                neOS.StdOut.advanceLine();
                neOS.StdOut.putText(`Data written to file '${filename}' successfully.`);
            }
            else {
                neOS.StdOut.putText(`Error: Could not write to file '${filename}'.`);
            }
            TSOS.Control.updateDiskDisplay();
        }
        shellDelete(args) {
            const filename = args[0];
            if (!filename) {
                neOS.StdOut.putText("Error: Filename is required.");
                return;
            }
            if (neOS.DiskDriver.deleteFile(filename)) {
                neOS.StdOut.putText(`File '${filename}' deleted successfully.`);
            }
            else {
                neOS.StdOut.putText(`Error: Could not delete file '${filename}'.`);
            }
            TSOS.Control.updateDiskDisplay();
        }
        shellCopy(args) {
            const sourceFile = args[0];
            const targetFile = args[1];
            if (!sourceFile || !targetFile) {
                neOS.StdOut.putText("Error: Source and target filenames are required.");
                return;
            }
            if (neOS.DiskDriver.copyFile(sourceFile, targetFile)) {
                neOS.StdOut.putText(`File '${sourceFile}' copied to '${targetFile}' successfully.`);
            }
            else {
                neOS.StdOut.putText(`Error: Could not copy file '${sourceFile}'.`);
            }
            TSOS.Control.updateDiskDisplay();
        }
        shellRename(args) {
            const oldName = args[0];
            const newName = args[1];
            if (!oldName || !newName) {
                neOS.StdOut.putText("Error: Current and new filenames are required.");
                return;
            }
            if (neOS.DiskDriver.renameFile(oldName, newName)) {
                neOS.StdOut.putText(`File '${oldName}' renamed to '${newName}' successfully.`);
            }
            else {
                neOS.StdOut.putText(`Error: Could not rename file '${oldName}'.`);
            }
            TSOS.Control.updateDiskDisplay();
        }
        shellLs() {
            const files = neOS.DiskDriver.listFiles();
            if (files !== "") {
                neOS.StdOut.advanceLine();
                neOS.StdOut.putText("Files: " + files);
            }
            else {
                neOS.StdOut.putText("No files found on the disk.");
            }
            TSOS.Control.updateDiskDisplay();
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