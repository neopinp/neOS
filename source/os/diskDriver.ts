namespace TSOS {
  export class DiskSystemDeviceDriver {
    constructor(
      private blockCount: number,
      private blockSize: number,
    ) {
      this.initializeDisk();
    }

    // Initalize Disk
    initializeDisk(clear: boolean = true) {
      for (let i = 0; i < this.blockCount; i++) {
        if (clear || !sessionStorage.getItem(`block${i}`)) {
          sessionStorage.setItem(`block${i}`, "".padEnd(this.blockSize, " "));
        }
      }
    }

    // Write to Disk
    writeBlock(index: number, data: string): boolean {
      if (index < 0 || index >= 5) {
        console.error("Invalid block index");
        return false;
      }
      if (data.length > this.blockSize) {
        console.error("Data exceeds block size");
        return false;
      }
      sessionStorage.setItem(`block${index}`, data.padEnd(this.blockSize, " "));
      return true;
    }
    // Read to Disk
    readBlock(index: number): string {
      if (index < 0 || index >= 5) {
        console.error("Invalid block index");
        return "";
      }
      return sessionStorage.getItem(`block${index}`) || "";
    }

    // Helper Methods
    // Check Blocks
    isBlockEmpty(index: number): boolean {
      const blockData = sessionStorage.getItem(`block${index}`);
      return blockData?.trim() === "";
    }

    clearBlock(index: number): boolean {
      if (index < 0 || index >= this.blockCount) {
        console.error("Invalid block index");
        return false;
      }
      sessionStorage.setItem(`block${index}`, "".padEnd(this.blockSize, " "));
      return true;
    }
  }
}
