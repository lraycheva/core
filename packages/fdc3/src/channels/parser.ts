import { Context } from '@finos/fdc3';

export class ChannelsParser {
    private readonly contextPrefix = "___channel___";
    private readonly fdc3Delimiter = "&";

    public mapChannelNameToContextName(channelName: string): string {
        return `${this.contextPrefix}${channelName}`;
    }

    public parseGlue42DataToInitialFDC3Data(glue42Data: { data: any, latest_fdc3_type: string}): Context {
        const latestPublishedData = this.parseContextsDataToInitialFDC3Data(glue42Data);
    
        const initialFDC3DataArr = Object.entries(glue42Data.data).map(([fdc3Type, dataValue]: [string, any]) => {
            const type = this.removeFDC3Prefix(fdc3Type);
            return { type, ...dataValue };
        });
    
        return Object.assign({}, ...initialFDC3DataArr, latestPublishedData);
    }

    public parseContextsDataToInitialFDC3Data = (context: { data: any, latest_fdc3_type: string }): Context  => {      
        const { data, latest_fdc3_type } = context;

        const parsedType = this.mapChannelsDelimiterToFDC3Type(latest_fdc3_type);

        return { type: parsedType, ...data[`fdc3_${latest_fdc3_type}`] };
    }

    public parseFDC3ContextToGlueContexts(context: Context) {
        const { type, ...rest } = context;

        const parsedType = this.mapFDC3TypeToChannelsDelimiter(type);
    
        return { [`fdc3_${parsedType}`]: rest };
    }

    public mapFDC3TypeToChannelsDelimiter(type: string): string {
        return type.split(".").join(this.fdc3Delimiter);
    }

    private mapChannelsDelimiterToFDC3Type(type: string): string {
        return type.split(this.fdc3Delimiter).join(".");
    }
    
    private removeFDC3Prefix(type: string): string {
        const typeWithoutPrefix = type.split("_").slice(1).join("");
        return this.mapChannelsDelimiterToFDC3Type(typeWithoutPrefix);
    }
}