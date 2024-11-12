var TSOS;
(function (TSOS) {
    class Dispatcher {
        dispatch(process) {
            console.log(`Dispatching process PID: ${process.pid} with initial state: ${process.state}`);
            process.loadContext(neOS.CPU);
            console.log(`Process PID: ${process.pid} is now running.`);
        }
    }
    TSOS.Dispatcher = Dispatcher;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=dispatcher.js.map