describe("window.onLockConfigurationChanged() Should", () => {
    const basicConfig = {
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
                    }
                ]
            }
        ]
    }

    const windowLockOptions = ["allowExtract", "allowReorder", "showCloseButton"];

    let workspace;
    let workspaceWindow;
    before(() => coreReady);
    beforeEach(async () => {
        workspace = await glue.workspaces.createWorkspace(basicConfig);
        workspaceWindow = workspace.getAllWindows()[0];
    });

    afterEach(async () => {
        gtf.clearWindowActiveHooks();

        const wsps = await glue.workspaces.getAllWorkspaces();
        await Promise.all(wsps.map((wsp) => wsp.close()));
    });

    it("be invoked with all properties set to false when the window is locked without passing a config", async () => {
        const wrapper = gtf.wrapPromise();

        const unsub = await workspaceWindow.onLockConfigurationChanged((config) => {
            try {
                const areAllOptionsLocked = windowLockOptions.every((lockOption) => config[lockOption] === false);

                expect(areAllOptionsLocked).to.be.true;
                wrapper.resolve();
            } catch (error) {
                wrapper.reject(error);
            }
        });

        gtf.addWindowHook(unsub);

        await workspaceWindow.lock();

        return wrapper.promise;
    });

    it("be invoked with all properties set to false when the window is locked with a full config", async () => {
        const wrapper = gtf.wrapPromise();

        const unsub = await workspaceWindow.onLockConfigurationChanged((config) => {
            try {
                const areAllOptionsLocked = windowLockOptions.every((lockOption) => config[lockOption] === false);

                expect(areAllOptionsLocked).to.be.true;
                wrapper.resolve();
            } catch (error) {
                wrapper.reject(error);
            }
        });

        gtf.addWindowHook(unsub);

        const fullLockConfig = windowLockOptions.reduce((acc, opt) => {
            acc[opt] = false;
            return acc;
        }, {});

        await workspaceWindow.lock(fullLockConfig);

        return wrapper.promise;
    });

    it("be invoked with all properties set to true when the window is unlocked with empty config", async () => {
        const wrapper = gtf.wrapPromise();
        await workspaceWindow.lock();
        const unsub = await workspaceWindow.onLockConfigurationChanged((config) => {
            try {
                const areAllOptionsUnlocked = windowLockOptions.every((lockOption) => config[lockOption] === true);

                expect(areAllOptionsUnlocked).to.be.true;
                wrapper.resolve();
            } catch (error) {
                wrapper.reject(error);
            }
        });

        gtf.addWindowHook(unsub);

        await workspaceWindow.lock({});

        return wrapper.promise;
    });

    it("be invoked with all properties set to true when the window is unlocked with a full config", async () => {
        const wrapper = gtf.wrapPromise();

        const unsub = await workspaceWindow.onLockConfigurationChanged((config) => {
            try {
                const areAllOptionsLocked = windowLockOptions.every((lockOption) => config[lockOption] === false);

                expect(areAllOptionsLocked).to.be.true;
                wrapper.resolve();
            } catch (error) {
                wrapper.reject(error);
            }
        });

        gtf.addWindowHook(unsub);

        const fullLockConfig = windowLockOptions.reduce((acc, opt) => {
            acc[opt] = true;
            return acc;
        }, {});

        await workspaceWindow.lock();
        await workspaceWindow.lock(fullLockConfig);

        return wrapper.promise;
    });

    it("be invoked only once when all properties are changed to a locked state", async () => {
        const wrapper = gtf.wrapPromise();
        let timesInvoked = 0;
        setTimeout(() => {
            if (timesInvoked === 1) {
                wrapper.resolve();
            } else {
                wrapper.reject(new Error("Should be invoked exactly once"));
            }
        }, 3000);

        const unsub = await workspaceWindow.onLockConfigurationChanged((config) => {
            timesInvoked++;
        });

        gtf.addWindowHook(unsub);

        await workspaceWindow.lock();

        return wrapper.promise;
    });

    it("be invoked only once when all properties are changed to an unlocked state", async () => {
        const wrapper = gtf.wrapPromise();
        let timesInvoked = 0;
        setTimeout(() => {
            if (timesInvoked === 1) {
                wrapper.resolve();
            } else {
                wrapper.reject(new Error("Should be invoked exactly once"));
            }
        }, 3000);

        await workspaceWindow.lock();

        const unsub = await workspaceWindow.onLockConfigurationChanged((config) => {
            timesInvoked++;
        });

        gtf.addWindowHook(unsub);

        await workspaceWindow.lock({});

        return wrapper.promise;
    });

    it("not be invoked when invoked with the same config (locked)", async () => {
        const wrapper = gtf.wrapPromise();
        setTimeout(() => {
            wrapper.resolve();
        }, 3000);

        await workspaceWindow.lock();

        const unsub = await workspaceWindow.onLockConfigurationChanged((config) => {
            wrapper.reject(new Error("Should not be invoked"));
        });

        gtf.addWindowHook(unsub);

        await workspaceWindow.lock((config) => config);

        return wrapper.promise;
    });

    it("not be invoked when invoked with the same config (unlocked)", async () => {
        const wrapper = gtf.wrapPromise();
        setTimeout(() => {
            wrapper.resolve();
        }, 3000);

        const unsub = await workspaceWindow.onLockConfigurationChanged((config) => {
            wrapper.reject(new Error("Should not be invoked"));
        });

        gtf.addWindowHook(unsub);

        await workspaceWindow.lock((config) => config);

        return wrapper.promise;
    });

    it("not be invoked when the unsubscribe function has been invoked", async () => {
        const wrapper = gtf.wrapPromise();
        setTimeout(() => {
            wrapper.resolve();
        }, 3000);

        const unsub = await workspaceWindow.onLockConfigurationChanged((config) => {
            wrapper.reject(new Error("Should not be invoked"));
        });

        unsub();
        await workspaceWindow.lock();

        return wrapper.promise;
    });

    windowLockOptions.forEach(propertyUnderTest => {
        [true, false].forEach(value => {
            it(`be invoked with ${propertyUnderTest}: ${value} when lock is invoked with the same config`, async () => {
                const wrapper = gtf.wrapPromise();

                if (value) {
                    await workspaceWindow.lock(); // if the value is true the window should be locked to trigger the event
                }
                const unsub = await workspaceWindow.onLockConfigurationChanged((config) => {
                    try {
                        expect(config[propertyUnderTest]).to.eql(value);
                        wrapper.resolve();
                    } catch (error) {
                        wrapper.reject(error);
                    }
                });

                gtf.addWindowHook(unsub);

                await workspaceWindow.lock({ [propertyUnderTest]: value });

                return wrapper.promise;
            });
        });
    });

    [true, false].forEach(value => {
        it(`be invoked with allowExtract: ${value} when the workspace is locked with the same config`, async () => {
            const wrapper = gtf.wrapPromise();

            if (value) {
                await workspace.lock(); // if the value is true the window should be locked to trigger the event
            }
            const unsub = await workspaceWindow.onLockConfigurationChanged((config) => {
                try {
                    expect(config.allowExtract).to.eql(value);
                    wrapper.resolve();
                } catch (error) {
                    wrapper.reject(error);
                }
            });

            gtf.addWindowHook(unsub);

            await workspace.lock({ allowExtract: value });

            return wrapper.promise;
        });

        it(`be invoked with allowReorder: ${value} when the workspace is locked with allowWindowReorder: ${value}`, async () => {
            const wrapper = gtf.wrapPromise();

            if (value) {
                await workspace.lock(); // if the value is true the window should be locked to trigger the event
            }
            const unsub = await workspaceWindow.onLockConfigurationChanged((config) => {
                try {
                    expect(config.allowReorder).to.eql(value);
                    wrapper.resolve();
                } catch (error) {
                    wrapper.reject(error);
                }
            });

            gtf.addWindowHook(unsub);

            await workspace.lock({ allowWindowReorder: value });

            return wrapper.promise;
        });

        it(`be invoked with showCloseButton: ${value} when the workspace is locked with showWindowCloseButtons: ${value}`, async () => {
            const wrapper = gtf.wrapPromise();

            if (value) {
                await workspace.lock(); // if the value is true the window should be locked to trigger the event
            }
            const unsub = await workspaceWindow.onLockConfigurationChanged((config) => {
                try {
                    expect(config.showCloseButton).to.eql(value);
                    wrapper.resolve();
                } catch (error) {
                    wrapper.reject(error);
                }
            });

            gtf.addWindowHook(unsub);

            await workspace.lock({ showWindowCloseButtons: value });

            return wrapper.promise;
        });

        it(`be invoked with allowExtract: ${value} when the parent group is locked with the same config`, async () => {
            const wrapper = gtf.wrapPromise();

            if (value) {
                await workspace.lock(); // if the value is true the window should be locked to trigger the event
            }
            const unsub = await workspaceWindow.onLockConfigurationChanged((config) => {
                try {
                    expect(config.allowExtract).to.eql(value);
                    wrapper.resolve();
                } catch (error) {
                    wrapper.reject(error);
                }
            });

            gtf.addWindowHook(unsub);

            await workspaceWindow.parent.lock({ allowExtract: value });

            return wrapper.promise;
        });

        it(`be invoked with allowReorder: ${value} when the parent group is locked with the same config`, async () => {
            const wrapper = gtf.wrapPromise();

            if (value) {
                await workspace.lock(); // if the value is true the window should be locked to trigger the event
            }
            const unsub = await workspaceWindow.onLockConfigurationChanged((config) => {
                try {
                    expect(config.allowReorder).to.eql(value);
                    wrapper.resolve();
                } catch (error) {
                    wrapper.reject(error);
                }
            });

            gtf.addWindowHook(unsub);

            await workspaceWindow.parent.lock({ allowReorder: value });

            return wrapper.promise;
        });
    });
});