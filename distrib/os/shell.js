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
            rot13: "Does rot13 obfuscatuion on <string>. Usage: rot13 <string>",
            prompt: "Sets the prompt. Usage: promt <string>",
            date: "Displays the current date",
            whereami: "Dispalys your current location",
            riddle: "Outputs a serious question. Make the right choice.",
            status: "Set a status to be displayed",
            load: "Load a program from user input and validate it to make sure that it only contains hex digits and spaces",
            list: "List all the running processes and the corresponding IDS <string>.",
            kill: "Kills the specificed process id <string>",
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
            sc = new TSOS.ShellCommand(() => this.shellLoad(), "load", " - Load a user program");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellBSOD, 'bsod', ' - triggers a BSOD for testing');
            this.commandList[this.commandList.length] = sc;
            this.putPrompt();
            sc = new TSOS.ShellCommand(this.shellList, "list", "<string> - List running processes and their IDS <string>.");
            this.commandList[this.commandList.length] = sc;
            // ps  - list the running processes and their IDs
            // new shell command
            sc = new TSOS.ShellCommand(this.shellKill, "kill", "<string> - Kills the specificed process id <string>.");
            this.commandList[this.commandList.length] = sc;
            // kill <id> - kills the specified process id.
            // new shell command
            /*
            sc = new ShellCommand(
              this.shellRun,
              "run",
              "<process_name> - Starts a new process with the given name."
            );
            this.commandList[this.commandList.length] = sc;
            */
            // test new command functionalities
            // list + kill
            this.putPrompt(); // Display the initial prompt.
        }
        putPrompt() {
            neOS.StdOut.putText(this.promptStr);
        }
        handleInput(buffer) {
            neOS.Kernel.krnTrace("Shell Command~" + buffer);
            if (neOS.waitingForRiddleAnswer) {
                this.checkRiddleAnswer(buffer);
                return;
            }
            //
            // Parse the input...
            //
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
        // Note: args is an optional parameter, ergo the ? which allows TypeScript to understand that.
        execute(fn, args) {
            // We just got a command, so advance the line...
            neOS.StdOut.advanceLine();
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
            neOS.StdOut.putText(APP_NAME + " version " + APP_VERSION);
            neOS.StdOut.advanceLine();
            neOS.StdOut.putText("Developed by: Neo Pi");
            neOS.StdOut.advanceLine();
            neOS.StdOut.putText("Course: CMPT 424 - Operating Systems");
        }
        shellHelp(args) {
            neOS.StdOut.putText("Commands:");
            for (var i in neOS.OsShell.commandList) {
                neOS.StdOut.advanceLine();
                neOS.StdOut.putText("  " +
                    neOS.OsShell.commandList[i].command +
                    " " +
                    neOS.OsShell.commandList[i].description);
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
            neOS.StdOut.putText("Current Date & Time: " + currentDate);
        }
        shellWhereAmI(args) {
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
            if (trimmedAnswer === "red" ||
                trimmedAnswer === "red pill" ||
                trimmedAnswer === "blue" ||
                trimmedAnswer === "blue pill") {
                neOS.StdOut.advanceLine();
                if (trimmedAnswer === "red" || trimmedAnswer === "red pill") {
                    neOS.StdOut.putText("Good choice...");
                }
                else {
                    neOS.StdOut.putText("Wrong, wrong, and WRONG");
                }
            }
            neOS.StdOut.advanceLine();
            neOS.waitingForRiddleAnswer = false;
            neOS.correctAnswer = "";
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
            // Assuming the input is fetched from a text area on the HTML page
            const programInput = document.getElementById("taProgramInput").value;
            // Validate that the input is a valid hexadecimal string
            const isValidHex = /^[0-9a-fA-F\s]+$/.test(programInput.trim());
            if (isValidHex) {
                neOS.StdOut.putText("Program loaded successfully.");
                // Here you could also implement storing the program in memory if required
                // e.g., neOS.MemoryManager.storeProgram(programInput);
            }
            else {
                neOS.StdOut.putText("Invalid program. Please enter a valid hexadecimal string.");
            }
        }
        shellBSOD(args) {
            neOS.Kernel.krnTrapError("Manual BSOD trigger.");
        }
        shellList(args) {
            if (neOS.ProcessList.length > 0) {
                neOS.StdOut.putText("PID \tProcess Name");
                neOS.StdOut.advanceLine();
                for (let i = 0; i < neOS.ProcessList.length; i++) {
                    neOS.StdOut.putText(neOS.ProcessList[i].pid + "   \t" + neOS.ProcessList[i].name);
                    neOS.StdOut.advanceLine();
                }
            }
            else {
                neOS.StdOut.putText("No running Processes.");
            }
        } // new command
        shellKill(args) {
            // add new shell command functionalities
        }
        shellRun(args) {
            if (args.length > 0) {
                const processName = args[0];
                neOS.Kernel.startNewProcess(processName);
                neOS.StdOut.advanceLine();
                neOS.StdOut.putText(`Process "${processName}" started.`);
            }
            else {
                neOS.StdOut.putText("Usage: run <process_name>");
            }
        }
        shellMan(args) {
            if (args.length > 0) {
                var topic = TSOS.Utils.trim(args[0].toLowerCase()); // Trim and lowercase the argument
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
    }
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));
// code tutor gpt
//# sourceMappingURL=shell.js.map