describe('restoreWorkspace() Should', function () {
    const iconForTesting = `data:image/svg+xml,%3Csvg version='1.1' xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 512 512'%3E%3Cpath
    d='M224 448v-96h64v96l-32 64zM336 224v-160c48 0 80-32 80-64v0 0h-320c0 32 32 64 80 64v160c-73.6 22.4-112 64-112 128h384c0-64-38.4-105.6-112-128z'%3E%3C/path%3E%3C/svg%3E%0A`;
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
                        type: "window",
                        appName: "noGlueApp"
                    }
                ]
            }
        ]
    };

    const secondBasicConfig = {
        children: [
            {
                type: "group",
                children: [
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

    let workspace;
    const layoutName = "layout.integration.tests";
    const secondLayoutName = "layout.integration.tests.2";
    before(() => coreReady);

    beforeEach(async () => {
        workspace = await glue.workspaces.createWorkspace(basicConfig);
        await workspace.saveLayout(layoutName);
        let secondWorkspace = await glue.workspaces.createWorkspace(secondBasicConfig);
        await secondWorkspace.saveLayout(secondLayoutName);
        await secondWorkspace.close();
    });

    afterEach(async () => {
        gtf.clearWindowActiveHooks();
        await glue.workspaces.layouts.delete(layoutName);
        const frames = await glue.workspaces.getAllFrames();
        await Promise.all(frames.map((f) => f.close()));
    });

    it("restore the layout when the arguments are correct and the workspace is still opened", async () => {
        const secondWorkspace = await glue.workspaces.restoreWorkspace(layoutName);
        const summaries = await glue.workspaces.getAllWorkspacesSummaries();

        expect(summaries.length).to.eql(2);
    });

    it("restore the layout when the arguments are correct and the workspace is closed", async () => {
        await workspace.close();
        const secondWorkspace = await glue.workspaces.restoreWorkspace(layoutName);
        const summaries = await glue.workspaces.getAllWorkspacesSummaries();

        expect(summaries.length).to.eql(1);
    });

    it("restore the layout when the workspace is still opened and the options are an empty object", async () => {
        const secondWorkspace = await glue.workspaces.restoreWorkspace(layoutName, {});
        const summaries = await glue.workspaces.getAllWorkspacesSummaries();

        expect(summaries.length).to.eql(2);
    });

    it("restore the layout when the workspace is closed and the options are an empty object", async () => {
        await workspace.close();
        const secondWorkspace = await glue.workspaces.restoreWorkspace(layoutName, {});
        const summaries = await glue.workspaces.getAllWorkspacesSummaries();

        expect(summaries.length).to.eql(1);
    });

    it("restore the layout in the same frame when the workspace is still opened and the options are an empty object", async () => {
        const secondWorkspace = await glue.workspaces.restoreWorkspace(layoutName, {});
        const frames = await glue.workspaces.getAllFrames();

        expect(frames.length).to.eql(1);
    });

    it("restore the layout in the same frame when the workspace is still opened", async () => {
        const secondWorkspace = await glue.workspaces.restoreWorkspace(layoutName);
        const frames = await glue.workspaces.getAllFrames();

        expect(frames.length).to.eql(1);
    });

    it("restore same layout 2 times in the same frame when the workspace is restored twice only by name", async () => {
        await workspace.close();
        const firstWorkspace = await glue.workspaces.restoreWorkspace(layoutName);
        const secondWorkspace = await glue.workspaces.restoreWorkspace(layoutName);
        const frames = await glue.workspaces.getAllFrames();
        const workspaceSummaries = await glue.workspaces.getAllWorkspacesSummaries();

        expect(frames.length).to.eql(1);
        expect(workspaceSummaries.length).to.eql(2);
    });

    it("restore same layout 2 times in the same frame when the workspace is restored twice with an empty object", async () => {
        await workspace.close();
        const firstWorkspace = await glue.workspaces.restoreWorkspace(layoutName, {});
        const secondWorkspace = await glue.workspaces.restoreWorkspace(layoutName, {});
        const frames = await glue.workspaces.getAllFrames();
        const workspaceSummaries = await glue.workspaces.getAllWorkspacesSummaries();

        expect(frames.length).to.eql(1);
        expect(workspaceSummaries.length).to.eql(2);
    });

    it("restore the layout in the same frame when the workspace is still opened and newFrame is false", async () => {
        const secondWorkspace = await glue.workspaces.restoreWorkspace(layoutName, { newFrame: false });
        const frames = await glue.workspaces.getAllFrames();

        expect(frames.length).to.eql(1);
    });

    it("restore the layout in the same frame when the workspace is still opened and frameId is passed", async () => {
        const secondWorkspace = await glue.workspaces.restoreWorkspace(layoutName, { frameId: workspace.frameId });
        const frames = await glue.workspaces.getAllFrames();

        expect(frames.length).to.eql(1);
    });

    it.skip("reuse the specified workspace when the reuseWorkspaceIdOptions is passed", async () => {
        await workspace.addWindow({
            type: "window",
            appName: "dummyApp"
        });
        const secondWorkspace = await glue.workspaces.restoreWorkspace(layoutName, { reuseWorkspaceId: workspace.id });
        const workspaceSummaries = await glue.workspaces.getAllWorkspacesSummaries();
        const workspaceWindows = secondWorkspace.getAllWindows();

        expect(workspaceSummaries.length).to.eql(1);
        expect(workspaceWindows.length).to.eql(1);
    });

    it("restore the layout in a new frame when the workspace is still opened and newFrame is true", async () => {
        const secondWorkspace = await glue.workspaces.restoreWorkspace(layoutName, { newFrame: true });
        const frames = await glue.workspaces.getAllFrames();

        expect(frames.length).to.eql(2);
    });

    it("restore the layout with the given title when a title is passed", async () => {
        const title = "myNewTitle";
        const secondWorkspace = await glue.workspaces.restoreWorkspace(layoutName, { title });

        expect(secondWorkspace.title).to.eql(title);
    });

    it("set the workspace context to the given context when a context is passed", async () => {
        const context = {
            my: "context"
        };

        const secondWorkspace = await glue.workspaces.restoreWorkspace(layoutName, { context });
        const workspaceContext = await secondWorkspace.getContext();

        expect(workspaceContext).to.eql(context);
    });

    it("set the workspace context to the context from the layout when the layout contains a context", async () => {
        const contextToBeSaved = {
            the: "context"
        };

        const workspaceToBeSaved = await glue.workspaces.createWorkspace(basicConfig);

        await workspaceToBeSaved.setContext(contextToBeSaved);
        await workspaceToBeSaved.saveLayout(layoutName, { saveContext: true });
        await workspaceToBeSaved.close();

        const restoredWorkspace = await glue.workspaces.restoreWorkspace(layoutName);
        const restoredWorkspaceContext = await restoredWorkspace.getContext();

        expect(restoredWorkspaceContext).to.eql(contextToBeSaved);
    });

    it("merge the context in the layout and the passed context when the layout contains a context and a context has been passed", async () => {
        const contextToBeSaved = {
            the: "context"
        };

        const secondContext = {
            test: "42"
        }

        const workspaceToBeSaved = await glue.workspaces.createWorkspace(basicConfig);

        await workspaceToBeSaved.setContext(contextToBeSaved);
        await workspaceToBeSaved.saveLayout(layoutName, { saveContext: true });
        await workspaceToBeSaved.close();

        const restoredWorkspace = await glue.workspaces.restoreWorkspace(layoutName, { context: secondContext });
        const restoredWorkspaceContext = await restoredWorkspace.getContext();

        expect(restoredWorkspaceContext).to.eql(Object.assign(secondContext, contextToBeSaved));
    });

    it("reject the promise when there isn't a layout with such name", (done) => {
        glue.workspaces.restoreWorkspace("some missing layout").then(() => {
            done("Should not resolve");
        }).catch(() => done());
    });

    Array.from([null, undefined, 42, "SomeString", [], {}]).forEach((input) => {
        if (typeof input != "string") {
            it(`reject the promise when the name parameter is ${JSON.stringify(input)}`, (done) => {
                glue.workspaces.restoreWorkspace(input).then(() => {
                    done("Should not resolve");
                }).catch(() => done());
            });
        }

        if (typeof input != "undefined" && typeof input != "object") {
            it(`reject the promise when the options parameter is ${JSON.stringify(input)}`, (done) => {
                glue.workspaces.restoreWorkspace(layoutName, input).then(() => {
                    done("Should not resolve");
                }).catch(() => done());
            });
        }
    });

    describe('reuseWorkspaceId Should ', function () {
        // BASIC
        this.timeout(60000);

        it("change noTabHeader to true when the new workspace has noTabHeader:true and target one has false", async () => {
            const workspace = await glue.workspaces.restoreWorkspace(layoutName, {
                noTabHeader: false
            });

            const secondWorkspace = await glue.workspaces.restoreWorkspace(secondLayoutName, {
                reuseWorkspaceId: workspace.id,
                noTabHeader: true
            });

            const secondWorkspaceWindows = secondWorkspace.getAllWindows();
            expect(secondWorkspaceWindows.length).to.eql(2);
            // TODO assert correctly
        });

        it("change noTabHeader to false when the new workspaces has noTabHeader:false and target one has true", async () => {
            const workspace = await glue.workspaces.restoreWorkspace(layoutName, {
                noTabHeader: true
            });

            const secondWorkspace = await glue.workspaces.restoreWorkspace(secondLayoutName, {
                reuseWorkspaceId: workspace.id,
                noTabHeader: false
            });

            const secondWorkspaceWindows = secondWorkspace.getAllWindows();
            expect(secondWorkspaceWindows.length).to.eql(2);
            // TODO assert correctly
        });

        it('not add a new workspace in the summaries collection after resolve', async () => {
            const allWorkspacesBeforeReuse = await glue.workspaces.getAllWorkspacesSummaries();
            await gtf.wait(10000);
            const secondWorkspаce = await glue.workspaces.restoreWorkspace(secondLayoutName, {
                reuseWorkspaceId: workspace.id
            });
            await gtf.wait(10000);
            const allWorkspacesAfterReuse = await glue.workspaces.getAllWorkspacesSummaries();

            expect(allWorkspacesAfterReuse.some((wsp) => wsp.id === workspace.id)).to.be.true;
            expect(allWorkspacesAfterReuse.length).to.eql(allWorkspacesBeforeReuse.length);
        });

        it('preserve the id', async () => {
            const secondWorkspаce = await glue.workspaces.restoreWorkspace(secondLayoutName, {
                reuseWorkspaceId: workspace.id
            });

            expect(workspace.id).to.eql(secondWorkspаce.id);
        });

        it('increase the number of windows by one when the reused workspace has one app less', async () => {
            const workspace = await glue.workspaces.restoreWorkspace(layoutName);
            await Promise.all(workspace.getAllWindows().map(w => w.forceLoad()));
            await gtf.wait(3000);
            const windowsCount = glue.windows.list().length;
            const secondWorkspаce = await glue.workspaces.restoreWorkspace(secondLayoutName, {
                reuseWorkspaceId: workspace.id
            });

            await Promise.all(secondWorkspаce.getAllWindows().map(w => w.forceLoad()));
            await gtf.wait(3000);
            const secondWindowsCount = glue.windows.list().length;
            expect(windowsCount + 1).to.eql(secondWindowsCount);
        });

        it("not preserve the context when a new context has not been passed", async () => {
            const firstContext = {
                "a": "b"
            };

            const workspace = await glue.workspaces.restoreWorkspace(layoutName, {
                context: firstContext
            });

            const secondWorkspace = await glue.workspaces.restoreWorkspace(secondLayoutName, {
                reuseWorkspaceId: workspace.id
            });

            const secondWorkspaceContext = await secondWorkspace.getContext();

            expect(secondWorkspaceContext).to.eql({});
        });

        it("not preserve the context when an empty object has been passed as context", async () => {
            const firstContext = {
                "a": "b"
            };

            const workspace = await glue.workspaces.restoreWorkspace(layoutName, {
                context: firstContext
            });

            const secondWorkspace = await glue.workspaces.restoreWorkspace(secondLayoutName, {
                reuseWorkspaceId: workspace.id,
                context: {}
            });

            const secondWorkspaceContext = await secondWorkspace.getContext();

            expect(secondWorkspaceContext).to.eql({});
        });

        it("set the context correctly when a new context has been passed", async () => {
            const firstContext = {
                "a": "b"
            };

            const secondContext = {
                "c": "d"
            };

            const workspace = await glue.workspaces.restoreWorkspace(layoutName, {
                context: firstContext
            });

            const secondWorkspace = await glue.workspaces.restoreWorkspace(secondLayoutName, {
                reuseWorkspaceId: workspace.id,
                context: secondContext
            });

            const secondWorkspaceContext = await secondWorkspace.getContext();

            expect(secondWorkspaceContext).to.eql(secondContext);
        });

        it('not trigger workspace opened', (done) => {
            let unSubFunc;
            let workspace;

            glue.workspaces.restoreWorkspace(layoutName).then((w) => {
                workspace = w;
                return glue.workspaces.onWorkspaceOpened(() => {
                    try {
                        done("Should not be invoked");

                        unSubFunc();
                    } catch (error) { }
                });
            }).then((unSub) => {
                unSubFunc = unSub;
                return glue.workspaces.restoreWorkspace(secondLayoutName, {
                    reuseWorkspaceId: workspace.id
                });
            }).then(() => {
                return gtf.wait(3000, () => { done(); unSubFunc(); });
            }).catch(done);
        });

        it('not trigger workspace closed', (done) => {
            let unSubFunc;
            let workspace;

            glue.workspaces.restoreWorkspace(layoutName).then((w) => {
                workspace = w;
                return glue.workspaces.onWorkspaceClosed(() => {
                    try {
                        done("Should not be invoked");

                        unSubFunc();
                    } catch (error) { }
                });
            }).then((unSub) => {
                unSubFunc = unSub;
                return glue.workspaces.restoreWorkspace(secondLayoutName, {
                    reuseWorkspaceId: workspace.id
                });
            }).then(() => {
                return gtf.wait(3000, () => { done(); unSubFunc(); });
            }).catch(done);
        });

        it("resolve with correct title when it is specified and valid", async () => {
            const testTitle = "myTestTitle";
            const workspace = await glue.workspaces.restoreWorkspace(layoutName);
            const secondWorkspace = await glue.workspaces.restoreWorkspace(
                secondLayoutName, { title: testTitle, reuseWorkspaceId: workspace.id }
            );

            expect(secondWorkspace.title).to.eql(testTitle);
        });

        it("set the title to the layoutName when a title isn't passed", async () => {
            const workspace = await glue.workspaces.restoreWorkspace(layoutName);

            expect(workspace.title).to.eql(layoutName);
        });

        it("resolve when there are multiple frames opened and one of the middle ones (by starting order) contains the target workspace", async () => {
            const workspaceTwo = await glue.workspaces.restoreWorkspace(layoutName, { newFrame: true });
            const workspaceThree = await glue.workspaces.restoreWorkspace(layoutName, { newFrame: true });
            const workspaceFour = await glue.workspaces.restoreWorkspace(secondLayoutName, { reuseWorkspaceId: workspaceTwo.id });

            const allWorkspaces = await glue.workspaces.getAllWorkspaces();
            const allFrames = await glue.workspaces.getAllFrames();
            const windowsInWorkspaceFour = workspaceFour.getAllWindows();

            expect(allWorkspaces.length).to.eql(3);
            expect(allFrames.length).to.eql(3);
            expect(windowsInWorkspaceFour.length).to.eql(2);
        });
    });

    describe('loadingStrategy Should ', function () {
        const config = {
            children: [
                {
                    type: "column",
                    children: [
                        {
                            type: "row", children: [{
                                type: "group",
                                children: [
                                    { type: "window", appName: "dummyApp" },
                                    { type: "window", appName: "dummyApp" }]
                            }]
                        },
                        {
                            type: "row", children: [{
                                type: "group",
                                children: [
                                    { type: "window", appName: "dummyApp" },
                                    { type: "window", appName: "dummyApp" }]
                            }]
                        }
                    ]
                }
            ]
        };

        beforeEach(async () => {
            workspace = await glue.workspaces.createWorkspace(config);
            await workspace.saveLayout(layoutName, { saveContext: false });
            await workspace.frame.close();
        });

        afterEach(async () => {
            const wsps = await glue.workspaces.getAllWorkspaces();
            await Promise.all(wsps.map((wsp) => wsp.close()));
        });

        it("load all windows when the loadingStrategy is direct", async () => {
            let loadedWindowsCount = 0;

            let unsub = await glue.workspaces.onWindowLoaded((w) => {
                loadedWindowsCount++;
            });

            gtf.addWindowHook(unsub);

            await glue.workspaces.restoreWorkspace(layoutName, { loadingStrategy: "direct" });
            await gtf.wait(3000);

            expect(loadedWindowsCount).to.eql(4);
        });

        it("load only the visible windows when the loadingStrategy is lazy", async () => {
            let loadedWindowsCount = 0;

            let unsub = await glue.workspaces.onWindowLoaded(() => {
                loadedWindowsCount++;
            });

            gtf.addWindowHook(unsub);

            await glue.workspaces.restoreWorkspace(layoutName, { loadingStrategy: "lazy" });

            await gtf.wait(3000);

            expect(loadedWindowsCount).to.eql(2);
        });

        it("load all windows when the loadingStrategy is lazy and all windows are force loaded", async () => {
            let loadedWindowsCount = 0;

            let unsub = await glue.workspaces.onWindowLoaded(() => {
                loadedWindowsCount++;
            });

            gtf.addWindowHook(unsub);

            const workspace = await glue.workspaces.restoreWorkspace(layoutName, { loadingStrategy: "lazy" });
            await Promise.all(workspace.getAllWindows().map(w => w.forceLoad()));

            await gtf.wait(3000);

            expect(loadedWindowsCount).to.eql(4);
        });

        it("load all windows when the loadingStrategy is lazy and all windows are focused", async () => {
            let loadedWindowsCount = 0;

            let unsub = await glue.workspaces.onWindowLoaded(() => {
                loadedWindowsCount++;
            });

            gtf.addWindowHook(unsub);

            const workspace = await glue.workspaces.restoreWorkspace(layoutName, { loadingStrategy: "lazy" });
            await Promise.all(workspace.getAllWindows().map(w => w.focus()));

            await gtf.wait(3000);

            expect(loadedWindowsCount).to.eql(4);
        });

        it("load one more window for 4 seconds when the loadingStrategy is delayed", async () => {
            let loadedWindowsCount = 0;

            let unsub = await glue.workspaces.onWindowLoaded(() => {
                loadedWindowsCount++;
            });

            gtf.addWindowHook(unsub);

            await glue.workspaces.restoreWorkspace(layoutName, { loadingStrategy: "delayed" });
            await gtf.wait(4000);

            expect(loadedWindowsCount).to.eql(3);
        });

        it("load all windows when the loadingStrategy is delayed and all windows are force loaded", async () => {
            let loadedWindowsCount = 0;

            let unsub = await glue.workspaces.onWindowLoaded(() => {
                loadedWindowsCount++;
            });

            gtf.addWindowHook(unsub);

            const workspace = await glue.workspaces.restoreWorkspace(layoutName, { loadingStrategy: "delayed" });
            await Promise.all(workspace.getAllWindows().map(w => w.forceLoad()));

            await gtf.wait(3000);

            expect(loadedWindowsCount).to.eql(4);
        });

        it("load all windows when the loadingStrategy is delayed and all windows are focused", async () => {
            let loadedWindowsCount = 0;

            let unsub = await glue.workspaces.onWindowLoaded(() => {
                loadedWindowsCount++;
            });

            gtf.addWindowHook(unsub);

            const workspace = await glue.workspaces.restoreWorkspace(layoutName, { loadingStrategy: "delayed" });
            await Promise.all(workspace.getAllWindows().map(w => w.focus()));

            await gtf.wait(3000);

            expect(loadedWindowsCount).to.eql(4);
        });

        [0, 100, 200, 300, 400, 500].forEach((delay) => {
            it(`not start any new windows when the loadingStrategy is delayed and the frame has been closed with a delay of ${delay} before all windows can be loaded`, async () => {
                let resolve;
                let reject;
                const promise = new Promise((res, rej) => {
                    resolve = res;
                    reject = rej;
                });

                let frameClosed = false;

                let unsub = await glue.windows.onWindowAdded(() => {
                    if (frameClosed) {
                        reject("Should not be invoked after the frame has been stopped");
                    }
                });

                gtf.addWindowHook(unsub);

                const workspace = await glue.workspaces.restoreWorkspace(layoutName, { loadingStrategy: "delayed" });
                await gtf.wait(delay);
                await workspace.frame.close();
                frameClosed = true;

                gtf.wait(5000).then(() => {
                    resolve();
                });

                return promise;
            });
        });
    });

    describe('locking Should', () => {
        const lockingConfig = {
            children: [
                {
                    type: "row",
                    children: [
                        {
                            type: "column",
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
                        },
                        {
                            type: "column",
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
        };

        const lockedLayoutName = "layout.integration.tests.locked";

        it("restore the workspace with all constraints when the workspace was saved in a locked state", async () => {
            let workspace;

            workspace = await glue.workspaces.createWorkspace(lockingConfig);
            await workspace.lock();
            await workspace.saveLayout(lockedLayoutName, { saveContext: false });

            const wsps = await glue.workspaces.getAllWorkspaces();
            await Promise.all(wsps.map((wsp) => wsp.close()));

            const restoredWorkspace = await glue.workspaces.restoreWorkspace(lockedLayoutName);

            expect(restoredWorkspace.allowDrop).to.be.true;
            expect(restoredWorkspace.allowExtract).to.be.false;
            expect(restoredWorkspace.allowWindowReorder).to.be.false;
            expect(restoredWorkspace.allowWorkspaceTabReorder).to.be.false;
            expect(restoredWorkspace.showSaveButton).to.be.false;
            expect(restoredWorkspace.showCloseButton).to.be.false;
            expect(restoredWorkspace.allowSplitters).to.be.false;
        });

        it("restore the workspace with containers with constraints when a group was saved in a locked state", async () => {
            let workspace;

            workspace = await glue.workspaces.createWorkspace(lockingConfig);
            const groups = workspace.getAllGroups();

            await Promise.all(groups.map((group) => group.lock()));
            await workspace.saveLayout(lockedLayoutName, { saveContext: false });

            const wsps = await glue.workspaces.getAllWorkspaces();
            await Promise.all(wsps.map((wsp) => wsp.close()));

            const restoredWorkspace = await glue.workspaces.restoreWorkspace(lockedLayoutName);

            restoredWorkspace.getAllGroups().forEach((g) => {
                expect(g.allowDrop).to.be.false;
                expect(g.allowExtract).to.be.false;
                expect(g.allowReorder).to.be.false;
                expect(g.showMaximizeButton).to.be.false;
                expect(g.showEjectButton).to.be.false;
                expect(g.showAddWindowButton).to.be.false;
            });
        });

        it("restore the workspace with containers with constraints when a row was saved in a locked state", async () => {
            let workspace;

            workspace = await glue.workspaces.createWorkspace(lockingConfig);
            const rows = workspace.getAllRows();

            await Promise.all(rows.map((row) => row.lock()));
            await workspace.saveLayout(lockedLayoutName, { saveContext: false });

            const wsps = await glue.workspaces.getAllWorkspaces();
            await Promise.all(wsps.map((wsp) => wsp.close()));

            const restoredWorkspace = await glue.workspaces.restoreWorkspace(lockedLayoutName);

            restoredWorkspace.getAllRows().forEach((g) => {
                expect(g.allowDrop).to.be.false;
            });
        });

        it("restore the workspace with containers with constraints when a column was saved in a locked state", async () => {
            let workspace;

            workspace = await glue.workspaces.createWorkspace(lockingConfig);
            const columns = workspace.getAllColumns();

            await Promise.all(columns.map((column) => column.lock()));
            await workspace.saveLayout(lockedLayoutName, { saveContext: false });

            const wsps = await glue.workspaces.getAllWorkspaces();
            await Promise.all(wsps.map((wsp) => wsp.close()));

            const restoredWorkspace = await glue.workspaces.restoreWorkspace(lockedLayoutName);

            restoredWorkspace.getAllColumns().forEach((c) => {
                expect(c.allowDrop).to.be.false;
            });
        });

        it("restore the workspace with windows with constraints when the windows were saved in a locked state", async () => {
            let workspace;

            workspace = await glue.workspaces.createWorkspace(lockingConfig);
            const windows = workspace.getAllWindows();

            await Promise.all(windows.map((window) => window.lock()));
            await workspace.saveLayout(lockedLayoutName, { saveContext: false });

            const wsps = await glue.workspaces.getAllWorkspaces();
            await Promise.all(wsps.map((wsp) => wsp.close()));

            const restoredWorkspace = await glue.workspaces.restoreWorkspace(lockedLayoutName);

            restoredWorkspace.getAllWindows().forEach((w) => {
                expect(w.allowExtract).to.be.false;
                expect(w.allowReorder).to.be.false;
                expect(w.showCloseButton).to.be.false;
            });
        });

        it("restore the workspace with the correct container overrides when the workspace was locked and the groups were overriding the lock", async () => {
            let workspace;

            workspace = await glue.workspaces.createWorkspace(lockingConfig);
            const groups = workspace.getAllGroups();

            await workspace.lock();
            await Promise.all(groups.map((group) => group.lock({})));
            await workspace.saveLayout(lockedLayoutName, { saveContext: false });

            const wsps = await glue.workspaces.getAllWorkspaces();
            await Promise.all(wsps.map((wsp) => wsp.close()));

            const restoredWorkspace = await glue.workspaces.restoreWorkspace(lockedLayoutName);

            expect(workspace.allowDrop).to.be.true;
            expect(workspace.allowExtract).to.be.false;
            expect(workspace.allowWindowReorder).to.be.false;

            restoredWorkspace.getAllGroups().forEach((g) => {
                expect(g.allowDrop).to.be.true;
                expect(g.showMaximizeButton).to.be.true;
                expect(g.showEjectButton).to.be.true;
                expect(g.allowExtract).to.be.true;
                expect(g.allowReorder).to.be.true;
                expect(g.showAddWindowButton).to.be.true;
            });
        });

        it("restore the workspace with the correct container overrides when the workspace was locked and the columns were overriding the lock", async () => {
            let workspace;

            workspace = await glue.workspaces.createWorkspace(lockingConfig);
            const columns = workspace.getAllColumns();

            await workspace.lock();
            await Promise.all(columns.map((column) => column.lock({})));
            await workspace.saveLayout(lockedLayoutName, { saveContext: false });

            const wsps = await glue.workspaces.getAllWorkspaces();
            await Promise.all(wsps.map((wsp) => wsp.close()));

            const restoredWorkspace = await glue.workspaces.restoreWorkspace(lockedLayoutName);

            expect(workspace.allowDrop).to.be.true;
            expect(workspace.allowExtract).to.be.false;

            restoredWorkspace.getAllColumns().forEach((c) => {
                expect(c.allowDrop).to.be.true;
            });
        });

        it("restore the workspace with the correct container overrides when the workspace was locked and the rows were overriding the lock", async () => {
            let workspace;

            workspace = await glue.workspaces.createWorkspace(lockingConfig);
            const rows = workspace.getAllRows();

            await workspace.lock();
            await Promise.all(rows.map((row) => row.lock({})));
            await workspace.saveLayout(lockedLayoutName, { saveContext: false });

            const wsps = await glue.workspaces.getAllWorkspaces();
            await Promise.all(wsps.map((wsp) => wsp.close()));

            const restoredWorkspace = await glue.workspaces.restoreWorkspace(lockedLayoutName);

            expect(workspace.allowDrop).to.be.true;
            expect(workspace.allowExtract).to.be.false;

            restoredWorkspace.getAllRows().forEach((g) => {
                expect(g.allowDrop).to.be.true;
            });
        });

        it("restore the workspace with the correct window overrides when the workspace was locked and some of the windows were overriding the lock", async () => {
            let workspace;

            workspace = await glue.workspaces.createWorkspace(lockingConfig);
            const windows = workspace.getAllWindows();

            await workspace.lock();
            await Promise.all(windows.map((win) => win.lock({})));
            await workspace.saveLayout(lockedLayoutName, { saveContext: false });

            const wsps = await glue.workspaces.getAllWorkspaces();
            await Promise.all(wsps.map((wsp) => wsp.close()));

            const restoredWorkspace = await glue.workspaces.restoreWorkspace(lockedLayoutName);

            expect(workspace.allowDrop).to.be.true;
            expect(workspace.allowExtract).to.be.false;
            expect(workspace.allowWindowReorder).to.be.false;

            restoredWorkspace.getAllWindows().forEach((w) => {
                expect(w.allowExtract).to.be.true;
                expect(w.allowReorder).to.be.true;
                expect(w.showCloseButton).to.be.true;
            });
        });

        it("restore the workspace with the correct window overrides when the parent group was locked and some of the windows were overriding the lock", async () => {
            let workspace;

            workspace = await glue.workspaces.createWorkspace(lockingConfig);
            const windows = workspace.getAllWindows();

            await Promise.all(workspace.getAllGroups().map(g => g.lock()));
            await Promise.all(windows.map((win) => win.lock({})));
            await workspace.saveLayout(lockedLayoutName, { saveContext: false });

            const wsps = await glue.workspaces.getAllWorkspaces();
            await Promise.all(wsps.map((wsp) => wsp.close()));

            const restoredWorkspace = await glue.workspaces.restoreWorkspace(lockedLayoutName);

            restoredWorkspace.getAllGroups(g => {
                expect(g.allowExtract).to.be.false;
                expect(g.allowReorder).to.be.false;
            });

            restoredWorkspace.getAllWindows().forEach((w) => {
                expect(w.allowExtract).to.be.true;
                expect(w.allowReorder).to.be.true;
                expect(w.showCloseButton).to.be.true;
            });
        });
    });

    describe("constraints Should", () => {
        let layoutName = "gtf.test.layout.constraints";
        const decorationsHeight = 30;
        beforeEach(async () => {
            const wsps = await glue.workspaces.getAllWorkspaces();
            await Promise.all(wsps.map((wsp) => wsp.close()));
        });

        afterEach(async () => {
            const wsps = await glue.workspaces.getAllWorkspaces();
            await Promise.all(wsps.map((wsp) => wsp.close()));

            await glue.workspaces.layouts.delete(layoutName);
        });

        it("be equal to the default values when no elements have constraints", async () => {
            const singleWindowConfig = {
                children: [
                    windowConfig
                ]
            }

            let workspace = await glue.workspaces.createWorkspace(singleWindowConfig);

            await workspace.saveLayout(layoutName);
            await workspace.close();

            workspace = await glue.workspaces.restoreWorkspace(layoutName);

            expect(workspace.minWidth).to.eql(20);
            expect(workspace.maxWidth).to.eql(32767);
            expect(workspace.minHeight).to.eql(20);
            expect(workspace.maxHeight).to.eql(32767);
        });

        Array.from([200, 300]).forEach((mw) => {
            it(`have a minWidth equal to the sum of all minWidths (${mw}) of the columns in the workspace`, async () => {
                const config = {
                    children: [
                        {
                            type: "row",
                            children: [
                                {
                                    type: "column",
                                    config: {
                                        minWidth: mw
                                    },
                                    children: [
                                        windowConfig
                                    ]
                                },
                                {
                                    type: "column",
                                    config: {
                                        minWidth: mw
                                    },
                                    children: [
                                        windowConfig
                                    ]
                                },
                                {
                                    type: "column",
                                    config: {
                                        minWidth: mw
                                    },
                                    children: [
                                        windowConfig
                                    ]
                                }
                            ]
                        }
                    ]
                }

                let workspace = await glue.workspaces.createWorkspace(config);

                await workspace.saveLayout(layoutName);
                await workspace.close();

                workspace = await glue.workspaces.restoreWorkspace(layoutName);

                expect(workspace.minWidth).to.eql(3 * mw);
            });

            it(`have a minHeight equal to the sum of all minHeight (${mw}) of the rows in the workspace`, async () => {
                const config = {
                    children: [
                        {
                            type: "column",
                            children: [
                                {
                                    type: "row",
                                    config: {
                                        minHeight: mw
                                    },
                                    children: [
                                        windowConfig
                                    ]
                                },
                                {
                                    type: "row",
                                    config: {
                                        minHeight: mw
                                    },
                                    children: [
                                        windowConfig
                                    ]
                                },
                                {
                                    type: "row",
                                    config: {
                                        minHeight: mw
                                    },
                                    children: [
                                        windowConfig
                                    ]
                                }
                            ]
                        }
                    ]
                }

                let workspace = await glue.workspaces.createWorkspace(config);

                await workspace.saveLayout(layoutName);
                await workspace.close();

                workspace = await glue.workspaces.restoreWorkspace(layoutName);

                expect(workspace.minHeight).to.eql(3 * mw);
            });

            it(`have a minWidth equal to the biggest (${mw}) of the rows in the workspace`, async () => {
                const config = {
                    children: [
                        {
                            type: "column",
                            children: [
                                {
                                    type: "row",
                                    children: [
                                        {
                                            type: "group",
                                            config: {
                                                minWidth: mw
                                            },
                                            children: [
                                                windowConfig
                                            ]
                                        }
                                    ]
                                },
                                {
                                    type: "row",
                                    children: [
                                        {
                                            type: "group",
                                            config: {
                                                minWidth: mw + 10
                                            },
                                            children: [
                                                windowConfig
                                            ]
                                        }
                                    ]
                                },
                                {
                                    type: "row",
                                    children: [
                                        {
                                            type: "group",
                                            config: {
                                                minWidth: mw
                                            },
                                            children: [
                                                windowConfig
                                            ]
                                        }
                                    ]
                                },
                            ]
                        }
                    ]
                }

                let workspace = await glue.workspaces.createWorkspace(config);
                await workspace.saveLayout(layoutName);
                await workspace.close();

                workspace = await glue.workspaces.restoreWorkspace(layoutName);

                expect(workspace.minWidth).to.eql(mw + 10);
            });

            it(`have a minHeight equal to the biggest minHeight (${mw}) of the columns in the workspace`, async () => {
                const config = {
                    children: [
                        {
                            type: "row",
                            children: [
                                {
                                    type: "column",
                                    children: [
                                        {
                                            type: "group",
                                            config: {
                                                minHeight: mw
                                            },
                                            children: [
                                                windowConfig
                                            ]
                                        }
                                    ]
                                },
                                {
                                    type: "column",
                                    children: [
                                        {
                                            type: "group",
                                            config: {
                                                minHeight: mw + 10
                                            },
                                            children: [
                                                windowConfig
                                            ]
                                        }
                                    ]
                                },
                                {
                                    type: "column",
                                    children: [
                                        {
                                            type: "group",
                                            config: {
                                                minHeight: mw
                                            },
                                            children: [
                                                windowConfig
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }

                let workspace = await glue.workspaces.createWorkspace(config);

                await workspace.saveLayout(layoutName);
                await workspace.close();

                workspace = await glue.workspaces.restoreWorkspace(layoutName);

                expect(workspace.minHeight).to.eql(mw + 10);
            });

            it(`have a maxWidth equal to the sum of all maxWidths (${mw}) of the columns in the workspace`, async () => {
                const config = {
                    children: [
                        {
                            type: "row",
                            children: [
                                {
                                    type: "column",
                                    config: {
                                        maxWidth: mw
                                    },
                                    children: [
                                        windowConfig
                                    ]
                                },
                                {
                                    type: "column",
                                    config: {
                                        maxWidth: mw
                                    },
                                    children: [
                                        windowConfig
                                    ]
                                },
                                {
                                    type: "column",
                                    config: {
                                        maxWidth: mw
                                    },
                                    children: [
                                        windowConfig
                                    ]
                                }
                            ]
                        }
                    ]
                }

                let workspace = await glue.workspaces.createWorkspace(config);

                await workspace.saveLayout(layoutName);
                await workspace.close();

                workspace = await glue.workspaces.restoreWorkspace(layoutName);

                expect(workspace.maxWidth).to.eql(3 * mw);
            });

            it(`have a maxHeight equal to the sum of all maxHeight (${mw}) of the rows in the workspace`, async () => {
                const config = {
                    children: [
                        {
                            type: "column",
                            children: [
                                {
                                    type: "row",
                                    config: {
                                        maxHeight: mw
                                    },
                                    children: [
                                        windowConfig
                                    ]
                                },
                                {
                                    type: "row",
                                    config: {
                                        maxHeight: mw
                                    },
                                    children: [
                                        windowConfig
                                    ]
                                },
                                {
                                    type: "row",
                                    config: {
                                        maxHeight: mw
                                    },
                                    children: [
                                        windowConfig
                                    ]
                                }
                            ]
                        }
                    ]
                }

                let workspace = await glue.workspaces.createWorkspace(config);

                await workspace.saveLayout(layoutName);
                await workspace.close();

                workspace = await glue.workspaces.restoreWorkspace(layoutName);

                expect(workspace.maxHeight).to.eql(3 * mw);
            });

            it(`have a maxWidth equal to the smallest (${mw}) of the rows in the workspace`, async () => {
                const config = {
                    children: [
                        {
                            type: "column",
                            children: [
                                {
                                    type: "row",
                                    children: [
                                        {
                                            type: "group",
                                            config: {
                                                maxWidth: mw
                                            },
                                            children: [
                                                windowConfig
                                            ]
                                        }
                                    ]
                                },
                                {
                                    type: "row",
                                    children: [
                                        {
                                            type: "group",
                                            config: {
                                                maxWidth: mw - 10
                                            },
                                            children: [
                                                windowConfig
                                            ]
                                        }
                                    ]
                                },
                                {
                                    type: "row",
                                    children: [
                                        {
                                            type: "group",
                                            config: {
                                                maxWidth: mw
                                            },
                                            children: [
                                                windowConfig
                                            ]
                                        }
                                    ]
                                },
                            ]
                        }
                    ]
                }

                let workspace = await glue.workspaces.createWorkspace(config);

                await workspace.saveLayout(layoutName);
                await workspace.close();

                workspace = await glue.workspaces.restoreWorkspace(layoutName);

                expect(workspace.maxWidth).to.eql(mw - 10);
            });

            it(`have a maxHeight equal to the smallest maxHeight (${mw}) of the columns in the workspace`, async () => {
                const config = {
                    children: [
                        {
                            type: "row",
                            children: [
                                {
                                    type: "column",
                                    children: [
                                        {
                                            type: "group",
                                            config: {
                                                maxHeight: mw
                                            },
                                            children: [
                                                windowConfig
                                            ]
                                        }
                                    ]
                                },
                                {
                                    type: "column",
                                    children: [
                                        {
                                            type: "group",
                                            config: {
                                                maxHeight: mw - 10
                                            },
                                            children: [
                                                windowConfig
                                            ]
                                        }
                                    ]
                                },
                                {
                                    type: "column",
                                    children: [
                                        {
                                            type: "group",
                                            config: {
                                                maxHeight: mw
                                            },
                                            children: [
                                                windowConfig
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }

                let workspace = await glue.workspaces.createWorkspace(config);

                await workspace.saveLayout(layoutName);
                await workspace.close();

                workspace = await glue.workspaces.restoreWorkspace(layoutName);

                expect(workspace.maxHeight).to.eql(mw - 10);
            });

            it(`have a minWidth equal to the sum of all minWidths (${mw}) of the columns in the workspace and the constraints are put on the windows`, async () => {
                const config = {
                    children: [
                        {
                            type: "row",
                            children: [
                                {
                                    type: "column",
                                    children: [
                                        {
                                            type: "window",
                                            appName: "noGlueApp",
                                            config: {
                                                minWidth: mw
                                            }
                                        }
                                    ]
                                },
                                {
                                    type: "column",
                                    children: [
                                        {
                                            type: "window",
                                            appName: "noGlueApp",
                                            config: {
                                                minWidth: mw
                                            }
                                        }
                                    ]
                                },
                                {
                                    type: "column",
                                    children: [
                                        {
                                            type: "window",
                                            appName: "noGlueApp",
                                            config: {
                                                minWidth: mw
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }

                let workspace = await glue.workspaces.createWorkspace(config);

                await workspace.saveLayout(layoutName);
                await workspace.close();

                workspace = await glue.workspaces.restoreWorkspace(layoutName);

                expect(workspace.minWidth).to.eql(3 * mw);
            });

            it(`have a minHeight equal to the sum of all minHeight (${mw}) of the rows in the workspace and the constraints are put on the windows`, async () => {
                const config = {
                    children: [
                        {
                            type: "column",
                            children: [
                                {
                                    type: "row",
                                    children: [
                                        {
                                            type: "window",
                                            appName: "noGlueApp",
                                            config: {
                                                minHeight: mw
                                            }
                                        }
                                    ]
                                },
                                {
                                    type: "row",
                                    children: [
                                        {
                                            type: "window",
                                            appName: "noGlueApp",
                                            config: {
                                                minHeight: mw
                                            }
                                        }
                                    ]
                                },
                                {
                                    type: "row",
                                    children: [
                                        {
                                            type: "window",
                                            appName: "noGlueApp",
                                            config: {
                                                minHeight: mw
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }

                let workspace = await glue.workspaces.createWorkspace(config);

                await workspace.saveLayout(layoutName);
                await workspace.close();

                workspace = await glue.workspaces.restoreWorkspace(layoutName);

                expect(workspace.minHeight).to.eql(3 * mw);
            });

            it(`have a minWidth equal to the biggest (${mw}) of the rows in the workspace and the constraints are put on the windows`, async () => {
                const config = {
                    children: [
                        {
                            type: "column",
                            children: [
                                {
                                    type: "row",
                                    children: [
                                        {
                                            type: "group",
                                            children: [
                                                {
                                                    type: "window",
                                                    appName: "noGlueApp",
                                                    config: {
                                                        minWidth: mw
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    type: "row",
                                    children: [
                                        {
                                            type: "group",
                                            children: [
                                                {
                                                    type: "window",
                                                    appName: "noGlueApp",
                                                    config: {
                                                        minWidth: mw + 10
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    type: "row",
                                    children: [
                                        {
                                            type: "group",
                                            children: [
                                                {
                                                    type: "window",
                                                    appName: "noGlueApp",
                                                    config: {
                                                        minWidth: mw
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                },
                            ]
                        }
                    ]
                }

                let workspace = await glue.workspaces.createWorkspace(config);

                await workspace.saveLayout(layoutName);
                await workspace.close();

                workspace = await glue.workspaces.restoreWorkspace(layoutName);

                expect(workspace.minWidth).to.eql(mw + 10);
            });

            it(`have a minHeight equal to the biggest minHeight (${mw}) of the columns in the workspace and the constraints are put on the windows`, async () => {
                const config = {
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
                                                    appName: "noGlueApp",
                                                    config: {
                                                        minHeight: mw
                                                    },
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
                                                    appName: "noGlueApp",
                                                    config: {
                                                        minHeight: mw + 10
                                                    },
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
                                                    appName: "noGlueApp",
                                                    config: {
                                                        minHeight: mw
                                                    },
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }

                let workspace = await glue.workspaces.createWorkspace(config);

                await workspace.saveLayout(layoutName);
                await workspace.close();

                workspace = await glue.workspaces.restoreWorkspace(layoutName);

                expect(workspace.minHeight).to.eql(mw + 10 + decorationsHeight);
            });

            it(`have a maxWidth equal to the sum of all maxWidths (${mw}) of the columns in the workspace and the constraints are put on the windows`, async () => {
                const config = {
                    children: [
                        {
                            type: "row",
                            children: [
                                {
                                    type: "column",
                                    children: [
                                        {
                                            type: "window",
                                            appName: "noGlueApp",
                                            config: {
                                                maxWidth: mw
                                            },
                                        }
                                    ]
                                },
                                {
                                    type: "column",
                                    children: [
                                        {
                                            type: "window",
                                            appName: "noGlueApp",
                                            config: {
                                                maxWidth: mw
                                            },
                                        }
                                    ]
                                },
                                {
                                    type: "column",
                                    children: [
                                        {
                                            type: "window",
                                            appName: "noGlueApp",
                                            config: {
                                                maxWidth: mw
                                            },
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }

                let workspace = await glue.workspaces.createWorkspace(config);

                await workspace.saveLayout(layoutName);
                await workspace.close();

                workspace = await glue.workspaces.restoreWorkspace(layoutName);

                expect(workspace.maxWidth).to.eql(3 * mw);
            });

            it(`have a maxHeight equal to the sum of all maxHeight (${mw}) of the rows in the workspace and the constraints are put on the windows`, async () => {
                const config = {
                    children: [
                        {
                            type: "column",
                            children: [
                                {
                                    type: "row",
                                    children: [
                                        {
                                            type: "window",
                                            appName: "noGlueApp",
                                            config: {
                                                maxHeight: mw
                                            },
                                        }
                                    ]
                                },
                                {
                                    type: "row",
                                    children: [
                                        {
                                            type: "window",
                                            appName: "noGlueApp",
                                            config: {
                                                maxHeight: mw
                                            },
                                        }
                                    ]
                                },
                                {
                                    type: "row",
                                    children: [
                                        {
                                            type: "window",
                                            appName: "noGlueApp",
                                            config: {
                                                maxHeight: mw
                                            },
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }

                let workspace = await glue.workspaces.createWorkspace(config);

                await workspace.saveLayout(layoutName);
                await workspace.close();

                workspace = await glue.workspaces.restoreWorkspace(layoutName);

                expect(workspace.maxHeight).to.eql(3 * mw);
            });

            it(`have a maxWidth equal to the smallest (${mw}) of the rows in the workspace and the constraints are put on the windows`, async () => {
                const config = {
                    children: [
                        {
                            type: "column",
                            children: [
                                {
                                    type: "row",
                                    children: [
                                        {
                                            type: "group",
                                            children: [
                                                {
                                                    type: "window",
                                                    appName: "noGlueApp",
                                                    config: {
                                                        maxWidth: mw
                                                    },
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    type: "row",
                                    children: [
                                        {
                                            type: "group",
                                            children: [
                                                {
                                                    type: "window",
                                                    appName: "noGlueApp",
                                                    config: {
                                                        maxWidth: mw - 10
                                                    },
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    type: "row",
                                    children: [
                                        {
                                            type: "group",
                                            children: [
                                                {
                                                    type: "window",
                                                    appName: "noGlueApp",
                                                    config: {
                                                        maxWidth: mw
                                                    },
                                                }
                                            ]
                                        }
                                    ]
                                },
                            ]
                        }
                    ]
                }

                let workspace = await glue.workspaces.createWorkspace(config);
                await workspace.saveLayout(layoutName);
                await workspace.close();

                workspace = await glue.workspaces.restoreWorkspace(layoutName);

                expect(workspace.maxWidth).to.eql(mw - 10);
            });

            it(`have a maxHeight equal to the smallest maxHeight (${mw}) of the columns in the workspace and the constraints are put on the windows`, async () => {
                const config = {
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
                                                    appName: "noGlueApp",
                                                    config: {
                                                        maxHeight: mw
                                                    },
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
                                                    appName: "noGlueApp",
                                                    config: {
                                                        maxHeight: mw - 10
                                                    },
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
                                                    appName: "noGlueApp",
                                                    config: {
                                                        maxHeight: mw
                                                    },
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }

                let workspace = await glue.workspaces.createWorkspace(config);
                await workspace.saveLayout(layoutName);
                await workspace.close();

                workspace = await glue.workspaces.restoreWorkspace(layoutName);

                expect(workspace.maxHeight).to.eql(mw - 10 + decorationsHeight);
            });

        });

        it(`have a minWidth equal to the biggest one from the group when the configuration is a single stack with multiple windows`, async () => {
            const config = {
                children: [
                    {
                        type: "group",
                        children: [
                            {
                                type: "window",
                                appName: "noGlueApp",
                                config: {
                                    minWidth: 100
                                },
                            },
                            {
                                type: "window",
                                appName: "noGlueApp",
                                config: {
                                    minWidth: 400
                                },
                            },
                            {
                                type: "window",
                                appName: "noGlueApp",
                                config: {
                                    minWidth: 200
                                },
                            }
                        ]
                    }
                ]
            }

            let workspace = await glue.workspaces.createWorkspace(config);
            await workspace.saveLayout(layoutName);
            await workspace.close();

            workspace = await glue.workspaces.restoreWorkspace(layoutName);

            expect(workspace.minWidth).to.eql(400);
        });

        it(`have a minHeight equal to the biggest one from the group when the configuration is a single stack with multiple windows`, async () => {
            const config = {
                children: [
                    {
                        type: "group",
                        children: [
                            {
                                type: "window",
                                appName: "noGlueApp",
                                config: {
                                    minHeight: 100
                                },
                            },
                            {
                                type: "window",
                                appName: "noGlueApp",
                                config: {
                                    minHeight: 400
                                },
                            },
                            {
                                type: "window",
                                appName: "noGlueApp",
                                config: {
                                    minHeight: 200
                                },
                            }
                        ]
                    }
                ]
            }

            let workspace = await glue.workspaces.createWorkspace(config);
            await workspace.saveLayout(layoutName);
            await workspace.close();

            workspace = await glue.workspaces.restoreWorkspace(layoutName);

            expect(workspace.minHeight).to.eql(400 + decorationsHeight);
        });

        it(`have a maxWidth equal to the smallest one from the group when the configuration is a single stack with multiple windows`, async () => {
            const config = {
                children: [
                    {
                        type: "group",
                        children: [
                            {
                                type: "window",
                                appName: "noGlueApp",
                                config: {
                                    maxWidth: 500
                                },
                            },
                            {
                                type: "window",
                                appName: "noGlueApp",
                                config: {
                                    maxWidth: 700
                                },
                            },
                            {
                                type: "window",
                                appName: "noGlueApp",
                                config: {
                                    maxWidth: 600
                                },
                            }
                        ]
                    }
                ]
            }

            let workspace = await glue.workspaces.createWorkspace(config);
            await workspace.saveLayout(layoutName);
            await workspace.close();

            workspace = await glue.workspaces.restoreWorkspace(layoutName);

            expect(workspace.maxWidth).to.eql(500);
        });

        it(`have a maxHeight equal to the smallest one from the group when the configuration is a single stack with multiple windows`, async () => {
            const config = {
                children: [
                    {
                        type: "group",
                        children: [
                            {
                                type: "window",
                                appName: "noGlueApp",
                                config: {
                                    maxHeight: 500
                                },
                            },
                            {
                                type: "window",
                                appName: "noGlueApp",
                                config: {
                                    maxHeight: 700
                                },
                            },
                            {
                                type: "window",
                                appName: "noGlueApp",
                                config: {
                                    maxHeight: 600
                                },
                            }
                        ]
                    }
                ]
            }

            let workspace = await glue.workspaces.createWorkspace(config);
            await workspace.saveLayout(layoutName);
            await workspace.close();

            workspace = await glue.workspaces.restoreWorkspace(layoutName);

            expect(workspace.maxHeight).to.eql(500 + decorationsHeight);
        });
    });

    describe("isPinned container Should ", () => {
        Array.from([true, false]).forEach((value) => {
            it(`set the isPinned property to ${value} when the config contains a row with isPinned ${value}`, async () => {
                const config = {
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
                            ],
                            config: {
                                isPinned: value
                            }
                        }
                    ]
                };

                let workspace = await glue.workspaces.createWorkspace(config);

                await workspace.saveLayout(layoutName);
                await workspace.close();
                await glue.workspaces.restoreWorkspace(layoutName);

                const firstRow = workspace.getAllRows()[0];

                expect(firstRow.isPinned).to.eql(value);
            });

            it(`set the isPinned property to ${value} when the config contains a column with isPinned ${value}`, async () => {
                const config = {
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
                            ],
                            config: {
                                isPinned: value
                            }
                        }
                    ]
                }

                let workspace = await glue.workspaces.createWorkspace(config);

                await workspace.saveLayout(layoutName);
                await workspace.close();
                await glue.workspaces.restoreWorkspace(layoutName);

                const firstColumn = workspace.getAllColumns()[0];

                expect(firstColumn.isPinned).to.eql(value);
            });
        });
    });

    describe("isPinned workspace Should ", () => {
        const newIcon = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 0 24 24' width='24px' fill='%23FFFFFF'%3E%3Cpath d='M0 0h24v24H0z' fill='none'/%3E%3Cpath d='M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z'/%3E%3C/svg%3E`;

        it("restore a workspace as pinned when the layout contains a pinned workspace", async () => {
            const workspaceToSave = await glue.workspaces.createWorkspace(basicConfig);
            await workspaceToSave.pin({ icon: iconForTesting });
            await workspaceToSave.saveLayout(layoutName);
            await workspaceToSave.close();
            const restoredWorkspace = await glue.workspaces.restoreWorkspace(layoutName);

            expect(restoredWorkspace.isPinned).to.be.true;
        });

        it("restore a workspace with the correct icon when the layout contains a pinned workspace", async () => {
            const workspaceToSave = await glue.workspaces.createWorkspace(basicConfig);
            await workspaceToSave.pin({ icon: iconForTesting });
            await workspaceToSave.saveLayout(layoutName);
            await workspaceToSave.close();

            const restoredWorkspace = await glue.workspaces.restoreWorkspace(layoutName);
            const icon = await restoredWorkspace.getIcon();

            expect(icon).to.eql(iconForTesting);
        });

        it("restore a workspace as pinned when the layout contains a pinned and locked workspace", async () => {
            const workspaceToSave = await glue.workspaces.createWorkspace(basicConfig);
            await workspaceToSave.pin({ icon: iconForTesting });
            await workspaceToSave.lock();
            await workspaceToSave.saveLayout(layoutName);
            await workspaceToSave.close();
            const restoredWorkspace = await glue.workspaces.restoreWorkspace(layoutName);

            expect(restoredWorkspace.isPinned).to.be.true;
        });

        it("restore a workspace as not pinned when the layout contains a pinned workspace and isPinned:false is passed in the configuration object", async () => {
            const workspaceToSave = await glue.workspaces.createWorkspace(basicConfig);
            await workspaceToSave.pin({ icon: iconForTesting });
            await workspaceToSave.saveLayout(layoutName);
            await workspaceToSave.close();
            const restoredWorkspace = await glue.workspaces.restoreWorkspace(layoutName, { isPinned: false });

            expect(restoredWorkspace.isPinned).to.be.false;
        });

        it("restore a workspace as pinned when the layout does not contain a pinned workspace and isPinned:true is passed in the configuration object", async () => {
            const workspaceToSave = await glue.workspaces.createWorkspace(Object.assign({}, basicConfig, { config: { icon: iconForTesting } }));
            await workspaceToSave.saveLayout(layoutName);
            await workspaceToSave.close();
            const restoredWorkspace = await glue.workspaces.restoreWorkspace(layoutName, { isPinned: true });

            expect(restoredWorkspace.isPinned).to.be.true;
        });

        it("restore a workspace with the newly passed icon when its pinned in the layout", async () => {
            const workspaceToSave = await glue.workspaces.createWorkspace(Object.assign({}, basicConfig, { config: { icon: iconForTesting } }));
            await workspaceToSave.pin();
            await workspaceToSave.saveLayout(layoutName);
            await workspaceToSave.close();

            const restoredWorkspace = await glue.workspaces.restoreWorkspace(layoutName, { isPinned: true, icon: newIcon });
            const iconInWorkspace = await restoredWorkspace.getIcon();

            expect(iconInWorkspace).to.eql(newIcon);
        });

        it("restore a workspace with the newly passed icon when its pinned in the layout and isPinned:false is passed", async () => {
            const workspaceToSave = await glue.workspaces.createWorkspace(Object.assign({}, basicConfig, { config: { icon: iconForTesting } }));
            await workspaceToSave.pin();
            await workspaceToSave.saveLayout(layoutName);
            await workspaceToSave.close();

            const restoredWorkspace = await glue.workspaces.restoreWorkspace(layoutName, { isPinned: false, icon: newIcon });
            const iconInWorkspace = await restoredWorkspace.getIcon();

            expect(iconInWorkspace).to.eql(newIcon);
        });

        it("restore a workspace with the newly passed icon when its not pinned in the layout", async () => {
            const workspaceToSave = await glue.workspaces.createWorkspace(Object.assign({}, basicConfig, { config: { icon: iconForTesting } }));
            await workspaceToSave.saveLayout(layoutName);
            await workspaceToSave.close();
            const restoredWorkspace = await glue.workspaces.restoreWorkspace(layoutName, { icon: newIcon });
            const iconInWorkspace = await restoredWorkspace.getIcon();

            expect(iconInWorkspace).to.eql(newIcon);
        });

        it("restore a workspace with the newly passed icon when its not pinned in the layout and isPinned:true is passed", async () => {
            const workspaceToSave = await glue.workspaces.createWorkspace(Object.assign({}, basicConfig, { config: { icon: iconForTesting } }));
            await workspaceToSave.saveLayout(layoutName);
            await workspaceToSave.close();
            const restoredWorkspace = await glue.workspaces.restoreWorkspace(layoutName, { isPinned: true, icon: newIcon });
            const iconInWorkspace = await restoredWorkspace.getIcon();

            expect(iconInWorkspace).to.eql(newIcon);
        });

        it("restore the workspace at the front of the frame when there aren't any other pinned workspaces and isPinned is true", async () => {
            const workspaceToSave = await glue.workspaces.createWorkspace(Object.assign({}, basicConfig, { config: { icon: iconForTesting } }));

            await workspaceToSave.saveLayout(layoutName);
            await workspaceToSave.close();
            await glue.workspaces.createWorkspace(basicConfig);

            const restoredWorkspace = await glue.workspaces.restoreWorkspace(layoutName, { isPinned: true, icon: newIcon });

            expect(restoredWorkspace.positionIndex).to.eql(0);
        });

        it("restore the workspace after the last pinned workspace when isPinned is true", async () => {
            const workspaceToSave = await glue.workspaces.createWorkspace(Object.assign({}, basicConfig, { config: { icon: iconForTesting } }));

            await workspaceToSave.saveLayout(layoutName);
            await workspaceToSave.close();

            const pinnedWorkspace = await glue.workspaces.createWorkspace(basicConfig);
            await pinnedWorkspace.pin({ icon: iconForTesting });
            await glue.workspaces.createWorkspace(basicConfig);

            const restoredWorkspace = await glue.workspaces.restoreWorkspace(layoutName, { isPinned: true, icon: newIcon });

            expect(restoredWorkspace.positionIndex).to.eql(1);
        });
    });

    describe("isSelected Should ", () => {
        it("be selected when isSelected true is passed in the restore config", async () => {
            const workspaceToSave = await glue.workspaces.createWorkspace(basicConfig);
            await workspaceToSave.saveLayout(layoutName);
            const restoredWorkspace = await glue.workspaces.restoreWorkspace(layoutName, { isSelected: true });

            expect(restoredWorkspace.isSelected).to.be.true;
        });

        it("be selected when isSelected undefined is passed in the restore config", async () => {
            const workspaceToSave = await glue.workspaces.createWorkspace(basicConfig);
            await workspaceToSave.saveLayout(layoutName);
            const restoredWorkspace = await glue.workspaces.restoreWorkspace(layoutName, { isSelected: undefined });

            expect(restoredWorkspace.isSelected).to.be.true;
        });

        it("be selected when nothing is passed", async () => {
            await glue.workspaces.createWorkspace(basicConfig);
            const workspaceToSave = await glue.workspaces.createWorkspace(basicConfig);
            await workspaceToSave.saveLayout(layoutName);
            const restoredWorkspace = await glue.workspaces.restoreWorkspace(layoutName, {});

            expect(restoredWorkspace.isSelected).to.be.true;
        });

        it("be selected when a isSelected false workspace is in the layout and nothing is passed in the restore config", async () => {
            await glue.workspaces.createWorkspace(basicConfig);
            const workspaceToSave = await glue.workspaces.createWorkspace(Object.assign({}, basicConfig, { config: { isSelected: false } }));
            await workspaceToSave.saveLayout(layoutName);
            const restoredWorkspace = await glue.workspaces.restoreWorkspace(layoutName, {});

            expect(restoredWorkspace.isSelected).to.be.true;
        });

        it("not be selected when isSelected false is passed in the restore config", async () => {
            const workspaceToSave = await glue.workspaces.createWorkspace(basicConfig);
            await workspaceToSave.saveLayout(layoutName);
            const restoredWorkspace = await glue.workspaces.restoreWorkspace(layoutName, { isSelected: false });

            expect(restoredWorkspace.isSelected).to.be.false;
        });
    });

    describe("positionIndex Should ", () => {
        const workspaceChildren = [{
            type: "group",
            children: [{
                type: "window",
                appName: "noGlueApp"
            }]
        }];
        let frameUnderTest;
        const layoutName = "workspace.integration.tests";
        beforeEach(async () => {
            const workspace = await glue.workspaces.createWorkspace({ children: workspaceChildren, frame: { newFrame: true } });

            await workspace.saveLayout(layoutName);

            frameUnderTest = workspace.frame;
        });

        after(() => {
            return glue.workspaces.layouts.delete(layoutName);
        });

        Array.from({ length: 3 }).forEach((_, i, arr) => {
            it(`be placed on the specified position when there are ${arr.length} tabs and the target position is ${i}`, async () => {
                await Promise.all(Array.from({ length: arr.length - 1 }).map(() => frameUnderTest.createWorkspace({ children: workspaceChildren })));

                const workspaceUnderTest = await frameUnderTest.restoreWorkspace(layoutName, { positionIndex: i });

                expect(workspaceUnderTest.positionIndex).to.eql(i);
            });

            it(`be the last one when nothing is specified and the workspace are ${i}`, async () => {
                await Promise.all(Array.from({ length: i }).map(() => frameUnderTest.createWorkspace({ children: workspaceChildren })));

                const workspaceUnderTest = await frameUnderTest.restoreWorkspace(layoutName);

                expect(workspaceUnderTest.positionIndex).to.eql(i + 1);
            });

            it(`be the last one when the position index is 42 and the workspace are ${i}`, async () => {
                await Promise.all(Array.from({ length: i }).map(() => frameUnderTest.createWorkspace({ children: workspaceChildren })));

                const workspaceUnderTest = await frameUnderTest.restoreWorkspace(layoutName, { positionIndex: 42 });

                expect(workspaceUnderTest.positionIndex).to.eql(i + 1);
            });

            it(`be the last one when nothing is specified and the layout which is being restored has a specified position index ${i}`, async () => {
                await Promise.all(Array.from({ length: i }).map((_, ii) => frameUnderTest.createWorkspace({ children: workspaceChildren, config: { positionIndex: ii } })));

                const workspacesInFrame = await frameUnderTest.workspaces();

                await workspacesInFrame[i].saveLayout(layoutName);
                const workspaceUnderTest = await frameUnderTest.restoreWorkspace(layoutName);

                expect(workspaceUnderTest.positionIndex).to.eql(i + 1);
            });
        });

        it("place the pinned tab after the other pinned tabs when nothing is specified", async () => {
            const threeItemsArr = Array.from({ length: 3 });
            const pinnedWorkspaceConfig = { children: workspaceChildren, config: { isPinned: true, icon: iconForTesting } };

            await Promise.all(threeItemsArr.map((_) => frameUnderTest.createWorkspace(pinnedWorkspaceConfig)));
            await Promise.all(threeItemsArr.map(_ => frameUnderTest.createWorkspace({ children: workspaceChildren })));

            const workspaceUnderTest = await frameUnderTest.restoreWorkspace(layoutName, { isPinned: true, icon: iconForTesting });

            expect(workspaceUnderTest.positionIndex).to.eql(3);
        });

        it("place the pinned tab after when nothing is specified and there are no other pinned tabs", async () => {
            const threeItemsArr = Array.from({ length: 3 });
            await Promise.all(threeItemsArr.map(_ => frameUnderTest.createWorkspace({ children: workspaceChildren })));

            const workspaceUnderTest = await frameUnderTest.restoreWorkspace(layoutName, { isPinned: true, icon: iconForTesting });

            expect(workspaceUnderTest.positionIndex).to.eql(0);
        });

        it("place the pinned tab after the other pinned tabs when the positionIndex is bigger than the number of pinned tabs", async () => {
            const threeItemsArr = Array.from({ length: 3 });
            const pinnedWorkspaceConfig = { children: workspaceChildren, config: { isPinned: true, icon: iconForTesting } };
            await Promise.all(threeItemsArr.map(_ => frameUnderTest.createWorkspace(pinnedWorkspaceConfig)));
            await Promise.all(threeItemsArr.map(_ => frameUnderTest.createWorkspace({ children: workspaceChildren })));

            const workspaceUnderTest = await frameUnderTest.restoreWorkspace(layoutName, { isPinned: true, icon: iconForTesting, positionIndex: 4 });

            expect(workspaceUnderTest.positionIndex).to.eql(3);
        });

        Array.from({ length: 3 }).forEach((_, i, arr) => {
            it(`place the pinned tab at the desired positionIndex when there are ${arr.length} pinned tabs`, async () => {
                const threeItemsArr = Array.from({ length: 3 });
                const pinnedWorkspaceConfig = { children: workspaceChildren, config: { isPinned: true, icon: iconForTesting } };

                await Promise.all(threeItemsArr.map(_ => frameUnderTest.createWorkspace(pinnedWorkspaceConfig)));
                await Promise.all(threeItemsArr.map(_ => frameUnderTest.createWorkspace({ children: workspaceChildren })));

                const workspaceUnderTest = await frameUnderTest.createWorkspace({ children: workspaceChildren, config: { isPinned: true, icon: iconForTesting, positionIndex: i } });

                expect(workspaceUnderTest.positionIndex).to.eql(i);
            });
        });

        it("reject when the positionIndex is smaller than the last pinned tab and the workspace is not pinned", (done) => {
            const threeItemsArr = Array.from({ length: 3 });
            const pinnedWorkspaceConfig = { children: workspaceChildren, config: { isPinned: true, icon: iconForTesting } };
            Promise.all(threeItemsArr.map(_ => frameUnderTest.createWorkspace(pinnedWorkspaceConfig))).then(() => {
                frameUnderTest.restoreWorkspace(layoutName, { positionIndex: 0 }).then(() => {
                    done("Should not resolve");
                }).catch(() => done());
            }).catch(done)
        });

        it("reject when the positionIndex is negative", (done) => {
            Promise.all(Array.from({ length: 3 }).map(() => frameUnderTest.createWorkspace({ children: workspaceChildren }))).then(() => {
                return frameUnderTest.restoreWorkspace(layoutName, { positionIndex: -24 });
            }).then(() => {
                done("Should not resolve");
            }).catch(() => {
                done();
            });
        });
    });

    describe("isMaximized Should ", () => {

        const windowConfig = {
            type: "window",
            appName: "dummyApp"
        };
        const threeContainersConfig = {
            children: [
                {
                    type: "row",
                    children: [
                        {
                            type: "column",
                            children: [
                                {
                                    type: "row",
                                    children: [
                                        windowConfig
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
                                        windowConfig
                                    ]
                                }
                            ]
                        },
                        {
                            type: "column",
                            children: [
                                windowConfig
                            ]
                        }
                    ]
                }
            ]
        };

        Array.from(["row", "column", "group"]).forEach((containerType) => {
            it(`restore the layout with a maximized ${containerType} when the layout contains a maximized ${containerType}`, async () => {
                const workspace = await glue.workspaces.createWorkspace(threeContainersConfig);
                const maximizedContainer = workspace.getAllBoxes().find(b => b.type === containerType);

                await maximizedContainer.maximize();

                await workspace.saveLayout(layoutName);
                await workspace.close();

                const restoredWorkspace = await glue.workspaces.restoreWorkspace(layoutName);

                expect(restoredWorkspace.getAllBoxes(b => b.isMaximized).length).to.eql(1);
            });
        });

        it(`restore the layout with a maximized window when the layout contains a maximized window`, async () => {
            const workspace = await glue.workspaces.createWorkspace(threeContainersConfig);
            const maximizedWindow = workspace.getAllWindows().find(w => w.parent.type === "group");

            await maximizedWindow.maximize();

            await workspace.saveLayout(layoutName);
            await workspace.close();

            const restoredWorkspace = await glue.workspaces.restoreWorkspace(layoutName);

            expect(restoredWorkspace.getAllWindows().filter(w => w.isMaximized).length).to.eql(1);
        });

        it(`restore the layout with a maximized flat window when the layout contains a flat maximized window`, async () => {
            const workspace = await glue.workspaces.createWorkspace(threeContainersConfig);
            const maximizedWindow = workspace.getAllWindows().find(w => w.parent.type !== "group");

            await maximizedWindow.maximize();

            await workspace.saveLayout(layoutName);
            await workspace.close();

            const restoredWorkspace = await glue.workspaces.restoreWorkspace(layoutName);

            expect(restoredWorkspace.getAllWindows().filter(w => w.isMaximized).length).to.eql(1);
        });

    });

    describe("maximizationBoundary Should ", () => {
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
        it("preserve the maximizationBoundary flags when the layout has maximizationBoundaries set", async () => {
            const complexWorkspace = await glue.workspaces.createWorkspace(complexConfig);
            await complexWorkspace.saveLayout(layoutName);
            await complexWorkspace.close();

            const restoredComplexWorkspace = await glue.workspaces.restoreWorkspace(layoutName);

            expect(restoredComplexWorkspace.getAllRows().filter(r => r.maximizationBoundary).length).to.eql(1);
            expect(restoredComplexWorkspace.getAllColumns().filter(c => c.maximizationBoundary).length).to.eql(1);
        });

        it("restore the workspace with maximized window in the maximization boundary", async () => {
            const complexWorkspace = await glue.workspaces.createWorkspace(complexConfig);
            const targetGroup = complexWorkspace.getAllGroups().find(g => g.children.length === 4);

            await targetGroup.children[0].maximize();
            await complexWorkspace.saveLayout(layoutName);
            await complexWorkspace.close();

            const restoredComplexWorkspace = await glue.workspaces.restoreWorkspace(layoutName);
            const restoredTargetGroup = restoredComplexWorkspace.getAllGroups().find(g => g.children.length === 4);

            expect(restoredTargetGroup.children[0].isMaximized).to.be.true;
        });

        it("restore the workspace with maximized windows in the maximization boundaries", async () => {
            const complexWorkspace = await glue.workspaces.createWorkspace(complexConfig);
            const targetGroup = complexWorkspace.getAllGroups().find(g => g.children.length === 4);
            const secondWindowToMaximize = complexWorkspace.children[0].children[1].children[0].children[0];
            await targetGroup.children[0].maximize();
            await secondWindowToMaximize.maximize();

            await complexWorkspace.saveLayout(layoutName);
            await complexWorkspace.close();

            const restoredComplexWorkspace = await glue.workspaces.restoreWorkspace(layoutName);
            const restoredTargetGroup = restoredComplexWorkspace.getAllGroups().find(g => g.children.length === 4);
            const restoredSecondWindow = restoredComplexWorkspace.children[0].children[1].children[0].children[0];

            expect(restoredTargetGroup.children[0].isMaximized).to.be.true;
            expect(restoredSecondWindow.isMaximized).to.be.true;
        });

        it("restore the workspace with maximized windows in the maximization boundaries and a globally maximized window", async () => {
            const complexWorkspace = await glue.workspaces.createWorkspace(complexConfig);
            const targetGroup = complexWorkspace.getAllGroups().find(g => g.children.length === 4);
            const secondWindowToMaximize = complexWorkspace.children[0].children[1].children[0].children[0];
            const globallyMaximizedWindow = complexWorkspace.children[0].children[0].children[0];
            await targetGroup.children[0].maximize();
            await secondWindowToMaximize.maximize();
            await globallyMaximizedWindow.maximize();

            await complexWorkspace.saveLayout(layoutName);
            await complexWorkspace.close();

            const restoredComplexWorkspace = await glue.workspaces.restoreWorkspace(layoutName);
            const restoredTargetGroup = restoredComplexWorkspace.getAllGroups().find(g => g.children.length === 4);
            const restoredSecondWindow = restoredComplexWorkspace.children[0].children[1].children[0].children[0];
            const restoredGloballyMaximizedWindow = restoredComplexWorkspace.children[0].children[0].children[0];

            expect(restoredTargetGroup.children[0].isMaximized).to.be.true;
            expect(restoredSecondWindow.isMaximized).to.be.true;
            expect(restoredGloballyMaximizedWindow.isMaximized).to.be.true;
        });

        it("restore the workspace with maximized windows in the maximization boundaries and a globally maximized window, so that when restoring the windows the others are preserved as maximized", async () => {
            const complexWorkspace = await glue.workspaces.createWorkspace(complexConfig);
            const targetGroup = complexWorkspace.getAllGroups().find(g => g.children.length === 4);
            const secondWindowToMaximize = complexWorkspace.children[0].children[1].children[0].children[0];
            const globallyMaximizedWindow = complexWorkspace.children[0].children[0].children[0];
            await targetGroup.children[0].maximize();
            await secondWindowToMaximize.maximize();
            await globallyMaximizedWindow.maximize();

            await complexWorkspace.saveLayout(layoutName);
            await complexWorkspace.close();

            const restoredComplexWorkspace = await glue.workspaces.restoreWorkspace(layoutName);
            const restoredTargetGroup = restoredComplexWorkspace.getAllGroups().find(g => g.children.length === 4);
            const restoredSecondWindow = restoredComplexWorkspace.children[0].children[1].children[0].children[0];
            const restoredGloballyMaximizedWindow = restoredComplexWorkspace.children[0].children[0].children[0];

            await restoredGloballyMaximizedWindow.restore();
            expect(restoredTargetGroup.children[0].isMaximized).to.be.true;
            expect(restoredSecondWindow.isMaximized).to.be.true;

            await restoredSecondWindow.restore();
            expect(restoredTargetGroup.children[0].isMaximized).to.be.true;
        });
    });

    describe("size Should ", () => {
        it("restore the workspace with elements in the correct proportion when the size hasn't been modified", async () => {
            const config = { children: [{ type: "row", children: [{ type: "group", children: [{ type: "window", appName: "noGlueApp" }] }, { type: "group", children: [{ type: "window", appName: "noGlueApp" }] }] }] };
            const workspace = await glue.workspaces.createWorkspace(config);
            const widthSizes = workspace.getAllGroups().map(g => g.width);
            await workspace.saveLayout(layoutName);
            await workspace.close();

            const restoredWorkspace = await glue.workspaces.restoreWorkspace(layoutName);

            const restoredGroupSizes = restoredWorkspace.getAllGroups().map(g => g.width);
            expect(restoredGroupSizes[0] === widthSizes[0] || restoredGroupSizes[0] === widthSizes[1]).to.be.true;
            expect(restoredGroupSizes[1] === widthSizes[0] || restoredGroupSizes[1] === widthSizes[1]).to.be.true;
        });

        it("restore the workspace with elements in the correct proportion when the size hasn't been modified and the windows are flat in a row", async  () => {
            const config = { children: [{ type: "row", children: [{ type: "window", appName: "noGlueApp" }, { type: "window", appName: "noGlueApp" }] }] };
            const workspace = await glue.workspaces.createWorkspace(config);
            const widthSizes = workspace.getAllWindows().map(g => g.width);
            await workspace.saveLayout(layoutName);
            await workspace.close();

            const restoredWorkspace = await glue.workspaces.restoreWorkspace(layoutName);

            const restoredWindowSizes = restoredWorkspace.getAllWindows().map(g => g.width);
            expect(restoredWindowSizes[0] === widthSizes[0] || restoredWindowSizes[0] === widthSizes[1]).to.be.true;
            expect(restoredWindowSizes[1] === widthSizes[0] || restoredWindowSizes[1] === widthSizes[1]).to.be.true;
        });

        it("restore the workspace with elements in the correct proportion when the size hasn't been modified and the windows are flat in separate columns", async  () => {
            const config = { children: [{ type: "row", children: [{ type: "column", children: [{ type: "window", appName: "noGlueApp" }] }, { type: "column", children: [{ type: "window", appName: "noGlueApp" }] }] }] };
            const workspace = await glue.workspaces.createWorkspace(config);
            const widthSizes = workspace.getAllWindows().map(g => g.width);
            await workspace.saveLayout(layoutName);
            await workspace.close();

            const restoredWorkspace = await glue.workspaces.restoreWorkspace(layoutName);

            const restoredWindowSizes = restoredWorkspace.getAllWindows().map(g => g.width);
            expect(restoredWindowSizes[0] === widthSizes[0] || restoredWindowSizes[0] === widthSizes[1]).to.be.true;
            expect(restoredWindowSizes[1] === widthSizes[0] || restoredWindowSizes[1] === widthSizes[1]).to.be.true;
        });
        // width
        it("restore the workspace with elements in the correct proportion when the width has been modified", async  () => {
            const config = { children: [{ type: "row", children: [{ type: "group", children: [{ type: "window", appName: "noGlueApp" }] }, { type: "group", children: [{ type: "window", appName: "noGlueApp" }] }] }] };
            const workspace = await glue.workspaces.createWorkspace(config);
            await workspace.getAllWindows()[0].setSize({ width: 293 });
            const widthSizes = workspace.getAllGroups().map(g => g.width);
            await workspace.saveLayout(layoutName);
            await workspace.close();

            const restoredWorkspace = await glue.workspaces.restoreWorkspace(layoutName);

            const restoredGroupSizes = restoredWorkspace.getAllGroups().map(g => g.width);
            expect(restoredGroupSizes[0] === widthSizes[0] || restoredGroupSizes[0] === widthSizes[1]).to.be.true;
            expect(restoredGroupSizes[1] === widthSizes[0] || restoredGroupSizes[1] === widthSizes[1]).to.be.true;
        });

        it("restore the workspace with elements in the correct proportion when the width has been modified and the windows are flat in a row",async  () => {
            const config = { children: [{ type: "row", children: [{ type: "window", appName: "noGlueApp" }, { type: "window", appName: "noGlueApp" }] }] };
            const workspace = await glue.workspaces.createWorkspace(config);
            await workspace.getAllWindows()[0].setSize({ width: 293 });
            const widthSizes = workspace.getAllWindows().map(g => g.width);
            await workspace.saveLayout(layoutName);
            await workspace.close();

            const restoredWorkspace = await glue.workspaces.restoreWorkspace(layoutName);

            const restoredWindowSizes = restoredWorkspace.getAllWindows().map(g => g.width);
            expect(restoredWindowSizes[0] === widthSizes[0] || restoredWindowSizes[0] === widthSizes[1]).to.be.true;
            expect(restoredWindowSizes[1] === widthSizes[0] || restoredWindowSizes[1] === widthSizes[1]).to.be.true;
        });

        it("restore the workspace with elements in the correct proportion when the width has been modified and the windows are flat in separate columns", async () => {
            const config = { children: [{ type: "row", children: [{ type: "column", children: [{ type: "window", appName: "noGlueApp" }] }, { type: "column", children: [{ type: "window", appName: "noGlueApp" }] }] }] };
            const workspace = await glue.workspaces.createWorkspace(config);
            await workspace.getAllWindows()[0].setSize({ width: 293 });
            const widthSizes = workspace.getAllWindows().map(g => g.width);
            await workspace.saveLayout(layoutName);
            await workspace.close();

            const restoredWorkspace = await glue.workspaces.restoreWorkspace(layoutName);

            const restoredWindowSizes = restoredWorkspace.getAllWindows().map(g => g.width);
            expect(restoredWindowSizes[0] === widthSizes[0] || restoredWindowSizes[0] === widthSizes[1]).to.be.true;
            expect(restoredWindowSizes[1] === widthSizes[0] || restoredWindowSizes[1] === widthSizes[1]).to.be.true;
        });
        // height
        it("restore the workspace with elements in the correct proportion when the height has been modified", async  () => {
            const config = { children: [{ type: "column", children: [{ type: "group", children: [{ type: "window", appName: "noGlueApp" }] }, { type: "group", children: [{ type: "window", appName: "noGlueApp" }] }] }] };
            const workspace = await glue.workspaces.createWorkspace(config);
            await workspace.getAllWindows()[0].setSize({ height: 293 });
            const heightSizes = workspace.getAllGroups().map(g => g.height);
            await workspace.saveLayout(layoutName);
            await workspace.close();

            const restoredWorkspace = await glue.workspaces.restoreWorkspace(layoutName);

            const restoredGroupSizes = restoredWorkspace.getAllGroups().map(g => g.height);
            expect(restoredGroupSizes[0] === heightSizes[0] || restoredGroupSizes[0] === heightSizes[1]).to.be.true;
            expect(restoredGroupSizes[1] === heightSizes[0] || restoredGroupSizes[1] === heightSizes[1]).to.be.true;
        });

        it("restore the workspace with elements in the correct proportion when the height has been modified and the windows are flat in a column",async  () => {
            const config = { children: [{ type: "column", children: [{ type: "window", appName: "noGlueApp" }, { type: "window", appName: "noGlueApp" }] }] };
            const workspace = await glue.workspaces.createWorkspace(config);
            await workspace.getAllWindows()[0].setSize({ height: 293 });
            const heightSizes = workspace.getAllWindows().map(g => g.height);
            await workspace.saveLayout(layoutName);
            await workspace.close();

            const restoredWorkspace = await glue.workspaces.restoreWorkspace(layoutName);

            const restoredWindowSizes = restoredWorkspace.getAllWindows().map(g => g.height);
            expect(restoredWindowSizes[0] === heightSizes[0] || restoredWindowSizes[0] === heightSizes[1]).to.be.true;
            expect(restoredWindowSizes[1] === heightSizes[0] || restoredWindowSizes[1] === heightSizes[1]).to.be.true;
        });

        it("restore the workspace with elements in the correct proportion when the height has been modified and the windows are flat in separate rows", async () => {
            const config = { children: [{ type: "column", children: [{ type: "row", children: [{ type: "window", appName: "noGlueApp" }] }, { type: "row", children: [{ type: "window", appName: "noGlueApp" }] }] }] };
            const workspace = await glue.workspaces.createWorkspace(config);
            await workspace.getAllWindows()[0].setSize({ height: 293 });
            const heightSizes = workspace.getAllWindows().map(g => g.height);
            await workspace.saveLayout(layoutName);
            await workspace.close();

            const restoredWorkspace = await glue.workspaces.restoreWorkspace(layoutName);

            const restoredWindowSizes = restoredWorkspace.getAllWindows().map(g => g.height);
            expect(restoredWindowSizes[0] === heightSizes[0] || restoredWindowSizes[0] === heightSizes[1]).to.be.true;
            expect(restoredWindowSizes[1] === heightSizes[0] || restoredWindowSizes[1] === heightSizes[1]).to.be.true;
        });

    })
});
