/* ----------------------------------
   DiskDriver.ts
   ---------------------------------- */
var TSOS;
(function (TSOS) {
    class DiskSystemDeviceDriver extends TSOS.DeviceDriver {
        blockCount;
        blockSize;
        constructor(blockCount = 5, blockSize = 64) {
            super();
            this.blockCount = blockCount;
            this.blockSize = blockSize;
            this.driverEntry = this.diskDriverEntry; // Assign the driverEntry property to the method
        }
        diskDriverEntry = () => {
            console.log("Disk System Driver loaded.");
            this.initializeDisk();
            this.status = "loaded";
        };
        // Initalize Disk
        initializeDisk(clear = true) {
            for (let i = 0; i < this.blockCount; i++) {
                if (clear || !sessionStorage.getItem(`block${i}`)) {
                    sessionStorage.setItem(`block${i}`, "".padEnd(this.blockSize, " "));
                }
            }
        }
        // Write to Disk
        writeBlock(index, data) {
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
        readBlock(index) {
            if (index < 0 || index >= this.blockCount) {
                console.error("Invalid block index");
                return "";
            }
            return sessionStorage.getItem(`block${index}`) || "";
        }
        // Helper Methods
        // Check Blocks
        isBlockEmpty(index) {
            const blockData = sessionStorage.getItem(`block${index}`);
            return blockData?.trim() === "";
        }
        clearBlock(index) {
            if (index < 0 || index >= this.blockCount) {
                console.error("Invalid block index");
                return false;
            }
            sessionStorage.setItem(`block${index}`, "".padEnd(this.blockSize, " "));
            return true;
        }
    }
    TSOS.DiskSystemDeviceDriver = DiskSystemDeviceDriver;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=diskDriver.js.map