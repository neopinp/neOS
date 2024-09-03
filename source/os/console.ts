/* ------------
     Console.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */

namespace TSOS {

    export class Console {
        private outputBuffer: string[] = [];
        private visibleLines: number;

        constructor(public currentFont = neOS.DefaultFontFamily,
            public currentFontSize = neOS.DefaultFontSize,
            public currentXPosition = 0,
            public currentYPosition = neOS.DefaultFontSize,
            public buffer = "") {
            this.visibleLines = Math.floor(neOS.Canvas.height / (this.currentFontSize + neOS.FontHeightMargin))

        }

        public init(): void {
            this.clearScreen();
            this.resetXY();
        }

        public clearScreen(): void {
            neOS.DrawingContext.clearRect(0, 0, neOS.Canvas.width, neOS.Canvas.height);
        }

        public resetXY(): void {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }

        public handleInput(): void {
            while (neOS.KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = neOS.KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) { // the Enter key
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    neOS.OsShell.handleInput(this.buffer);
                    this.advanceLine();
                    // ... and reset our buffer.
                    this.buffer = "";
                } else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Add a case for Ctrl-C that would allow the user to break the current program.
            }
        }

        public putText(text: string): void {
            if (text !== "") {
                // Draw the text at the current X and Y coordinates.
                neOS.DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                // Move the current X position.
                var offset = neOS.DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition += offset;
            }
        }

        public advanceLine(): void {
            // Add the current line to the output buffer before moving to a new line
            this.outputBuffer.push(this.buffer);

            // If the buffer exceeds visible lines, remove the oldest line
            if (this.outputBuffer.length > this.visibleLines) {
                this.outputBuffer.shift();
            }

            this.render();

            this.currentXPosition = 0;
            this.currentYPosition += this.currentFontSize +
                neOS.DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                neOS.FontHeightMargin;

            // If the current Y position exceeds the canvas height, scroll
            if (this.currentYPosition > neOS.Canvas.height) {
                this.currentYPosition = neOS.Canvas.height - (this.currentFontSize +
                    neOS.DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                    neOS.FontHeightMargin);
                this.render();
            }
        }

        private render(): void {
            this.clearScreen();
            this.resetXY();

            for (let i = 0; i < this.outputBuffer.length; i++) {
                const text = this.outputBuffer[i];
                neOS.DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                this.advanceLineWithoutRender();
            }
        }
        private advanceLineWithoutRender(): void {
            this.currentXPosition = 0;
            this.currentYPosition += this.currentFontSize +
                neOS.DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                neOS.FontHeightMargin;
        }

    }
}
