describe("connected() ", function () {
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

        it("connection.connected should be replayed when the client is already connected to the gateway - web-platform check", (done) => {

            const ready = gtf.waitFor(2, done);

            gtf.puppet.startWebPlatform()
                .then((platform) => {
                    clientsToClear.push(platform);

                    return platform.connected(() => {
                        ready();
                    })
                })
                .then((unsub) => {
                    unsubFuncs.push(unsub);
                    ready();
                })
                .catch(done);

        });

        it("connection.connected should be replayed when the client is already connected to the gateway - web-client check", (done) => {
            const ready = gtf.waitFor(2, done);

            gtf.puppet.startWebPlatform()
                .then((platform) => {
                    clientsToClear.push(platform);

                    return platform.openClient()
                })
                .then((webClient) => {
                    clientsToClear.push(webClient);

                    return webClient.connected(() => {
                        ready();
                    })
                })
                .then((unsub) => {
                    unsubFuncs.push(unsub);
                    ready();
                })
                .catch(done);

        });

        it("connection.connected should be fired twice when the client's gateway reloads", async () => {
            const platform = await gtf.puppet.startWebPlatform();

            clientsToClear.push(platform);

            const web = await platform.openClient();

            clientsToClear.push(web);

            const wrapper = gtf.wrapPromise();

            const ready = gtf.waitFor(2, () => wrapper.resolve());

            const unsubCon = await web.connected(() => {
                ready();
            });

            unsubFuncs.push(unsubCon);

            await platform.reload();

            await wrapper.promise;
        });

        it("connection.connected should all be fired twice and disconnected once when the client's gateway reloads", async () => {
            const platform = await gtf.puppet.startWebPlatform();

            clientsToClear.push(platform);

            const web = await platform.openClient();

            clientsToClear.push(web);

            const wrapper = gtf.wrapPromise();

            const ready = gtf.waitFor(3, () => wrapper.resolve());

            const unsubCon = await web.connected(() => {
                ready();
            });

            unsubFuncs.push(unsubCon);

            const unsubDis = await web.disconnected(() => {
                ready();
            });

            unsubFuncs.push(unsubDis);

            await platform.reload();

            await wrapper.promise;
        });

        it("connection.connected should be fired with the same server name when the client's gateway re-appears", async () => {

            const platform = await gtf.puppet.startWebPlatform();

            clientsToClear.push(platform);

            const web = await platform.openClient();

            clientsToClear.push(web);

            const wrapper = gtf.wrapPromise();

            const ready = gtf.waitFor(2, () => wrapper.resolve());

            let originalServer;

            const unsubCon = await web.connected((server) => {
                if (!originalServer) {
                    originalServer = server;
                    ready();
                    return;
                }

                try {
                    expect(server).to.eql(originalServer);
                    ready();
                } catch (error) {
                    wrapper.reject(error);
                }
            });

            unsubFuncs.push(unsubCon);

            await platform.reload();

            await wrapper.promise;

        });
    });

    describe("desktop gw only", () => {

        it("connection.connected should be replayed when the client is already connected to the gateway", async () => {
            const wrapper = gtf.wrapPromise();

            const gw = await gtf.puppet.startDesktopGateway();

            gwsToClose.push(gw);

            const coreClient = await gtf.puppet.startCoreClient();

            clientsToClear.push(coreClient);

            const unsub = await coreClient.connected(() => {
                wrapper.resolve();
            });

            unsubFuncs.push(unsub);

            await wrapper.promise;
        });

        it("connection.connected should be fired twice when the client's gateway re-appears", async () => {
            const gw = await gtf.puppet.startDesktopGateway();

            gwsToClose.push(gw);

            const coreClient = await gtf.puppet.startCoreClient();

            clientsToClear.push(coreClient);

            const wrapper = gtf.wrapPromise();

            const ready = gtf.waitFor(2, () => wrapper.resolve());

            const unsubCon = await coreClient.connected(() => {
                ready();
            });

            unsubFuncs.push(unsubCon);

            await gtf.puppet.stopDesktopGateway(gw);

            const newGw = await gtf.puppet.startDesktopGateway();

            gwsToClose.push(newGw);

            await wrapper.promise;
        });

        it("connection.connected should all be fired twice and disconnected once when the client's gateway re-appears", async () => {
            const gw = await gtf.puppet.startDesktopGateway()

            gwsToClose.push(gw);

            const coreClient = await gtf.puppet.startCoreClient();

            clientsToClear.push(coreClient);

            const wrapper = gtf.wrapPromise();

            const ready = gtf.waitFor(3, () => wrapper.resolve());

            const unsubCon = await coreClient.connected(() => {
                ready();
            });

            unsubFuncs.push(unsubCon);

            const unsubDis = await coreClient.disconnected(() => {
                ready();
            });

            unsubFuncs.push(unsubDis);

            await gtf.puppet.stopDesktopGateway(gw);

            const newGw = await gtf.puppet.startDesktopGateway();

            gwsToClose.push(newGw);

            await wrapper.promise;
        });

        it("connection.connected should be fired with the same server name when the client's gateway re-appears", async () => {

            const gw = await gtf.puppet.startDesktopGateway();

            gwsToClose.push(gw);

            const coreClient = await gtf.puppet.startCoreClient();

            clientsToClear.push(coreClient);

            const wrapper = gtf.wrapPromise();

            const ready = gtf.waitFor(2, () => wrapper.resolve());

            let originalServer;

            const unsubCon = await coreClient.connected((server) => {
                if (!originalServer) {
                    originalServer = server;
                    ready();
                    return;
                }

                try {
                    expect(server).to.eql(originalServer);
                    ready();
                } catch (error) {
                    wrapper.reject(error);
                }
            });

            unsubFuncs.push(unsubCon);

            await gtf.puppet.stopDesktopGateway(gw);

            const newGw = await gtf.puppet.startDesktopGateway();

            gwsToClose.push(newGw);

            await wrapper.promise;

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

            it("connection.connected should be fired twice when a preferred desktop gateway appears - web-platform check", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const wrapper = gtf.wrapPromise();

                const ready = gtf.waitFor(2, () => wrapper.resolve());

                const unsub = await platform.connected(() => ready());

                unsubFuncs.push(unsub);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                await wrapper.promise;
            });

            it("connection.connected should be fired twice when a preferred desktop gateway appears - web-client check", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const wrapper = gtf.wrapPromise();

                const ready = gtf.waitFor(2, () => wrapper.resolve());

                const unsub = await webClient.connected(() => ready());

                unsubFuncs.push(unsub);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                await wrapper.promise;
            });

            it("connection.connected should be fired three times when falling back to default after the preferred disappears - web-platform check", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const wrapper = gtf.wrapPromise();

                const ready = gtf.waitFor(3, () => wrapper.resolve());

                const unsub = await platform.connected(() => ready());

                unsubFuncs.push(unsub);

                const reconnectionWrapper = gtf.wrapPromise();

                const reconUnsub = await platform.reconnected(() => reconnectionWrapper.resolve());

                unsubFuncs.push(reconUnsub);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                await reconnectionWrapper.promise;

                await gtf.puppet.stopDesktopGateway(gw);

                await wrapper.promise;
            });

            it("connection.connected should be fired within 5 seconds with the default server when falling back to default after the preferred disappears - web-platform check + not waiting for confirmed reconnection", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                await gtf.puppet.stopDesktopGateway(gw);

                await gtf.simpleWait(5000);

                const wrapper = gtf.wrapPromise();

                const unsub = await platform.connected((server) => {
                    if (server === "web-platform") {
                        wrapper.resolve();
                    }
                });

                unsubFuncs.push(unsub);

                await wrapper.promise;
            });

            it("connection.connected should be fired three times when falling back to default after the preferred disappears - web-client check", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const wrapper = gtf.wrapPromise();

                const ready = gtf.waitFor(3, () => wrapper.resolve());

                const unsub = await webClient.connected(() => ready());

                unsubFuncs.push(unsub);

                const reconnection = waitClientReconnect(platform);
                const reconnectionWC = waitClientReconnect(webClient);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                await reconnection;
                await reconnectionWC;

                await gtf.puppet.stopDesktopGateway(gw);

                await wrapper.promise;
            });

            it("connection.connected should be fired within 5 seconds with the default server when falling back to default after the preferred disappears - web-client check + not waiting for confirmed reconnection", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                await gtf.puppet.stopDesktopGateway(gw);

                await gtf.simpleWait(5000);

                const wrapper = gtf.wrapPromise();

                const unsub = await webClient.connected((server) => {
                    if (server === "web-platform") {
                        wrapper.resolve();
                    }
                });

                unsubFuncs.push(unsub);

                await wrapper.promise;
            });

            it("connection.connected should be fired four times when connected for the second time to the preferred - web-platform check", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);
                clientsToClear.push(platform);

                const wrapper = gtf.wrapPromise();

                const ready = gtf.waitFor(4, () => wrapper.resolve());

                const unsub = await platform.connected(() => {
                    ready();
                });

                unsubFuncs.push(unsub);

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

                const secondGw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(secondGw);

                await wrapper.promise;
            });

            it("connection.connected should be fired four times when connected for the second time to the preferred - web-client check", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const wrapper = gtf.wrapPromise();

                const ready = gtf.waitFor(4, () => wrapper.resolve());

                const unsub = await webClient.connected(() => ready());

                unsubFuncs.push(unsub);

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

                const secondGw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(secondGw);

                await wrapper.promise;
            });
        });

        describe("preferred GW exists before the web platform", () => {

            it("connection.connected should be called once with server equal to the desktop gw when a preferred desktop gateway is present before the web-platform starts - web-platform check", async () => {
                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const wrapper = gtf.wrapPromise();

                const unsub = await platform.connected((server) => {
                    try {
                        expect(server).to.include(gtf.puppet.defaultGWUrl);
                        wrapper.resolve();
                    } catch (error) {
                        wrapper.reject(error)
                    }
                });

                unsubFuncs.push(unsub);

                await wrapper.promise;
            });

            it("connection.connected should be called once with server equal to the desktop gw when a preferred desktop gateway is present before the web-platform starts - web-client check", async () => {
                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const wrapper = gtf.wrapPromise();

                const unsub = await webClient.connected((server) => {
                    try {
                        expect(server).to.include(gtf.puppet.defaultGWUrl);
                        wrapper.resolve();
                    } catch (error) {
                        wrapper.reject(error)
                    }
                });

                unsubFuncs.push(unsub);

                await wrapper.promise;
            });

            it("connection.connected should be fired twice when falling back to default after the preferred disappears - web-platform check", async () => {
                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const wrapper = gtf.wrapPromise();

                const ready = gtf.waitFor(2, () => wrapper.resolve());

                const unsub = await platform.connected(() => ready());

                unsubFuncs.push(unsub);

                await gtf.simpleWait(500);

                await gtf.puppet.stopDesktopGateway(gw);

                await wrapper.promise;
            });

            it("connection.connected should be fired twice when falling back to default after the preferred disappears - web-client check", async () => {
                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const wrapper = gtf.wrapPromise();

                const ready = gtf.waitFor(2, () => wrapper.resolve());

                const unsub = await webClient.connected(() => ready());

                unsubFuncs.push(unsub);

                await gtf.simpleWait(500);

                await gtf.puppet.stopDesktopGateway(gw);

                await wrapper.promise;
            });
        });
    });

    // need to find a way to force the GW to reject my connection, after successful discovery
    describe.skip("failed connection to the preferred GW", () => {
        it("the platform should fire connected twice when a preferred GW connection appears, but the connection fails", async () => {

        });

        it("the platform should fire connected twice with server equal to 'platform' when a preferred GW connection appears, but the connection fail", async () => {

        });

        it("the platform should initialize connected to itself when a preferred existed beforehand, but the connection failed", async () => {

        });

        it("the web client should not fire disconnect when the platform's connection to the preferred failed", async () => {

        });

        it("simple interop between a platform and a web client should work after a preferred GW connection failed - the method was registered before the preferred", async () => {

        });

        it("simple interop between a platform and a web client should work after a preferred GW connection failed - the method was registered after the preferred", async () => {

        });

        it("simple interop between two web clients should work after their platform could not connect to the preferred GW - the method was registered before the preferred", async () => {

        });

        it("simple interop between two web clients should work after their platform could not connect to the preferred GW - the method was registered after the preferred", async () => {

        });

    });
});