import { Channel } from "@finos/fdc3";

export interface SystemChannel extends Channel {
    join(): Promise<void>,
    leave(): Promise<void>
}