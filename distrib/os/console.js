var TSOS;
(function (TSOS) {
    class Console {
        currentFont;
        currentFontSize;
        currentXPosition;
        currentYPosition;
        buffer;
        outputBuffer = [];
        visibleLines;
        lineHeight;
        constructor(currentFont = neOS.DefaultFontFamily, currentFontSize = neOS.DefaultFontSize, currentXPosition = 0, currentYPosition = neOS.DefaultFontSize, buffer = "") {
            this.currentFont = currentFont;
            this.currentFontSize = currentFontSize;
            this.currentXPosition = currentXPosition;
            this.currentYPosition = currentYPosition;
            this.buffer = buffer;
            this.lineHeight = neOS.DefaultFontSize + neOS.FontHeightMargin;
            this.visibleLines = Math.floor(neOS.Canvas.height / this.lineHeight);
        }
        init() {
            this.clearScreen();
            this.resetXY();
        }
        clearScreen() {
            neOS.DrawingContext.clearRect(0, 0, neOS.Canvas.width, neOS.Canvas.height);
        }
        resetXY() {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }
        handleInput() {
            while (neOS.KernelInputQueue.getSize() > 0) {
                const chr = neOS.KernelInputQueue.dequeue();
                if (chr === String.fromCharCode(13)) { // Enter key
                    neOS.OsShell.handleInput(this.buffer);
                    this.outputBuffer.push(this.buffer);
                    this.buffer = ""; // Clear the buffer after command execution
                }
                else if (chr === String.fromCharCode(8)) {
                    this.handleBackSpace();
                }
                else {
                    this.buffer += chr;
                    this.putText(chr); // Display the character
                }
            }
        }
        handleBackSpace() {
            if (this.buffer.length > 0) {
                // Remove the last character from the buffer
                const lastChar = this.buffer.slice(-1);
                this.buffer = this.buffer.slice(0, -1);
                // Measure the width of the last character to calculate how much to clear
                const charWidth = neOS.DrawingContext.measureText(this.currentFont, this.currentFontSize, lastChar);
                this.currentXPosition -= charWidth;
                const clearHeight = this.lineHeight + 6;
                neOS.DrawingContext.clearRect(this.currentXPosition, this.currentYPosition - this.lineHeight, charWidth, clearHeight);
                // Redraw the console
                this.redrawConsoleAfterBackspace();
            }
        }
        redrawConsoleAfterBackspace() {
            this.currentXPosition = 0;
            this.putText(neOS.OsShell.promptStr);
            const promptWidth = neOS.DrawingContext.measureText(this.currentFont, this.currentFontSize, neOS.OsShell.promptStr);
            this.currentXPosition = promptWidth;
            this.putText(this.buffer);
            const bufferWidth = neOS.DrawingContext.measureText(this.currentFont, this.currentFontSize, this.buffer);
            this.currentXPosition = promptWidth + bufferWidth;
        }
        putText(text) {
            if (text !== "") {
                const offset = neOS.DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                // Handle wrapping when text exceeds the canvas width
                if (this.currentXPosition + offset > neOS.Canvas.width) {
                    this.advanceLine();
                }
                // Draw the text at the current X and Y coordinates
                neOS.DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                this.currentXPosition += offset; // Move X position for the next character
                // Scroll the canvas when the text reaches the bottom
                if (this.currentYPosition >= neOS.Canvas.height) {
                    this.scrollText();
                }
            }
        }
        advanceLine() {
            this.currentXPosition = 0;
            this.currentYPosition += this.lineHeight;
            // If the Y position exceeds the canvas height, scroll
            if (this.currentYPosition >= neOS.Canvas.height) {
                this.scrollText();
            }
        }
        scrollText() {
            const scrollAmount = this.lineHeight;
            // Scroll the canvas by copying the existing data up by one line height
            const imageData = neOS.DrawingContext.getImageData(0, scrollAmount, neOS.Canvas.width, neOS.Canvas.height - scrollAmount);
            this.clearScreen();
            neOS.DrawingContext.putImageData(imageData, 0, 0);
            this.currentYPosition = neOS.Canvas.height - this.lineHeight;
        }
    }
    TSOS.Console = Console;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=console.js.map