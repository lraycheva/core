import ServerProtocol from "./server";
import ClientProtocol from "./client";
import { Glue42Core } from "../../../../glue";
import ClientRepository from "../../client/repository";
import ServerRepository from "../../server/repository";
import Interop from "../../interop";
import { Protocol, InteropSettings } from "../../types";
import Connection from "../../../connection/connection";

export default function (instance: Glue42Core.AGM.Instance, connection: Connection, clientRepository: ClientRepository, serverRepository: ServerRepository, libConfig: InteropSettings, interop: Interop): Promise<Protocol> {
    const logger = libConfig.logger.subLogger("gw3-protocol");
    let resolveReadyPromise: ((p: Protocol) => void) | undefined;

    const readyPromise = new Promise<Protocol>((resolve) => {
        resolveReadyPromise = resolve;
    });

    // start domain join handshake
    const session = connection.domain("agm", ["subscribed"]);

    const server = new ServerProtocol(session, clientRepository, serverRepository, logger.subLogger("server"));
    const client = new ClientProtocol(session, clientRepository, logger.subLogger("client"));

    async function handleReconnect(): Promise<void> {
        // we're reconnecting
        logger.info("reconnected - will replay registered methods and subscriptions");

        client.drainSubscriptionsCache().forEach((sub) => {
            const methodInfo = sub.method;
            const params = Object.assign({}, sub.params);

            logger.info(`trying to soft-re-subscribe to method ${methodInfo.name}, with params: ${JSON.stringify(params)}`);

            interop.client.subscribe(methodInfo, params, undefined, undefined, sub).then(() => logger.info(`soft-subscribing to method ${methodInfo.name} DONE`)).catch((error) => logger.warn(`subscribing to method ${methodInfo.name} failed: ${JSON.stringify(error)}}`));
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const reconnectionPromises: Array<Promise<any>> = [];

        const existingSubscriptions = client.drainSubscriptions();

        for (const sub of existingSubscriptions) {
            const methodInfo = sub.method;
            const params = Object.assign({}, sub.params);
            // remove handlers, otherwise they will be added twice
            logger.info(`trying to re-subscribe to method ${methodInfo.name}, with params: ${JSON.stringify(params)}`);

            reconnectionPromises.push(
                interop.client.subscribe(methodInfo, params, undefined, undefined, sub).then(() => logger.info(`subscribing to method ${methodInfo.name} DONE`))
            );

        }

        // server side
        const registeredMethods = serverRepository.getList();
        serverRepository.reset();

        // replay server methods
        for (const method of registeredMethods) {
            const def = method.definition;
            logger.info(`re-publishing method ${def.name}`);

            if (method.stream) {
                // streaming method
                reconnectionPromises.push(
                    interop.server.createStream(def, method.streamCallbacks, undefined, undefined, method.stream).then(() => logger.info(`subscribing to method ${def.name} DONE`))
                );
            } else if (method.theFunction && method.theFunction.userCallback) {
                reconnectionPromises.push(
                    interop.register(def, method.theFunction.userCallback).then(() => logger.info(`subscribing to method ${def.name} DONE`))
                );
            } else if (method.theFunction && method.theFunction.userCallbackAsync) {
                reconnectionPromises.push(
                    interop.registerAsync(def, method.theFunction.userCallbackAsync).then(() => logger.info(`subscribing to method ${def.name} DONE`))
                );
            }

            logger.info(`re-publishing method ${def.name} DONE`);
        }

        await Promise.all(reconnectionPromises);

        logger.info("Interop is re-announced");
    }

    function handleInitialJoin() {
        if (resolveReadyPromise) {
            resolveReadyPromise({
                client,
                server,
            });

            resolveReadyPromise = undefined;
        }
    }

    session.onJoined((reconnect) => {
        // add our server to the client repository
        clientRepository.addServer(instance, connection.peerId);

        if (reconnect) {
            handleReconnect().then(() => connection.setLibReAnnounced({ name: "interop" })).catch((error) => logger.warn(`Error while re-announcing interop: ${JSON.stringify(error)}`));
        } else {
            handleInitialJoin();
        }
    });

    session.onLeft(() => {
        // reset the client repository when the connection is down
        clientRepository.reset();
    });

    session.join();

    return readyPromise;
}
