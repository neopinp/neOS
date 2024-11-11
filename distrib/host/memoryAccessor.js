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
            console.log(`Writing value ${value.toString(16)} to address ${address}`);
            this.memory[address] = value;
        }
        read(address, base, limit) {
            if (address < base || address > limit) {
                throw new Error(`Memory access violation at address ${address}. Outside process boundaries. ${base} ${limit} ${neOS.CurrentProcess.pc}`);
            }
            return this.memory[address];
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