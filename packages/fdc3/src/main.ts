import { IoC } from './shared/ioc';
import { DesktopAgent } from '@finos/fdc3';

const fdc3Factory = (): DesktopAgent => {
    const ioc = new IoC();

    ioc.glueController.createGluePromise();

    ioc.eventReceiver.start();

    return ioc.fdc3;
}

export default fdc3Factory;
