describe("restore() Should", () => {
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
    };

    let workspace = undefined;
    let window = undefined;
    before(() => coreReady);

    beforeEach(async () => {
        workspace = await glue.workspaces.createWorkspace(basicConfig);
        await workspace.addWindow(windowConfig);
        await workspace.refreshReference();

        const windows = workspace.getAllWindows();
        window = windows[0];

        await window.maximize();
        await workspace.refreshReference();
    })

    afterEach(async () => {
        const frames = await glue.workspaces.getAllFrames();
        await Promise.all(frames.map((f) => f.close()));
    });

    it("return a promise", async () => {
        const restorePromise = window.restore();

        expect(restorePromise.then).to.be.a("function");
        expect(restorePromise.catch).to.be.a("function");
    });

    it("resolve the promise", async () => {
        await window.restore();
    });

    it("change the window state to normal when the window is not loaded", async () => {
        await window.restore();
        await workspace.refreshReference();

        const windows = workspace.getAllWindows();
        window = windows[0];

        expect(window.isMaximized).to.be.false;
    });

    it("change the window state to maximized when the window is loaded", async () => {
        await window.forceLoad();
        await workspace.refreshReference();

        let windows = workspace.getAllWindows();
        window = windows[0];

        await window.restore();
        await workspace.refreshReference();

        windows = workspace.getAllWindows();
        window = windows[0];

        expect(window.isMaximized).to.be.false;
    });

    it("restore the window successfully when there is a maximization boundary", async () => {
        const complexWorkspace = await glue.workspaces.createWorkspace(complexConfig);

        const groupWithWindowToMaximize = complexWorkspace.getAllGroups().find(g => g.children.length === 4);
        const windowToMaximize = groupWithWindowToMaximize.children[0];
        const widthBefore =  windowToMaximize.width;
        const heightBefore =  windowToMaximize.height;

        await windowToMaximize.maximize();
        await windowToMaximize.restore();

        expect(windowToMaximize.isMaximized).to.be.false;
        expect(windowToMaximize.width).to.eql(widthBefore);
        expect(windowToMaximize.height).to.eql(heightBefore);
    });

    it("restore the window successfully when there is already a maximized window within a boundary FIFO", async () => {
        const complexWorkspace = await glue.workspaces.createWorkspace(complexConfig);

        const groupWithWindowToMaximize = complexWorkspace.getAllGroups().find(g => g.children.length === 4);
        const windowToMaximizeInBoundary = groupWithWindowToMaximize.children[0];
        const windowToMaximize = complexWorkspace.children[0].children[0];

        const widthBeforeInBoundary =  windowToMaximizeInBoundary.width;
        const heightBeforeInBoundary =  windowToMaximizeInBoundary.height;

        const widthBefore =  windowToMaximize.width;
        const heightBefore =  windowToMaximize.height;

        await windowToMaximizeInBoundary.maximize();
        await windowToMaximize.maximize();

        await windowToMaximizeInBoundary.restore();
        await windowToMaximize.restore();

        expect(windowToMaximizeInBoundary.isMaximized).to.be.false;
        expect(windowToMaximize.isMaximized).to.be.false;

        expect(windowToMaximizeInBoundary.width).to.eql(widthBeforeInBoundary);
        expect(windowToMaximizeInBoundary.height).to.eql(heightBeforeInBoundary);

        expect(windowToMaximize.width).to.eql(widthBefore);
        expect(windowToMaximize.height).to.eql(heightBefore);
    });

    it("restore the window successfully when there is already a maximized window within a boundary LIFO", async () => {
        const complexWorkspace = await glue.workspaces.createWorkspace(complexConfig);

        const groupWithWindowToMaximize = complexWorkspace.getAllGroups().find(g => g.children.length === 4);
        const windowToMaximizeInBoundary = groupWithWindowToMaximize.children[0];
        const windowToMaximize = complexWorkspace.children[0].children[0];

        const widthBeforeInBoundary =  windowToMaximizeInBoundary.width;
        const heightBeforeInBoundary =  windowToMaximizeInBoundary.height;

        const widthBefore =  windowToMaximize.width;
        const heightBefore =  windowToMaximize.height;

        await windowToMaximizeInBoundary.maximize();
        await windowToMaximize.maximize();

        await windowToMaximize.restore();
        await windowToMaximizeInBoundary.restore();

        expect(windowToMaximizeInBoundary.isMaximized).to.be.false;
        expect(windowToMaximize.isMaximized).to.be.false;

        expect(windowToMaximizeInBoundary.width).to.eql(widthBeforeInBoundary);
        expect(windowToMaximizeInBoundary.height).to.eql(heightBeforeInBoundary);

        expect(windowToMaximize.width).to.eql(widthBefore);
        expect(windowToMaximize.height).to.eql(heightBefore);
    });

    it("restore two windows succesfully when they are targeting different boundarys FIFO ", async ()=>{
        const complexWorkspace = await glue.workspaces.createWorkspace(complexConfig);

        const groupWithWindowToMaximize = complexWorkspace.getAllGroups().find(g => g.children.length === 4);
        const windowToMaximizeInBoundary = groupWithWindowToMaximize.children[0];
        const secondWindowToMaximizeInBoundary = complexWorkspace.children[0].children[1].children[0].children[0];

        const widthBeforeInBoundary =  windowToMaximizeInBoundary.width;
        const heightBeforeInBoundary =  windowToMaximizeInBoundary.height;

        const widthBefore =  secondWindowToMaximizeInBoundary.width;
        const heightBefore =  secondWindowToMaximizeInBoundary.height;

        await windowToMaximizeInBoundary.maximize();
        await secondWindowToMaximizeInBoundary.maximize();

        await windowToMaximizeInBoundary.restore();
        await secondWindowToMaximizeInBoundary.restore();

        expect(windowToMaximizeInBoundary.isMaximized).to.be.false;
        expect(secondWindowToMaximizeInBoundary.isMaximized).to.be.false;

        expect(windowToMaximizeInBoundary.width).to.eql(widthBeforeInBoundary);
        expect(windowToMaximizeInBoundary.height).to.eql(heightBeforeInBoundary);

        expect(secondWindowToMaximizeInBoundary.width).to.eql(widthBefore);
        expect(secondWindowToMaximizeInBoundary.height).to.eql(heightBefore);
    });

    it("restore two windows succesfully when they are targeting different boundarys LIFO ", async ()=>{
        const complexWorkspace = await glue.workspaces.createWorkspace(complexConfig);

        const groupWithWindowToMaximize = complexWorkspace.getAllGroups().find(g => g.children.length === 4);
        const windowToMaximizeInBoundary = groupWithWindowToMaximize.children[0];
        const secondWindowToMaximizeInBoundary = complexWorkspace.children[0].children[1].children[0].children[0];

        const widthBeforeInBoundary =  windowToMaximizeInBoundary.width;
        const heightBeforeInBoundary =  windowToMaximizeInBoundary.height;

        const widthBefore =  secondWindowToMaximizeInBoundary.width;
        const heightBefore =  secondWindowToMaximizeInBoundary.height;

        await windowToMaximizeInBoundary.maximize();
        await secondWindowToMaximizeInBoundary.maximize();

        await secondWindowToMaximizeInBoundary.restore();
        await windowToMaximizeInBoundary.restore();

        expect(windowToMaximizeInBoundary.isMaximized).to.be.false;
        expect(secondWindowToMaximizeInBoundary.isMaximized).to.be.false;

        expect(windowToMaximizeInBoundary.width).to.eql(widthBeforeInBoundary);
        expect(windowToMaximizeInBoundary.height).to.eql(heightBeforeInBoundary);

        expect(secondWindowToMaximizeInBoundary.width).to.eql(widthBefore);
        expect(secondWindowToMaximizeInBoundary.height).to.eql(heightBefore);
    });

});
