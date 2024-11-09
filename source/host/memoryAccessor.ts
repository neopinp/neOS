namespace TSOS {
  export class MemoryAccessor {
    private memory: Memory;

    constructor(memory: Memory) {
      this.memory = memory;
    }

    // Read a byte from memory
    public read(address: number): number {
      if (address < 0 || address >= 768) {
        console.error(`Memory Access Error: Address ${address} out of bounds`);
        return undefined; // Return undefined if the address is invalid
      }
      const value = this.memory.getByte(address);
      console.log(`DEBUG: Reading from memory address ${address}: ${value}`);
      return value;
    }

    // Write a byte to memory
    public write(address: number, value: number): void {
      // Check if address is within bounds
      if (address < 0 || address >= 768) {
        throw new Error(
          `Memory Access Error: Address ${address} out of bounds`
        );
      }
      this.memory.setByte(address, value);
    }

    // Read a block of memory (for retrieving programs)
    public readBlock(start: number, end: number): number[] {
      if (end >= 768) {
        throw new Error("Memory Access Error: Block exceeds memory size");
      }
      return this.memory.getMemoryArray().slice(start, end + 1);
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
              let dataValue = this.memory.getByte(i + j);
              if (dataValue === undefined) {
                console.error(`Undefined value at memory address: ${i + j}`);
                dataCell.textContent = "--";
              } else {
                dataCell.textContent = dataValue
                  .toString(16)
                  .padStart(2, "0")
                  .toUpperCase();
              }
            } else {
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
