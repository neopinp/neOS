var TSOS;
(function (TSOS) {
    class MemoryAccessor {
        memory;
        constructor(memory) {
            this.memory = memory;
        }
        // Read a byte from memory
        read(address) {
            if (address >= 0 && address < this.memory.memoryArray.length) {
                const value = this.memory.getByte(address);
                return value;
            }
            else {
                throw new Error("Memory access violation at address " + address);
            }
        }
        // Write a byte to memory
        write(address, value) {
            if (address >= 0 && address < this.memory.memoryArray.length) {
                this.memory.setByte(address, value);
                // Log memory access
            }
            else {
                throw new Error("Memory access violation at address " + address);
            }
        }
        // Read a block of memory (for retrieving programs)
        readBlock(startAddress, endAddress) {
            if (startAddress >= 0 && endAddress < this.memory.memoryArray.length) {
                return this.memory.memoryArray.slice(startAddress, endAddress + 1);
            }
            else {
                throw new Error("Memory access violation between addresses " +
                    startAddress +
                    " and " +
                    endAddress);
            }
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
                            let dataValue = this.memory
                                .getByte(i + j)
                                .toString(16)
                                .padStart(2, "0")
                                .toUpperCase();
                            dataCell.textContent = dataValue;
                        }
                        else {
                            // If we're out of bounds, leave the cell blank
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