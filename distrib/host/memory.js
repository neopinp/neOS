var TSOS;
(function (TSOS) {
    class Memory {
        memoryArray;
        constructor(memorySize = 256) {
            this.memoryArray = new Array(memorySize).fill(0);
        }
        init() {
            this.memoryArray.fill(0); // Reset the memory
        }
        getByte(address) {
            const value = this.memoryArray[address];
            neOS.Kernel.krnTrace(`Reading memory at address ${address}: ${value}`);
            return value;
        }
        setByte(address, value) {
            this.memoryArray[address] = value;
            neOS.Kernel.krnTrace(`Writing value ${value} to memory at address ${address}`);
        }
        getMemoryArray() {
            return this.memoryArray;
        }
    }
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memory.js.map