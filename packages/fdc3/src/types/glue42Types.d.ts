type ApplicationStartOptions = {
    waitForAGMReady?: boolean;
    ignoreSavedLayout?: boolean;
}

type ChannelContext = {
    name: string;
    meta: any;
    data: any;
}

type Intent = {
    name: string;
    handlers:  IntentHandler[];
}

type IntentContext = {
    readonly type?: string;
    readonly data?: { [key: string]: any };
}

type IntentRequest = {
    readonly intent: string;
    readonly target?: "startNew" | "reuse" | { app?: string; instance?: string };
    readonly context?: IntentContext;
    readonly options?: ApplicationStartOptions;
}

type IntentHandler = {
    applicationName: string;
    applicationTitle: string;
    applicationDescription?: string;
    applicationIcon?: string;
    type: "app" | "instance";
    displayName?: string;
    contextTypes?: string[];
    instanceId?: string;
    instanceTitle?: string;
}

type IntentResult = {
    request: IntentRequest;
    handler: IntentHandler;
    result?: any;
}

type AddIntentListenerRequest = {
    intent: string;
    contextTypes?: string[];
    displayName?: string;
    icon?: string;
    description?: string;
}

type IntentFilter = {
    name?: string;
    contextType?: string;
    resultType?: string;
}

type UnsubscribeFunction = {
    (): void;
}

type Application = {
    name: string;
    title?: string;
    version?: string;
    icon?: string;
    caption?: string;
    userProperties: any;
    instances: Instance[];
    start(context?: object, options?: ApplicationStartOptions): Promise<Instance>;
    onInstanceStarted(callback: (instance: Instance) => any): void;
    onInstanceStopped(callback: (instance: Instance) => any): void;
}

type Instance = {
    id: string;
    application: Application;
    activity: any;
    activityInstances: Instance[];
    activityOwnerInstance: Instance;
    window: any;
    context: object;
    title: string;
    isActivityInstance: boolean;
    activityId: string;
    inActivity: boolean;
    isSingleWindowApp: boolean;
    agm: any;
    stop(): Promise<void>;
    activate(): Promise<any>;
    onAgmReady(callback: (instance: Instance) => any): UnsubscribeFunction;
    onStopped(callback: (instance: Instance) => any): UnsubscribeFunction;
    getContext(): Promise<object>;
    getWindow(): Promise<any>;
}

type ImportResult = {
    imported: string[];
    errors: Array<{ app: string; error: string }>;
}

type PathValue = {
    path: string;
    value: any;
}

type GDWindow = {
    getContext(): Promise<any>;
}

type InstanceTarget = "best" | "all" | "skipMine" | { windowId: string } | ServerInstance[];

interface ChannelsAPI {
    subscribe(callback: (data: any, context: ChannelContext, updaterId: string) => void): () => void;
    subscribeFor(name: string, callback: (data: any, context: ChannelContext, updaterId: string) => void): Promise<() => void>;
    publish(data: any, name?: string): Promise<void>;
    all(): Promise<string[]>;
    list(): Promise<ChannelContext[]>;
    get(name: string): Promise<ChannelContext>;
    getMy(): Promise<ChannelContext>;
    join(name: string, windowId?: string): Promise<void>;
    leave(windowId?: string): Promise<void>;
    my(): string;
    onChanged(callback: (channel: string) => void): () => void;
    add(info: ChannelContext): Promise<ChannelContext>;
    current(): string;
    changed(callback: (channel: string) => void): () => void;
}

interface IntentsAPI {
    raise(request: string | IntentRequest): Promise<IntentResult>;
    all(): Promise<Intent[]>;
    addIntentListener(intent: string | AddIntentListenerRequest, handler: (context: IntentContext) => any): { unsubscribe: UnsubscribeFunction };
    find(intentFilter?: string | IntentFilter): Promise<Intent[]>;
}

interface AppManagerAPI {
    myInstance: Instance;
    inMemory: InMemoryStore;
    application(name: string): Application;
    applications(): Application[];
    instances(): Instance[];
    onInstanceStarted(callback: (instance: Instance) => any): UnsubscribeFunction;
    onInstanceStartFailed(callback: (instance: Instance) => any): UnsubscribeFunction;
    onInstanceStopped(callback: (instance: Instance) => any): UnsubscribeFunction;
    onInstanceUpdated(callback: (instance: Instance) => any): UnsubscribeFunction;
    onAppAdded(callback: (app: Application) => any): UnsubscribeFunction;
    onAppRemoved(callback: (app: Application) => any): UnsubscribeFunction;
    onAppAvailable(callback: (app: Application) => any): UnsubscribeFunction;
    onAppUnavailable(callback: (app: Application) => any): UnsubscribeFunction;
    onAppChanged(callback: (app: Application) => any): UnsubscribeFunction;
}

