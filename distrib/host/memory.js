var TSOS;
(function (TSOS) {
    class Memory {
        memoryArray;
        constructor(memorySize) {
            this.memoryArray = new Array(256).fill(0); // Memory of 256 bytes, adjust as needed
        }
        init() {
            this.memoryArray.fill(0); // Reset the memory
        }
        getByte(address) {
            return this.memoryArray[address];
        }
        setByte(address, value) {
            this.memoryArray[address] = value;
        }
    }
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memory.js.map