import { nanoid } from "nanoid";
import { Glue42Web } from "../../web";
import { SessionStorageController } from "../shared/session";
import { ParsedConfig } from "../shared/types";

const defaultConfig = {
    logger: "info",
    gateway: { webPlatform: {} },
    libraries: []
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export const parseConfig = (session: SessionStorageController, config?: Glue42Web.Config): ParsedConfig => {
    const isPlatformInternal = !!(config as any)?.gateway?.webPlatform?.port;

    const combined: ParsedConfig = Object.assign({}, defaultConfig, config, { isPlatformInternal });

    if (combined.systemLogger) {
        combined.logger = combined.systemLogger.level ?? "info";
    }

    let webSettings = session.getWebSettings();

    if (!webSettings) {

        webSettings = {
            clientInstanceId: nanoid()
        };

        session.saveWebSettings(webSettings);
    }

    combined.identity = {
        instance: webSettings.clientInstanceId
    };

    return combined;
};
