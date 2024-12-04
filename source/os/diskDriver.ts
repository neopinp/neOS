/* ----------------------------------
   DiskDriver.ts
   ---------------------------------- */

namespace TSOS {
  export class DiskSystemDeviceDriver extends DeviceDriver {
    constructor(
      private blockCount: number = 5,
      private blockSize: number = 64
    ) {
      super();
      this.driverEntry = this.diskDriverEntry; // Assign the driverEntry property to the method
    }

    private diskDriverEntry = (): void => {
      console.log("Disk System Driver loaded.");
      this.status = "loaded";
      this.initializeDisk();
      console.log("Disk System Driver loaded.");
    };

    // Initalize Disk
    initializeDisk(clear: boolean = true): void {
      for (let i = 0; i < this.blockCount; i++) {
        if (clear || !sessionStorage.getItem(`block${i}`)) {
          sessionStorage.setItem(`block${i}`, "".padEnd(this.blockSize, " "));
        }
      }
      // Log the data for all blocks after initialization
      console.log("Driver status:", this.status); // Logs the driver status
      for (let i = 0; i < this.blockCount; i++) {
        console.log(`Block ${i} data:`, sessionStorage.getItem(`block${i}`)); // Logs each block's data
      }
    }

    // Write to Disk
    public writeBlock(index: number, data: string): boolean {
      if (index < 0 || index >= this.blockCount) {
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
    public readBlock(index: number): string {
      if (index < 0 || index >= this.blockCount) {
        console.error("Invalid block index");
        return "";
      }
      return sessionStorage.getItem(`block${index}`) || "";
    }

    // Helper Methods
    // Check Blocks
    public isBlockEmpty(index: number): boolean {
      const blockData = sessionStorage.getItem(`block${index}`);
      return blockData?.trim() === "";
    }

    public clearBlock(index: number): boolean {
      if (index < 0 || index >= this.blockCount) {
        console.error("Invalid block index");
        return false;
      }
      sessionStorage.setItem(`block${index}`, "".padEnd(this.blockSize, " "));
      return true;
    }
  }
}
