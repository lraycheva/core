import { Gtf } from "../gtf";

export class DesktopGateway implements Gtf.DesktopGateway {
    constructor(private readonly _port: number) { }

    public get port(): number {
        return this._port;
    }
}