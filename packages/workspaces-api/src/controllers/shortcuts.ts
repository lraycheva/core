import { UnsubscribeFunction } from "callback-registry";
import { Bridge } from "../communication/bridge";
import { CLIENT_OPERATIONS, OPERATIONS } from "../communication/constants";
import CallbackRegistry from "callback-registry";


export class ShortcutsController {
    private _shortcuts = CallbackRegistry();
    constructor(
        private readonly bridge: Bridge,
    ) { 
        this.bridge.onOperation((payload, caller) => {
            if (payload.operation === CLIENT_OPERATIONS.shortcutClicked.name) {
                this._shortcuts.execute(payload.data.shortcut);
            }
        })
    }

    public async registerShortcut(shortcut: string, frameId: string, callback: () => void): Promise<UnsubscribeFunction> {
        await this.bridge.send<void>(OPERATIONS.registerShortcut.name, { shortcut, frameId });
        const un = this._shortcuts.add(shortcut, callback);
        return () => {
            un();
            this.bridge.send<void>(OPERATIONS.unregisterShortcut.name, { shortcut, frameId });
        }
    }
}
