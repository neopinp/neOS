var TSOS;
(function (TSOS) {
    class MemoryAccessor {
        memory;
        constructor(memory) {
            this.memory = memory;
        }
        write(address, value, base, limit) {
            if (address < base || address > limit) {
                throw new Error(`Memory access violation at address ${address}`);
            }
            console.log(`Writing value ${value.toString(16)} at address ${address}`);
            this.memory.setByte(address, value);
        }
        read(address, base, limit) {
            if (address < base || address > limit) {
                throw new Error(`Memory access violation at address ${address}. Outside process boundaries. ${base} ${limit} ${neOS.CurrentProcess.pc}`);
            }
            const value = this.memory.getByte(address);
            return value;
        }
        getMemoryArray() {
            return this.memory.getMemoryArray();
        }
        displayMemory() {
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
                // Populate row with memory data
                for (let j = 0; j < maxDataColumns; j++) {
                    const dataCell = document.createElement("td");
                    if (i + j < memoryArray.length) {
                        const value = memoryArray[i + j];
                        dataCell.textContent = value
                            .toString(16)
                            .padStart(2, "0")
                            .toUpperCase();
                    }
                    else {
                        dataCell.textContent = "--"; // Empty cell if out of bounds
                    }
                    row.appendChild(dataCell);
                }
                memoryTableBody.appendChild(row);
            }
            console.log("Memory display updated.");
        }
    }
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryAccessor.js.map