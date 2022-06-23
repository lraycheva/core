describe("maximize() Should", () => {
    const config = {
        children: [
            {
                type: "row",
                children: [
                    {
                        type: "column",
                        children: [
                            {
                                type: "row",
                                children: []
                            }
                        ]
                    },
                    {
                        type: "column",
                        children: [
                            {
                                type: "group",
                                children: [
                                    {
                                        type: "window",
                                        appName: "noGlueApp"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        type: "column",
                        children: []
                    },
                    {
                        type: "column",
                        children: [{
                            type: "group",
                            children: []
                        }]
                    }
                ]
            }
        ]
    };

    let workspace;
    before(() => coreReady);
    beforeEach(async () => {
        workspace = await glue.workspaces.createWorkspace(config);
    });

    afterEach(async () => {
        const wsps = await glue.workspaces.getAllWorkspaces();
        await Promise.all(wsps.map((wsp) => wsp.close()));
    });
    Array.from(["row", "column", "group"]).forEach((type) => {
        it(`resolve when the item is a ${type}`, async () => {
            const targetItem = workspace.getAllBoxes().find(b => b.type === type);

            await targetItem.maximize();
        });

        it(`resolve when the item is an empty ${type}`, async () => {
            const targetItem = workspace.getAllBoxes().find(b => b.type === type && !b.children.length);

            await targetItem.maximize();
        });

        it(`resolve when the item is already maximized and is a ${type}`, async () => {
            const targetItem = workspace.getAllBoxes().find(b => b.type === type);

            await targetItem.maximize();
            await targetItem.maximize();
        });

        it(`update the property isMaximized to true when the item is a ${type}`, async () => {
            const targetItem = workspace.getAllBoxes().find(b => b.type === type);

            await targetItem.maximize();

            expect(targetItem.isMaximized).to.eql(true);
        });
    });
});