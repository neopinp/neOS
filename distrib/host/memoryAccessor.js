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
    }
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryAccessor.js.map