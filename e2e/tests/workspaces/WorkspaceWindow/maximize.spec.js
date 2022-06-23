describe("maximize() Should", () => {
    const windowConfig = {
        type: "window",
        appName: "dummyApp"
    };

    const basicConfig = {
        children: [
            {
                type: "row",
                children: [
                ]
            }
        ]
    }

    const complexConfig = {
        "children": [
            {
                "config": {},
                "type": "column",
                "children": [
                    {
                        "config": {},
                        "type": "row",
                        "children": [
                            {
                                type: "window",
                                appName: "noGlueApp"
                            },
                        ]
                    },
                    {
                        "config": {
                            maximizationBoundary: true
                        },
                        "type": "row",
                        "children": [
                            {
                                "config": {},
                                "type": "column",
                                "children": [
                                    {
                                        type: "window",
                                        appName: "noGlueApp"
                                    },
                                ]
                            },
                            {
                                "config": {
                                    maximizationBoundary: true
                                },
                                "type": "column",
                                "children": [
                                    {
                                        "config": {},
                                        "type": "row",
                                        "children": [
                                            {
                                                "config": {},
                                                "type": "group",
                                                "children": [
                                                    {
                                                        type: "window",
                                                        appName: "noGlueApp"
                                                    },
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        "config": {},
                                        "type": "row",
                                        "children": [
                                            {
                                                "config": {},
                                                "type": "group",
                                                "children": [
                                                    {
                                                        type: "window",
                                                        appName: "noGlueApp"
                                                    },
                                                    {
                                                        type: "window",
                                                        appName: "noGlueApp"
                                                    },
                                                    {
                                                        type: "window",
                                                        appName: "noGlueApp"
                                                    },
                                                    {
                                                        type: "window",
                                                        appName: "noGlueApp"
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    }

    let workspace = undefined;
    let window = undefined;

    before(() => coreReady);

    beforeEach(async () => {
        workspace = await glue.workspaces.createWorkspace(basicConfig);

        await workspace.addWindow(windowConfig);

        await workspace.refreshReference();

        const windows = workspace.getAllWindows();
        window = windows[0];
    });

    afterEach(async () => {
        const frames = await glue.workspaces.getAllFrames();
        await Promise.all(frames.map((f) => f.close()));
    });

    it("return a promise", async () => {
        const maximizePromise = window.maximize();

        expect(maximizePromise.then).to.be.a("function");
        expect(maximizePromise.catch).to.be.a("function");
    });

    it("resolve the promise", async () => {
        await window.maximize();
    });

    it("change the window state to maximized when the window is not loaded", async () => {
        await window.maximize();
        await workspace.refreshReference();

        const windows = workspace.getAllWindows();
        window = windows[0];

        expect(window.isMaximized).to.be.true;
    });

    it("change the window state to maximized when the window is loaded", async () => {
        await window.forceLoad();
        await workspace.refreshReference();

        let windows = workspace.getAllWindows();
        window = windows[0];

        await window.maximize();
        await workspace.refreshReference();

        windows = workspace.getAllWindows();
        window = windows[0];

        expect(window.isMaximized).to.be.true;
    });

    it("maxmize the window successfully when there is a maximization boundary", async () => {
        const complexWorkspace = await glue.workspaces.createWorkspace(complexConfig);

        const groupWithWindowToMaximize = complexWorkspace.getAllGroups().find(g => g.children.length === 4);
        const windowToMaximize = groupWithWindowToMaximize.children[0];
        await windowToMaximize.maximize();

        expect(windowToMaximize.isMaximized).to.be.true;
    });

    it("maximize the window successfully when there is already a maximized window within a boundary", async () => {
        const complexWorkspace = await glue.workspaces.createWorkspace(complexConfig);

        const groupWithWindowToMaximize = complexWorkspace.getAllGroups().find(g => g.children.length === 4);
        const windowToMaximizeInBoundary = groupWithWindowToMaximize.children[0];
        const windowToMaximize = workspace.children[0].children[0];

        await windowToMaximizeInBoundary.maximize();
        await windowToMaximize.maximize();

        expect(windowToMaximizeInBoundary.isMaximized).to.be.true;
        expect(windowToMaximize.isMaximized).to.be.true;
    });

    it("maxmize the window from the second invocation and restore the first one when trying to maximize to windows in the same boundary", async ()=>{
        const complexWorkspace = await glue.workspaces.createWorkspace(complexConfig);

        const groupWithWindowToMaximize = complexWorkspace.getAllGroups().find(g => g.children.length === 4);
        const secondGroupWithWindowToMaximize = complexWorkspace.getAllGroups().find(g => g.children.length === 1);
        const windowToMaximizeInBoundary = groupWithWindowToMaximize.children[0];
        const secondWindowToMaximizeInBoundary = secondGroupWithWindowToMaximize.children[0];

        await windowToMaximizeInBoundary.maximize();
        await secondWindowToMaximizeInBoundary.maximize();

        expect(windowToMaximizeInBoundary.isMaximized).to.be.false;
        expect(secondWindowToMaximizeInBoundary.isMaximized).to.be.true;
    });

    it("maxmize two windows succesfully when they are targeting different boundarys", async ()=>{
        const complexWorkspace = await glue.workspaces.createWorkspace(complexConfig);

        const groupWithWindowToMaximize = complexWorkspace.getAllGroups().find(g => g.children.length === 4);
        const windowToMaximizeInBoundary = groupWithWindowToMaximize.children[0];
        const secondWindowToMaximizeInBoundary = complexWorkspace.children[0].children[1].children[0].children[0];

        await windowToMaximizeInBoundary.maximize();
        await secondWindowToMaximizeInBoundary.maximize();

        expect(windowToMaximizeInBoundary.isMaximized).to.be.true;
        expect(secondWindowToMaximizeInBoundary.isMaximized).to.be.true;
    });

    describe("", () => {
        before(async () => {
            await glue.workspaces.createWorkspace(basicConfig);
        });

        it("resolve the promise when the workspace is not focused", async () => {
            await window.maximize();
        });

        it("change the window state to maximized when the window is not loaded and the workspace is not focused", async () => {
            await window.maximize();
            await workspace.refreshReference();

            const windows = workspace.getAllWindows();
            window = windows[0];

            expect(window.isMaximized).to.be.true;
        });

        it("change the window state to maximized when the window is loaded and the workspace is not focused", async () => {
            await window.forceLoad();
            await workspace.refreshReference();

            let windows = workspace.getAllWindows();
            window = windows[0];

            await window.maximize();
            await workspace.refreshReference();

            windows = workspace.getAllWindows();
            window = windows[0];

            expect(window.isMaximized).to.be.true;
        });
    });
});
