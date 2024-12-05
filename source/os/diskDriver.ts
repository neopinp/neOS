/* ----------------------------------
   DiskDriver.ts
   ---------------------------------- */

namespace TSOS {
  export class DiskSystemDeviceDriver extends DeviceDriver {
    public programAllocation: { programId: number; blocks: number[] }[] = [];

    constructor(
      public blockCount: number = 100, // Total blocks available on the disk
      public blockSize: number = 64, // Block size in bytes
      public listofFiles: string[] = []
    ) {
      super();
      this.driverEntry = this.diskDriverEntry;
    }

    private diskDriverEntry = (): void => {
      console.log("Disk System Driver loaded.");
      this.status = "loaded";
      this.initializeDisk();
      console.log("Disk System Driver loaded.");
    };

    // Initalize Disk
    public initializeDisk(clear: boolean = true): void {
      for (let i = 0; i < this.blockCount; i++) {
        if (clear || !sessionStorage.getItem(`block${i}`)) {
          sessionStorage.setItem(`block${i}`, "".padEnd(this.blockSize, " "));
        }
        Control.updateDiskDisplay();
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
        console.error(`Invalid block index: ${index}`);
        return false;
      }
      if (data.length > this.blockSize) {
        console.error(`Data exceeds block size. Block index: ${index}`);
        return false;
      }
      sessionStorage.setItem(`block${index}`, data.padEnd(this.blockSize, " "));
      console.log(`Block ${index} written. Data: "${data.trim()}"`);
      TSOS.Control.updateDiskDisplay();
      return true;
    }
    // Read to Disk
    public readBlock(index: number): string {
      if (index < 0 || index >= this.blockCount) {
        console.error(`Invalid block index: ${index}`);
        return "";
      }
      const blockData = sessionStorage.getItem(`block${index}`) || "";
      const trimmedData = blockData.trim(); // Remove excessive spacing
      console.log(`Reading from block ${index}: "${trimmedData}"`); // Debug log with trimmed data
      return blockData; // Return the raw block data (use .trim() where needed elsewhere)
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
    public allocateBlocksForProgram(programData: string[]): number {
      const requiredBlocks = 5;
      const availableBlocks: number[] = [];

      // Find available blocks
      for (let i = 0; i < this.blockCount; i++) {
        if (this.isBlockEmpty(i)) {
          availableBlocks.push(i);
          if (availableBlocks.length === requiredBlocks) break;
        }
      }

      if (availableBlocks.length < requiredBlocks) {
        console.error("Not enough available blocks for the program.");
        return -1;
      }

      const programId = neOS.MemoryManager.nextPID++;
      this.programAllocation.push({ programId, blocks: availableBlocks });

      // Write the program data into the allocated blocks
      for (let i = 0; i < availableBlocks.length; i++) {
        const data = programData[i] || ""; // If there's no data for a block, write an empty string
        this.writeBlock(availableBlocks[i], data);
      }

      Control.updateDiskDisplay();
      return programId;
    }

    public retrieveProgram(programId: number): string[] {
      const program = this.programAllocation.find(
        (p) => p.programId === programId
      );

      if (!program) {
        console.error(`Program with ID ${programId} not found.`);
        return [];
      }

      return program.blocks.map((blockIndex) => this.readBlock(blockIndex));
    }
    public clearProgram(programId: number): boolean {
      const programIndex = this.programAllocation.findIndex(
        (p) => p.programId === programId
      );

      if (programIndex === -1) {
        console.error(`Program with ID ${programId} not found.`);
        return false;
      }

      const program = this.programAllocation[programIndex];
      program.blocks.forEach((blockIndex) => this.clearBlock(blockIndex));
      this.programAllocation.splice(programIndex, 1);

      Control.updateDiskDisplay();
      return true;
    }

    // File Operations
    public createFile(filename: string): boolean {
      // Step 1: Check if the file already exists
      if (this.findBlockByFileName(filename) !== -1) {
        console.error(`File '${filename}' already exists.`);
        return false;
      }

      // Step 2: Find an empty block for metadata
      const metadataBlockIndex = this.findEmptyBlock();
      if (metadataBlockIndex === -1) {
        console.error("No empty blocks available for file creation.");
        return false;
      }

      // **Reserve the metadata block by writing placeholder metadata**
      const placeholderMetadata = `${filename.padEnd(10, " ")}---`.padEnd(
        this.blockSize,
        " "
      );
      this.writeBlock(metadataBlockIndex, placeholderMetadata);

      // Step 3: Find an empty block for content
      const contentBlockIndex = this.findEmptyBlock();
      if (contentBlockIndex === -1) {
        console.error("No empty blocks available for content.");
        return false;
      }

      // Step 4: Update metadata block to include pointer to content block
      const metadata = `${filename.padEnd(10, " ")}${contentBlockIndex
        .toString()
        .padStart(3, "0")}`;
      this.writeBlock(metadataBlockIndex, metadata.padEnd(this.blockSize, " "));

      // Step 5: Initialize the content block with empty data
      const initialContent = "---".padEnd(this.blockSize, " ");
      this.writeBlock(contentBlockIndex, initialContent);

      console.log(
        `File '${filename}' created. Metadata written to block ${metadataBlockIndex}, pointer to content block ${contentBlockIndex}.`
      );

      return true;
    }
    public findBlockByFileName(filename: string): number {
      console.log(`Searching for file: "${filename}"`);

      for (let i = 0; i < this.blockCount; i++) {
        const blockData = sessionStorage.getItem(`block${i}`) || "";

        const isMetadataBlock = blockData.length >= 13;
        if (!isMetadataBlock) {
          console.log(
            `Skipping block ${i}: Not a metadata block (Data: "${blockData}")`
          );
          continue;
        }

        const storedFilename = blockData.slice(0, 10).trim(); // Extract possible filename
        const pointer = blockData.slice(10, 13).trim(); // Extract pointer

        // Log metadata details
        console.log(
          `Checking block ${i}: "${blockData}" (Stored filename: "${storedFilename}", Target filename: "${filename}", Pointer: "${pointer}")`
        );
        // List of files

        const isValidMetadata =
          storedFilename === filename &&
          (pointer === "---" || /^\d{3}$/.test(pointer));

        if (isValidMetadata) {
          console.log(`File '${filename}' found in block ${i}.`);
          return pointer === "---" ? -1 : parseInt(pointer, 10);
        } else {
          console.log(
            `Filename mismatch in block ${i}: Expected "${filename}", Found "${storedFilename}"`
          );
        }
      }

      console.error(`File '${filename}' not found.`);
      return -1; // File not found
    }

    public readFile(filename: string): string | null {
      const startBlock = this.findBlockByFileName(filename); // Locate the metadata block
      if (startBlock === -1) {
        console.error(`Error: File '${filename}' not found.`);
        return null;
      }

      // Read metadata to get the pointer to the first content block
      const metadataBlock = this.readBlock(startBlock);
      const firstContentBlockPointer = metadataBlock.slice(10, 13).trim();

      if (firstContentBlockPointer === "---") {
        console.log(`File '${filename}' is empty.`);
        return ""; // No content
      }

      let currentBlock =
        firstContentBlockPointer === "---"
          ? -1
          : parseInt(firstContentBlockPointer, 10);
      let content = "";

      // Follow the chain of content blocks
      while (currentBlock !== -1) {
        const blockData = this.readBlock(currentBlock);
        const dataChunk = blockData.slice(3).trim(); // Skip pointer (first 3 characters)
        content += dataChunk;

        const nextBlockPointer = blockData.slice(0, 3).trim();
        currentBlock =
          nextBlockPointer === "---" ? -1 : parseInt(nextBlockPointer, 10);

        if (isNaN(currentBlock)) {
          console.error(`Invalid pointer value in block.`);
          return null;
        }
      }

      console.log(
        `File '${filename}' read successfully. Content: "${content}"`
      );
      return content;
    }

    public writeToFile(filename: string, data: string): boolean {
      // Step 1: Get the first content block index from findBlockByFileName
      const contentBlockIndex = this.findBlockByFileName(filename);
      if (contentBlockIndex === -1) {
        console.error(`Error: File '${filename}' not found.`);
        return false;
      }

      let currentBlockIndex = contentBlockIndex; // Start writing at the content block
      let offset = 0;

      while (offset < data.length) {
        // Extract a chunk of data to fit in the block (reserve space for the pointer)
        const chunkSize = this.blockSize - 3; // Reserve 3 bytes for the pointer
        const chunk = data.slice(offset, offset + chunkSize);

        // Find the next empty block for the pointer
        const nextBlockIndex = this.findEmptyBlock();
        const pointer =
          nextBlockIndex !== -1 && offset + chunk.length < data.length
            ? nextBlockIndex.toString().padStart(3, "0")
            : "---"; // Use "---" for the last block

        // Construct the block data with the pointer
        const blockData = `${pointer}${chunk.padEnd(chunkSize, " ")}`;
        this.writeBlock(currentBlockIndex, blockData);

        // Move to the next block if needed
        currentBlockIndex = nextBlockIndex;
        offset += chunkSize;
      }

      console.log(`File '${filename}' written successfully.`);
      return true;
    }

    public deleteFile(filename: string): boolean {
      const startBlock = this.findBlockByFileName(filename);
      if (startBlock === -1) {
        console.error(`Error: File '${filename}' not found.`);
        return false;
      }

      let currentBlock = startBlock;

      while (currentBlock !== -1) {
        const blockData = this.readBlock(currentBlock);
        const nextBlock = blockData.slice(10, 13).trim(); // Pointer to the next block
        this.clearBlock(currentBlock);
        currentBlock = nextBlock === "---" ? -1 : parseInt(nextBlock, 10);
      }

      return true;
    }
    public copyFile(sourceFilename: string, targetFilename: string): boolean {
      const content = this.readFile(sourceFilename);
      if (content === null) {
        console.error(`Error: Source file '${sourceFilename}' not found.`);
        return false;
      }

      if (!this.createFile(targetFilename)) {
        console.error(
          `Error: Could not create target file '${targetFilename}'.`
        );
        return false;
      }

      return this.writeToFile(targetFilename, content);
    }
    public renameFile(oldName: string, newName: string): boolean {
      const startBlock = this.findBlockByFileName(oldName);
      if (startBlock === -1) {
        console.error(`Error: File '${oldName}' not found.`);
        return false;
      }

      const blockData = this.readBlock(startBlock);
      const newBlockData = `${newName.padEnd(10, " ")}${blockData.slice(10)}`;
      this.writeBlock(startBlock, newBlockData);

      return true;
    }
    public listFiles(): string {
      let fileList = "";
      for (let i = 0; i < this.listofFiles.length; i++) {
        fileList += this.listofFiles[i];
        // Append a comma after each file, except for the last one
        if (i < this.listofFiles.length - 1) {
          fileList += ",";
        }
      }
      console.log(`List of files on disk: ${fileList}`);
      return fileList;
    }

    public findEmptyBlock(): number {
      for (let i = 0; i < this.blockCount; i++) {
        const blockData = sessionStorage.getItem(`block${i}`);
        if (!blockData || !blockData.trim()) {
          return i;
        }
      }
      return -1;
    }
  }
}
