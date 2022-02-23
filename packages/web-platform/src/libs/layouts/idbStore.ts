/* eslint-disable indent */
import { IDBPDatabase } from "idb";
import { Glue42Web } from "@glue42/web";
import { layoutDecoder, layoutTypeDecoder } from "./decoders";
import { IoC } from "../../shared/ioc";
import { Glue42CoreDB } from "../../common/types";

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
            case "Workspace": return (await this.database).getAll<"workspaceLayouts">("workspaceLayouts");
            case "Global": return (await this.database).getAll<"globalLayouts">("globalLayouts");
            default: throw new Error(`The provided layout type is not recognized: ${layoutType}`);
        }
    }

    public async delete(name: string, layoutType: Glue42Web.Layouts.LayoutType): Promise<void> {
        switch (layoutType) {
            case "Workspace": return (await this.database).delete<"workspaceLayouts">("workspaceLayouts", name);
            case "Global": return (await this.database).delete<"globalLayouts">("globalLayouts", name);
            default: throw new Error(`The provided layout type is not recognized: ${layoutType}`);
        }
    }

    public async clear(layoutType: Glue42Web.Layouts.LayoutType): Promise<void> {
        switch (layoutType) {
            case "Workspace": return (await this.database).clear("workspaceLayouts");
            case "Global": return (await this.database).clear("globalLayouts");
            default: throw new Error(`The provided layout type is not recognized: ${layoutType}`);
        }
    }

    public async get(name: string, layoutType: Glue42Web.Layouts.LayoutType): Promise<Glue42Web.Layouts.Layout | undefined> {
        switch (layoutType) {
            case "Workspace": return (await this.database).get<"workspaceLayouts">("workspaceLayouts", name);
            case "Global": return (await this.database).get<"globalLayouts">("globalLayouts", name);
            default: throw new Error(`The provided layout type is not recognized: ${layoutType}`);
        }
    }

    public async store(layout: Glue42Web.Layouts.Layout, layoutType: Glue42Web.Layouts.LayoutType): Promise<string> {
        layoutDecoder.runWithException(layout);
        layoutTypeDecoder.runWithException(layoutType);

        switch (layoutType) {
            case "Workspace": return (await this.database).put<"workspaceLayouts">("workspaceLayouts", layout, layout.name);
            case "Global": return (await this.database).put<"globalLayouts">("globalLayouts", layout, layout.name);
            default: throw new Error(`The provided layout type is not recognized: ${layoutType}`);
        }
    }

}
