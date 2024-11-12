namespace TSOS {
  export class Dispatcher {
    public dispatch(process: PCB): void {
      console.log(
        `Dispatching process PID: ${process.pid} with initial state: ${process.state}`
      );
      process.loadContext(neOS.CPU);
      console.log(`Process PID: ${process.pid} is now running.`);

    }
  }
}
