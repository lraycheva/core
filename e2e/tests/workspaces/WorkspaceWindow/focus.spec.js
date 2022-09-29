describe("window.focus() Should", () => {
    const windowConfig = {
        type: "window",
        appName: "noGlueApp"
    };

    const basicConfig = {
        children: [
            {
                type: "row",
                children: [
                    {
                        type: "group",
                        children: [
                            windowConfig,
                            windowConfig,
                            windowConfig
                        ]
                    },
                    {
                        type: "group",
                        children: [
                            windowConfig,
                            windowConfig,
                            windowConfig
                        ]
                    }
                ]
            }
        ]
    }

    let workspace = undefined;
    let firstGroup = undefined;
    let secondGroup = undefined;

    before(async () => {
        await coreReady;
        workspace = await glue.workspaces.createWorkspace(basicConfig);

        firstGroup = workspace.getAllGroups()[0];
        secondGroup = workspace.getAllGroups()[1];
    });

    beforeEach(async () => {
        const firstWindowInFirstGroup = firstGroup.children.find((c) => c.positionIndex === 0);
        const firstWindowInSecondGroup = secondGroup.children.find((c) => c.positionIndex === 0);

        await Promise.all([firstWindowInFirstGroup.focus(), firstWindowInSecondGroup.focus()]);

        await workspace.refreshReference();
    });

    after(async () => {
        const frames = await glue.workspaces.getAllFrames();
        await Promise.all(frames.map((f) => f.close()));
    });

    it("resolve", async () => {
        const secondWindowInFirstGroup = firstGroup.children.find((c) => c.positionIndex === 1);

        await secondWindowInFirstGroup.focus();
    });

    it("resolve when invoked two times for the same window", async() => {
        const secondWindowInFirstGroup = firstGroup.children.find((c) => c.positionIndex === 1);

        await secondWindowInFirstGroup.focus();
        await secondWindowInFirstGroup.focus();
    });

    it("change the selection", async() => {
        const firstWindowInFirstGroup = firstGroup.children.find((c) => c.positionIndex === 0);
        const secondWindowInFirstGroup = firstGroup.children.find((c) => c.positionIndex === 1);

        await secondWindowInFirstGroup.focus();

        expect(firstWindowInFirstGroup.isSelected).to.eql(false);
        expect(secondWindowInFirstGroup.isSelected).to.eql(true);
    });

    it("change the selection without affecting other windows", async() => {
        const firstWindowInSecondGroup = secondGroup.children.find((c) => c.positionIndex === 0);
        const secondWindowInFirstGroup = firstGroup.children.find((c) => c.positionIndex === 1);

        await secondWindowInFirstGroup.focus();
        await workspace.refreshReference();

        expect(secondWindowInFirstGroup.isSelected).to.eql(true);
        expect(secondGroup.children.find((c) => c.positionIndex === 0));
    });
});