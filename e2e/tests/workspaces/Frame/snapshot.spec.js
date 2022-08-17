describe("snapshot() Should", () => {
    before(() => coreReady);

    const layoutName = "layout.integration.tests";

    const basicConfig = {
        children: [{
            type: "column",
            children: [
                {
                    type: "row",
                    children: [{
                        type: "group",
                        children: [{
                            type: "window",
                            appName: "noGlueApp"
                        }]
                    }]
                },
                {
                    type: "row",
                    children: [{
                        type: "group",
                        children: [{
                            type: "window",
                            appName: "noGlueApp"
                        }]
                    }]
                }
            ]
        }]
    }

    afterEach(async () => {
        const summaries = await glue.workspaces.layouts.getSummaries();
        if (summaries.some(s => s.name === layoutName)) {
            await glue.workspaces.layouts.delete(layoutName);
        }
        const frames = await glue.workspaces.getAllFrames();
        await Promise.all(frames.map((f) => f.close()));
    });

    it("resolve", async () => {
        const workspace = await glue.workspaces.createWorkspace(basicConfig);
        const frame = workspace.frame;
        await frame.snapshot();
    });

    Array.from({ length: 5 }).forEach((_, i) => {
        it(`return ${i + 1} workspace snapshots when the frame has ${i + 1} workspaces`, async () => {
            const numberOfWorkspaces = i + 1;
            const workspaces = [];
            for (let i = 0; i < numberOfWorkspaces; i++) {
                workspaces.push(await glue.workspaces.createWorkspace(basicConfig));
            }
            const frame = workspaces[0].frame;
            const snapshot = await frame.snapshot();

            expect(snapshot.workspaces.length).to.eql(numberOfWorkspaces);
        });

        it(`return a the workspace context on top level in the workspace snapshots for each of the ${i + 1} workspaces`, async () => {
            const numberOfWorkspaces = i + 1;
            const workspaces = [];
            for (let i = 0; i < numberOfWorkspaces; i++) {
                workspaces.push(await glue.workspaces.createWorkspace(basicConfig));
            }

            await Promise.all(workspaces.map(async (w) => {
                const newContext = { "test": w.id };
                await w.setContext(newContext);

                return newContext;
            }));

            const snapshot = await workspaces[0].frame.snapshot();

            snapshot.workspaces.forEach((ws) => {
                expect(ws.context).to.eql({ "test": ws.id });
            });

        });
    });

    it("have a matching id to the one of the frame", async () => {
        const workspace = await glue.workspaces.createWorkspace(basicConfig);
        const frame = workspace.frame;
        const snapshot = await frame.snapshot();

        expect(frame.id).to.eql(snapshot.id);
    });

    it("return a workspace with isSelected:true and with id matching the selected one", async () => {
        const workspace = await glue.workspaces.createWorkspace(basicConfig);
        const frame = workspace.frame;
        const secondWorkspace = await frame.createWorkspace(basicConfig);
        const thirdWorkspace = await frame.createWorkspace(basicConfig);

        await secondWorkspace.focus();

        const snapshot = await frame.snapshot();
        const selectedSnapshot = snapshot.workspaces.find(w => w.config.isSelected);

        expect(selectedSnapshot.id).to.eql(secondWorkspace.id);
    });

    it("have a workspace with the correct layoutName when the frame contains a restored layout", async () => {
        const workspace = await glue.workspaces.createWorkspace(basicConfig);
        await workspace.saveLayout(layoutName);
        await workspace.close();

        const restoredWorkspace = await glue.workspaces.restoreWorkspace(layoutName);
        const snapshot = await restoredWorkspace.frame.snapshot();

        expect(snapshot.workspaces[0].config.layoutName).to.eql(layoutName);
    });
});