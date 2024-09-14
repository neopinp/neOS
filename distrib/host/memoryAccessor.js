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
                return this.memory.getByte(address);
                throw new Error("Memory access violation at address " + address);
            }
        }
        // Write a byte to memory
        write(address, value) {
            if (address >= 0 && address < this.memory.memoryArray.length) {
                this.memory.setByte(address, value);
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
                throw new Error("Memory access violation between addresses " + startAddress + " and " + endAddress);
            }
        }
    }
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryAccessor.js.map