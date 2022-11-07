export interface Listener {
    unsubscribe(): void;
}

export interface Context {
    id?: {
        [key: string]: string;
    };
    name?: string;
    type: string;
}

export interface AppIdentifier {
    readonly appId: string;
    readonly instanceId?: string;
}


export interface IntentResolution {
    readonly source: AppIdentifier;
    readonly intent: string;
    readonly version?: string;
    getResult(): Promise<IntentResult>;
}

export declare type IntentResult = Context | Channel;

export interface Channel {
    readonly id: string;
    readonly type: 'user' | 'app' | 'private';
    readonly displayMetadata?: DisplayMetadata;
    broadcast(context: Context): Promise<void>;
    getCurrentContext(contextType?: string): Promise<Context | null>;
    addContextListener(handler: ContextHandler): Promise<Listener>;
    addContextListener(contextType: string | null, handler: ContextHandler): Promise<Listener>;
}


export interface Fdc3IntentResolution {
    resolutionResult: any;
    data: any;
}

export interface DisplayMetadata {
    readonly name?: string;
    readonly color?: string;
    readonly glyph?: string;
}

export declare type ContextHandler = (context: Context, metadata?: ContextMetadata) => void;

export interface ContextMetadata {
    readonly source: AppIdentifier;
}
export interface Listener {
    unsubscribe(): void;
}




