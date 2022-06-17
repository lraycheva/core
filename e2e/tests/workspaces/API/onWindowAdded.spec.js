describe("onWindowAdded() Should", () => {
    let unSubFuncs = [];
    let timeout = undefined;

    before(() => coreReady);

    afterEach(async () => {
        const frames = await glue.workspaces.getAllFrames();
        await Promise.all(frames.map((frame) => frame.close()));

        unSubFuncs.forEach((unSub) => {
            if (typeof unSub === "function") {
                unSub();
            }
        });
        unSubFuncs = [];

        if (timeout) {
            clearTimeout(timeout);
        }
    });

    const basicConfig = {
        children: [
            {
                type: "group",
                children: [{
                    type: "window",
                    appName: "noGlueApp"
                }]
            }
        ]
    };

    const basicConfigTwoWindows = {
        children: [
            {
                type: "group",
                children: [{
                    type: "window",
                    appName: "noGlueApp"
                },
                {
                    type: "window",
                    appName: "noGlueApp"
                }]
            }
        ]
    };

    const addParentConfig = {
        children: [
            {
                type: "row",
                children: [
                    {
                        type: "column",
                        children: [{
                            type: "row",
                            children: []
                        }]
                    },
                    {
                        type: "column",
                        children: [{
                            type: "group",
                            children: []
                        }]
                    },
                    {
                        type: "column",
                        children: []
                    }
                ]
            }
        ]
    };

    const basicMoveToConfig = {
        children: [
            {
                type: "row",
                children: [
                    {
                        type: "column",
                        children: [{
                            type: "group",
                            children: [{
                                type: "window",
                                appName: "noGlueApp"
                            }]
                        }]
                    },
                    {
                        type: "column",
                        children: []
                    }
                ]
            }
        ]
    };

    it("notify that a window has been added when a workspace is created", (done) => {
        glue.workspaces.onWindowAdded(() => {
            done();
        }).then((unSub) => {
            unSubFuncs.push(unSub);
            return glue.workspaces.createWorkspace(basicConfig);
        }).catch(done);
    });

    it("notify that a window has been added only once when a workspace is created", (done) => {
        let createdWindows = 0;
        timeout = setTimeout(() => {
            if (createdWindows === 1) {
                done();
            }
        }, 3000);
        glue.workspaces.onWindowAdded(() => {
            createdWindows += 1;
        }).then((unSub) => {
            unSubFuncs.push(unSub);
            return glue.workspaces.createWorkspace(basicConfig);
        }).catch(done);
    });

    it(`invoke the callback once when a new workspace with 1 window is opened and there is a window loaded subscription`, (done) => {
        let createdWindows = 0;
        timeout = setTimeout(() => {
            if (createdWindows === 1) {
                done();
            }
        }, 3000);
        glue.workspaces.onWindowLoaded(() => {
            //do nothing
        }).then((unSub) => {
            unSubFuncs.push(unSub);
            return glue.workspaces.onWindowAdded(() => {
                createdWindows += 1;
            })
        }).then((unSub) => {
            unSubFuncs.push(unSub);
            return glue.workspaces.createWorkspace(basicConfig);
        }).catch(done);
    });

    it("not notify that a window has been added when the unsubscribe function is immediately invoked", (done) => {
        timeout = setTimeout(() => {
            done();
        }, 3000);
        glue.workspaces.onWindowAdded(() => {
            done("Should not be invoked")
        }).then((unSub) => {
            unSub();
            return glue.workspaces.createWorkspace(basicConfig);
        }).catch(done);
    });

    it("notify with a window with valid workspaceId and frameId when a workspace is created", (done) => {
        let workspace = undefined;
        glue.workspaces.onWindowAdded((w) => {
            if (w.workspace.id === workspace.id && w.workspace.frame.id === workspace.frame.id) {
                done();
            }
        }).then((unSub) => {
            unSubFuncs.push(unSub);
            return glue.workspaces.createWorkspace(basicConfig);
        }).then((w) => {
            workspace = w;
        }).catch(done);
    });

    it("notify that two windows have been added when a workspace with two windows is created", (done) => {
        let addedWindowCount = 0;
        glue.workspaces.onWindowAdded(() => {
            addedWindowCount++;
            if (addedWindowCount === 2) {
                done();
            }
        }).then((unSub) => {
            unSubFuncs.push(unSub);
            return glue.workspaces.createWorkspace(basicConfigTwoWindows);
        }).catch(done);
    });

    it("notify that two windows have been added when two workspace are  created", (done) => {
        let addedWindowCount = 0;
        glue.workspaces.onWindowAdded(() => {
            addedWindowCount++;
            if (addedWindowCount === 2) {
                done();
            }
        }).then((unSub) => {
            unSubFuncs.push(unSub);
            return Promise.all([glue.workspaces.createWorkspace(basicConfigTwoWindows), glue.workspaces.createWorkspace(basicConfigTwoWindows)]);
        }).catch(done);
    });

    it("notify that a window has been added when a window is added through addWindow to the workspace", (done) => {
        let workspace = undefined;
        glue.workspaces.createWorkspace(basicConfig).then((w) => {
            workspace = w;
            return glue.workspaces.onWindowAdded(() => {
                done();
            })
        }).then((unSub) => {
            unSubFuncs.push(unSub);
            return workspace.addWindow({ type: "window", appName: "dummyApp" });
        }).catch(done);
    });

    it("notify that a window has been added when a window is added through addWindow to a parent", (done) => {
        let workspace = undefined;
        glue.workspaces.createWorkspace(basicConfig).then((w) => {
            workspace = w;
            return glue.workspaces.onWindowAdded(() => {
                done();
            })
        }).then((unSub) => {
            unSubFuncs.push(unSub);
            return workspace.getAllGroups()[0].addWindow({ type: "window", appName: "dummyApp" });
        }).catch(done);
    });

    it("notify that a window has been added when a window is added through addWindow to the workspace", (done) => {
        let workspace = undefined;
        glue.workspaces.createWorkspace(basicConfig).then((w) => {
            workspace = w;
            return glue.workspaces.onWindowAdded(() => {
                done();
            })
        }).then((unSub) => {
            unSubFuncs.push(unSub);
            return workspace.addWindow({ type: "window", appName: "dummyApp" });
        }).catch(done);
    });

    it("notify that a window has been added when a window is added through addWindow to a parent", (done) => {
        let workspace = undefined;
        glue.workspaces.createWorkspace(basicConfig).then((w) => {
            workspace = w;
            return glue.workspaces.onWindowAdded(() => {
                done();
            })
        }).then((unSub) => {
            unSubFuncs.push(unSub);
            return workspace.getAllGroups()[0].addWindow({ type: "window", appName: "dummyApp" });
        }).catch(done);
    });

    it(`notify that a window has been added when a windows is added through addGroup`, (done) => {
        let workspace = undefined;
        glue.workspaces.createWorkspace(addParentConfig).then((w) => {
            workspace = w;
            return glue.workspaces.onWindowAdded(() => {
                done();
            })
        }).then((unSub) => {
            unSubFuncs.push(unSub);
            return workspace.getAllRows().find(b => !b.children.length).addGroup({ children: [{ type: "window", appName: "dummyApp" }] });
        }).catch(done);
    });

    it(`notify that a window has been added when a windows is added through addColumn`, (done) => {
        let workspace = undefined;
        glue.workspaces.createWorkspace(addParentConfig).then((w) => {
            workspace = w;
            return glue.workspaces.onWindowAdded(() => {
                done();
            })
        }).then((unSub) => {
            unSubFuncs.push(unSub);
            return workspace.getAllRows().find(b => !b.children.length).addColumn({ children: [{ type: "window", appName: "dummyApp" }] });
        }).catch(done);
    });

    it(`notify that a window has been added when a windows is added through addRow`, (done) => {
        let workspace = undefined;
        glue.workspaces.createWorkspace(addParentConfig).then((w) => {
            workspace = w;
            return glue.workspaces.onWindowAdded(() => {
                done();
            })
        }).then((unSub) => {
            unSubFuncs.push(unSub);
            return workspace.getAllColumns().find(b => !b.children.length).addRow({ children: [{ type: "window", appName: "dummyApp" }] });
        }).catch(done);
    });

    it("notify that a window has been added when a window is added through moveTo in the same workspace", (done) => {
        let workspace = undefined;
        glue.workspaces.createWorkspace(basicMoveToConfig).then((w) => {
            workspace = w;
            return glue.workspaces.onWindowAdded(() => {
                done();
            });
        }).then((unSub) => {
            unSubFuncs.push(unSub);
            const targetContainer = workspace.getAllBoxes().find(b => !b.children.length);
            const windowToMove = workspace.getAllWindows()[0];

            return windowToMove.moveTo(targetContainer);
        }).catch(done);
    });

    it("notify that a window has been added when a window is added through moveTo in a different workspace", (done) => {
        let firstWorkspace = undefined;
        let secondWorkspace = undefined;
        glue.workspaces.createWorkspace(basicMoveToConfig).then((w) => {
            firstWorkspace = w;
            return glue.workspaces.createWorkspace(basicMoveToConfig);
        }).then((w) => {
            secondWorkspace = w;
            return glue.workspaces.onWindowAdded(() => {
                done();
            })
        }).then((unSub) => {
            unSubFuncs.push(unSub);
            const targetContainer = firstWorkspace.getAllBoxes().find(b => !b.children.length);
            const windowToMove = secondWorkspace.getAllWindows()[0];

            return windowToMove.moveTo(targetContainer);
        }).catch(done);
    });

    it("notify that a window has been added with a valid workspaceId property when a window is added through moveTo in a different workspace", (done) => {
        let firstWorkspace = undefined;
        let secondWorkspace = undefined;
        glue.workspaces.createWorkspace(basicMoveToConfig).then((w) => {
            firstWorkspace = w;
            return glue.workspaces.createWorkspace(basicMoveToConfig);
        }).then((w) => {
            secondWorkspace = w;
            return glue.workspaces.onWindowAdded(async (w) => {
                if (firstWorkspace.id === w.workspace.id) {
                    done();
                }
            });
        }).then((unSub) => {
            unSubFuncs.push(unSub);
            const targetContainer = firstWorkspace.getAllBoxes().find(b => !b.children.length);
            const windowToMove = secondWorkspace.getAllWindows()[0];

            return windowToMove.moveTo(targetContainer);
        }).catch(done);
    });
});

// should return a promise, which resolves with a function

// by opening a workspace
    // should notify with a valid workspace window when a window was added
    // should notify twice when the restored workspace was two windows
    // should notify twice when restoring two workspaces with one window each
    // the loaded window should exist in the workspace windows collection by appName

// already opened workspace
    // should notify with a valid workspace window when a window was added
    // the provided workspace window should have correct workspace id and frame id
    // the loaded window should exist in the workspace windows collection by appName

// should not notify when immediately unsubscribed
// should not notify when unsubscribing after receiving notifications
// should reject if the provided parameter is not a function