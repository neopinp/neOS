var TSOS;
(function (TSOS) {
    class Memory {
        static instance;
        memoryArray;
        constructor(memorySize = 768) {
            this.memoryArray = new Array(memorySize).fill(0);
        }
        init() {
            this.memoryArray.fill(0); // Reset the memory
        }
        getByte(address) {
            const value = this.memoryArray[address];
            return value;
        }
        setByte(address, value) {
            this.memoryArray[address] = value;
        }
        getMemoryArray() {
            return this.memoryArray;
        }
        static getInstance() {
            if (!Memory.instance) {
                Memory.instance = new Memory();
            }
            return Memory.instance;
        }
    }
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memory.js.map