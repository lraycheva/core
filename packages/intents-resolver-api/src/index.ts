import { IoC } from './shared/ioc';
import { Glue42 } from './types/glue';
import { IntentsResolverFactoryFunction } from './types/types';

const factoryFunction: IntentsResolverFactoryFunction = async (glue: Glue42): Promise<void> => {
    const ioc = new IoC();

    try {
        await ioc.glueController.initialize(glue);
    } catch (error) {
        throw new Error(`The Intents Resolver API did not initialized successfully. Error: ${error}`);
    }

    glue.intents.resolver = ioc.intentsResolver;

    Object.freeze(glue.intents);
};

// attach to window
if (typeof window !== "undefined") {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    (window as any).GlueIntentsResolver = factoryFunction;
}

export default factoryFunction;
