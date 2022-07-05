describe("onWindowRestored() Should", () => {
    let unSubFuncs = [];

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

    it("notify that a window has been restored when the window is in a group with a single window", (done) => {
        glue.workspaces.onWindowRestored((w) => {
            done();
        }).then((unSub) => {
            unSubFuncs.push(unSub);
            return glue.workspaces.createWorkspace(basicConfig)
        }).then(workspace => {
            const window = workspace.getAllWindows()[0];
            return window.maximize().then(() => window.restore());
        }).catch(done);
    });

    it("notify that all windows have been restored when a group with multiple windows has been maximized", (done) => {
        let windowsHeard = 0;
        glue.workspaces.onWindowRestored((w) => {
            windowsHeard++;
            if (windowsHeard == 2) {
                done();
            }
        }).then((unSub) => {
            unSubFuncs.push(unSub);
            return glue.workspaces.createWorkspace(basicConfigTwoWindows)
        }).then(workspace => {
            const window = workspace.getAllWindows()[0];
            return window.maximize().then(() => window.restore());;
        }).catch(done);
    });

    it("notify that a window has been restored when the window is in a row with a single window", (done) => {
        glue.workspaces.onWindowRestored((w) => {
            done();
        }).then((unSub) => {
            unSubFuncs.push(unSub);
            return glue.workspaces.createWorkspace({
                children: [{
                    type: "row",
                    children: [
                        {
                            type: "window",
                            appName: "noGlueApp"
                        }
                    ]
                }]
            });
        }).then(workspace => {
            const window = workspace.getAllWindows()[0];
            return window.maximize().then(() => window.restore());
        }).catch(done);
    });

    it("notify that a window has been restored when the window is in a column with a single window", (done) => {
        glue.workspaces.onWindowRestored((w) => {
            done();
        }).then((unSub) => {
            unSubFuncs.push(unSub);
            return glue.workspaces.createWorkspace({
                children: [{
                    type: "column",
                    children: [
                        {
                            type: "window",
                            appName: "noGlueApp"
                        }
                    ]
                }]
            });
        }).then(workspace => {
            const window = workspace.getAllWindows()[0];
            return window.maximize().then(() => window.restore());
        }).catch(done);
    });

    it("notify with a valid window", (done) => {
        glue.workspaces.onWindowRestored((w) => {
            expect(typeof w === "object").to.be.true;
            expect(typeof w.id === "string").to.be.true;
            expect(typeof w.elementId === "string").to.be.true;
            expect(typeof w.getGdWindow === "function").to.be.true;
            expect(w.isMaximized).to.be.false;
            done();
        }).then((unSub) => {
            unSubFuncs.push(unSub);
            return glue.workspaces.createWorkspace(basicConfig)
        }).then((workspace) => {
            const window = workspace.getAllWindows()[0];
            return window.maximize().then(() => window.restore());
        }).catch(done);
    });

    it("invoke only once when the window is the only one in the group and there are other windows in the workspace", (done) => {
        let timesInvoked = 0;
        gtf.wait(3000, () => {

            if (timesInvoked != 1) {
                done(`Should have been invoked only once but was invoked ${timesInvoked} times `)
            } else {
                done();
            }
        });

        glue.workspaces.onWindowRestored((w) => {
            timesInvoked++;
        }).then((unSub) => {
            unSubFuncs.push(unSub);
            return glue.workspaces.createWorkspace({
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
                            },
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
            })
        }).then(workspace => {
            const window = workspace.getAllWindows()[0];
            return window.maximize().then(() => window.restore());
        }).catch(done);
    });

    it("not be invoked when the window has been maximized before the subscription", (done) => {
        gtf.wait(3000, done);

        glue.workspaces.createWorkspace(basicConfig).then(workspace => {
            const window = workspace.getAllWindows()[0];
            return window.maximize().then(() => window.restore());;
        }).then(() => {
            return glue.workspaces.onWindowRestored((w) => {
                done("not be invoked");
            });
        }).then((unSub) => {
            unSubFuncs.push(unSub);
        }).catch(done);
    });

    it("not notify when the unsubscribe function has been invoked", (done) => {
        gtf.wait(3000, done);

        glue.workspaces.onWindowRestored((w) => {
            done("not be invoked");
        }).then((unSub) => {
            unSub();
            return glue.workspaces.createWorkspace(basicConfig)
        }).then(workspace => {
            const window = workspace.getAllWindows()[0];
            return window.maximize().then(() => window.restore());
        }).catch(done);
    });

    it("not notify when a container (different from a group) is restored", (done) => {
        gtf.wait(3000, done);

        glue.workspaces.onWindowRestored((w) => {
            done("not be invoked");
        }).then((unSub) => {
            unSub();
            return glue.workspaces.createWorkspace({
                children: [{
                    type: "row",
                    children: [{
                        type: "group",
                        children: [{
                            type: "window",
                            appName: "noGlueApp"
                        }]
                    }]
                }]
            })
        }).then(workspace => {
            const row = workspace.getAllRows()[0];
            return row.maximize().then(() => row.restore());
        }).catch(done);
    });

    [
        undefined,
        null,
        42,
        true,
        {},
        { test: () => { } },
        "function",
        [() => { }]
    ].forEach((input) => {
        it(`should reject if the provided parameter is not a function: ${JSON.stringify(input)}`, (done) => {
            glue.workspaces.onWindowRestored(input)
                .then((unSub) => {
                    unSubFuncs.push(unSub);
                    done(`Should have rejected, because the provided parameter is not valid: ${JSON.stringify(input)}`);
                })
                .catch(() => {
                    done();
                });
        });
    });
});