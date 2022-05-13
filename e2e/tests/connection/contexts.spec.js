describe("contexts ", function () {
    this.timeout(60000);
    before(() => coreReady);

    let clientsToClear = [];
    let unsubFuncs = [];
    let gwsToClose = [];

    afterEach(async () => {

        unsubFuncs.forEach((unsub) => unsub());

        unsubFuncs = [];

        await Promise.all(clientsToClear.map((client) => client.close()));

        clientsToClear = [];

        await Promise.all(gwsToClose.map((gw) => gtf.puppet.stopDesktopGateway(gw)));

        gwsToClose = [];
    });

    const waitClientReconnect = async (client) => {
        const reconnectionWrapper = gtf.wrapPromise();

        const reconUnsub = await client.reconnected(() => {
            reconnectionWrapper.resolve();
            reconUnsub();
        });

        return reconnectionWrapper.promise;
    };

    describe("web platform only", () => {
        it("all() in the platform should return the context name created by another web client before platform reload", async () => {
            const platform = await gtf.puppet.startWebPlatform();

            clientsToClear.push(platform);

            const webClient = await platform.openClient();

            clientsToClear.push(webClient);

            const contextName = gtf.contexts.getContextName();

            const context = { complexObj: gtf.contexts.generateComplexObject(10) };

            await webClient.setContext(contextName, context);

            const clientReconnection = waitClientReconnect(webClient);

            await platform.reload();

            await clientReconnection;

            const allContexts = await platform.getAllContexts();

            expect(allContexts.some((ctxName) => ctxName === contextName)).to.be.true;
        });

        it("all() in a web client should return the context name created by another web client before platform reload", async () => {
            const platform = await gtf.puppet.startWebPlatform();

            clientsToClear.push(platform);

            const webClient = await platform.openClient();

            clientsToClear.push(webClient);

            const webClientTwo = await platform.openClient();

            clientsToClear.push(webClientTwo);

            const contextName = gtf.contexts.getContextName();

            const context = { complexObj: gtf.contexts.generateComplexObject(10) };

            await webClient.setContext(contextName, context);

            const clientReconnection = waitClientReconnect(webClient);

            const clientReconnectionTwo = waitClientReconnect(webClientTwo);

            await platform.reload();

            await Promise.all([clientReconnection, clientReconnectionTwo]);

            const allContexts = await webClientTwo.getAllContexts();

            expect(allContexts.some((ctxName) => ctxName === contextName)).to.be.true;
        });

        it("all() in a web client should return the context name initially created by the platform before reload when another app got it before the reload", async () => {
            const platform = await gtf.puppet.startWebPlatform();

            clientsToClear.push(platform);

            const webClient = await platform.openClient();

            clientsToClear.push(webClient);

            const webClientTwo = await platform.openClient();

            clientsToClear.push(webClientTwo);

            const contextName = gtf.contexts.getContextName();

            const context = { complexObj: gtf.contexts.generateComplexObject(10) };

            await platform.setContext(contextName, context);

            await webClient.getContext(contextName);

            const clientReconnection = waitClientReconnect(webClient);

            const clientReconnectionTwo = waitClientReconnect(webClientTwo);

            await platform.reload();

            await Promise.all([clientReconnection, clientReconnectionTwo]);

            const allContexts = await webClientTwo.getAllContexts();

            expect(allContexts.some((ctxName) => ctxName === contextName)).to.be.true;
        });

        it("get() in the platform should return the context created by another web client before platform reload", async () => {
            const platform = await gtf.puppet.startWebPlatform();

            clientsToClear.push(platform);

            const webClient = await platform.openClient();

            clientsToClear.push(webClient);

            const contextName = gtf.contexts.getContextName();

            const initialContext = { complexObj: gtf.contexts.generateComplexObject(10) };

            await webClient.setContext(contextName, initialContext);

            const clientReconnection = waitClientReconnect(webClient);

            await platform.reload();

            await clientReconnection;

            const fetchedContext = await platform.getContext(contextName)

            expect(fetchedContext).to.eql(initialContext);
        });

        it("get() in a web client should return the context created by another web client before platform reload", async () => {
            const platform = await gtf.puppet.startWebPlatform();

            clientsToClear.push(platform);

            const webClient = await platform.openClient();

            clientsToClear.push(webClient);

            const webClientTwo = await platform.openClient();

            clientsToClear.push(webClientTwo);

            const contextName = gtf.contexts.getContextName();

            const initialContext = { complexObj: gtf.contexts.generateComplexObject(10) };

            await webClient.setContext(contextName, initialContext);

            const clientReconnection = waitClientReconnect(webClient);

            const clientReconnectionTwo = waitClientReconnect(webClientTwo);

            await platform.reload();

            await Promise.all([clientReconnection, clientReconnectionTwo]);

            const fetchedContext = await webClientTwo.getContext(contextName);

            expect(fetchedContext).to.eql(initialContext);
        });

        it("get() in a web client should return the context initially created by the platform before reload when another app got it before the reload", async () => {
            const platform = await gtf.puppet.startWebPlatform();

            clientsToClear.push(platform);

            const webClient = await platform.openClient();

            clientsToClear.push(webClient);

            const webClientTwo = await platform.openClient();

            clientsToClear.push(webClientTwo);

            const contextName = gtf.contexts.getContextName();

            const initialContext = { complexObj: gtf.contexts.generateComplexObject(10) };

            await platform.setContext(contextName, initialContext);

            await webClient.getContext(contextName);

            const clientReconnection = waitClientReconnect(webClient);

            const clientReconnectionTwo = waitClientReconnect(webClientTwo);

            await platform.reload();

            await Promise.all([clientReconnection, clientReconnectionTwo]);

            const fetchedContext = await webClientTwo.getContext(contextName);

            expect(fetchedContext).to.eql(initialContext);
        });

        it("subscribe() should continue to work in a web client after platform reload", async () => {
            const platform = await gtf.puppet.startWebPlatform();

            clientsToClear.push(platform);

            const webClient = await platform.openClient();

            clientsToClear.push(webClient);

            const contextName = gtf.contexts.getContextName();

            const context = { test: 42 };

            const updatedContext = { test: 62 };

            const firstSubPromise = gtf.wrapPromise();

            const secondSubPromise = gtf.wrapPromise();

            const unsub = await webClient.subscribeContext(contextName, (data) => {
                if (data.test === 42) {
                    firstSubPromise.resolve();
                    return;
                }

                if (data.test === 62) {
                    secondSubPromise.resolve();
                    return;
                }
            });

            unsubFuncs.push(unsub);

            await platform.setContext(contextName, context);

            await firstSubPromise.promise;

            const clientReconnection = waitClientReconnect(webClient);

            await platform.reload();

            await clientReconnection;

            await platform.updateContext(contextName, updatedContext);

            await secondSubPromise.promise;

        });

    });

    describe("desktop gw only", () => {
        it("all() should return the context name created by the same core client before gateway reload", async () => {
            const gw = await gtf.puppet.startDesktopGateway();

            gwsToClose.push(gw);

            const coreClient = await gtf.puppet.startCoreClient();

            clientsToClear.push(coreClient);

            const contextName = gtf.contexts.getContextName();

            const context = { complexObj: gtf.contexts.generateComplexObject(10) };

            await coreClient.setContext(contextName, context);

            const clientReconnection = waitClientReconnect(coreClient);

            await gtf.puppet.stopDesktopGateway(gw);

            const newGw = await gtf.puppet.startDesktopGateway();

            gwsToClose.push(newGw);

            await clientReconnection;

            const allContexts = await coreClient.getAllContexts();

            expect(allContexts.some((ctxName) => ctxName === contextName)).to.be.true;
        });

        // Fail rate 1% - needs further investigation
        it.skip("all() should return the context name created by another core client before gateway reload", async () => {
            const gw = await gtf.puppet.startDesktopGateway();

            gwsToClose.push(gw);

            const coreClient = await gtf.puppet.startCoreClient();

            clientsToClear.push(coreClient);

            const coreClientTwo = await gtf.puppet.startCoreClient();

            clientsToClear.push(coreClientTwo);

            const contextName = gtf.contexts.getContextName();

            const context = { complexObj: gtf.contexts.generateComplexObject(10) };

            await coreClientTwo.setContext(contextName, context);

            const clientReconnection = waitClientReconnect(coreClient);

            const clientReconnectionTwo = waitClientReconnect(coreClientTwo);

            await gtf.puppet.stopDesktopGateway(gw);

            const newGw = await gtf.puppet.startDesktopGateway();

            gwsToClose.push(newGw);

            await Promise.all([clientReconnection, clientReconnectionTwo]);

            const allContexts = await coreClient.getAllContexts();

            expect(allContexts.some((ctxName) => ctxName === contextName)).to.be.true;
        });

        // Fail rate 5%, needs further investigation
        it.skip("get() in a core client should return the context created by another core client before gateway reload", async () => {
            const gw = await gtf.puppet.startDesktopGateway();

            gwsToClose.push(gw);

            const coreClient = await gtf.puppet.startCoreClient();

            clientsToClear.push(coreClient);

            const coreClientTwo = await gtf.puppet.startCoreClient();

            clientsToClear.push(coreClientTwo);

            const contextName = gtf.contexts.getContextName();

            const context = { complexObj: gtf.contexts.generateComplexObject(10) };

            await coreClient.setContext(contextName, context);

            const clientReconnection = waitClientReconnect(coreClient);

            const clientReconnectionTwo = waitClientReconnect(coreClientTwo);

            await gtf.puppet.stopDesktopGateway(gw);

            const newGw = await gtf.puppet.startDesktopGateway();

            gwsToClose.push(newGw);

            await clientReconnection;

            await clientReconnectionTwo;

            const fetchedContext = await coreClientTwo.getContext(contextName);

            expect(fetchedContext).to.eql(context);
        });

        it("get() in a core client should return the context created by the same core client before gateway reload", async () => {
            const gw = await gtf.puppet.startDesktopGateway();

            gwsToClose.push(gw);

            const coreClient = await gtf.puppet.startCoreClient();

            clientsToClear.push(coreClient);

            const contextName = gtf.contexts.getContextName();

            const context = { complexObj: gtf.contexts.generateComplexObject(10) };

            await coreClient.setContext(contextName, context);

            const clientReconnection = waitClientReconnect(coreClient);

            await gtf.puppet.stopDesktopGateway(gw);

            const newGw = await gtf.puppet.startDesktopGateway();

            gwsToClose.push(newGw);

            await clientReconnection

            const fetchedContext = await coreClient.getContext(contextName);

            expect(fetchedContext).to.eql(context);
        });

        it("subscribe() should continue to work in a core client after gateway reload", async () => {
            const gw = await gtf.puppet.startDesktopGateway();

            gwsToClose.push(gw);

            const coreClient = await gtf.puppet.startCoreClient();

            clientsToClear.push(coreClient);

            const contextName = gtf.contexts.getContextName();

            const context = { test: 42 };

            const updatedContext = { test: 62 };

            const firstSubPromise = gtf.wrapPromise();

            const secondSubPromise = gtf.wrapPromise();

            const unsub = await coreClient.subscribeContext(contextName, (data) => {
                if (data.test === 42) {
                    firstSubPromise.resolve();
                    return;
                }

                if (data.test === 62) {
                    secondSubPromise.resolve();
                    return;
                }
            });

            unsubFuncs.push(unsub);

            await coreClient.setContext(contextName, context);

            await firstSubPromise.promise;

            const clientReconnection = waitClientReconnect(coreClient);

            await gtf.puppet.stopDesktopGateway(gw);

            const newGw = await gtf.puppet.startDesktopGateway();

            gwsToClose.push(newGw);

            await clientReconnection;

            await coreClient.updateContext(contextName, updatedContext);

            await secondSubPromise.promise;
        });

    });

    describe("web platform to desktop gw", () => {
        const platformConfig = {
            glue: {
                systemLogger: {
                    level: "info"
                }
            },
            connection: {
                preferred: {
                    url: gtf.puppet.defaultGWUrl,
                    auth: gtf.puppet.defaultGWAuth,
                    discoveryIntervalMS: 1000
                }
            }
        };

        describe("web platform exists before the preferred GW", () => {
            it("all() in the platform after preferred appears should contain the context names set before", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const contextName = gtf.contexts.getContextName();

                const context = { complexObj: gtf.contexts.generateComplexObject(10) };

                await platform.setContext(contextName, context);
                await platform.waitContextTrack(contextName, context);

                const initialContextNames = await platform.getAllContexts();

                const reconnection = waitClientReconnect(platform);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                await reconnection;

                await platform.waitContext(contextName, context);
                const latestContextNames = await platform.getAllContexts();

                expect(initialContextNames.every((ctxName) => latestContextNames.some((name) => name === ctxName))).to.be.true;
            });

            it("all() in a web client after preferred appears should contain the context names set before", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const contextName = gtf.contexts.getContextName();

                const context = { complexObj: gtf.contexts.generateComplexObject(10) };

                await platform.setContext(contextName, context);
                await platform.waitContextTrack(contextName, context);

                const initialContextNames = await platform.getAllContexts();

                const reconnection = waitClientReconnect(platform);

                const reconnectedTwo = waitClientReconnect(webClient);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                await reconnection;

                await reconnectedTwo;

                await webClient.waitContext(contextName, context);
                const latestContextNames = await webClient.getAllContexts();

                expect(initialContextNames.every((ctxName) => latestContextNames.some((name) => name === ctxName))).to.be.true;
            });

            it("all() in the platform when back on default should contain the correct context names when adding a new context while connected to preferred", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const contextName = gtf.contexts.getContextName();

                const context = { complexObj: gtf.contexts.generateComplexObject(10) };

                const reconnection = waitClientReconnect(platform);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                await reconnection;

                await platform.setContext(contextName, context);
                await platform.waitContextTrack(contextName, context);

                const initialContextNames = await platform.getAllContexts();

                const reconnectionTwo = waitClientReconnect(platform);

                await gtf.puppet.stopDesktopGateway(gw);

                await reconnectionTwo;

                await platform.waitContext(contextName, context);
                const latestContextNames = await platform.getAllContexts();

                expect(initialContextNames.every((ctxName) => latestContextNames.some((name) => name === ctxName))).to.be.true;
            });

            it("all() in a web client when back on default should contain the correct context names when adding a new context while connected to preferred", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const contextName = gtf.contexts.getContextName();

                const context = { complexObj: gtf.contexts.generateComplexObject(10) };

                const reconnection = waitClientReconnect(platform);
                const reconnectionWC = waitClientReconnect(webClient);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                await reconnection;
                await reconnectionWC;

                await platform.setContext(contextName, context);
                await platform.waitContextTrack(contextName, context);

                const initialContextNames = await platform.getAllContexts();

                const reconnectionTwo = waitClientReconnect(platform);
                const reconnectionTwoWC = waitClientReconnect(webClient);

                await gtf.puppet.stopDesktopGateway(gw);

                await reconnectionTwo;
                await reconnectionTwoWC;

                await webClient.waitContext(contextName, context);
                const latestContextNames = await webClient.getAllContexts();

                expect(initialContextNames.every((ctxName) => latestContextNames.some((name) => name === ctxName))).to.be.true;
            });

            it("get() in the platform after preferred appears should return the correct pre-existing context", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const contextName = gtf.contexts.getContextName();

                const context = { complexObj: gtf.contexts.generateComplexObject(10) };

                await platform.setContext(contextName, context);
                await platform.waitContextTrack(contextName, context);

                const reconnection = waitClientReconnect(platform);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                await reconnection;

                await platform.waitContext(contextName, context);
                const latestCtx = await platform.getContext(contextName);

                expect(latestCtx).to.eql(context);
            });

            it("get() in a web client after preferred appears should return the correct pre-existing context", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const contextName = gtf.contexts.getContextName();

                const context = { complexObj: gtf.contexts.generateComplexObject(10) };

                await webClient.setContext(contextName, context);
                await platform.waitContextTrack(contextName, context);

                const reconnection = waitClientReconnect(platform);
                const reconnectionWC = waitClientReconnect(webClient);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                await reconnection;
                await reconnectionWC;

                await webClient.waitContext(contextName, context);
                const latestCtx = await webClient.getContext(contextName);

                expect(latestCtx).to.eql(context);
            });

            it("get() in the platform after preferred appears should return the correct context when created by a core client", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const reconnection = waitClientReconnect(platform);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const coreClient = await gtf.puppet.startCoreClient();

                clientsToClear.push(coreClient);

                const contextName = gtf.contexts.getContextName();

                const context = { complexObj: gtf.contexts.generateComplexObject(10) };

                await coreClient.setContext(contextName, context);
                await platform.waitContextTrack(contextName, context);

                await reconnection;

                await platform.waitContext(contextName, context);
                const latestCtx = await platform.getContext(contextName);

                expect(latestCtx).to.eql(context);
            });

            it("get() in a web client after preferred appears should return the correct context when created by a core client", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const reconnection = waitClientReconnect(platform);
                const reconnectionWC = waitClientReconnect(webClient);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const coreClient = await gtf.puppet.startCoreClient();

                clientsToClear.push(coreClient);

                const contextName = gtf.contexts.getContextName();

                const context = { complexObj: gtf.contexts.generateComplexObject(10) };

                await coreClient.setContext(contextName, context);
                await platform.waitContextTrack(contextName, context);

                await reconnection;
                await reconnectionWC;

                await webClient.waitContext(contextName, context);

                const latestCtx = await webClient.getContext(contextName);

                expect(latestCtx).to.eql(context);
            });

            it("get() in the platform after preferred appears should return the correct context when updated by a core client", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const reconnection = waitClientReconnect(platform);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const coreClient = await gtf.puppet.startCoreClient();

                clientsToClear.push(coreClient);

                const contextName = gtf.contexts.getContextName();

                const context = { complexObj: gtf.contexts.generateComplexObject(10) };

                await coreClient.setContext(contextName, context);
                await platform.waitContextTrack(contextName, context);

                await reconnection;

                await platform.waitContext(contextName, context);
                const latestCtx = await platform.getContext(contextName);

                expect(latestCtx).to.eql(context);
            });

            it("get() in a core client after preferred appears should return the correct context when updated by a platform", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const contextName = gtf.contexts.getContextName();

                const context = { complexObj: gtf.contexts.generateComplexObject(10) };

                await platform.setContext(contextName, context);
                await platform.waitContextTrack(contextName, context);

                const reconnection = waitClientReconnect(platform);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const coreClient = await gtf.puppet.startCoreClient();

                clientsToClear.push(coreClient);

                await reconnection;

                await coreClient.waitContext(contextName, context);
                const latestCtx = await coreClient.getContext(contextName);

                expect(latestCtx).to.eql(context);
            });

            it("get() in a core client after preferred appears should return the correct context when updated by a web client", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const contextName = gtf.contexts.getContextName();

                const context = { complexObj: gtf.contexts.generateComplexObject(10) };

                await webClient.setContext(contextName, context);

                await platform.waitContextTrack(contextName, context);

                const reconnection = waitClientReconnect(platform);
                const reconnectionWC = waitClientReconnect(webClient);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const coreClient = await gtf.puppet.startCoreClient();

                clientsToClear.push(coreClient);

                await reconnection;
                await reconnectionWC;

                await coreClient.waitContext(contextName, context);

                const latestCtx = await coreClient.getContext(contextName);

                expect(latestCtx).to.eql(context);
            });

            it("get() in the platform when back on default should contain the correct context when a new context was added by the platform while connected to preferred", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const reconnection = waitClientReconnect(platform);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                await reconnection;

                const contextName = gtf.contexts.getContextName();

                const context = { complexObj: gtf.contexts.generateComplexObject(10) };

                await platform.setContext(contextName, context);
                await platform.waitContextTrack(contextName, context);

                const reconnectionTwo = waitClientReconnect(platform);

                await gtf.puppet.stopDesktopGateway(gw);

                await reconnectionTwo;

                await platform.waitContext(contextName, context);
                const latestCtx = await platform.getContext(contextName);

                expect(latestCtx).to.eql(context);
            });

            it("get() in the platform when back on default should contain the correct context when an existing context was updated by the platform while connected to preferred", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const contextName = gtf.contexts.getContextName();

                const context = { complexObj: gtf.contexts.generateComplexObject(10) };

                await platform.setContext(contextName, context);
                await platform.waitContextTrack(contextName, context);

                const reconnection = waitClientReconnect(platform);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                await reconnection;

                const updatedCtx = { complexObj: 42 };

                await platform.updateContext(contextName, updatedCtx);
                await platform.waitContextTrack(contextName, updatedCtx);

                const reconnectionTwo = waitClientReconnect(platform);

                await gtf.puppet.stopDesktopGateway(gw);

                await reconnectionTwo;

                await platform.waitContext(contextName, updatedCtx)
                const latestCtx = await platform.getContext(contextName);

                expect(latestCtx).to.eql(updatedCtx);
            });

            it("get() in the platform when back on default should contain the correct context when a new context was added by a core client while connected to preferred", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const reconnection = waitClientReconnect(platform);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const coreClient = await gtf.puppet.startCoreClient();

                clientsToClear.push(coreClient);

                await reconnection;

                const contextName = gtf.contexts.getContextName();

                const context = { complexObj: gtf.contexts.generateComplexObject(10) };

                await coreClient.setContext(contextName, context);

                await platform.waitContextTrack(contextName, context);

                const reconnectionTwo = waitClientReconnect(platform);

                await gtf.puppet.stopDesktopGateway(gw);

                await reconnectionTwo;

                await platform.waitContext(contextName, context);

                const latestCtx = await platform.getContext(contextName);

                expect(latestCtx).to.eql(context);
            });

            it("get() in the platform when back on default should contain the correct context when an existing context was updated a core client while connected to preferred", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const reconnection = waitClientReconnect(platform);

                const contextName = gtf.contexts.getContextName();

                const context = { complexObj: gtf.contexts.generateComplexObject(10) };

                await platform.setContext(contextName, context);
                await platform.waitContextTrack(contextName, context);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const coreClient = await gtf.puppet.startCoreClient();

                clientsToClear.push(coreClient);

                await reconnection;

                await coreClient.updateContext(contextName, { complexObj: 42 });
                await platform.waitContextTrack(contextName, { complexObj: 42 });

                const reconnectionTwo = waitClientReconnect(platform);

                await gtf.puppet.stopDesktopGateway(gw);

                await reconnectionTwo;

                await platform.waitContext(contextName, { complexObj: 42 });
                const latestCtx = await platform.getContext(contextName);

                expect(latestCtx).to.eql({ complexObj: 42 });
            });

            it("get() in the platform when back on default should contain the correct context when a new context was added by a web client while connected to preferred", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const reconnection = waitClientReconnect(platform);
                const reconnectionWC = waitClientReconnect(webClient);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                await reconnection;
                await reconnectionWC;

                const contextName = gtf.contexts.getContextName();

                const context = { complexObj: gtf.contexts.generateComplexObject(10) };

                await webClient.setContext(contextName, context);
                await platform.waitContextTrack(contextName, context);

                const reconnectionTwo = waitClientReconnect(platform);
                const reconnectionTwoWC = waitClientReconnect(webClient);

                await gtf.puppet.stopDesktopGateway(gw);

                await reconnectionTwo;
                await reconnectionTwoWC;

                await platform.waitContext(contextName, context);
                const latestCtx = await platform.getContext(contextName);

                expect(latestCtx).to.eql(context);
            });

            it("get() in the platform when back on default should contain the correct context when an existing context was updated a web client while connected to preferred", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const reconnection = waitClientReconnect(platform);
                const reconnectionWC = waitClientReconnect(webClient);

                const contextName = gtf.contexts.getContextName();

                const context = { complexObj: gtf.contexts.generateComplexObject(10) };

                await webClient.setContext(contextName, context);
                await platform.waitContextTrack(contextName, context);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                await reconnection;
                await reconnectionWC;

                await webClient.updateContext(contextName, { complexObj: 42 });
                await platform.waitContextTrack(contextName, { complexObj: 42 });

                const reconnectionTwo = waitClientReconnect(platform);
                const reconnectionTwoWC = waitClientReconnect(webClient);

                await gtf.puppet.stopDesktopGateway(gw);

                await reconnectionTwo;
                await reconnectionTwoWC;

                await platform.waitContext(contextName, { complexObj: 42 });
                const latestCtx = await platform.getContext(contextName);

                expect(latestCtx).to.eql({ complexObj: 42 });
            });

            it("get() in a web client when back on default should contain the correct context when a new context was added by the platform while connected to preferred", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const reconnection = waitClientReconnect(platform);
                const reconnectionWC = waitClientReconnect(webClient);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                await reconnection;
                await reconnectionWC;

                const contextName = gtf.contexts.getContextName();

                const context = { complexObj: gtf.contexts.generateComplexObject(10) };

                await platform.setContext(contextName, context);
                await platform.waitContextTrack(contextName, context);

                const reconnectionTwo = waitClientReconnect(platform);
                const reconnectionTwoWC = waitClientReconnect(webClient);

                await gtf.puppet.stopDesktopGateway(gw);

                await reconnectionTwo;
                await reconnectionTwoWC;

                await webClient.waitContext(contextName, context);
                const latestCtx = await webClient.getContext(contextName);

                expect(latestCtx).to.eql(context);
            });

            it("get() in a web client when back on default should contain the correct context when an existing context was updated by the platform while connected to preferred", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const contextName = gtf.contexts.getContextName();

                const context = { complexObj: gtf.contexts.generateComplexObject(10) };

                await platform.setContext(contextName, context);
                await platform.waitContextTrack(contextName, context);

                const reconnection = waitClientReconnect(platform);
                const reconnectionWC = waitClientReconnect(webClient);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                await reconnection;
                await reconnectionWC;

                await platform.updateContext(contextName, { complexObj: 42 });
                await platform.waitContextTrack(contextName, { complexObj: 42 });

                const reconnectionTwo = waitClientReconnect(platform);
                const reconnectionTwoWC = waitClientReconnect(webClient);

                await gtf.puppet.stopDesktopGateway(gw);

                await reconnectionTwo;
                await reconnectionTwoWC;

                await webClient.waitContext(contextName, { complexObj: 42 });
                const latestCtx = await webClient.getContext(contextName);

                expect(latestCtx).to.eql({ complexObj: 42 });
            });

            it("get() in a web client when back on default should contain the correct context when a new context was added by a core client while connected to preferred", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const reconnection = waitClientReconnect(platform);
                const reconnectionWC = waitClientReconnect(webClient);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const coreClient = await gtf.puppet.startCoreClient();

                clientsToClear.push(coreClient);

                await reconnection;
                await reconnectionWC;

                const contextName = gtf.contexts.getContextName();

                const context = { complexObj: gtf.contexts.generateComplexObject(10) };

                await coreClient.setContext(contextName, context);
                await platform.waitContextTrack(contextName, context);

                const reconnectionTwo = waitClientReconnect(platform);
                const reconnectionTwoWC = waitClientReconnect(webClient);

                await gtf.puppet.stopDesktopGateway(gw);

                await reconnectionTwo;
                await reconnectionTwoWC;

                await webClient.waitContext(contextName, context);
                const latestCtx = await webClient.getContext(contextName);

                expect(latestCtx).to.eql(context);
            });

            it("get() in a web client when back on default should contain the correct context when an existing context was updated a core client while connected to preferred - created by the platform", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const contextName = gtf.contexts.getContextName();

                const context = { complexObj: gtf.contexts.generateComplexObject(10) };

                await platform.setContext(contextName, context);
                await platform.waitContextTrack(contextName, context);

                const reconnection = waitClientReconnect(platform);
                const reconnectionWC = waitClientReconnect(webClient);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const coreClient = await gtf.puppet.startCoreClient();

                clientsToClear.push(coreClient);

                await reconnection;
                await reconnectionWC;

                await coreClient.updateContext(contextName, { complexObj: 42 });
                await platform.waitContextTrack(contextName, { complexObj: 42 });

                const reconnectionTwo = waitClientReconnect(platform);
                const reconnectionTwoWC = waitClientReconnect(webClient);

                await gtf.puppet.stopDesktopGateway(gw);

                await reconnectionTwo;
                await reconnectionTwoWC;

                await webClient.waitContext(contextName, { complexObj: 42 });
                const latestCtx = await webClient.getContext(contextName);

                expect(latestCtx).to.eql({ complexObj: 42 });
            });

            it("get() in a web client when back on default should contain the correct context when an existing context was updated a core client while connected to preferred - created by the web client", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const contextName = gtf.contexts.getContextName();

                const context = { complexObj: gtf.contexts.generateComplexObject(10) };

                await webClient.setContext(contextName, context);
                await platform.waitContextTrack(contextName, context);

                const reconnection = waitClientReconnect(platform);
                const reconnectionWC = waitClientReconnect(webClient);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const coreClient = await gtf.puppet.startCoreClient();

                clientsToClear.push(coreClient);

                await reconnection;
                await reconnectionWC;

                await coreClient.updateContext(contextName, { complexObj: 42 });
                await platform.waitContextTrack(contextName, { complexObj: 42 });

                const reconnectionTwo = waitClientReconnect(platform);
                const reconnectionTwoWC = waitClientReconnect(webClient);

                await gtf.puppet.stopDesktopGateway(gw);

                await reconnectionTwo;
                await reconnectionTwoWC;

                await webClient.waitContext(contextName, { complexObj: 42 });
                const latestCtx = await webClient.getContext(contextName);

                expect(latestCtx).to.eql({ complexObj: 42 });
            });

            it("get() in a web client when back on default should contain the correct context when a new context was added by a web client while connected to preferred", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const webClientTwo = await platform.openClient();

                clientsToClear.push(webClientTwo);

                const reconnection = waitClientReconnect(platform);
                const reconnectionWC = waitClientReconnect(webClient);
                const reconnectionWCTwo = waitClientReconnect(webClientTwo);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                await reconnection;
                await reconnectionWC;
                await reconnectionWCTwo;

                const contextName = gtf.contexts.getContextName();

                const context = { complexObj: gtf.contexts.generateComplexObject(10) };

                await webClientTwo.setContext(contextName, context);
                await platform.waitContextTrack(contextName, context);

                const reconnectionTwo = waitClientReconnect(platform);
                const reconnectionTwoWC = waitClientReconnect(webClient);
                const reconnectionTwoWCTwo = waitClientReconnect(webClientTwo);

                await gtf.puppet.stopDesktopGateway(gw);

                await reconnectionTwo;
                await reconnectionTwoWC;
                await reconnectionTwoWCTwo;

                await webClient.waitContext(contextName, context);
                const latestCtx = await webClient.getContext(contextName);

                expect(latestCtx).to.eql(context);
            });

            it("get() in a web client when back on default should contain the correct context when an existing context was updated a web client while connected to preferred", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const webClientTwo = await platform.openClient();

                clientsToClear.push(webClientTwo);

                const contextName = gtf.contexts.getContextName();

                const context = { complexObj: gtf.contexts.generateComplexObject(10) };

                await platform.setContext(contextName, context);
                await platform.waitContextTrack(contextName, context);

                const reconnection = waitClientReconnect(platform);
                const reconnectionWC = waitClientReconnect(webClient);
                const reconnectionWCTwo = waitClientReconnect(webClientTwo);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                await reconnection;
                await reconnectionWC;
                await reconnectionWCTwo;

                await webClientTwo.updateContext(contextName, { complexObj: 42 })
                await platform.waitContextTrack(contextName, { complexObj: 42 });

                const reconnectionTwo = waitClientReconnect(platform);
                const reconnectionTwoWC = waitClientReconnect(webClient);
                const reconnectionTwoWCTwo = waitClientReconnect(webClientTwo);

                await gtf.puppet.stopDesktopGateway(gw);

                await reconnectionTwo;
                await reconnectionTwoWC;
                await reconnectionTwoWCTwo;

                await webClient.waitContext(contextName, { complexObj: 42 });
                const latestCtx = await webClient.getContext(contextName);

                expect(latestCtx).to.eql({ complexObj: 42 });
            });

            it("subscribe() in the platform should continue to work when preferred appears - platform context set", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const reconnection = waitClientReconnect(platform);

                const contextName = gtf.contexts.getContextName();

                const context = { complexObj: gtf.contexts.generateComplexObject(10) };

                const wrapper = gtf.wrapPromise();

                const unsub = await platform.subscribeContext(contextName, (data) => {
                    try {
                        expect(data).to.eql(context);
                        wrapper.resolve()
                    } catch (error) {
                        return;
                    }
                });

                unsubFuncs.push(unsub);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                await reconnection;

                await platform.setContext(contextName, context);

                await wrapper.promise;
            });

            it("subscribe() in the platform should continue to work when preferred appears - web client context set", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const reconnection = waitClientReconnect(platform);
                const reconnectionWC = waitClientReconnect(webClient);

                const contextName = gtf.contexts.getContextName();

                const context = { complexObj: gtf.contexts.generateComplexObject(10) };

                const wrapper = gtf.wrapPromise();

                const unsub = await platform.subscribeContext(contextName, (data) => {
                    try {
                        expect(data).to.eql(context);
                        wrapper.resolve()
                    } catch (error) {
                        return;
                    }
                });

                unsubFuncs.push(unsub);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                await reconnection;
                await reconnectionWC;

                await webClient.setContext(contextName, context);

                await wrapper.promise;
            });

            it("subscribe() in the platform should continue to work when preferred appears - core client context set", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const reconnection = waitClientReconnect(platform);

                const contextName = gtf.contexts.getContextName();

                const context = { complexObj: gtf.contexts.generateComplexObject(10) };

                const wrapper = gtf.wrapPromise();

                const unsub = await platform.subscribeContext(contextName, (data) => {
                    try {
                        expect(data).to.eql(context);
                        wrapper.resolve()
                    } catch (error) {
                        return;
                    }
                });

                unsubFuncs.push(unsub);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                await reconnection;

                const coreClient = await gtf.puppet.startCoreClient();

                clientsToClear.push(coreClient);

                await coreClient.setContext(contextName, context);

                await wrapper.promise;
            });

            it("subscribe() in the platform should continue to work when back on default after being connected to preferred", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const reconnection = waitClientReconnect(platform);

                const contextName = gtf.contexts.getContextName();

                const context = { complexObj: gtf.contexts.generateComplexObject(10) };

                const wrapper = gtf.wrapPromise();

                const unsub = await platform.subscribeContext(contextName, (data) => {
                    try {
                        expect(data).to.eql(context);
                        wrapper.resolve()
                    } catch (error) {
                        return;
                    }
                });

                unsubFuncs.push(unsub);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                await reconnection;

                const reconnectionTwo = waitClientReconnect(platform);

                await gtf.puppet.stopDesktopGateway(gw);

                await reconnectionTwo;

                await platform.setContext(contextName, context);

                await wrapper.promise;
            });

            it("subscribe() in the platform should continue to work when back on default after being connected to preferred - web client create", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const reconnection = waitClientReconnect(platform);
                const reconnectionWC = waitClientReconnect(webClient);

                const contextName = gtf.contexts.getContextName();

                const context = { complexObj: gtf.contexts.generateComplexObject(10) };

                const wrapper = gtf.wrapPromise();

                const unsub = await platform.subscribeContext(contextName, (data) => {
                    try {
                        expect(data).to.eql(context);
                        wrapper.resolve()
                    } catch (error) {
                        return;
                    }
                });

                unsubFuncs.push(unsub);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                await reconnection;
                await reconnectionWC;

                const reconnectionTwo = waitClientReconnect(platform);
                const reconnectionTwoWC = waitClientReconnect(webClient);

                await gtf.puppet.stopDesktopGateway(gw);

                await reconnectionTwo;
                await reconnectionTwoWC;

                await webClient.setContext(contextName, context);

                await wrapper.promise;
            });

            it("subscribe() in the platform should continue to work when back on default after being connected to preferred - web client update - platform create", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const reconnection = waitClientReconnect(platform);
                const reconnectionWC = waitClientReconnect(webClient);

                const contextName = gtf.contexts.getContextName();

                const wrapper = gtf.wrapPromise();
                const ready = gtf.waitFor(2, () => wrapper.resolve());

                let called44 = false;
                let called42 = false;

                const unsub = await platform.subscribeContext(contextName, (data) => {
                    if (data && data.test === 42 && !called42) {
                        called42 = true;
                        ready();
                    }

                    if (data && data.test === 44 && !called44) {
                        called44 = true;
                        ready();
                    }
                });

                unsubFuncs.push(unsub);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                await reconnection;
                await reconnectionWC;

                await platform.setContext(contextName, { test: 42 });

                await gtf.simpleWait(1000);

                const reconnectionTwo = waitClientReconnect(platform);
                const reconnectionTwoWC = waitClientReconnect(webClient);

                await gtf.puppet.stopDesktopGateway(gw);

                await reconnectionTwo;
                await reconnectionTwoWC;

                await webClient.updateContext(contextName, { test: 44 });

                await wrapper.promise;
            });

            it("subscribe() in the platform should continue to work when back on default after being connected to preferred - web client update - web client create", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const reconnection = waitClientReconnect(platform);
                const reconnectionWC = waitClientReconnect(webClient);

                const contextName = gtf.contexts.getContextName();

                const wrapper = gtf.wrapPromise();
                const ready = gtf.waitFor(2, () => wrapper.resolve());

                let called44 = false;
                let called42 = false;

                const unsub = await platform.subscribeContext(contextName, (data) => {
                    if (data && data.test === 42 && !called42) {
                        called42 = true;
                        ready();
                    }

                    if (data && data.test === 44 && !called44) {
                        called44 = true;
                        ready();
                    }
                });

                unsubFuncs.push(unsub);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                await reconnection;
                await reconnectionWC;

                await webClient.setContext(contextName, { test: 42 });

                await gtf.simpleWait(1000);

                const reconnectionTwo = waitClientReconnect(platform);
                const reconnectionTwoWC = waitClientReconnect(webClient);

                await gtf.puppet.stopDesktopGateway(gw);

                await reconnectionTwo;
                await reconnectionTwoWC;

                await webClient.updateContext(contextName, { test: 44 });

                await wrapper.promise;
            });

            it("subscribe() in the web client should continue to work when preferred appears - platform context set", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const reconnection = waitClientReconnect(platform);
                const reconnectionWC = waitClientReconnect(webClient);

                const contextName = gtf.contexts.getContextName();

                const context = { complexObj: gtf.contexts.generateComplexObject(10) };

                const wrapper = gtf.wrapPromise();

                const unsub = await webClient.subscribeContext(contextName, (data) => {
                    try {
                        expect(data).to.eql(context);
                        wrapper.resolve()
                    } catch (error) {
                        return;
                    }
                });

                unsubFuncs.push(unsub);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                await reconnection;
                await reconnectionWC;

                await platform.setContext(contextName, context);

                await wrapper.promise;
            });

            it("subscribe() in the web client should continue to work when preferred appears - web client context set", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const webClient2 = await platform.openClient();

                clientsToClear.push(webClient2);

                const reconnection = waitClientReconnect(platform);
                const reconnectionWC = waitClientReconnect(webClient);
                const reconnectionWC2 = waitClientReconnect(webClient2);

                const contextName = gtf.contexts.getContextName();

                const context = { complexObj: gtf.contexts.generateComplexObject(10) };

                const wrapper = gtf.wrapPromise();

                const unsub = await webClient.subscribeContext(contextName, (data) => {
                    try {
                        expect(data).to.eql(context);
                        wrapper.resolve()
                    } catch (error) {
                        return;
                    }
                });

                unsubFuncs.push(unsub);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                await reconnection;
                await reconnectionWC;
                await reconnectionWC2;

                await webClient2.setContext(contextName, context);

                await wrapper.promise;
            });

            it("subscribe() in the web client should continue to work when preferred appears - core client context set", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const reconnection = waitClientReconnect(platform);
                const reconnectionWC = waitClientReconnect(webClient);

                const contextName = gtf.contexts.getContextName();

                const context = { complexObj: gtf.contexts.generateComplexObject(10) };

                const wrapper = gtf.wrapPromise();

                const unsub = await webClient.subscribeContext(contextName, (data) => {
                    try {
                        expect(data).to.eql(context);
                        wrapper.resolve()
                    } catch (error) {
                        return;
                    }
                });

                unsubFuncs.push(unsub);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                await reconnection;
                await reconnectionWC;

                const coreClient = await gtf.puppet.startCoreClient();

                clientsToClear.push(coreClient);

                await coreClient.setContext(contextName, context);

                await wrapper.promise;
            });

            it("subscribe() in the web client should continue to work when back on default after being connected to preferred", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const reconnection = waitClientReconnect(platform);
                const reconnectionWC = waitClientReconnect(webClient);

                const contextName = gtf.contexts.getContextName();

                const context = { complexObj: gtf.contexts.generateComplexObject(10) };

                const wrapper = gtf.wrapPromise();

                const unsub = await webClient.subscribeContext(contextName, (data) => {
                    try {
                        expect(data).to.eql(context);
                        wrapper.resolve()
                    } catch (error) {
                        return;
                    }
                });

                unsubFuncs.push(unsub);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                await reconnection;
                await reconnectionWC;

                const reconnectionTwo = waitClientReconnect(platform);
                const reconnectionTwoWC = waitClientReconnect(webClient);

                await gtf.puppet.stopDesktopGateway(gw);

                await reconnectionTwo;
                await reconnectionTwoWC;

                await platform.setContext(contextName, context);

                await wrapper.promise;
            });

            it("subscribe() in the web client should continue to work when back on default after being connected to preferred - web client create", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const webClient2 = await platform.openClient();

                clientsToClear.push(webClient2);

                const reconnection = waitClientReconnect(platform);
                const reconnectionWC = waitClientReconnect(webClient);
                const reconnectionWC2 = waitClientReconnect(webClient2);

                const contextName = gtf.contexts.getContextName();

                const context = { complexObj: gtf.contexts.generateComplexObject(10) };

                const wrapper = gtf.wrapPromise();

                const unsub = await webClient.subscribeContext(contextName, (data) => {
                    try {
                        expect(data).to.eql(context);
                        wrapper.resolve()
                    } catch (error) {
                        return;
                    }
                });

                unsubFuncs.push(unsub);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                await reconnection;
                await reconnectionWC;
                await reconnectionWC2;

                const reconnectionTwo = waitClientReconnect(platform);
                const reconnectionTwoWC = waitClientReconnect(webClient);
                const reconnectionTwoWC2 = waitClientReconnect(webClient2);

                await gtf.puppet.stopDesktopGateway(gw);

                await reconnectionTwo;
                await reconnectionTwoWC;
                await reconnectionTwoWC2;

                await webClient2.setContext(contextName, context);

                await wrapper.promise;
            });

            it("subscribe() in the web client should continue to work when back on default after being connected to preferred - web client update - platform create", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const webClient2 = await platform.openClient();

                clientsToClear.push(webClient2);

                const reconnection = waitClientReconnect(platform);
                const reconnectionWC = waitClientReconnect(webClient);
                const reconnectionWC2 = waitClientReconnect(webClient2);

                const contextName = gtf.contexts.getContextName();

                const wrapper = gtf.wrapPromise();
                const ready = gtf.waitFor(2, () => wrapper.resolve());

                let called44 = false;
                let called42 = false;

                const unsub = await webClient.subscribeContext(contextName, (data) => {
                    if (data && data.test === 42 && !called42) {
                        called42 = true;
                        ready();
                    }

                    if (data && data.test === 44 && !called44) {
                        called44 = true;
                        ready();
                    }
                });

                unsubFuncs.push(unsub);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                await reconnection;
                await reconnectionWC;
                await reconnectionWC2;

                await platform.setContext(contextName, { test: 42 });

                await gtf.simpleWait(1000);

                const reconnectionTwo = waitClientReconnect(platform);
                const reconnectionTwoWC = waitClientReconnect(webClient);
                const reconnectionTwoWC2 = waitClientReconnect(webClient2);

                await gtf.puppet.stopDesktopGateway(gw);

                await reconnectionTwo;
                await reconnectionTwoWC;
                await reconnectionTwoWC2;

                await webClient2.updateContext(contextName, { test: 44 });

                await wrapper.promise;
            });

            it("subscribe() in the web client should continue to work when back on default after being connected to preferred - web client update - web client create", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const webClient2 = await platform.openClient();

                clientsToClear.push(webClient2);

                const reconnection = waitClientReconnect(platform);
                const reconnectionWC = waitClientReconnect(webClient);
                const reconnectionWC2 = waitClientReconnect(webClient2);

                const contextName = gtf.contexts.getContextName();

                const wrapper = gtf.wrapPromise();
                const ready = gtf.waitFor(2, () => wrapper.resolve());

                let called44 = false;
                let called42 = false;

                const unsub = await webClient.subscribeContext(contextName, (data) => {
                    if (data && data.test === 42 && !called42) {
                        called42 = true;
                        ready();
                    }

                    if (data && data.test === 44 && !called44) {
                        called44 = true;
                        ready();
                    }
                });

                unsubFuncs.push(unsub);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                await reconnection;
                await reconnectionWC;
                await reconnectionWC2;

                await webClient2.setContext(contextName, { test: 42 });

                await gtf.simpleWait(1000);

                const reconnectionTwo = waitClientReconnect(platform);
                const reconnectionTwoWC = waitClientReconnect(webClient);
                const reconnectionTwoWC2 = waitClientReconnect(webClient2);

                await gtf.puppet.stopDesktopGateway(gw);

                await reconnectionTwo;
                await reconnectionTwoWC;
                await reconnectionTwoWC2;

                await webClient2.updateContext(contextName, { test: 44 });

                await wrapper.promise;
            });
        });

        describe("preferred GW exists before the web platform", () => {

            const platformConfig = {
                connection: {
                    preferred: {
                        url: gtf.puppet.defaultGWUrl,
                        auth: gtf.puppet.defaultGWAuth
                    }
                }
            };

            it("all() in the platform should contain the same context names as previously available in the preferred GW", async () => {
                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const coreClient = await gtf.puppet.startCoreClient();

                clientsToClear.push(coreClient);

                const contextName = gtf.contexts.getContextName();

                const context = { complexObj: gtf.contexts.generateComplexObject(10) };

                await coreClient.setContext(contextName, context);

                const prePlatformContextNames = await coreClient.getAllContexts();

                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                await platform.waitContext(contextName, context);
                const platformKnownContexts = await platform.getAllContexts();

                expect(prePlatformContextNames.every((ctxName) => platformKnownContexts.some((name) => name === ctxName))).to.be.true;
            });

            it("all() a web client should contain the same context names as previously available in the preferred GW", async () => {
                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const coreClient = await gtf.puppet.startCoreClient();

                clientsToClear.push(coreClient);

                const contextName = gtf.contexts.getContextName();

                const context = { complexObj: gtf.contexts.generateComplexObject(10) };

                await coreClient.setContext(contextName, context);

                const prePlatformContextNames = await coreClient.getAllContexts();

                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                await webClient.waitContext(contextName, context);
                const webKnownContexts = await webClient.getAllContexts();

                expect(prePlatformContextNames.every((ctxName) => webKnownContexts.some((name) => name === ctxName))).to.be.true;
            });

            it("get() in the platform should return the correct pre-existing context", async () => {
                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const coreClient = await gtf.puppet.startCoreClient();

                clientsToClear.push(coreClient);

                const contextName = gtf.contexts.getContextName();

                const context = { complexObj: gtf.contexts.generateComplexObject(10) };

                await coreClient.setContext(contextName, context);

                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                await platform.waitContext(contextName, context);
                const platformContext = await platform.getContext(contextName);

                expect(platformContext).to.eql(context);
            });

            it("get() in a web client should return the correct pre-existing context", async () => {
                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const coreClient = await gtf.puppet.startCoreClient();

                clientsToClear.push(coreClient);

                const contextName = gtf.contexts.getContextName();

                const context = { complexObj: gtf.contexts.generateComplexObject(10) };

                await coreClient.setContext(contextName, context);

                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                await webClient.waitContext(contextName, context);
                const webContext = await webClient.getContext(contextName);

                expect(webContext).to.eql(context);
            });

            it("get() in the platform should return the correct context created by a core client when back on default and the platform was reloaded when on preferred", async () => {
                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const coreClient = await gtf.puppet.startCoreClient();

                clientsToClear.push(coreClient);

                const contextName = gtf.contexts.getContextName();

                const context = { complexObj: gtf.contexts.generateComplexObject(10) };

                await coreClient.setContext(contextName, context);

                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                await platform.reload();

                await platform.waitContextTrack(contextName, context);

                const reconnection = waitClientReconnect(platform);

                await gtf.puppet.stopDesktopGateway(gw);

                await reconnection;

                await platform.waitContext(contextName, context);
                const platformContext = await platform.getContext(contextName);

                expect(platformContext).to.eql(context);


            });

            it("get() in the platform should return the correct context created by a web client when back on default and the platform was reloaded when on preferred", async () => {
                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const contextName = gtf.contexts.getContextName();

                const context = { complexObj: gtf.contexts.generateComplexObject(10) };

                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                await platform.reload();

                const reconnection = waitClientReconnect(platform);
                const reconnectionWC = waitClientReconnect(webClient);

                await gtf.puppet.stopDesktopGateway(gw);

                await reconnection;
                await reconnectionWC;

                await webClient.setContext(contextName, context);

                await platform.waitContext(contextName, context);
                const platformContext = await platform.getContext(contextName);

                expect(platformContext).to.eql(context);
            });

            it("get() in the platform should return the correct context created by a web client (on preferred before reload) when back on default and the platform was reloaded when on preferred", async () => {
                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const contextName = gtf.contexts.getContextName();

                const context = { complexObj: gtf.contexts.generateComplexObject(10) };

                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                await webClient.setContext(contextName, context);

                await platform.reload();

                const reconnection = waitClientReconnect(platform);
                const reconnectionWC = waitClientReconnect(webClient);

                await platform.waitContextTrack(contextName, context);

                await gtf.puppet.stopDesktopGateway(gw);

                await reconnection;
                await reconnectionWC;

                await platform.waitContext(contextName, context);
                const platformContext = await platform.getContext(contextName);

                expect(platformContext).to.eql(context);
            });

            it("get() in the platform should return the correct context created by a web client (on preferred after reload) when back on default and the platform was reloaded when on preferred", async () => {
                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const contextName = gtf.contexts.getContextName();

                const context = { complexObj: 42 };

                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                await platform.reload();

                await webClient.setContext(contextName, context);
                await platform.waitContextTrack(contextName, context);

                const reconnection = waitClientReconnect(platform);
                const reconnectionWC = waitClientReconnect(webClient);

                await gtf.puppet.stopDesktopGateway(gw);

                await reconnection;
                await reconnectionWC;

                await platform.waitContext(contextName, context);
                const platformContext = await platform.getContext(contextName);

                expect(platformContext).to.eql(context);
            });

            it("get() in the platform should return the correct context created by the platform (on preferred) and used by a web client (on preferred) when back on default and the platform was reloaded when on preferred", async () => {
                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const contextName = gtf.contexts.getContextName();

                const context = { complexObj: gtf.contexts.generateComplexObject(10) };

                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                await platform.setContext(contextName, context);
                await platform.waitContextTrack(contextName, context);

                await webClient.getContext(contextName);

                await platform.reload();

                const reconnection = waitClientReconnect(platform);
                const reconnectionWC = waitClientReconnect(webClient);

                await platform.waitContextTrack(contextName, context);

                await gtf.puppet.stopDesktopGateway(gw);

                await reconnection;
                await reconnectionWC;

                await platform.waitContext(contextName, context);
                const platformContext = await platform.getContext(contextName);

                expect(platformContext).to.eql(context);
            });

            it("get() in a web client should return the correct context created by a core client when back on default and the platform was reloaded when on preferred", async () => {
                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const coreClient = await gtf.puppet.startCoreClient();

                clientsToClear.push(coreClient);

                const contextName = gtf.contexts.getContextName();

                const context = { complexObj: gtf.contexts.generateComplexObject(10) };

                await coreClient.setContext(contextName, context);

                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                await platform.reload();

                await platform.waitContextTrack(contextName, context);

                const reconnection = waitClientReconnect(platform);
                const reconnectionWC = waitClientReconnect(webClient);

                await gtf.puppet.stopDesktopGateway(gw);

                await reconnection;
                await reconnectionWC;

                await webClient.waitContext(contextName, context);
                const webContext = await webClient.getContext(contextName);

                expect(webContext).to.eql(context);
            });

            it("get() in a web client should return the correct context created by a web client when back on default and the platform was reloaded when on preferred", async () => {
                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const contextName = gtf.contexts.getContextName();

                const context = { complexObj: gtf.contexts.generateComplexObject(10) };

                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const webClient2 = await platform.openClient();

                clientsToClear.push(webClient2);

                await platform.reload();

                const reconnection = waitClientReconnect(platform);
                const reconnectionWC = waitClientReconnect(webClient);
                const reconnectionWC2 = waitClientReconnect(webClient2);

                await gtf.puppet.stopDesktopGateway(gw);

                await reconnection;
                await reconnectionWC;
                await reconnectionWC2;

                await webClient2.setContext(contextName, context);
                await platform.waitContextTrack(contextName, context);

                await webClient.waitContext(contextName, context);
                const webContext = await webClient.getContext(contextName);

                expect(webContext).to.eql(context);
            });

            it("get() in a web client should return the correct context created by the platform and used by another web client when back on default and the platform was reloaded when on preferred", async () => {
                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const contextName = gtf.contexts.getContextName();

                const context = { complexObj: gtf.contexts.generateComplexObject(10) };

                const platform = await gtf.puppet.startWebPlatform(Object.assign({}, platformConfig));

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const webClient2 = await platform.openClient();

                clientsToClear.push(webClient2);

                await platform.setContext(contextName, context);
                await platform.waitContextTrack(contextName, context);

                await platform.reload();

                const reconnection = waitClientReconnect(platform);
                const reconnectionWC = waitClientReconnect(webClient);
                const reconnectionWC2 = waitClientReconnect(webClient2);

                await platform.waitContextTrack(contextName, context);

                await gtf.puppet.stopDesktopGateway(gw);

                await reconnection;
                await reconnectionWC;
                await reconnectionWC2;

                await webClient.waitContext(contextName, context);
                const platformContext = await webClient.getContext(contextName);

                expect(platformContext).to.eql(context);
            });

            it("subscribe() in the platform should continue to work when back on default", async () => {
                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const contextName = gtf.contexts.getContextName();

                const context = { complexObj: gtf.contexts.generateComplexObject(10) };

                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const wrapper = gtf.wrapPromise();

                const unsub = await platform.subscribeContext(contextName, (data) => {
                    try {
                        expect(data).to.eql(context);
                        wrapper.resolve();
                    } catch (error) {
                        return;
                    }
                });

                unsubFuncs.push(unsub);

                const reconnection = waitClientReconnect(platform);

                await gtf.puppet.stopDesktopGateway(gw);

                await reconnection;

                await platform.setContext(contextName, context);

                await wrapper.promise;
            });

            it("subscribe() in a web client should continue to work when back on default", async () => {
                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const contextName = gtf.contexts.getContextName();

                const context = { complexObj: gtf.contexts.generateComplexObject(10) };

                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const wrapper = gtf.wrapPromise();

                const unsub = await webClient.subscribeContext(contextName, (data) => {
                    try {
                        expect(data).to.eql(context);
                        wrapper.resolve();
                    } catch (error) {
                        return;
                    }
                });

                unsubFuncs.push(unsub);

                const reconnection = waitClientReconnect(platform);
                const reconnectionWC = waitClientReconnect(webClient);

                await gtf.puppet.stopDesktopGateway(gw);

                await reconnection;
                await reconnectionWC;

                await platform.setContext(contextName, context);

                await wrapper.promise;
            });

        });
    });
});
