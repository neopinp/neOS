var TSOS;
(function (TSOS) {
    class MemoryAccessor {
        memory;
        constructor(memory) {
            this.memory = memory;
        }
        // Read a byte from memory
        read(address) {
            if (address < 0 || address >= 768) {
                console.error(`Memory Access Error: Address ${address} out of bounds`);
                return undefined; // Return undefined if the address is invalid
            }
            return this.memory.getByte(address);
        }
        // Write a byte to memory
        write(address, value) {
            // Check if address is within bounds
            if (address < 0 || address >= 768) {
                throw new Error(`Memory Access Error: Address ${address} out of bounds`);
            }
            this.memory.setByte(address, value);
        }
        // Read a block of memory (for retrieving programs)
        readBlock(start, end) {
            if (end >= 768) {
                throw new Error("Memory Access Error: Block exceeds memory size");
            }
            return this.memory.getMemoryArray().slice(start, end + 1);
        }
        getMemoryArray() {
            return this.memory.getMemoryArray();
        }
        displayMemory() {
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
                            }
                            else {
                                dataCell.textContent = dataValue
                                    .toString(16)
                                    .padStart(2, "0")
                                    .toUpperCase();
                            }
                        }
                        else {
                            dataCell.textContent = "--";
                        }
                        row.appendChild(dataCell);
                    }
                    memoryTableBody.appendChild(row);
                }
            }
            else {
                console.error("Memory table body not found");
            }
        }
    }
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryAccessor.js.map