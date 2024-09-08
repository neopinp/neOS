/* ----------------------------------
   DeviceDriverKeyboard.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    class DeviceDriverKeyboard extends TSOS.DeviceDriver {
        isCapsLockActive = false;
        constructor() {
            // Override the base method pointers.
            // The code below cannot run because "this" can only be
            // accessed after calling super.
            // super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            // So instead...
            super();
            this.driverEntry = this.krnKbdDriverEntry;
            this.isr = this.krnKbdDispatchKeyPress;
        }
        krnKbdDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }
        krnKbdDispatchKeyPress(params) {
            // Parse the params.  TODO: Check that the params are valid and osTrapError if not.
            const keyCode = params[0];
            const isShifted = params[1];
            neOS.Kernel.krnTrace("Key code:" +
                keyCode +
                " shifted:" +
                isShifted +
                " capsLock:" +
                this.isCapsLockActive);
            if (keyCode === 9) {
                neOS.OsShell.handleTabCompletion();
                return;
            }
            if (keyCode === 20) {
                this.isCapsLockActive = !this.isCapsLockActive;
                return;
            }
            let chr = "";
            if (keyCode === 38 || keyCode === 40) {
                neOS.OsShell.handleArrowKeys(keyCode);
            }
            if (keyCode >= 65 && keyCode <= 90) {
                chr = this.handleLetter(keyCode, isShifted);
                neOS.KernelInputQueue.enqueue(chr);
                // TODO: Check for caps-lock and handle as shifted if so.
            }
            else if ((keyCode >= 48 && keyCode <= 57) ||
                keyCode == 32 ||
                keyCode == 13) {
                chr = this.handleDigitsAndSpecial(keyCode, isShifted);
                neOS.KernelInputQueue.enqueue(chr);
            }
            else if (keyCode == 8) {
                neOS.KernelInputQueue.enqueue(String.fromCharCode(8)); //
            }
            else {
                chr = this.handlePunctuationAndSpecial(keyCode, isShifted);
                if (chr) {
                    neOS.KernelInputQueue.enqueue(chr);
                }
            }
        }
        handleLetter(keyCode, isShifted) {
            let chr = "";
            if (this.isCapsLockActive && isShifted) {
                chr = String.fromCharCode(keyCode + 32);
            }
            else if (this.isCapsLockActive || isShifted) {
                chr = String.fromCharCode(keyCode);
            }
            else {
                chr = String.fromCharCode(keyCode + 32);
            }
            return chr;
        }
        // Handles digits and special characters with their shifted counterparts.
        handleDigitsAndSpecial(keyCode, isShifted) {
            // Shifted map for digits (0-9) to special characters (!@#$%^&*())
            const shiftedMap = {
                48: ")",
                49: "!",
                50: "@",
                51: "#",
                52: "$",
                53: "%",
                54: "^",
                55: "&",
                56: "*",
                57: "(",
            };
            return isShifted && shiftedMap[keyCode]
                ? shiftedMap[keyCode]
                : String.fromCharCode(keyCode);
        }
        handlePunctuationAndSpecial(keyCode, isShifted) {
            const punctuationMap = {
                190: { shifted: ">", unshifted: "." },
                188: { shifted: "<", unshifted: "," },
                191: { shifted: "?", unshifted: "/" },
                186: { shifted: ":", unshifted: ";" },
                222: { shifted: '"', unshifted: "'" },
                219: { shifted: "{", unshifted: "[" },
                221: { shifted: "}", unshifted: "]" },
                220: { shifted: "|", unshifted: "\\" },
                189: { shifted: "_", unshifted: "-" },
                187: { shifted: "+", unshifted: "=" },
                192: { shifted: "~", unshifted: "`" },
            };
            if (punctuationMap[keyCode]) {
                return isShifted
                    ? punctuationMap[keyCode].shifted
                    : punctuationMap[keyCode].unshifted;
            }
            return "";
        }
    }
    TSOS.DeviceDriverKeyboard = DeviceDriverKeyboard;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=deviceDriverKeyboard.js.map