describe("isConnected() ", function () {
    this.timeout(60000);
    before(() => coreReady);

    let clientsToClear = [];
    let unsubFuncs = [];
    let gwsToClose = [];

    const waitClientReconnect = async (client) => {
        const reconnectionWrapper = gtf.wrapPromise();

        const reconUnsub = await client.reconnected(() => {
            reconnectionWrapper.resolve();
            reconUnsub();
        });

        return reconnectionWrapper.promise;
    };

    afterEach(async () => {

        unsubFuncs.forEach((unsub) => unsub());

        unsubFuncs = [];

        await Promise.all(clientsToClear.map((client) => client.close()));

        clientsToClear = [];

        await Promise.all(gwsToClose.map((gw) => gtf.puppet.stopDesktopGateway(gw)));

        gwsToClose = [];
    });

    describe("web platform only", () => {

        it("connection.isConnected should be true when the client is connected to the gateway - web-platform check", async () => {
            const platformClient = await gtf.puppet.startWebPlatform();

            clientsToClear.push(platformClient);

            const isConnected = await platformClient.isConnected();

            expect(isConnected).to.be.true;
        });

        it("connection.isConnected should be true when the client is connected to the gateway - web-client check", async () => {
            const platformClient = await gtf.puppet.startWebPlatform();

            clientsToClear.push(platformClient);

            const web = await platformClient.openClient();

            clientsToClear.push(web);

            const isConnected = await web.isConnected();

            expect(isConnected).to.be.true;
        });

        it("connection.isConnected should be false when the client's gateway disappears", async () => {
            const platform = await gtf.puppet.startWebPlatform();

            const webClient = await platform.openClient();

            clientsToClear.push(webClient);

            await platform.close();

            const isConnected = await webClient.isConnected();

            expect(isConnected).to.be.false;
        });

        it("connection.isConnected should be true when the client's gateway reloads", async () => {
            const platform = await gtf.puppet.startWebPlatform();

            clientsToClear.push(platform);

            const webClient = await platform.openClient();

            clientsToClear.push(webClient);

            const wrapper = gtf.wrapPromise();

            await webClient.reconnected(() => {
                wrapper.resolve();
            });

            await platform.reload();

            await wrapper.promise;

            const isConnected = await webClient.isConnected();

            expect(isConnected).to.be.true;

        });
    });

    describe("desktop gw only", () => {

        it("connection.isConnected should be true when the client is connected to the gateway", async () => {
            const gw = await gtf.puppet.startDesktopGateway();

            gwsToClose.push(gw);

            const coreClient = await gtf.puppet.startCoreClient();

            clientsToClear.push(coreClient);

            const isConnected = await coreClient.isConnected();

            expect(isConnected).to.be.true;
        });

        it("connection.isConnected should be false when the client's gateway disappears", async () => {
            const gw = await gtf.puppet.startDesktopGateway();

            gwsToClose.push(gw);

            const coreClient = await gtf.puppet.startCoreClient();

            clientsToClear.push(coreClient);

            await gtf.puppet.stopDesktopGateway(gw);

            const isConnected = await coreClient.isConnected();

            expect(isConnected).to.be.false;
        });

        it("connection.isConnected should be true when the client's gateway reappears", async () => {
            const gw = await gtf.puppet.startDesktopGateway();

            gwsToClose.push(gw);

            const coreClient = await gtf.puppet.startCoreClient();

            clientsToClear.push(coreClient);

            const wrapper = gtf.wrapPromise();

            await coreClient.reconnected(() => {
                wrapper.resolve();
            });

            await gtf.puppet.stopDesktopGateway(gw);

            const newGw = await gtf.puppet.startDesktopGateway();

            gwsToClose.push(newGw);

            await wrapper.promise;

            const isConnected = await coreClient.isConnected();

            expect(isConnected).to.be.true;

        });
    });

    describe("web platform to desktop gw", () => {
        const platformConfig = {
            connection: {
                preferred: {
                    url: gtf.puppet.defaultGWUrl,
                    auth: gtf.puppet.defaultGWAuth,
                    discoveryIntervalMS: 5000
                }
            }
        };

        describe("web platform exists before the preferred GW", () => {

            it("connection.isConnected should be true within 5 seconds when falling back to default after the preferred disappears - web-platform check + not waiting for confirmed reconnection", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                await gtf.puppet.stopDesktopGateway(gw);

                await gtf.simpleWait(5000);

                const isConnected = await platform.isConnected();

                expect(isConnected).to.be.true;
            });

            it("connection.isConnected should be true within 5 seconds when falling back to default after the preferred disappears - web-client check + not waiting for confirmed reconnection", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                await gtf.puppet.stopDesktopGateway(gw);

                await gtf.simpleWait(5000);

                const isConnected = await webClient.isConnected();

                expect(isConnected).to.be.true;
            });

            it("connection.isConnected should be true when connected to the preferred gateway - web-platform check", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const reconnectionWrapper = gtf.wrapPromise();

                const reconUnsub = await platform.reconnected(() => reconnectionWrapper.resolve());

                unsubFuncs.push(reconUnsub);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                await reconnectionWrapper.promise;

                const isConnected = await platform.isConnected();

                expect(isConnected).to.be.true;

            });

            it("connection.isConnected should be true when connected to the preferred gateway - web-client check", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const reconnectionWrapper = gtf.wrapPromise();

                const reconUnsub = await webClient.reconnected(() => reconnectionWrapper.resolve());

                unsubFuncs.push(reconUnsub);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                await reconnectionWrapper.promise;

                const isConnected = await webClient.isConnected();

                expect(isConnected).to.be.true;
            });

            it("connection.isConnected should be true when falling back to the default - web-platform check", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const reconnectionWrapper = gtf.wrapPromise();
                const secondReconnectionWrapper = gtf.wrapPromise();
                let reconnectedCalled = false;

                const reconUnsub = await platform.reconnected(() => {
                    if (!reconnectedCalled) {
                        reconnectedCalled = true;
                        reconnectionWrapper.resolve();
                        return;
                    }

                    secondReconnectionWrapper.resolve();
                });

                unsubFuncs.push(reconUnsub);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                await reconnectionWrapper.promise;

                await gtf.puppet.stopDesktopGateway(gw);

                await secondReconnectionWrapper.promise;

                const isConnected = await platform.isConnected();

                expect(isConnected).to.be.true;

            });

            it("connection.isConnected should be true when falling back to the default - web-client check", async () => {
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

                const reconnection2 = waitClientReconnect(platform);
                const reconnectionWC2 = waitClientReconnect(webClient);

                await gtf.puppet.stopDesktopGateway(gw);

                await reconnection2;
                await reconnectionWC2;

                const isConnected = await webClient.isConnected();

                expect(isConnected).to.be.true;
            });
        });

        describe("preferred GW exists before the web platform", () => {

            it("connection.isConnected should be true when connected to the preferred gateway - web-platform check", async () => {
                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const isConnected = await platform.isConnected();

                expect(isConnected).to.be.true;

            });

            it("connection.isConnected should be true when connected to the preferred gateway - web-client check", async () => {
                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const isConnected = await webClient.isConnected();

                expect(isConnected).to.be.true;
            });

            it("connection.isConnected should be true when falling back to the default - web-platform check", async () => {
                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const reconnectionWrapper = gtf.wrapPromise();

                const reconUnsub = await platform.reconnected(() => reconnectionWrapper.resolve());

                unsubFuncs.push(reconUnsub);

                await gtf.puppet.stopDesktopGateway(gw);

                await reconnectionWrapper.promise;

                const isConnected = await platform.isConnected();

                expect(isConnected).to.be.true;
            });

            it("connection.isConnected should be true when falling back to the default - web-client check", async () => {
                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const reconnectionWrapper = gtf.wrapPromise();

                const reconUnsub = await webClient.reconnected(() => reconnectionWrapper.resolve());

                unsubFuncs.push(reconUnsub);

                await gtf.puppet.stopDesktopGateway(gw);

                await reconnectionWrapper.promise;

                const isConnected = await webClient.isConnected();

                expect(isConnected).to.be.true;
            });

            it("connection.isConnected should still be true after reloading while on referred - platform check", async () => {
                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                await platform.reload();

                const isConnected = await platform.isConnected();

                expect(isConnected).to.be.true;
            });

            it("connection.isConnected should still be true when reloading while on referred - web client check with platform reload", async () => {
                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                await platform.reload();

                const isConnected = await webClient.isConnected();

                expect(isConnected).to.be.true;
            });

            it("connection.isConnected should still be true when reloading while on referred - web client check with client reload", async () => {
                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                await webClient.reload();

                const isConnected = await webClient.isConnected();

                expect(isConnected).to.be.true;
            });
        });
    });
});