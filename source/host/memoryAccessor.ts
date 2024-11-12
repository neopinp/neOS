namespace TSOS {
  export class MemoryAccessor {
    private memory: Memory;
    public memorySize: number;

    constructor(memory: Memory) {
      this.memory = Memory.getInstance();
      this.memorySize = this.memory.getMemoryArray().length;
    }

    // Read a byte from memory
    public read(address: number): number {
      if (address >= 0 && address < this.memory.memoryArray.length) {
        const value = this.memory.getByte(address);
        return value;
      } else {
        throw new Error("Memory access violation at address " + address);
      }
    }

    // Write a byte to memory
    public write(address: number, value: number): void {
      if (address >= 0 && address < this.memory.memoryArray.length) {
        this.memory.setByte(address, value);
        // Log memory access
      } else {
        throw new Error("Memory access violation at address " + address);
      }
    }

    // Read a block of memory (for retrieving programs)
    public readBlock(startAddress: number, endAddress: number): number[] {
      if (startAddress >= 0 && endAddress < this.memory.memoryArray.length) {
        return this.memory.memoryArray.slice(startAddress, endAddress + 1);
      } else {
        throw new Error(
          "Memory access violation between addresses " +
            startAddress +
            " and " +
            endAddress
        );
      }
    }

    public getMemoryArray(): number[] {
      return this.memory.getMemoryArray();
    }

    public displayMemory(): void {
      const memoryTableBody = document.querySelector("#memoryTable tbody");

      if (!memoryTableBody) {
        console.error("Memory table body not found");
        return;
      }

      memoryTableBody.innerHTML = ""; // Clear previous content

      const maxDataColumns = 7; // Number of data columns per row
      const memoryArray = this.getMemoryArray(); // Get the memory contents

      // Ensure the memory array is not empty
      if (!memoryArray || memoryArray.length === 0) {
        console.error("Memory array is empty or not initialized.");
        return;
      }

      for (let i = 0; i < memoryArray.length; i += maxDataColumns) {
        const row = document.createElement("tr");

        // Create address cell
        const addressCell = document.createElement("td");
        addressCell.textContent = `0x${i
          .toString(16)
          .padStart(3, "0")
          .toUpperCase()}`;
        row.appendChild(addressCell);

          for (let j = 0; j < maxDataColumns; j++) {
            let dataCell = document.createElement("td");

            if (i + j < this.memory.memoryArray.length) {
              let dataValue = this.memory
                .getByte(i + j)
                .toString(16)
                .padStart(2, "0")
                .toUpperCase();
              dataCell.textContent = dataValue;
            } else {
              // If we're out of bounds, leave the cell blank
              dataCell.textContent = "--";
            }

            row.appendChild(dataCell);
          }

          memoryTableBody.appendChild(row);
        }
      } else {
        console.error("Memory table body not found");
      }
    }
    public clearMemoryBlock(start: number, end: number): void {
      for (let i = start; i <= end; i++) {
        this.memory.setByte(i, 0);
      }
    }
    public clearAllMemory(): void {
      for (let i = 0; i < this.memorySize; i++) {
        this.write(i, 0);
      }
      console.log("Memory cleared successfully.");
    }
  }
}
