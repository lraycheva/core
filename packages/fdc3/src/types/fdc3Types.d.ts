import { DisplayMetadata, Listener } from '@finos/fdc3';
import { ChannelContext } from './glue42Types';

export interface ChannelMetadata {
    id?: string;
    type?: "user" | "app" | "private";
    displayMetadata?: any;
    isChannel: true;
}

export interface PrivateChannelListener {
    id: string;
    listener: Listener
}

export interface ExtendedDisplayMetadata extends DisplayMetadata {
    glueChannel: ChannelContext
}
