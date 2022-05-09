const { Worker } = require('worker_threads');

let gateways = [];

const startGateway = (data) => {
    return new Promise((resolve, reject) => {
        const port = data.config.port;
        const rejectConnection = data.config.rejectConnection;

        if (gateways.some((gw) => gw.port === port)) {
            throw new Error(`Cannot start a gateway at port: ${port}, because there is already a running gateway there`);
        }

        // this path is relative to the repo root
        const worker = new Worker("./e2e/puppet-env/gateway.js", { workerData: { port, rejectConnection } });

        worker.on('message', (msg) => {

            if (msg && msg.success) {
                gateways.push({ worker, port });

                resolve({ success: true });

                return;
            }

            if (msg && msg.gw) {
                // enable GW messages console print
                console.log(JSON.stringify(msg.gw));
                return;
            }
        });

        worker.on('error', reject);

    });
};

const stopGateway = async (data) => {
    const port = data.config.port;

    if (gateways.every((gw) => gw.port !== port)) {
        return { success: true };
    }

    const foundWorker = gateways.find((gw) => gw.port === port).worker;

    await foundWorker.terminate();

    gateways = gateways.filter((gw) => gw.port !== port);

    return { success: true };
}

const commands = {
    "startGateway": { execute: startGateway },
    "stopGateway": { execute: stopGateway }
};

const handleHttpCommand = async (command, data) => {

    const foundCommand = commands[command];

    if (!foundCommand) {
        throw new Error(`Unrecognized command: ${command}`);
    }

    const commandResult = await foundCommand.execute(data);

    return commandResult;
};

module.exports = {
    handleHttpCommand
}