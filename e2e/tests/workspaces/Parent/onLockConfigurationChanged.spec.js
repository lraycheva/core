describe("parent.onLockConfigurationChanged() Should", () => {
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

    const rowLockOptions = ["allowDrop", "allowSplitters"];
    const columnLockOptions = ["allowDrop", "allowSplitters"];
    const groupLockOptions = [
        "allowExtract",
        "allowReorder",
        "allowDrop",
        "allowDropHeader",
        "allowDropLeft",
        "allowDropRight",
        "allowDropTop",
        "allowDropBottom",
        "showMaximizeButton",
        "showEjectButton",
        "showAddWindowButton"
    ];

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

    describe("row ", () => {
        let row;
        beforeEach(() => {
            row = workspace.getAllRows()[0]
        });

        it("be invoked with all properties set to false when the row is locked without passing a config", async () => {
            const wrapper = gtf.wrapPromise();

            const unsub = await row.onLockConfigurationChanged((config) => {
                try {
                    const areAllOptionsLocked = rowLockOptions.every((lockOption) => config[lockOption] === false);

                    expect(areAllOptionsLocked).to.be.true;
                    wrapper.resolve();
                } catch (error) {
                    wrapper.reject(error);
                }
            });

            gtf.addWindowHook(unsub);

            await row.lock();

            return wrapper.promise;
        });

        it("be invoked with all properties set to false when the row is locked with a full config", async () => {
            const wrapper = gtf.wrapPromise();

            const unsub = await row.onLockConfigurationChanged((config) => {
                try {
                    const areAllOptionsLocked = rowLockOptions.every((lockOption) => config[lockOption] === false);

                    expect(areAllOptionsLocked).to.be.true;
                    wrapper.resolve();
                } catch (error) {
                    wrapper.reject(error);
                }
            });

            gtf.addWindowHook(unsub);

            const fullLockConfig = rowLockOptions.reduce((acc, opt) => {
                acc[opt] = false;
                return acc;
            }, {});

            await row.lock(fullLockConfig);

            return wrapper.promise;
        });

        it("be invoked with all properties set to true when the row is unlocked with empty config", async () => {
            const wrapper = gtf.wrapPromise();
            await row.lock();
            const unsub = await row.onLockConfigurationChanged((config) => {
                try {
                    const areAllOptionsUnlocked = rowLockOptions.every((lockOption) => config[lockOption] === true);

                    expect(areAllOptionsUnlocked).to.be.true;
                    wrapper.resolve();
                } catch (error) {
                    wrapper.reject(error);
                }
            });

            gtf.addWindowHook(unsub);

            await row.lock({});

            return wrapper.promise;
        });

        it("be invoked with all properties set to true when the row is unlocked with a full config", async () => {
            const wrapper = gtf.wrapPromise();

            const unsub = await row.onLockConfigurationChanged((config) => {
                try {
                    const areAllOptionsLocked = rowLockOptions.every((lockOption) => config[lockOption] === false);

                    expect(areAllOptionsLocked).to.be.true;
                    wrapper.resolve();
                } catch (error) {
                    wrapper.reject(error);
                }
            });

            gtf.addWindowHook(unsub);

            const fullLockConfig = rowLockOptions.reduce((acc, opt) => {
                acc[opt] = true;
                return acc;
            }, {});

            await row.lock();
            await row.lock(fullLockConfig);

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

            const unsub = await row.onLockConfigurationChanged((config) => {
                timesInvoked++;
            });

            gtf.addWindowHook(unsub);

            await row.lock();

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

            await row.lock();

            const unsub = await row.onLockConfigurationChanged((config) => {
                timesInvoked++;
            });

            gtf.addWindowHook(unsub);

            await row.lock({});

            return wrapper.promise;
        });

        it("not be invoked when invoked with the same config (locked)", async () => {
            const wrapper = gtf.wrapPromise();
            setTimeout(() => {
                wrapper.resolve();
            }, 3000);

            await row.lock();

            const unsub = await row.onLockConfigurationChanged((config) => {
                wrapper.reject(new Error("Should not be invoked"));
            });

            gtf.addWindowHook(unsub);

            await row.lock((config) => config);

            return wrapper.promise;
        });

        it("not be invoked when invoked with the same config (unlocked)", async () => {
            const wrapper = gtf.wrapPromise();
            setTimeout(() => {
                wrapper.resolve();
            }, 3000);

            const unsub = await row.onLockConfigurationChanged((config) => {
                wrapper.reject(new Error("Should not be invoked"));
            });

            gtf.addWindowHook(unsub);

            await row.lock((config) => config);

            return wrapper.promise;
        });

        it("not be invoked when the unsubscribe function has been invoked", async () => {
            const wrapper = gtf.wrapPromise();
            setTimeout(() => {
                wrapper.resolve();
            }, 3000);

            const unsub = await row.onLockConfigurationChanged((config) => {
                wrapper.reject(new Error("Should not be invoked"));
            });

            unsub();
            await row.lock();

            return wrapper.promise;
        });

        rowLockOptions.forEach(propertyUnderTest => {
            [true, false].forEach(value => {
                it(`be invoked with ${propertyUnderTest}: ${value} when lock is invoked with the same config`, async () => {
                    const wrapper = gtf.wrapPromise();

                    if (value) {
                        await row.lock(); // if the value is true the workspace should be locked to trigger the event
                    }
                    const unsub = await row.onLockConfigurationChanged((config) => {
                        try {
                            expect(config[propertyUnderTest]).to.eql(value);
                            wrapper.resolve();
                        } catch (error) {
                            wrapper.reject(error);
                        }
                    });

                    gtf.addWindowHook(unsub);

                    await row.lock({ [propertyUnderTest]: value });

                    return wrapper.promise;
                });
            });
        });

        [true, false].forEach((value) => {
            it(`be invoke with allowSplitters: ${value} when the workspace is locked with the same config`, async () => {
                const wrapper = gtf.wrapPromise();

                if (value) {
                    await workspace.lock(); // if the value is true the workspace should be locked to trigger the event
                }
                const unsub = await row.onLockConfigurationChanged((config) => {
                    try {
                        expect(config.allowSplitters).to.eql(value);
                        wrapper.resolve();
                    } catch (error) {
                        wrapper.reject(error);
                    }
                });

                gtf.addWindowHook(unsub);

                await workspace.lock({ allowSplitters: value });

                return wrapper.promise;
            });
        });
    });

    describe("column ", () => {
        let column;
        beforeEach(() => {
            column = workspace.getAllColumns()[0]
        });

        it("be invoked with all properties set to false when the column is locked without passing a config", async () => {
            const wrapper = gtf.wrapPromise();

            const unsub = await column.onLockConfigurationChanged((config) => {
                try {
                    const areAllOptionsLocked = columnLockOptions.every((lockOption) => config[lockOption] === false);

                    expect(areAllOptionsLocked).to.be.true;
                    wrapper.resolve();
                } catch (error) {
                    wrapper.reject(error);
                }
            });

            gtf.addWindowHook(unsub);

            await column.lock();

            return wrapper.promise;
        });

        it("be invoked with all properties set to false when the column is locked with a full config", async () => {
            const wrapper = gtf.wrapPromise();

            const unsub = await column.onLockConfigurationChanged((config) => {
                try {
                    const areAllOptionsLocked = columnLockOptions.every((lockOption) => config[lockOption] === false);

                    expect(areAllOptionsLocked).to.be.true;
                    wrapper.resolve();
                } catch (error) {
                    wrapper.reject(error);
                }
            });

            gtf.addWindowHook(unsub);

            const fullLockConfig = columnLockOptions.reduce((acc, opt) => {
                acc[opt] = false;
                return acc;
            }, {});

            await column.lock(fullLockConfig);

            return wrapper.promise;
        });

        it("be invoked with all properties set to true when the column is unlocked with empty config", async () => {
            const wrapper = gtf.wrapPromise();
            await column.lock();
            const unsub = await column.onLockConfigurationChanged((config) => {
                try {
                    const areAllOptionsUnlocked = columnLockOptions.every((lockOption) => config[lockOption] === true);

                    expect(areAllOptionsUnlocked).to.be.true;
                    wrapper.resolve();
                } catch (error) {
                    wrapper.reject(error);
                }
            });

            gtf.addWindowHook(unsub);

            await column.lock({});

            return wrapper.promise;
        });

        it("be invoked with all properties set to true when the column is unlocked with a full config", async () => {
            const wrapper = gtf.wrapPromise();

            const unsub = await column.onLockConfigurationChanged((config) => {
                try {
                    const areAllOptionsLocked = columnLockOptions.every((lockOption) => config[lockOption] === false);

                    expect(areAllOptionsLocked).to.be.true;
                    wrapper.resolve();
                } catch (error) {
                    wrapper.reject(error);
                }
            });

            gtf.addWindowHook(unsub);

            const fullLockConfig = columnLockOptions.reduce((acc, opt) => {
                acc[opt] = true;
                return acc;
            }, {});

            await column.lock();
            await column.lock(fullLockConfig);

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

            const unsub = await column.onLockConfigurationChanged((config) => {
                timesInvoked++;
            });

            gtf.addWindowHook(unsub);

            await column.lock();

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

            await column.lock();

            const unsub = await column.onLockConfigurationChanged((config) => {
                timesInvoked++;
            });

            gtf.addWindowHook(unsub);

            await column.lock({});

            return wrapper.promise;
        });

        it("not be invoked when invoked with the same config (locked)", async () => {
            const wrapper = gtf.wrapPromise();
            setTimeout(() => {
                wrapper.resolve();
            }, 3000);

            await column.lock();

            const unsub = await column.onLockConfigurationChanged((config) => {
                wrapper.reject(new Error("Should not be invoked"));
            });

            gtf.addWindowHook(unsub);

            await column.lock((config) => config);

            return wrapper.promise;
        });

        it("not be invoked when invoked with the same config (unlocked)", async () => {
            const wrapper = gtf.wrapPromise();
            setTimeout(() => {
                wrapper.resolve();
            }, 3000);

            const unsub = await column.onLockConfigurationChanged((config) => {
                wrapper.reject(new Error("Should not be invoked"));
            });

            gtf.addWindowHook(unsub);

            await column.lock((config) => config);

            return wrapper.promise;
        });

        it("not be invoked when the unsubscribe function has been invoked", async () => {
            const wrapper = gtf.wrapPromise();
            setTimeout(() => {
                wrapper.resolve();
            }, 3000);

            const unsub = await column.onLockConfigurationChanged((config) => {
                wrapper.reject(new Error("Should not be invoked"));
            });

            unsub();
            await column.lock();

            return wrapper.promise;
        });

        columnLockOptions.forEach(propertyUnderTest => {
            [true, false].forEach(value => {
                it(`be invoked with ${propertyUnderTest}: ${value} when lock is invoked with the same config`, async () => {
                    const wrapper = gtf.wrapPromise();

                    if (value) {
                        await column.lock(); // if the value is true the workspace should be locked to trigger the event
                    }
                    const unsub = await column.onLockConfigurationChanged((config) => {
                        try {
                            expect(config[propertyUnderTest]).to.eql(value);
                            wrapper.resolve();
                        } catch (error) {
                            wrapper.reject(error);
                        }
                    });

                    gtf.addWindowHook(unsub);

                    await column.lock({ [propertyUnderTest]: value });

                    return wrapper.promise;
                });
            });
        });

        [true, false].forEach((value) => {
            it(`be invoke with allowSplitters: ${value} when the workspace is locked with the same config`, async () => {
                const wrapper = gtf.wrapPromise();

                if (value) {
                    await workspace.lock(); // if the value is true the workspace should be locked to trigger the event
                }
                const unsub = await column.onLockConfigurationChanged((config) => {
                    try {
                        expect(config.allowSplitters).to.eql(value);
                        wrapper.resolve();
                    } catch (error) {
                        wrapper.reject(error);
                    }
                });

                gtf.addWindowHook(unsub);

                await workspace.lock({ allowSplitters: value });

                return wrapper.promise;
            });
        });
    });

    describe("group ", () => {
        let group;
        beforeEach(() => {
            group = workspace.getAllGroups()[0]
        });

        it("be invoked with all properties set to false when the group is locked without passing a config", async () => {
            const wrapper = gtf.wrapPromise();

            const unsub = await group.onLockConfigurationChanged((config) => {
                try {
                    const areAllOptionsLocked = groupLockOptions.every((lockOption) => config[lockOption] === false);

                    expect(areAllOptionsLocked).to.be.true;
                    wrapper.resolve();
                } catch (error) {
                    wrapper.reject(error);
                }
            });

            gtf.addWindowHook(unsub);

            await group.lock();

            return wrapper.promise;
        });

        it("be invoked with all properties set to false when the group is locked with a full config", async () => {
            const wrapper = gtf.wrapPromise();

            const unsub = await group.onLockConfigurationChanged((config) => {
                try {
                    const areAllOptionsLocked = groupLockOptions.every((lockOption) => config[lockOption] === false);

                    expect(areAllOptionsLocked).to.be.true;
                    wrapper.resolve();
                } catch (error) {
                    wrapper.reject(error);
                }
            });

            gtf.addWindowHook(unsub);

            const fullLockConfig = groupLockOptions.reduce((acc, opt) => {
                acc[opt] = false;
                return acc;
            }, {});

            await group.lock(fullLockConfig);

            return wrapper.promise;
        });

        it("be invoked with all properties set to true when the group is unlocked with empty config", async () => {
            const wrapper = gtf.wrapPromise();
            await group.lock();
            const unsub = await group.onLockConfigurationChanged((config) => {
                try {
                    const areAllOptionsUnlocked = groupLockOptions.every((lockOption) => config[lockOption] === true);

                    expect(areAllOptionsUnlocked).to.be.true;
                    wrapper.resolve();
                } catch (error) {
                    wrapper.reject(error);
                }
            });

            gtf.addWindowHook(unsub);

            await group.lock({});

            return wrapper.promise;
        });

        it("be invoked with all properties set to true when the group is unlocked with a full config", async () => {
            const wrapper = gtf.wrapPromise();

            const unsub = await group.onLockConfigurationChanged((config) => {
                try {
                    const areAllOptionsLocked = groupLockOptions.every((lockOption) => config[lockOption] === false);

                    expect(areAllOptionsLocked).to.be.true;
                    wrapper.resolve();
                } catch (error) {
                    wrapper.reject(error);
                }
            });

            gtf.addWindowHook(unsub);

            const fullLockConfig = groupLockOptions.reduce((acc, opt) => {
                acc[opt] = true;
                return acc;
            }, {});

            await group.lock();
            await group.lock(fullLockConfig);

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

            const unsub = await group.onLockConfigurationChanged((config) => {
                timesInvoked++;
            });

            gtf.addWindowHook(unsub);

            await group.lock();

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

            await group.lock();

            const unsub = await group.onLockConfigurationChanged((config) => {
                timesInvoked++;
            });

            gtf.addWindowHook(unsub);

            await group.lock({});

            return wrapper.promise;
        });

        it("not be invoked when invoked with the same config (locked)", async () => {
            const wrapper = gtf.wrapPromise();
            setTimeout(() => {
                wrapper.resolve();
            }, 3000);

            await group.lock();

            const unsub = await group.onLockConfigurationChanged((config) => {
                wrapper.reject(new Error("Should not be invoked"));
            });

            gtf.addWindowHook(unsub);

            await group.lock((config) => config);

            return wrapper.promise;
        });

        it("not be invoked when invoked with the same config (unlocked)", async () => {
            const wrapper = gtf.wrapPromise();
            setTimeout(() => {
                wrapper.resolve();
            }, 3000);

            const unsub = await group.onLockConfigurationChanged((config) => {
                wrapper.reject(new Error("Should not be invoked"));
            });

            gtf.addWindowHook(unsub);

            await group.lock((config) => config);

            return wrapper.promise;
        });

        it("not be invoked when the unsubscribe function has been invoked", async () => {
            const wrapper = gtf.wrapPromise();
            setTimeout(() => {
                wrapper.resolve();
            }, 3000);

            const unsub = await group.onLockConfigurationChanged((config) => {
                wrapper.reject(new Error("Should not be invoked"));
            });

            unsub();
            await group.lock();

            return wrapper.promise;
        });

        groupLockOptions.forEach(propertyUnderTest => {
            [true, false].forEach(value => {
                it(`be invoked with ${propertyUnderTest}: ${value} when lock is invoked with the same config`, async () => {
                    const wrapper = gtf.wrapPromise();

                    if (value) {
                        await group.lock(); // if the value is true the workspace should be locked to trigger the event
                    }
                    const unsub = await group.onLockConfigurationChanged((config) => {
                        try {
                            expect(config[propertyUnderTest]).to.eql(value);
                            wrapper.resolve();
                        } catch (error) {
                            wrapper.reject(error);
                        }
                    });

                    gtf.addWindowHook(unsub);

                    await group.lock({ [propertyUnderTest]: value });

                    return wrapper.promise;
                });
            });
        });

        [true, false].forEach((value) => {
            it(`be invoke with allowExtract: ${value} when the workspace is locked with the same config`, async () => {
                const wrapper = gtf.wrapPromise();

                if (value) {
                    await workspace.lock(); // if the value is true the workspace should be locked to trigger the event
                }
                const unsub = await group.onLockConfigurationChanged((config) => {
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

            it(`be invoke with allowReorder: ${value} when the workspace is locked with allowWindowReorder: ${value}`, async () => {
                const wrapper = gtf.wrapPromise();

                if (value) {
                    await workspace.lock(); // if the value is true the workspace should be locked to trigger the event
                }
                const unsub = await group.onLockConfigurationChanged((config) => {
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

            it(`be invoke with showEjectButton: ${value} when the workspace is locked with showEjectButtons: ${value}`, async () => {
                const wrapper = gtf.wrapPromise();

                if (value) {
                    await workspace.lock(); // if the value is true the workspace should be locked to trigger the event
                }
                const unsub = await group.onLockConfigurationChanged((config) => {
                    try {
                        expect(config.showEjectButton).to.eql(value);
                        wrapper.resolve();
                    } catch (error) {
                        wrapper.reject(error);
                    }
                });

                gtf.addWindowHook(unsub);

                await workspace.lock({ showEjectButtons: value });

                return wrapper.promise;
            });

            it(`be invoke with showAddWindowButton: ${value} when the workspace is locked with showAddWindowButtons: ${value}`, async () => {
                const wrapper = gtf.wrapPromise();

                if (value) {
                    await workspace.lock(); // if the value is true the workspace should be locked to trigger the event
                }
                const unsub = await group.onLockConfigurationChanged((config) => {
                    try {
                        expect(config.showAddWindowButton).to.eql(value);
                        wrapper.resolve();
                    } catch (error) {
                        wrapper.reject(error);
                    }
                });

                gtf.addWindowHook(unsub);

                await workspace.lock({ showAddWindowButtons: value });

                return wrapper.promise;
            });
        });
    });
});