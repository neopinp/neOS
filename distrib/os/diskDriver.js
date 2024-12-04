/* ----------------------------------
   DiskDriver.ts
   ---------------------------------- */
var TSOS;
(function (TSOS) {
    class DiskSystemDeviceDriver extends TSOS.DeviceDriver {
        blockCount;
        blockSize;
        programAllocation = [];
        nextProgramId = 0; // Unique identifier for programs
        constructor(blockCount = 100, // Total blocks available on the disk
        blockSize = 64 // Block size in bytes
        ) {
            super();
            this.blockCount = blockCount;
            this.blockSize = blockSize;
            this.driverEntry = this.diskDriverEntry;
        }
        diskDriverEntry = () => {
            console.log("Disk System Driver loaded.");
            this.status = "loaded";
            this.initializeDisk();
            console.log("Disk System Driver loaded.");
        };
        // Initalize Disk
        initializeDisk(clear = true) {
            for (let i = 0; i < this.blockCount; i++) {
                if (clear || !sessionStorage.getItem(`block${i}`)) {
                    sessionStorage.setItem(`block${i}`, "".padEnd(this.blockSize, " "));
                }
                TSOS.Control.updateDiskDisplay();
            }
            // Log the data for all blocks after initialization
            console.log("Driver status:", this.status); // Logs the driver status
            for (let i = 0; i < this.blockCount; i++) {
                console.log(`Block ${i} data:`, sessionStorage.getItem(`block${i}`)); // Logs each block's data
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
        allocateBlocksForProgram(programData) {
            const requiredBlocks = 5;
            const availableBlocks = [];
            // Find available blocks
            for (let i = 0; i < this.blockCount; i++) {
                if (this.isBlockEmpty(i)) {
                    availableBlocks.push(i);
                    if (availableBlocks.length === requiredBlocks)
                        break;
                }
            }
            if (availableBlocks.length < requiredBlocks) {
                console.error("Not enough available blocks for the program.");
                return -1;
            }
            const programId = this.nextProgramId++;
            this.programAllocation.push({ programId, blocks: availableBlocks });
            // Write the program data into the allocated blocks
            for (let i = 0; i < availableBlocks.length; i++) {
                const data = programData[i] || ""; // If there's no data for a block, write an empty string
                this.writeBlock(availableBlocks[i], data);
            }
            TSOS.Control.updateDiskDisplay();
            return programId;
        }
        retrieveProgram(programId) {
            const program = this.programAllocation.find((p) => p.programId === programId);
            if (!program) {
                console.error(`Program with ID ${programId} not found.`);
                return [];
            }
            return program.blocks.map((blockIndex) => this.readBlock(blockIndex));
        }
        clearProgram(programId) {
            const programIndex = this.programAllocation.findIndex((p) => p.programId === programId);
            if (programIndex === -1) {
                console.error(`Program with ID ${programId} not found.`);
                return false;
            }
            const program = this.programAllocation[programIndex];
            program.blocks.forEach((blockIndex) => this.clearBlock(blockIndex));
            this.programAllocation.splice(programIndex, 1);
            TSOS.Control.updateDiskDisplay();
            return true;
        }
    }
    TSOS.DiskSystemDeviceDriver = DiskSystemDeviceDriver;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=diskDriver.js.map