namespace TSOS {
  export class Console {
    private outputBuffer: string[] = [];
    private visibleLines: number;
    private lineHeight: number;

    constructor(
      public currentFont = neOS.DefaultFontFamily,
      public currentFontSize = neOS.DefaultFontSize,
      public currentXPosition = 0,
      public currentYPosition = neOS.DefaultFontSize,
      public buffer = ""
    ) {
      this.lineHeight = neOS.DefaultFontSize + neOS.FontHeightMargin;
      this.visibleLines = Math.floor(neOS.Canvas.height / this.lineHeight);
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
        const chr = neOS.KernelInputQueue.dequeue();
        if (chr === String.fromCharCode(13)) { // Enter key
          neOS.OsShell.handleInput(this.buffer);
          this.outputBuffer.push(this.buffer);
          this.buffer = "";  // Clear the buffer after command execution
        } else if (chr === String.fromCharCode(8)) {
          this.handleBackSpace();
        }
        else {
          this.buffer += chr;
          this.putText(chr);  // Display the character
        }
        // TODO: Add a case for Ctrl-C that would allow the user to break the current program 
      }
    }

    public handleBackSpace(): void {
      if (this.buffer.length > 0) {
          // Remove the last character from the buffer
          const lastChar = this.buffer.slice(-1);
          this.buffer = this.buffer.slice(0, -1);
  
          // Measure the width of the last character to calculate how much to clear
          const charWidth = neOS.DrawingContext.measureText(this.currentFont, this.currentFontSize, lastChar);

          this.currentXPosition -= charWidth;
          const clearHeight = this.lineHeight + 6;  
          neOS.DrawingContext.clearRect(
              this.currentXPosition,
              this.currentYPosition - this.lineHeight,
              charWidth,
              clearHeight
          );
  
          // Redraw the console
          this.redrawConsoleAfterBackspace();
      }
    }

    public redrawConsoleAfterBackspace(): void {
      this.currentXPosition = 0;
  
      this.putText(neOS.OsShell.promptStr);
  
      const promptWidth = neOS.DrawingContext.measureText(this.currentFont, this.currentFontSize, neOS.OsShell.promptStr);
      this.currentXPosition = promptWidth;
  
      this.putText(this.buffer);
  
      const bufferWidth = neOS.DrawingContext.measureText(this.currentFont, this.currentFontSize, this.buffer);
      this.currentXPosition = promptWidth + bufferWidth;
    }

    // Fix clearCurrentLine to only clear the current line where input is happening
    public clearCurrentLine(): void {
      const currentLineStartY = this.currentYPosition - this.lineHeight;  // The starting Y position of the current line
      neOS.DrawingContext.clearRect(0, currentLineStartY, neOS.Canvas.width, this.lineHeight);  // Clear only the current line
      this.currentXPosition = 0;  // Reset the X position to the beginning of the line
    }

    public putText(text: string): void {
      if (text !== "") {
        const offset = neOS.DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
        
        // Handle wrapping when text exceeds the canvas width
        if (this.currentXPosition + offset > neOS.Canvas.width) {
          this.advanceLine();
        }
        
        // Draw the text at the current X and Y coordinates
        neOS.DrawingContext.drawText(
          this.currentFont,
          this.currentFontSize,
          this.currentXPosition,
          this.currentYPosition,
          text
        );
        
        this.currentXPosition += offset;  // Move X position for the next character
        
        // Scroll the canvas when the text reaches the bottom
        if (this.currentYPosition >= neOS.Canvas.height) {
          this.scrollText();
        }
      }
    }

    public advanceLine(): void {
      this.currentXPosition = 0;  
      this.currentYPosition += this.lineHeight;
      
      // If the Y position exceeds the canvas height, scroll
      if (this.currentYPosition >= neOS.Canvas.height) {
        this.scrollText();
      }
    }

    private scrollText(): void {
      const scrollAmount = this.lineHeight;
  
      // Scroll the canvas by copying the existing data up by one line height
      const imageData = neOS.DrawingContext.getImageData(
        0,
        scrollAmount,
        neOS.Canvas.width,
        neOS.Canvas.height - scrollAmount
      );
  
      this.clearScreen();
      neOS.DrawingContext.putImageData(imageData, 0, 0);
  
      this.currentYPosition = neOS.Canvas.height - this.lineHeight;
    }
  }
}