interface WindowsAPI {
    my(): GDWindow;
}

interface ServerInstance {
    peerId: string;
    instance: string;
    applicationName: string;
    windowId: string;
}

interface InteropMethodDefinition {
    name: string;
    objectTypes?: string[];
    displayName?: string;
    accepts?: string;
    returns?: string;
    description?: string;
    version?: number;
    supportsStreaming?: boolean;
    flags?: { [key: string]: any };
    getServers?(): ServerInstance[];
}

interface InteropMethod extends InteropMethodDefinition {
    objectTypes: string[];
    supportsStreaming: boolean;
    flags: { [key: string]: any };
    getServers(): ServerInstance[];
}

interface InteropMethodFilter {
    name: string;
}

interface InvocationResultCore<T> {
    called_with: any;
    executed_by: ServerInstance;
    message: string;
    method: InteropMethodDefinition;
    returned: T;
    status: number;
}
export interface InvocationResult<T> {
    all_errors: any[];
    all_return_values: InvocationResultCore<T>[];
    called_with: any;
    executed_by: ServerInstance;
    message: string;
    method: InteropMethodDefinition;
    returned: T;
    status: number;
}

interface InteropAPI {
    instance: ServerInstance;
    servers(): ServerInstance[];
    register<T=any, R=any>(name: string, handler: (args: T, caller: ServerInstance) => void | R | Promise<R>): Promise<void>;
    unregister(name: string): void;
    invoke<T>(methodName: string, argumentObj: any, target?: InstanceTarget): Promise<InvocationResult<T>>;
    methods(filter?: string | InteropMethodFilter ): InteropMethod[]
}

interface ContextsAPI {
    setPathSupported: boolean;
    all(): string[];
    update(name: string, data: any): Promise<void>;
    set(name: string, data: any): Promise<void>;
    setPath(name: string, path: string, data: any): Promise<void>;
    setPaths(name: string, paths: PathValue[]): Promise<void>;
    subscribe(name: string, callback: (data: any, delta: any, removed: string[], unsubscribe: () => void, extraData?: any) => void): Promise<() => void>;
    get(name: string): Promise<any>;
    destroy(name: string): Promise<any>;
}

export type GlueValidator = {
    isValid: boolean;
    error?: { message: string }
}

export type Definition = {
    name: string;
    type: string;
    title?: string;
    version?: string;
    details: any;
    customProperties?: any;
    icon?: string;
    caption?: string;
    intents?: Intent[];
    allowCapture?: boolean;
}

export type FDC3Definition = {
    name: string;
    title?: string;
    version?: string;
    appId: string;
    manifest: string;
    manifestType: string;
    tooltip?: string;
    description?: string;
    contactEmail?: string;
    supportEmail?: string;
    publisher?: string;
    images?: any[];
    icons?: any[];
    customConfig?: any;
    intents?: Intent[];
}

export type InMemoryStore = {
    import(definitions: Array<Definition | FDC3Definition>, mode?: "replace" | "merge"): Promise<ImportResult>;
    export(): Promise<Definition[]>;
    remove(name: string): Promise<void>;
    clear(): Promise<void>;
}

export type Config = {
    application?: string;
    contexts?: any;
    bus?: boolean;
    logger?: any;
    customLogger?: any;
}

export type Glue42GD =  {
    fdc3InitsGlue: boolean;
    originalGlue?: any;
};

export type Glue42FDC3ChannelContext = {
    data: any;
    latest_fdc3_type: string;
}

export interface SystemMethodEventPayload {
    channelId: string;
    clientId: string;
    contextType?: string | null;
    replayContextTypes?: string[];
}
export interface SystemMethodEventArgument {
    action: string;
    payload: SystemMethodEventPayload
}

export interface Glue42 {
    contexts: ContextsAPI
    channels: ChannelsAPI;
    intents: IntentsAPI;
    interop: InteropAPI;
    appManager: AppManagerAPI;
    windows: any;
    version?: string;
}