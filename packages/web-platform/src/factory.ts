import GlueWeb, { Glue42Web } from "@glue42/web";
import { Glue42WebPlatformFactoryFunction, Glue42WebPlatform } from "../platform";
import { Glue42API } from "./common/types";
import { checkIfPlacedInWorkspace, checkIsOpenerGlue } from "./fallbacks/core";
import { fallbackToEnterprise } from "./fallbacks/enterprise";
import { IoC } from "./shared/ioc";

export const glueWebPlatformFactory: Glue42WebPlatformFactoryFunction = async (config?: Glue42WebPlatform.Config): Promise<{ glue: Glue42Web.API | Glue42API; platform?: Glue42WebPlatform.API }> => {

    // when running the package in Enterprise, we do not initialize anything from the platform
    // because we cannot provide runtime environment configuration to Enterprise
    // the same is valid when the platform is instructed to start as a client only
    if (window.glue42gd) {
        return fallbackToEnterprise(config);
    }

    // check if in Core and started by another platform and add the flag to the if
    const isOpenerGlue = await checkIsOpenerGlue();

    // if the platform is a window inside a workspace frame, it should also fallback to being a simple client
    const isPlacedInWorkspace = checkIfPlacedInWorkspace();

    if (config?.clientOnly || isOpenerGlue || isPlacedInWorkspace) {
        const glue = config?.glueFactory ?
            await config?.glueFactory(config?.glue) :
            await GlueWeb(config?.glue);

        return { glue };
    }

    const ioc = new IoC(config);

    await ioc.platform.ready();

    const glue = ioc.platform.getClientGlue();

    return { glue, platform: ioc?.platform.getPlatformApi() };
};
