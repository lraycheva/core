import { Glue42Web } from "../../../packages/web/web.d";
import { Gtf } from "./gtf";

export class GtfChannels implements Gtf.Channels {
    constructor(private readonly glue: Glue42Web.API) {
    }

    public async resetContexts(): Promise<void[]> {
        const channels = await this.glue.channels.list();

        const resetContextsPromises = channels.map((channelContext) => this.glue.contexts.set(`___channel___${channelContext.name}`, {
            name: channelContext.name,
            meta: channelContext.meta,
            data: {}
        }));

        return Promise.all(resetContextsPromises);
    }
}
