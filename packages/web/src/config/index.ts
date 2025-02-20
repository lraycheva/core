import { Glue42Web } from "../../web";
import { ParsedConfig } from "../shared/types";

const defaultConfig = {
    logger: "info",
    gateway: { webPlatform: {} },
    libraries: [],
    exposeGlue: true
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export const parseConfig = (config?: Glue42Web.Config): ParsedConfig => {
    const isPlatformInternal = !!(config as any)?.gateway?.webPlatform?.port;

    const combined: ParsedConfig = Object.assign({}, defaultConfig, config, { isPlatformInternal });

    if (combined.systemLogger) {
        combined.logger = combined.systemLogger.level ?? "info";
    }

    return combined;
};
