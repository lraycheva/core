describe("setSize() Should", () => {
    const config = {
        children: [
            {
                type: "column",
                children: [
                    {
                        type: "row",
                        children: [
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
                    },
                    {
                        type: "row",
                        children: [
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
                                children: [
                                    {
                                        type: "window",
                                        appName: "noGlueApp"
                                    }
                                ]
                            },
                            {
                                type: "column",
                                children: [
                                    {
                                        type: "row",
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

    it("enlarge the width of the window when the parent is a group", async () => {
        const window = workspace.getAllWindows().find(w => w.parent.type === "group");
        const newWidth = window.width + 10;
        await window.setSize({ width: newWidth });

        expect(window.width).to.eql(newWidth);
    });

    it("enlarge the height of the window when the parent is a group", async () => {
        const window = workspace.getAllWindows().find(w => w.parent.type === "group");
        const newHeight = window.height + 10;
        await window.setSize({ height: newHeight });

        expect(Math.abs(window.height - newHeight) <= 1).to.be.true;
    });

    it("enlarge the width and height of the window when the parent is a group", async () => {
        const window = workspace.getAllWindows().find(w => w.parent.type === "group");
        const newHeight = window.height + 10;
        const newWidth = window.width + 10;

        await window.setSize({ width: newWidth, height: newHeight });

        expect(window.width).to.eql(newWidth);
        expect(Math.abs(window.height - newHeight) <= 1).to.be.true;
    });

    it("reduce the width of the window when the parent is a group", async () => {
        const window = workspace.getAllWindows().find(w => w.parent.type === "group");
        const newWidth = window.width - 10;
        await window.setSize({ width: newWidth });

        expect(window.width).to.eql(newWidth);
    });

    it("reduce the height of the window when the parent is a group", async () => {
        const window = workspace.getAllWindows().find(w => w.parent.type === "group");
        const newHeight = window.height - 10;
        await window.setSize({ height: newHeight });

        expect(Math.abs(window.height - newHeight) <= 1).to.be.true;
    });

    it("reduce the width and height of the window when the parent is a group", async () => {
        const window = workspace.getAllWindows().find(w => w.parent.type === "group");
        const newWidth = window.width - 10;
        const newHeight = window.height - 10;
        await window.setSize({ width: newWidth, height: newHeight });

        expect(window.width).to.eql(newWidth);
        expect(Math.abs(window.height - newHeight) <= 1).to.be.true;
    });

    // 
    it("enlarge the width of the window when the parent is a column", async () => {
        const window = workspace.getAllWindows().find(w => w.parent.type === "column");
        const newWidth = window.width + 10;
        await window.setSize({ width: newWidth });

        expect(window.width).to.eql(newWidth);
    });

    it("enlarge the height of the window when the parent is a column", async () => {
        const window = workspace.getAllWindows().find(w => w.parent.type === "column");
        const newHeight = window.height + 10;
        await window.setSize({ height: newHeight });

        expect(Math.abs(window.height - newHeight) <= 1).to.be.true;
    });

    it("enlarge the width and height of the window when the parent is a column", async () => {
        const window = workspace.getAllWindows().find(w => w.parent.type === "column");
        const newHeight = window.height + 10;
        const newWidth = window.width + 10;

        await window.setSize({ width: newWidth, height: newHeight });

        expect(window.width).to.eql(newWidth);
        expect(Math.abs(window.height - newHeight) <= 1).to.be.true;
    });

    // The precision of the call is +/-1 px depending on the scaling of the display
    it.skip("reduce the width of the window when the parent is a column", async () => {
        const window = workspace.getAllWindows().find(w => w.parent.type === "column");
        const newWidth = window.width - 10;
        await window.setSize({ width: newWidth });

        expect(window.width).to.eql(newWidth);
    });

    it("reduce the height of the window when the parent is a column", async () => {
        const window = workspace.getAllWindows().find(w => w.parent.type === "column");
        const newHeight = window.height - 10;
        await window.setSize({ height: newHeight });

        expect(Math.abs(window.height - newHeight) <= 1).to.be.true;
    });

    // The precision of the call is +/-1 px depending on the scaling of the display
    it.skip("reduce the width and height of the window when the parent is a column", async () => {
        const window = workspace.getAllWindows().find(w => w.parent.type === "column");
        const newWidth = window.width - 10;
        const newHeight = window.height - 10;
        await window.setSize({ width: newWidth, height: newHeight });

        expect(window.width).to.eql(newWidth);
        expect(Math.abs(window.height - newHeight) <= 1).to.be.true;
    });

    // 
    it("enlarge the width of the window when the parent is a row", async () => {
        const window = workspace.getAllWindows().find(w => w.parent.type === "row");
        const newWidth = window.width + 10;
        await window.setSize({ width: newWidth });

        expect(window.width).to.eql(newWidth);
    });

    it("enlarge the height of the window when the parent is a row", async () => {
        const window = workspace.getAllWindows().find(w => w.parent.type === "row");
        const newHeight = window.height + 10;
        await window.setSize({ height: newHeight });

        expect(Math.abs(window.height - newHeight) <= 1).to.be.true;
    });

    it("enlarge the width and height of the window when the parent is a row", async () => {
        const window = workspace.getAllWindows().find(w => w.parent.type === "row");
        const newHeight = window.height + 10;
        const newWidth = window.width + 10;

        await window.setSize({ width: newWidth, height: newHeight });

        expect(window.width).to.eql(newWidth);
        expect(Math.abs(window.height - newHeight) <= 1).to.be.true;
    });

    it("reduce the width of the window when the parent is a row", async () => {
        const window = workspace.getAllWindows().find(w => w.parent.type === "row");
        const newWidth = window.width - 10;
        await window.setSize({ width: newWidth });

        expect(window.width).to.eql(newWidth);
    });

    it("reduce the height of the window when the parent is a row", async () => {
        const window = workspace.getAllWindows().find(w => w.parent.type === "row");
        const newHeight = window.height - 10;
        await window.setSize({ height: newHeight });

        expect(Math.abs(window.height - newHeight) <= 1).to.be.true;
    });

    it("reduce the width and height of the window when the parent is a row", async () => {
        const window = workspace.getAllWindows().find(w => w.parent.type === "row");
        const newWidth = window.width - 10;
        const newHeight = window.height - 10;
        await window.setSize({ width: newWidth, height: newHeight });

        expect(window.width).to.eql(newWidth);
        expect(Math.abs(window.height - newHeight) <= 1).to.be.true;
    });


    Array.from([undefined, null, () => { }, {}, "42", true, -1, 0]).forEach((arg) => {
        it(`reject when the passed arguments are ${typeof arg}`, (done) => {
            const window = workspace.getAllWindows()[0];
            window.setSize({ width: arg, height: arg }).then(() => {
                done("Should not resolve");
            }).catch(() => done());
        });
    });
});