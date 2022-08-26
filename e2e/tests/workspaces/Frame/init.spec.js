describe("init() Should ", () => {
    const iconForTesting = `data:image/svg+xml,%3Csvg version='1.1' xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 512 512'%3E%3Cpath
    d='M224 448v-96h64v96l-32 64zM336 224v-160c48 0 80-32 80-64v0 0h-320c0 32 32 64 80 64v160c-73.6 22.4-112 64-112 128h384c0-64-38.4-105.6-112-128z'%3E%3C/path%3E%3C/svg%3E%0A`;

    const basicConfig = {
        children: [
            {
                type: "row",
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
            }
        ]
    };

    const layoutName = "layout.integration.tests";

    before(async () => {
        await coreReady;

        const workspaceToSave = await glue.workspaces.createWorkspace(basicConfig);

        await workspaceToSave.saveLayout(layoutName);

        await workspaceToSave.close();
    });

    beforeEach(async () => {
        return glue.workspaces.createEmptyFrame();
    });

    afterEach(async () => {
        gtf.clearWindowActiveHooks();
        const frames = await glue.workspaces.getAllFrames();
        await Promise.all(frames.map((frame) => frame.close()));
    });

    after(() => {
        return glue.workspaces.layouts.delete(layoutName);
    });

    it("start the workspaces when 3 workspaces are passed as createWorkspace configs", async () => {
        const emptyFrame = (await glue.workspaces.getAllFrames()).find(f => !f.isInitialized);

        await emptyFrame.init({ workspaces: [basicConfig, basicConfig, basicConfig] });

        const workspacesInFrame = await emptyFrame.workspaces();

        expect(workspacesInFrame.length).to.eql(3);
    });

    it("start the workspaces when 3 workspaces are passed as layout definitions", async () => {
        const emptyFrame = (await glue.workspaces.getAllFrames()).find(f => !f.isInitialized);

        await emptyFrame.init({ workspaces: [{ name: layoutName }, { name: layoutName }, { name: layoutName }] });

        const workspacesInFrame = await emptyFrame.workspaces();

        expect(workspacesInFrame.length).to.eql(3);
    });

    it("start the workspaces when 3 workspaces are passed both as createWorkspaces configs and layout definitions", async () => {
        const emptyFrame = (await glue.workspaces.getAllFrames()).find(f => !f.isInitialized);

        await emptyFrame.init({ workspaces: [basicConfig, { name: layoutName }, basicConfig] });

        const workspacesInFrame = await emptyFrame.workspaces();

        expect(workspacesInFrame.length).to.eql(3);
    });

    describe("isSelected", () => {
        it("select the last workspace when none of the workspaces have isSelected set", async () => {
            const emptyFrame = (await glue.workspaces.getAllFrames()).find(f => !f.isInitialized);

            await emptyFrame.init({ workspaces: [basicConfig, { name: layoutName }, basicConfig] });

            const workspacesInFrame = await emptyFrame.workspaces();

            expect(workspacesInFrame[2].isSelected).to.eql(true);
        });

        it("select the first workspace when isSelected is passed and the workspace is createWorkspaces config", async () => {
            const emptyFrame = (await glue.workspaces.getAllFrames()).find(f => !f.isInitialized);

            await emptyFrame.init({ workspaces: [Object.assign({}, basicConfig, { config: { isSelected: true } }), { name: layoutName }, basicConfig] });

            const workspacesInFrame = await emptyFrame.workspaces();

            expect(workspacesInFrame[0].isSelected).to.eql(true);
        });

        it("select the second workspace when isSelected is passed and the workspace is a layout definition", async () => {
            const emptyFrame = (await glue.workspaces.getAllFrames()).find(f => !f.isInitialized);

            await emptyFrame.init({ workspaces: [basicConfig, { name: layoutName, restoreOptions: { isSelected: true } }, basicConfig] });

            const workspacesInFrame = await emptyFrame.workspaces();

            expect(workspacesInFrame[1].isSelected).to.eql(true);
        });
    });

    describe("isPinned", () => {
        const basicConfigWithIcon = Object.assign({}, basicConfig, { config: { icon: iconForTesting, isPinned: true } });

        it("open all workspaces as pinned when all of them have isPinned:true and icon set and are both layouts and workspaces", async () => {
            const emptyFrame = (await glue.workspaces.getAllFrames()).find(f => !f.isInitialized);
            await emptyFrame.init({ workspaces: [basicConfigWithIcon, { name: layoutName, restoreOptions: { isPinned: true, icon: iconForTesting } }, basicConfigWithIcon] });

            const workspacesInEmptyFrame = await emptyFrame.workspaces();

            expect(workspacesInEmptyFrame.every((w) => w.isPinned)).to.be.true;
        });
    });

    describe("locking", () => {
        ["showSaveButton",
            "showCloseButton",
            "allowExtract",
            "allowWindowReorder",
            "allowWorkspaceTabReorder",
            "allowSplitters",
            "allowDropLeft",
            "allowDropTop",
            "allowDropRight",
            "allowDropBottom",
            "showWindowCloseButtons",
            "showEjectButtons",
            "showAddWindowButtons"].forEach((propertyUnderTest) => {
                it(`put ${propertyUnderTest} in a locked state when ${propertyUnderTest}: false is passed to workspace definition`, async () => {
                    const emptyFrame = (await glue.workspaces.getAllFrames()).find(f => !f.isInitialized);
                    const lockedBasicConfig = Object.assign({}, basicConfig, { config: { [propertyUnderTest]: false } });
                    await emptyFrame.init({ workspaces: [lockedBasicConfig,] });

                    const workspacesInEmptyFrame = await emptyFrame.workspaces();

                    expect(workspacesInEmptyFrame.every((w) => !w[propertyUnderTest])).to.be.true;
                });
            });
    });

    describe("title", () => {
        it("start the workspace with the custom titles", async () => {
            const customTitle1 = "customTitle1";
            const customTitle2 = "customTitle2";
            const emptyFrame = (await glue.workspaces.getAllFrames()).find(f => !f.isInitialized);

            await emptyFrame.init({ workspaces: [Object.assign({}, basicConfig, { config: { title: customTitle1 } }), { name: layoutName, restoreOptions: { title: customTitle2 } }] });

            const workspacesInFrame = await emptyFrame.workspaces();

            expect(workspacesInFrame[0].title).to.eql(customTitle1);
            expect(workspacesInFrame[1].title).to.eql(customTitle2);
        });
    });

    it("reject the promise when the frame is already initialized", (done) => {
        glue.workspaces.createWorkspace(basicConfig).then(() => {
            return workspace.frame.init({ workspaces: [basicConfig] })
        }).then(() => {
            done("Should not resolve");
        }).catch(() => {
            done();
        });
    });
});