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
            neOS.OsShell.handleInput(this.buffer);  // Execute the command
            this.outputBuffer.push(this.buffer);  // Store the command output in buffer
            this.buffer = "";  // Clear the buffer after command execution
          } else {
            this.buffer += chr;
            this.putText(chr);  // Display the character
          }
        }
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
        this.currentXPosition = 0;  // Reset X to the beginning of the next line
        this.currentYPosition += this.lineHeight;  // Move Y down by one line height
        
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
  
        this.clearScreen();  // Clear the canvas to prevent text overlap
        neOS.DrawingContext.putImageData(imageData, 0, 0);  // Display the scrolled data
  
        this.currentYPosition = neOS.Canvas.height - this.lineHeight;  // Reset Y position to the last line
      }
    }
  }
  