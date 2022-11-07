import { Gtf } from '../gtf';
import { Glue42Web } from "../../../../packages/web/web";
import { Listener } from './types';
import { Context } from './types';

export class GtfFdc3 implements Gtf.Fdc3 {
    private readonly channelsPrefix = "___channel___";
    private counter = 0;
    private activeListeners: Listener[] = [];

    constructor(private readonly glue: Glue42Web.API) { }

    public getContext(): Context {
        ++this.counter;

        return {
            type: `fdc3.integration.tests.${this.counter}`,
            name: `${Date.now()}${this.counter}`,
            id: {
                date: new Date().toLocaleDateString(),
                time: Date.now().toString(),
            }
        }
    }

    public addActiveListener(listener: Listener): void {
        this.activeListeners.push(listener);
    }

    public removeActiveListeners(): void {
        this.activeListeners = this.activeListeners.filter(listener => listener.unsubscribe());
    }

    public async removeCreatedChannels(): Promise<void> {
        await Promise.all(this.glue.contexts.all().map(ctxName => {
            if (!ctxName.includes(this.channelsPrefix)) {
                return this.glue.contexts.destroy(ctxName);
            }
        }));
    }
}