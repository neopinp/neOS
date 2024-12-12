/* ------------
   Queue.ts

   A simple Queue, which is really just a dressed-up JavaScript Array.
   See the JavaScript Array documentation at
   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
   Look at the push and shift methods, as they are the least obvious here.

   ------------ */

namespace TSOS {
  export class Queue<T> {
    constructor(public q = new Array()) {}

    public getSize() {
      return this.q.length;
    }

    public isEmpty() {
      return this.q.length == 0;
    }

    public enqueue(element: T): void {
      this.q.push(element);
    }

    public dequeue(): T | null {
      var retVal = null;
      if (this.q.length > 0) {
        retVal = this.q.shift();
      }
      return retVal;
    }
    public peek(): T | null {
      return this.q.length > 0 ? this.q[0] : null;
    }

    public toString() {
      var retVal = "";
      for (var i in this.q) {
        retVal += "[" + this.q[i] + "] ";
      }
      return retVal;
    }
    public forEach(callback: (item: T) => void): void {
      this.q.forEach(callback);
    }
    public find(callback: (item: T) => boolean): T | undefined {
      return this.q.find(callback);
    }
    public removeProcessByPid(queue: TSOS.Queue<any>, pid: number): void {
      queue.q = queue.q.filter((item) => item.pid !== pid);
    }
    getAllProcesses(): Array<number> {
      return this.q.map((process) => process.pid); // Replace with your queue's structure
    }
  }
}
