var TSOS;
(function (TSOS) {
    class MemoryAccessor {
        memory;
        constructor(memory) {
            this.memory = memory;
        }
        read(address) {
            if (address >= 0 && address < neOS.Memory.memoryArray.length) {
                return neOS.Memory.getByte(address);
            }
            else {
                throw new Error("Memory access violation at address " + address);
            }
        }
        write(address, value) {
            if (address >= 0 && address < neOS.Memory.memoryArray.length) {
                neOS.Memory.setByte(address, value);
            }
            else {
                throw new Error("Memory access violation at address " + address);
            }
        }
    }
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryAccessor.js.map