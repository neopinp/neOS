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
                // Log memory access
                console.log(`Memory READ: Address: ${address
                    .toString(16)
                    .toUpperCase()}, Value: ${value.toString(16).toUpperCase()}`);
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
                console.log(`Memory WRITE: Address: ${address
                    .toString(16)
                    .toUpperCase()}, Value: ${value.toString(16).toUpperCase()}`);
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
            let memoryDisplay = document.getElementById('memoryDisplay');
            let memoryContent = "";
            // Correct the for loop to iterate based on the length of the memory array
            for (let i = 0; i < this.memory.memoryArray.length; i++) {
                if (i % 8 === 0) {
                    memoryContent += `\n0x${i
                        .toString(16)
                        .toUpperCase()
                        .padStart(3, "0")}: `; // Start of memory block
                }
                // Append each byte as two hex digits, padded with zero if needed
                memoryContent +=
                    this.memory.getByte(i).toString(16).padStart(2, "0") + " ";
                memoryDisplay.value = memoryContent.trim();
            }
            // Log the memory content in the console
            console.log(memoryContent);
        }
    }
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryAccessor.js.map