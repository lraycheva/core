/* eslint-disable indent */
import { IDBPDatabase } from "idb";
import { Glue42Web } from "@glue42/web";
import { IoC } from "../../shared/ioc";
import { Glue42CoreDB } from "../../common/types";
import { glueLayoutDecoder, layoutTypeDecoder } from "../../shared/decoders";

export class IdbLayoutsStore {

    constructor(private readonly ioc: IoC) {
        if (!("indexedDB" in window)) {
            throw new Error("Cannot initialize the local storage, because IndexedDb is not supported");
        }
    }

    private get database(): Promise<IDBPDatabase<Glue42CoreDB>> {
        return this.ioc.getDatabase();
    }

    public async getAll(layoutType: Glue42Web.Layouts.LayoutType): Promise<Glue42Web.Layouts.Layout[]> {
        switch (layoutType) {
            case "Workspace": return (await this.database).getAll("workspaceLayouts" as never);
            case "Global": return (await this.database).getAll("globalLayouts" as never);
            default: throw new Error(`The provided layout type is not recognized: ${layoutType}`);
        }
    }

    public async delete(name: string, layoutType: Glue42Web.Layouts.LayoutType): Promise<void> {
        switch (layoutType) {
            case "Workspace": return (await this.database).delete("workspaceLayouts" as never, name);
            case "Global": return (await this.database).delete("globalLayouts" as never, name);
            default: throw new Error(`The provided layout type is not recognized: ${layoutType}`);
        }
    }

    public async clear(layoutType: Glue42Web.Layouts.LayoutType): Promise<void> {
        switch (layoutType) {
            case "Workspace": return (await this.database).clear("workspaceLayouts" as never);
            case "Global": return (await this.database).clear("globalLayouts" as never);
            default: throw new Error(`The provided layout type is not recognized: ${layoutType}`);
        }
    }

    public async get(name: string, layoutType: Glue42Web.Layouts.LayoutType): Promise<Glue42Web.Layouts.Layout | undefined> {
        switch (layoutType) {
            case "Workspace": return (await this.database).get("workspaceLayouts" as never, name);
            case "Global": return (await this.database).get("globalLayouts" as never, name);
            default: throw new Error(`The provided layout type is not recognized: ${layoutType}`);
        }
    }

    public async store(layout: Glue42Web.Layouts.Layout, layoutType: Glue42Web.Layouts.LayoutType): Promise<IDBValidKey> {
        glueLayoutDecoder.runWithException(layout);
        layoutTypeDecoder.runWithException(layoutType);

        switch (layoutType) {
            case "Workspace": return (await this.database).put("workspaceLayouts" as never, layout, layout.name);
            case "Global": return (await this.database).put("globalLayouts" as never, layout, layout.name);
            default: throw new Error(`The provided layout type is not recognized: ${layoutType}`);
        }
    }

}
