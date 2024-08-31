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
    // Properties
    public promptStr = ">";
    public commandList = [];
    public curses =
      "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
    public apologies = "[sorry]";

    constructor() {
      super("Shell");
    }

    public init() {
      var sc: ShellCommand;
      //
      // Load the command list.

      // ver
      sc = new ShellCommand(this.shellVer, "ver", "- Display current version.");
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
        "Turns the OS trace on or off."
      );
      this.commandList[this.commandList.length] = sc;

      // rot13 <string>
      sc = new ShellCommand(
        this.shellRot13,
        "rot13",
        "Does rot13 obfuscation on <string>."
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
        this.shellList,
        "list",
        "<string> - List running processes and their IDS <string>."
      );
      this.commandList[this.commandList.length] = sc;
      // ps  - list the running processes and their IDs
      // new shell command

      sc = new ShellCommand(
        this.shellKill,
        "kill",
        "<string> - Kills the specificed process id <string>."
      );
      this.commandList[this.commandList.length] = sc;
      // kill <id> - kills the specified process id.
      // new shell command

      this.putPrompt(); // Display the initial prompt.
    }

    public putPrompt() {
      neOS.StdOut.putText(this.promptStr);
    }

    public handleInput(buffer) {
      neOS.Kernel.krnTrace("Shell Command~" + buffer);
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

    // Note: args is an optional parameter, ergo the ? which allows TypeScript to understand that.
    public execute(fn, args?) {
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
      neOS.StdOut.putText(APP_NAME + " version " + APP_VERSION);
    }

    public shellHelp(args: string[]) {
      neOS.StdOut.putText("Commands:");
      for (var i in neOS.OsShell.commandList) {
        neOS.StdOut.advanceLine();
        neOS.StdOut.putText(
          "  " +
            neOS.OsShell.commandList[i].command +
            " " +
            neOS.OsShell.commandList[i].description
        );
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

    public shellList(args: string[]) {
      // add new shell command functionalities
    }

    public shellKill(args: string[]) {
      // add new shell command functionalities
    }
    public detailedCommands = {
      help: "Help displays a list of all available commands",
      ver: "Displays the current version data.",
      shutdown:
        "Shuts down the virtual OS but leaves the underlying host / hardware simulation running.",
      cls: "Clears the screen and resets the cursor position.",
      man: "Displays the manual page for a command. Usage: man <command>",
      trace: "Turns the OS trace on or off. Usage: trace <on | off>",
      rot13: "Does rot13 obfuscatuion on <string>. Usage: rot13 <string>",
      prompt: "Sets the prompt. Usage: promt <string>",
    };

    public shellMan(args: string[]) {
      if (args.length > 0) {
        var topic = Utils.trim(args[0].toLowerCase()); // Trim and lowercase the argument

        if (this.detailedCommands[topic]) {
          neOS.StdOut.putText(this.detailedCommands[topic]);
        } else {
          neOS.StdOut.putText("No manual entry for " + topic + ".");
        }
      } else {
        neOS.StdOut.putText("Usage: man <topic>. Please supply a topic.");
      }
    }
  }
}
