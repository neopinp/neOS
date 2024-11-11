namespace TSOS {
  export class MemoryAccessor {
    private memory: Memory;

    constructor(memory: Memory) {
      this.memory = memory;
    }

    public write(address: number, value: number, base: number, limit: number): void {
      if (address < base || address > limit) {
        throw new Error(`Memory access violation at address ${address}`);
      }
      console.log(`Writing value ${value.toString(16)} to address ${address}`);
      this.memory[address] = value;
    }
    

    public read(address: number, base: number, limit: number): number {
      if (address < base || address > limit) {
        throw new Error(`Memory access violation at address ${address}. Outside process boundaries. ${base} ${limit} ${neOS.CurrentProcess.pc}`);
      }
      return this.memory[address];
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
