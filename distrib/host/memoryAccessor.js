var TSOS;
(function (TSOS) {
    class MemoryAccessor {
        memory;
        memorySize;
        constructor(memory) {
            this.memory = memory;
        }
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
        write(address, value, process = null) {
            // If a process is provided, use its boundaries for validation
            if (process) {
                const base = process.base;
                const limit = process.limit;
                if (address < base || address > limit) {
                    throw new Error(`Memory Access Error: Address ${address} out of bounds for PID ${process.pid}`);
                }
            }
            else {
                // If no process is provided, just check if the address is within the total memory bounds
                if (address < 0 || address >= 768) {
                    throw new Error(`Memory Access Error: Address ${address} out of overall memory bounds`);
                }
            }
            this.memory.setByte(address, value);
            console.log(`DEBUG: Writing value ${value} to memory address ${address}`);
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
        clearMemoryBlock(start, end) {
            for (let i = start; i <= end; i++) {
                this.memory.setByte(i, 0);
            }
        }
        clearAllMemory() {
            for (let i = 0; i < this.memorySize; i++) {
                this.write(i, 0);
            }
            console.log("Memory cleared successfully.");
        }
    }
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryAccessor.js.map