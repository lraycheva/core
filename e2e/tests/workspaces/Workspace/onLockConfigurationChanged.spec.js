describe("workspace.onLockConfigurationChanged() Should", () => {
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

    const workspaceLockOptions = ["showSaveButton", "showCloseButton", "allowExtract", "allowWorkspaceTabReorder", "allowWindowReorder",
        "allowSplitters", "allowDropLeft", "allowDropTop", "allowDropRight", "allowDropBottom",
        "showWindowCloseButtons", "showEjectButtons", "showAddWindowButtons"];

    let workspace;
    before(() => coreReady);
    beforeEach(async () => {
        workspace = await glue.workspaces.createWorkspace(basicConfig);
    });

    afterEach(async () => {
        gtf.clearWindowActiveHooks();

        const wsps = await glue.workspaces.getAllWorkspaces();
        await Promise.all(wsps.map((wsp) => wsp.close()));
    });

    it("be invoked with all properties set to false when the workspace is locked without passing a config", async () => {
        const wrapper = gtf.wrapPromise();

        const unsub = await workspace.onLockConfigurationChanged((config) => {
            try {
                // Filtering out allowDrop because its always true in core
                const areAllOptionsLocked = workspaceLockOptions.filter(option => option !== "allowDrop").every((lockOption) => config[lockOption] === false);

                expect(areAllOptionsLocked).to.be.true;
                wrapper.resolve();
            } catch (error) {
                wrapper.reject(error);
            }
        });

        gtf.addWindowHook(unsub);

        await workspace.lock();

        return wrapper.promise;
    });

    it("be invoked with all properties set to false when the workspace is locked with a full config", async () => {
        const wrapper = gtf.wrapPromise();

        const unsub = await workspace.onLockConfigurationChanged((config) => {
            try {
                const areAllOptionsLocked = workspaceLockOptions.every((lockOption) => config[lockOption] === false);

                expect(areAllOptionsLocked).to.be.true;
                wrapper.resolve();
            } catch (error) {
                wrapper.reject(error);
            }
        });

        gtf.addWindowHook(unsub);

        const fullLockConfig = workspaceLockOptions.reduce((acc, opt) => {
            acc[opt] = false;
            return acc;
        }, {});

        await workspace.lock(fullLockConfig);

        return wrapper.promise;
    });

    it("be invoked with all properties set to true when the workspace is unlocked with empty config", async () => {
        const wrapper = gtf.wrapPromise();
        await workspace.lock();
        const unsub = await workspace.onLockConfigurationChanged((config) => {
            try {
                const areAllOptionsUnlocked = workspaceLockOptions.every((lockOption) => config[lockOption] === true);

                expect(areAllOptionsUnlocked).to.be.true;
                wrapper.resolve();
            } catch (error) {
                wrapper.reject(error);
            }
        });

        gtf.addWindowHook(unsub);

        await workspace.lock({});

        return wrapper.promise;
    });

    it("be invoked with all properties set to true when the workspace is unlocked with a full config", async () => {
        const wrapper = gtf.wrapPromise();

        const unsub = await workspace.onLockConfigurationChanged((config) => {
            try {
                const areAllOptionsLocked = workspaceLockOptions.every((lockOption) => config[lockOption] === false);

                expect(areAllOptionsLocked).to.be.true;
                wrapper.resolve();
            } catch (error) {
                wrapper.reject(error);
            }
        });

        gtf.addWindowHook(unsub);

        const fullLockConfig = workspaceLockOptions.reduce((acc, opt) => {
            acc[opt] = true;
            return acc;
        }, {});

        await workspace.lock();
        await workspace.lock(fullLockConfig);

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

        const unsub = await workspace.onLockConfigurationChanged((config) => {
            timesInvoked++;
        });

        gtf.addWindowHook(unsub);

        await workspace.lock();

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

        await workspace.lock();

        const unsub = await workspace.onLockConfigurationChanged((config) => {
            timesInvoked++;
        });

        gtf.addWindowHook(unsub);

        await workspace.lock({});

        return wrapper.promise;
    });

    it("not be invoked when invoked with the same config (locked)", async () => {
        const wrapper = gtf.wrapPromise();
        setTimeout(() => {
            wrapper.resolve();
        }, 3000);

        await workspace.lock();

        const unsub = await workspace.onLockConfigurationChanged((config) => {
            wrapper.reject(new Error("Should not be invoked"));
        });

        gtf.addWindowHook(unsub);

        await workspace.lock((config) => config);

        return wrapper.promise;
    });

    it("not be invoked when invoked with the same config (unlocked)", async () => {
        const wrapper = gtf.wrapPromise();
        setTimeout(() => {
            wrapper.resolve();
        }, 3000);

        const unsub = await workspace.onLockConfigurationChanged((config) => {
            wrapper.reject(new Error("Should not be invoked"));
        });

        gtf.addWindowHook(unsub);

        await workspace.lock((config) => config);

        return wrapper.promise;
    });

    it("not be invoked when the unsubscribe function has been invoked", async () => {
        const wrapper = gtf.wrapPromise();
        setTimeout(() => {
            wrapper.resolve();
        }, 3000);

        const unsub = await workspace.onLockConfigurationChanged((config) => {
            wrapper.reject(new Error("Should not be invoked"));
        });

        unsub();
        await workspace.lock();

        return wrapper.promise;
    });

    workspaceLockOptions.forEach(propertyUnderTest => {
        [true, false].forEach(value => {
            it(`be invoked with ${propertyUnderTest}: ${value} when lock is invoked with the same config`, async () => {
                const wrapper = gtf.wrapPromise();

                if (value) {
                    await workspace.lock(); // if the value is true the workspace should be locked to trigger the event
                }
                const unsub = await workspace.onLockConfigurationChanged((config) => {
                    try {
                        expect(config[propertyUnderTest]).to.eql(value);
                        wrapper.resolve();
                    } catch (error) {
                        wrapper.reject(error);
                    }
                });

                gtf.addWindowHook(unsub);

                await workspace.lock({ [propertyUnderTest]: value });

                return wrapper.promise;
            });
        });
    });
});