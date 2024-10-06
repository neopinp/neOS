namespace TSOS {
  export class MemoryAccessor {
    private memory: Memory;

    constructor(memory: Memory) {
      this.memory = memory;
    }

    // Read a byte from memory
    public read(address: number): number {
      if (address >= 0 && address < this.memory.memoryArray.length) {
        const value = this.memory.getByte(address);
        // Log memory access
        console.log(
          `Memory READ: Address: ${address
            .toString(16)
            .toUpperCase()}, Value: ${value.toString(16).toUpperCase()}`
        );
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
        console.log(
          `Memory WRITE: Address: ${address
            .toString(16)
            .toUpperCase()}, Value: ${value.toString(16).toUpperCase()}`
        );
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
      let memoryTableBody = document.querySelector("#memoryTable tbody");

      if (memoryTableBody) {
        memoryTableBody.innerHTML = "";

        const maxDataColumns = 7;
        const rowHeight = maxDataColumns;

        for (let i = 0; i < this.memory.memoryArray.length; i += rowHeight) {
          let row = document.createElement("tr");

          let addressCell = document.createElement("td");
          addressCell.textContent = `0x${i
            .toString(16)
            .toUpperCase()
            .padStart(3, "000")}`;
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
  }
}
