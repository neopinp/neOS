namespace TSOS {
  export class PCB {
    public pid: number;
    public base: number;
    public limit: number;
    public pc: number;
    public state: string;
    public priority: number;
    public name: string;  // Add a name field

    constructor(pid: number, base: number, limit: number, priority: number = 1, name: string = "UnnamedProcess") {
      this.pid = pid;
      this.base = base;
      this.limit = limit;
      this.pc = 0;
      this.state = "Ready";
      this.priority = priority;
      this.name = name;  // Initialize name
    }
  }
}
