const { parentPort, workerData } = require("worker_threads");
const GW = require("@glue42/gateway-ws");

// const defaultGwURL = `ws://localhost:${port}/gw`;

const start = async () => {
    const gatewayConfig = workerData.rejectConnection ? {
        port: workerData.port,
        clients: { inactive_seconds: 0 },
        security: {
            origin_filters: {
                missing: "blacklist",
                non_matched: "blacklist"
            }
        }
    } : {
        port: workerData.port,
        clients: { inactive_seconds: 0 },
        security: {
            origin_filters: {
                missing: "whitelist",
                whitelist: ["#http://localhost:.*", "#chrome-extension://.*"],
                non_matched: "blacklist"
            }
        }
    };

    const gateway = GW.create(gatewayConfig);

    GW.configure_logging({
        level: "warn",
        appender: (logInfo) => {
            const message = logInfo.output;
            const ll = logInfo.level;

            switch (ll) {
                case "trace":
                    parentPort.postMessage({ gw: message });
                    // tslint:disable-next-line:no-console
                    // console.info(message);
                    break;
                case "debug":
                    parentPort.postMessage({ gw: message });
                    // tslint:disable-next-line:no-console
                    // console.info(message);
                    break;
                case "info":
                    parentPort.postMessage({ gw: message });
                    // tslint:disable-next-line:no-console
                    //console.info(message);
                    break;
                case "warn":
                    parentPort.postMessage({ gw: message });
                    // tslint:disable-next-line: no-console
                    // console.warn(message);
                    break;
                case "error":
                    parentPort.postMessage({ gw: message });
                    // tslint:disable-next-line:no-console
                    // console.error(message);
                    break;
            }
        }
    });

    await gateway.start();
}

// necessary, in order to call onError in the main thread
process.on('unhandledRejection', err => {
    throw err;
});

start().then(() => parentPort.postMessage({ success: true }));
