describe("interop ", function () {
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

    describe("web platform only", () => {

        it("simple interop between two clients connected to the gateway should work", async () => {
            const platform = await gtf.puppet.startWebPlatform();

            clientsToClear.push(platform);

            const webClient = await platform.openClient();

            clientsToClear.push(webClient);

            const methodName = gtf.getName();

            await platform.registerMethod(methodName, () => {
                return { success: true };
            });

            const invResult = await webClient.invokeMethod(methodName);

            expect(invResult.returned).to.eql({ success: true });
        });

        it("simple interop between two clients connected to the gateway should work - non platform client test", async () => {
            const platform = await gtf.puppet.startWebPlatform();

            clientsToClear.push(platform);

            const webClient = await platform.openClient();

            clientsToClear.push(webClient);

            const webClientTwo = await platform.openClient();

            clientsToClear.push(webClientTwo);

            const methodName = gtf.getName();

            await webClient.registerMethod(methodName, () => {
                return { success: true };
            });

            const invResult = await webClientTwo.invokeMethod(methodName);

            expect(invResult.returned).to.eql({ success: true });
        });

        it("interop.register should not work when the client's gateway has disappeared", async () => {
            const platform = await gtf.puppet.startWebPlatform();

            const webClient = await platform.openClient();

            clientsToClear.push(webClient);

            await platform.close();

            try {
                await webClient.registerMethod(gtf.getName(), () => {
                    return { success: true };
                });
                return Promise.reject("The registration should not have resolved");
            } catch (error) {
                return;
            }
        });

        it("simple interop between two clients should not work when their gateway has disappeared", async () => {
            const platform = await gtf.puppet.startWebPlatform();

            const webClient = await platform.openClient();

            clientsToClear.push(webClient);

            const webClientTwo = await platform.openClient();

            clientsToClear.push(webClientTwo);

            const methodName = gtf.getName();

            await webClient.registerMethod(methodName, () => {
                return { success: true };
            });

            await platform.close();

            try {
                await webClientTwo.invokeMethod(methodName);
                return Promise.reject("The invocation should not have resolved");
            } catch (error) {
                return
            }
        });

        it("the interop and contexts libs should both re-announce when the gateway reloads", async () => {
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
        });

        it("interop.register should work when the client's gateway re-appears", async () => {
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

            await webClient.registerMethod(gtf.getName(), () => { });
        });

        it("simple interop between two clients should work when their gateway re-appears - method registered before reload", async () => {
            const platform = await gtf.puppet.startWebPlatform();

            clientsToClear.push(platform);

            const webClient = await platform.openClient();

            clientsToClear.push(webClient);

            const methodName = gtf.getName();

            await webClient.registerMethod(methodName, () => {
                return { success: true };
            });

            const wrapper = gtf.wrapPromise();

            await webClient.reconnected(() => {
                wrapper.resolve();
            });

            await platform.reload();

            await wrapper.promise;

            const invResult = await platform.invokeMethod(methodName);

            expect(invResult.returned).to.eql({ success: true });
        });

        it("simple interop between two clients should work when their gateway re-appears - method registered after reload", async () => {
            const platform = await gtf.puppet.startWebPlatform();

            clientsToClear.push(platform);

            const webClient = await platform.openClient();

            clientsToClear.push(webClient);

            const methodName = gtf.getName();

            const wrapper = gtf.wrapPromise();

            await webClient.reconnected(() => {
                wrapper.resolve();
            });

            await platform.reload();

            await wrapper.promise;

            await webClient.registerMethod(methodName, () => {
                return { success: true };
            });

            const invResult = await platform.invokeMethod(methodName);

            expect(invResult.returned).to.eql({ success: true });
        });

        it("simple interop between two clients (non platform both) should work when their gateway re-appears - method registered after reload", async () => {
            const platform = await gtf.puppet.startWebPlatform();

            clientsToClear.push(platform);

            const webClient = await platform.openClient();

            clientsToClear.push(webClient);

            const webClientTwo = await platform.openClient();

            clientsToClear.push(webClientTwo);

            const methodName = gtf.getName();

            const wrapper = gtf.wrapPromise();

            await webClient.reconnected(() => {
                wrapper.resolve();
            });

            const wrapperTwo = gtf.wrapPromise();

            await webClientTwo.reconnected(() => {
                wrapperTwo.resolve();
            });

            await platform.reload();

            await Promise.all([wrapper.promise, wrapperTwo.promise]);

            await webClient.registerMethod(methodName, () => {
                return { success: true };
            });

            const invResult = await webClientTwo.invokeMethod(methodName);

            expect(invResult.returned).to.eql({ success: true });
        });

        it("simple interop between two clients (non platform both) should work when their gateway re-appears - method registered before reload", async () => {
            const platform = await gtf.puppet.startWebPlatform();

            clientsToClear.push(platform);

            const webClient = await platform.openClient();

            clientsToClear.push(webClient);

            const webClientTwo = await platform.openClient();

            clientsToClear.push(webClientTwo);

            const methodName = gtf.getName();

            const wrapper = gtf.wrapPromise();

            await webClient.reconnected(() => {
                wrapper.resolve();
            });

            const wrapperTwo = gtf.wrapPromise();

            await webClientTwo.reconnected(() => {
                wrapperTwo.resolve();
            });

            await webClient.registerMethod(methodName, () => {
                return { success: true };
            });

            await platform.reload();

            await Promise.all([wrapper.promise, wrapperTwo.promise]);

            const invResult = await webClientTwo.invokeMethod(methodName);

            expect(invResult.returned).to.eql({ success: true });
        });

    });

    describe("desktop gw only", () => {

        it("simple interop between two clients connected to the gateway should work", async () => {
            const gw = await gtf.puppet.startDesktopGateway();

            gwsToClose.push(gw);

            const coreClient = await gtf.puppet.startCoreClient();

            clientsToClear.push(coreClient);

            const coreClientTwo = await gtf.puppet.startCoreClient();

            clientsToClear.push(coreClientTwo);

            const methodName = gtf.getName();

            await coreClient.registerMethod(methodName, () => {
                return { success: true };
            });

            const invResult = await coreClientTwo.invokeMethod(methodName);

            expect(invResult.returned).to.eql({ success: true });
        });

        it("interop.register should not work when the client's gateway has disappeared", async () => {
            const gw = await gtf.puppet.startDesktopGateway();

            gwsToClose.push(gw);

            const coreClient = await gtf.puppet.startCoreClient();

            clientsToClear.push(coreClient);

            await gtf.puppet.stopDesktopGateway(gw);

            try {
                await coreClient.registerMethod(gtf.getName(), () => {
                    return { success: true };
                });
                return Promise.reject("The registration should not have resolved");
            } catch (error) {
                return;
            }
        });

        it("simple interop between two clients should not work when their gateway has disappeared", async () => {
            const gw = await gtf.puppet.startDesktopGateway()

            gwsToClose.push(gw);

            const coreClient = await gtf.puppet.startCoreClient();

            clientsToClear.push(coreClient);

            const coreClientTwo = await gtf.puppet.startCoreClient();

            clientsToClear.push(coreClientTwo);

            const methodName = gtf.getName();

            await coreClient.registerMethod(methodName, () => {
                return { success: true };
            });

            await gtf.puppet.stopDesktopGateway(gw);

            try {
                await coreClientTwo.invokeMethod(methodName);
                return Promise.reject("The invocation should not have resolved");
            } catch (error) {
                return
            }
        });

        it("the interop and contexts libs should both re-announce when the gateway re appears", async () => {
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
        });

        it("interop.register should work when the client's gateway re-appears", async () => {
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

            await coreClient.registerMethod(gtf.getName(), () => { });
        });

        it("simple interop between two clients should work when their gateway re-appears - method registered after re-appear", async () => {
            const gw = await gtf.puppet.startDesktopGateway();

            gwsToClose.push(gw);

            const coreClient = await gtf.puppet.startCoreClient();

            clientsToClear.push(coreClient);

            const coreClientTwo = await gtf.puppet.startCoreClient();

            clientsToClear.push(coreClientTwo);

            const methodName = gtf.getName();

            const wrapper = gtf.wrapPromise();

            await coreClient.reconnected(() => {
                wrapper.resolve();
            });

            const wrapperTwo = gtf.wrapPromise();

            await coreClientTwo.reconnected(() => {
                wrapperTwo.resolve();
            });

            await gtf.puppet.stopDesktopGateway(gw);

            const newGw = await gtf.puppet.startDesktopGateway();

            gwsToClose.push(newGw);

            await Promise.all([wrapper.promise, wrapperTwo.promise]);

            await coreClient.registerMethod(methodName, () => {
                return { success: true };
            });

            const invResult = await coreClientTwo.invokeMethod(methodName);

            expect(invResult.returned).to.eql({ success: true });
        });

        it("simple interop between two clients should work when their gateway re-appears - method registered before re-appear", async () => {
            const gw = await gtf.puppet.startDesktopGateway();

            gwsToClose.push(gw);

            const coreClient = await gtf.puppet.startCoreClient();

            clientsToClear.push(coreClient);

            const coreClientTwo = await gtf.puppet.startCoreClient();

            clientsToClear.push(coreClientTwo);

            const methodName = gtf.getName();

            const wrapper = gtf.wrapPromise();

            await coreClient.registerMethod(methodName, () => {
                return { success: true };
            });

            await coreClient.reconnected(() => {
                wrapper.resolve();
            });

            const wrapperTwo = gtf.wrapPromise();

            await coreClientTwo.reconnected(() => {
                wrapperTwo.resolve();
            });

            await gtf.puppet.stopDesktopGateway(gw);

            const newGw = await gtf.puppet.startDesktopGateway();

            gwsToClose.push(newGw);

            await Promise.all([wrapper.promise, wrapperTwo.promise]);

            const invResult = await coreClientTwo.invokeMethod(methodName);

            expect(invResult.returned).to.eql({ success: true });
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

            it("interop.register should work when the client is connected to the preferred gateway - web-platform check", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const reconnectionWrapper = gtf.wrapPromise();

                const unsub = await platform.reconnected(() => reconnectionWrapper.resolve());

                unsubFuncs.push(unsub);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                await reconnectionWrapper.promise;

                await platform.registerMethod(gtf.getName(), () => { });
            });

            it("interop.register should work when the client is connected to the preferred gateway - web-client check", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const reconnectionWrapper = gtf.wrapPromise();

                const unsub = await webClient.reconnected(() => reconnectionWrapper.resolve());

                unsubFuncs.push(unsub);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                await reconnectionWrapper.promise;

                await webClient.registerMethod(gtf.getName(), () => { });
            });

            it("simple interop between two clients both originating from the same web-platform, but now connected to the preferred gateway should work - post-reconnect interop register", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const reconnectionWrapperWebClient = gtf.wrapPromise();

                const unsubWebClient = await webClient.reconnected(() => reconnectionWrapperWebClient.resolve());

                unsubFuncs.push(unsubWebClient);

                const reconnectionWrapperWebPlatform = gtf.wrapPromise();

                const unsubWebPlatform = await platform.reconnected(() => reconnectionWrapperWebPlatform.resolve());

                unsubFuncs.push(unsubWebPlatform);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                await Promise.all([reconnectionWrapperWebClient, reconnectionWrapperWebPlatform]);

                const methodName = gtf.getName();

                await webClient.registerMethod(methodName, () => {
                    return { success: true };
                });

                const invResult = await platform.invokeMethod(methodName);

                expect(invResult.returned).to.eql({ success: true });
            });

            it("simple interop between two clients both originating from the same web-platform, but now connected to the preferred gateway should work - pre-reconnect interop register", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const reconnectionWrapperWebClient = gtf.wrapPromise();

                const unsubWebClient = await webClient.reconnected(() => reconnectionWrapperWebClient.resolve());

                unsubFuncs.push(unsubWebClient);

                const reconnectionWrapperWebPlatform = gtf.wrapPromise();

                const unsubWebPlatform = await platform.reconnected(() => reconnectionWrapperWebPlatform.resolve());

                unsubFuncs.push(unsubWebPlatform);

                const methodName = gtf.getName();

                await webClient.registerMethod(methodName, () => {
                    return { success: true };
                });

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                await Promise.all([reconnectionWrapperWebClient, reconnectionWrapperWebPlatform]);

                const invResult = await platform.invokeMethod(methodName);

                expect(invResult.returned).to.eql({ success: true });
            });

            it("simple interop between two clients (non-platform) both originating from the same web-platform, but now connected to the preferred gateway should work - post-reconnect interop register", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const webClientTwo = await platform.openClient();

                clientsToClear.push(webClientTwo);

                const reconnectionWrapperWebClient = gtf.wrapPromise();

                const unsubWebClient = await webClient.reconnected(() => reconnectionWrapperWebClient.resolve());

                unsubFuncs.push(unsubWebClient);

                const reconnectionWrapperWebClientTwo = gtf.wrapPromise();

                const unsubWebPlatform = await webClientTwo.reconnected(() => reconnectionWrapperWebClientTwo.resolve());

                unsubFuncs.push(unsubWebPlatform);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                await Promise.all([reconnectionWrapperWebClient, reconnectionWrapperWebClientTwo]);

                const methodName = gtf.getName();

                await webClient.registerMethod(methodName, () => {
                    return { success: true };
                });

                const invResult = await webClientTwo.invokeMethod(methodName);

                expect(invResult.returned).to.eql({ success: true });
            });

            it("simple interop between two clients (non-platform) both originating from the same web-platform, but now connected to the preferred gateway should work - pre-reconnect interop register", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const webClientTwo = await platform.openClient();

                clientsToClear.push(webClientTwo);

                const reconnectionWrapperWebClient = gtf.wrapPromise();

                const unsubWebClient = await webClient.reconnected(() => reconnectionWrapperWebClient.resolve());

                unsubFuncs.push(unsubWebClient);

                const reconnectionWrapperWebClientTwo = gtf.wrapPromise();

                const unsubWebPlatform = await webClientTwo.reconnected(() => reconnectionWrapperWebClientTwo.resolve());

                unsubFuncs.push(unsubWebPlatform);

                const methodName = gtf.getName();

                await webClient.registerMethod(methodName, () => {
                    return { success: true };
                });

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                await Promise.all([reconnectionWrapperWebClient, reconnectionWrapperWebClientTwo]);

                const invResult = await webClientTwo.invokeMethod(methodName);

                expect(invResult.returned).to.eql({ success: true });
            });

            it("simple interop between a web-platform and a core client connected to a desktop gateway should not work", async () => {
                const platform = await gtf.puppet.startWebPlatform();

                clientsToClear.push(platform);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const coreClient = await gtf.puppet.startCoreClient();

                clientsToClear.push(coreClient);

                const methodName = gtf.getName();

                await platform.registerMethod(methodName, () => {
                    return { success: true };
                });

                try {
                    await coreClient.invokeMethod(methodName);
                    return Promise.reject("The invocation should not have resolved");
                } catch (error) {
                    return
                }
            });

            it("simple interop between a web-client connected to a web-platform and a core client connected to a desktop gateway should not work", async () => {
                const platform = await gtf.puppet.startWebPlatform();

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const coreClient = await gtf.puppet.startCoreClient();

                clientsToClear.push(coreClient);

                const methodName = gtf.getName();

                await webClient.registerMethod(methodName, () => {
                    return { success: true };
                });

                try {
                    await coreClient.invokeMethod(methodName);
                    return Promise.reject("The invocation should not have resolved");
                } catch (error) {
                    return
                }
            });

            it("simple interop between a web-platform and a core client, when the web-platform has connected to the preferred gw should work - pre-reconnect register", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const reconnectionWrapper = gtf.wrapPromise();

                const unsubWebClient = await platform.reconnected(() => reconnectionWrapper.resolve());

                unsubFuncs.push(unsubWebClient);

                const methodName = gtf.getName();

                await platform.registerMethod(methodName, () => {
                    return { success: true };
                });

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const coreClient = await gtf.puppet.startCoreClient();

                clientsToClear.push(coreClient);

                await reconnectionWrapper.promise;

                const invResult = await coreClient.invokeMethod(methodName);

                expect(invResult.returned).to.eql({ success: true });
            });

            it("simple interop between a web-platform and a core client, when the web-platform has connected to the preferred gw should work - post-reconnect register", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const reconnectionWrapper = gtf.wrapPromise();

                const unsubWebClient = await platform.reconnected(() => reconnectionWrapper.resolve());

                unsubFuncs.push(unsubWebClient);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const coreClient = await gtf.puppet.startCoreClient();

                clientsToClear.push(coreClient);

                await reconnectionWrapper.promise;

                const methodName = gtf.getName();

                await platform.registerMethod(methodName, () => {
                    return { success: true };
                });

                const invResult = await coreClient.invokeMethod(methodName);

                expect(invResult.returned).to.eql({ success: true });
            });

            it("simple interop between a web-client and a core client, when the web-client has connected to the preferred gw should work - pre-reconnect register ", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const reconnectionWrapper = gtf.wrapPromise();

                const unsubWebClient = await webClient.reconnected(() => reconnectionWrapper.resolve());

                unsubFuncs.push(unsubWebClient);

                const methodName = gtf.getName();

                await webClient.registerMethod(methodName, () => {
                    return { success: true };
                });

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const coreClient = await gtf.puppet.startCoreClient();

                clientsToClear.push(coreClient);

                await reconnectionWrapper.promise;

                const invResult = await coreClient.invokeMethod(methodName);

                expect(invResult.returned).to.eql({ success: true });
            });

            it("simple interop between a web-client and a core client, when the web-client has connected to the preferred gw should work - post-reconnect register ", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const reconnectionWrapper = gtf.wrapPromise();

                const unsubWebClient = await webClient.reconnected(() => reconnectionWrapper.resolve());

                unsubFuncs.push(unsubWebClient);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const coreClient = await gtf.puppet.startCoreClient();

                clientsToClear.push(coreClient);

                await reconnectionWrapper.promise;

                const methodName = gtf.getName();

                await webClient.registerMethod(methodName, () => {
                    return { success: true };
                });

                const invResult = await coreClient.invokeMethod(methodName);

                expect(invResult.returned).to.eql({ success: true });
            });

            it("simple interop between a web-platform and a web-client should work when the preferred gw disappears after being connected to it - initial register", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

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

                const reconnectionWrapperClient = gtf.wrapPromise();
                const secondReconnectionWrapperClient = gtf.wrapPromise();
                let reconnectedCalledClient = false;

                const reconUnsubClient = await webClient.reconnected(() => {
                    if (!reconnectedCalledClient) {
                        reconnectedCalledClient = true;
                        reconnectionWrapperClient.resolve();
                        return;
                    }

                    secondReconnectionWrapperClient.resolve();
                });

                unsubFuncs.push(reconUnsubClient);

                const methodName = gtf.getName();

                await platform.registerMethod(methodName, () => {
                    return { success: true };
                });

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                await Promise.all([reconnectionWrapper.promise, reconnectionWrapperClient.promise]);

                await gtf.puppet.stopDesktopGateway(gw);

                await Promise.all([secondReconnectionWrapper.promise, secondReconnectionWrapperClient.promise]);

                const invResult = await webClient.invokeMethod(methodName);

                expect(invResult.returned).to.eql({ success: true });
            });

            it("simple interop between a web-platform and a web-client should work when the preferred gw disappears after being connected to it - register while on preferred", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

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

                const reconnectionWrapperClient = gtf.wrapPromise();
                const secondReconnectionWrapperClient = gtf.wrapPromise();
                let reconnectedCalledClient = false;

                const reconUnsubClient = await webClient.reconnected(() => {
                    if (!reconnectedCalledClient) {
                        reconnectedCalledClient = true;
                        reconnectionWrapperClient.resolve();
                        return;
                    }

                    secondReconnectionWrapperClient.resolve();
                });

                unsubFuncs.push(reconUnsubClient);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                await Promise.all([reconnectionWrapper.promise, reconnectionWrapperClient.promise]);

                const methodName = gtf.getName();

                await platform.registerMethod(methodName, () => {
                    return { success: true };
                });

                await gtf.puppet.stopDesktopGateway(gw);

                await Promise.all([secondReconnectionWrapper.promise, secondReconnectionWrapperClient.promise]);

                const invResult = await webClient.invokeMethod(methodName);

                expect(invResult.returned).to.eql({ success: true });
            });

            it("simple interop between a web-platform and a web-client should work when the preferred gw disappears after being connected to it - register when back on default", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

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

                const reconnectionWrapperClient = gtf.wrapPromise();
                const secondReconnectionWrapperClient = gtf.wrapPromise();
                let reconnectedCalledClient = false;

                const reconUnsubClient = await webClient.reconnected(() => {
                    if (!reconnectedCalledClient) {
                        reconnectedCalledClient = true;
                        reconnectionWrapperClient.resolve();
                        return;
                    }

                    secondReconnectionWrapperClient.resolve();
                });

                unsubFuncs.push(reconUnsubClient);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                await Promise.all([reconnectionWrapper.promise, reconnectionWrapperClient.promise]);

                await gtf.puppet.stopDesktopGateway(gw);

                await Promise.all([secondReconnectionWrapper.promise, secondReconnectionWrapperClient.promise]);

                const methodName = gtf.getName();

                await platform.registerMethod(methodName, () => {
                    return { success: true };
                });

                const invResult = await webClient.invokeMethod(methodName);

                expect(invResult.returned).to.eql({ success: true });
            });
        });

        describe("preferred GW exists before the web platform", () => {

            it("interop.register should work when the client is connected to the preferred gateway - web-platform check", async () => {
                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                await platform.registerMethod(gtf.getName(), () => { });
            });

            it("interop.register should work when the client is connected to the preferred gateway - web-client check", async () => {
                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                await webClient.registerMethod(gtf.getName(), () => { });
            });

            it("simple interop between two clients both originating from the same web-platform, but connected to the preferred gateway should work", async () => {
                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const methodName = gtf.getName();

                await webClient.registerMethod(methodName, () => {
                    return { success: true };
                });

                const invResult = await platform.invokeMethod(methodName);

                expect(invResult.returned).to.eql({ success: true });
            });

            it("simple interop between two clients (non-platform) both originating from the same web-platform, but now connected to the preferred gateway should work", async () => {
                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const webClientTwo = await platform.openClient();

                clientsToClear.push(webClientTwo);

                const methodName = gtf.getName();

                await webClient.registerMethod(methodName, () => {
                    return { success: true };
                });

                const invResult = await webClientTwo.invokeMethod(methodName);

                expect(invResult.returned).to.eql({ success: true });
            });

            it("simple interop between a web-platform and a core client, when the web-platform has connected to the preferred gw should work", async () => {
                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const coreClient = await gtf.puppet.startCoreClient();

                clientsToClear.push(coreClient);

                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const methodName = gtf.getName();

                await platform.registerMethod(methodName, () => {
                    return { success: true };
                });

                const invResult = await coreClient.invokeMethod(methodName);

                expect(invResult.returned).to.eql({ success: true });
            });

            it("simple interop between a web-client and a core client, when the web-client has connected to the preferred gw should work", async () => {
                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const coreClient = await gtf.puppet.startCoreClient();

                clientsToClear.push(coreClient);

                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const methodName = gtf.getName();

                await webClient.registerMethod(methodName, () => {
                    return { success: true };
                });

                const invResult = await coreClient.invokeMethod(methodName);

                expect(invResult.returned).to.eql({ success: true });
            });

            it("simple interop between a web-platform and a web-client should work when the preferred gw disappears after being connected to it - register while on preferred", async () => {
                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const reconnectionWrapper = gtf.wrapPromise();

                const reconUnsub = await platform.reconnected(() => reconnectionWrapper.resolve());

                unsubFuncs.push(reconUnsub);

                const reconnectionWrapperClient = gtf.wrapPromise();

                const reconUnsubClient = await webClient.reconnected(() => reconnectionWrapperClient.resolve());

                unsubFuncs.push(reconUnsubClient);

                const methodName = gtf.getName();

                await platform.registerMethod(methodName, () => {
                    return { success: true };
                });

                await gtf.puppet.stopDesktopGateway(gw);

                await Promise.all([reconnectionWrapper.promise, reconnectionWrapperClient.promise]);

                const invResult = await webClient.invokeMethod(methodName);

                expect(invResult.returned).to.eql({ success: true });
            });

            it("simple interop between a web-platform and a web-client should work when the preferred gw disappears after being connected to it - register when back on default", async () => {
                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const reconnectionWrapper = gtf.wrapPromise();

                const reconUnsub = await platform.reconnected(() => reconnectionWrapper.resolve());

                unsubFuncs.push(reconUnsub);

                const reconnectionWrapperClient = gtf.wrapPromise();

                const reconUnsubClient = await webClient.reconnected(() => reconnectionWrapperClient.resolve());

                unsubFuncs.push(reconUnsubClient);

                await gtf.puppet.stopDesktopGateway(gw);

                await Promise.all([reconnectionWrapper.promise, reconnectionWrapperClient.promise]);

                const methodName = gtf.getName();

                await platform.registerMethod(methodName, () => {
                    return { success: true };
                });

                const invResult = await webClient.invokeMethod(methodName);

                expect(invResult.returned).to.eql({ success: true });
            });

            it("simple interop between a platform and a web client should work after the platform was reloaded while on preferred - the platform registers the method", async () => {
                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                await platform.reload();

                const methodName = gtf.getName();

                await platform.registerMethod(methodName, () => {
                    return { success: true };
                });

                const invResult = await webClient.invokeMethod(methodName);

                expect(invResult.returned).to.eql({ success: true });
            });

            it("simple interop between a platform and a web client should work after the platform was reloaded while on preferred - the client registers the method before reload", async () => {
                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const methodName = gtf.getName();

                await webClient.registerMethod(methodName, () => {
                    return { success: true };
                });

                await platform.reload();

                const invResult = await platform.invokeMethod(methodName);

                expect(invResult.returned).to.eql({ success: true });
            });

            it("simple interop between a platform and a web client should work after the platform was reloaded while on preferred - the client registers the method after reload", async () => {
                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const methodName = gtf.getName();

                await platform.reload();

                await webClient.registerMethod(methodName, () => {
                    return { success: true };
                });

                const invResult = await platform.invokeMethod(methodName);

                expect(invResult.returned).to.eql({ success: true });
            });

            it("simple interop between a platform and a core client should work after the platform was reloaded while on preferred - the platform registers the method", async () => {
                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const coreClient = await gtf.puppet.startCoreClient();

                clientsToClear.push(coreClient);

                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                await platform.reload();

                const methodName = gtf.getName();

                await platform.registerMethod(methodName, () => {
                    return { success: true };
                });

                const invResult = await coreClient.invokeMethod(methodName);

                expect(invResult.returned).to.eql({ success: true });
            });

            it("simple interop between a platform and a core client should work after the platform was reloaded while on preferred - the core client registers the method before reload", async () => {
                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const coreClient = await gtf.puppet.startCoreClient();

                clientsToClear.push(coreClient);

                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const methodName = gtf.getName();

                await coreClient.registerMethod(methodName, () => {
                    return { success: true };
                });

                await platform.reload();

                const invResult = await platform.invokeMethod(methodName);

                expect(invResult.returned).to.eql({ success: true });
            });

            it("simple interop between a platform and a core client should work after the platform was reloaded while on preferred - the core client registers the method after reload", async () => {
                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const coreClient = await gtf.puppet.startCoreClient();

                clientsToClear.push(coreClient);

                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const methodName = gtf.getName();

                await platform.reload();

                await coreClient.registerMethod(methodName, () => {
                    return { success: true };
                });

                const invResult = await platform.invokeMethod(methodName);

                expect(invResult.returned).to.eql({ success: true });
            });

            it("simple interop between a web client and a core client should work after the platform was reloaded while on preferred - the web client registers the method before reload", async () => {
                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const coreClient = await gtf.puppet.startCoreClient();

                clientsToClear.push(coreClient);

                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const methodName = gtf.getName();

                await webClient.registerMethod(methodName, () => {
                    return { success: true };
                });

                await platform.reload();

                const invResult = await coreClient.invokeMethod(methodName);

                expect(invResult.returned).to.eql({ success: true });
            });

            it("simple interop between a web client and a core client should work after the platform was reloaded while on preferred - the web client registers the method after reload", async () => {
                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const coreClient = await gtf.puppet.startCoreClient();

                clientsToClear.push(coreClient);

                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                await platform.reload();

                const methodName = gtf.getName();

                await webClient.registerMethod(methodName, () => {
                    return { success: true };
                });

                const invResult = await coreClient.invokeMethod(methodName);

                expect(invResult.returned).to.eql({ success: true });
            });

            it("simple interop between a web client and a core client should work after the platform was reloaded while on preferred - the core client registers the method before reload", async () => {
                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const coreClient = await gtf.puppet.startCoreClient();

                clientsToClear.push(coreClient);

                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const methodName = gtf.getName();

                await coreClient.registerMethod(methodName, () => {
                    return { success: true };
                });

                await platform.reload();

                const invResult = await webClient.invokeMethod(methodName);

                expect(invResult.returned).to.eql({ success: true });
            });

            it("simple interop between a web client and a core client should work after the platform was reloaded while on preferred - the core client registers the method after reload", async () => {
                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const coreClient = await gtf.puppet.startCoreClient();

                clientsToClear.push(coreClient);

                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                await platform.reload();

                const methodName = gtf.getName();

                await coreClient.registerMethod(methodName, () => {
                    return { success: true };
                });

                const invResult = await webClient.invokeMethod(methodName);

                expect(invResult.returned).to.eql({ success: true });
            });

            it("simple interop between two web clients should work after the platform was reloaded while on preferred - method is registered before reload", async () => {
                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const webClientTwo = await platform.openClient();

                clientsToClear.push(webClientTwo);

                const methodName = gtf.getName();

                await webClientTwo.registerMethod(methodName, () => {
                    return { success: true };
                });

                await platform.reload();

                const invResult = await webClient.invokeMethod(methodName);

                expect(invResult.returned).to.eql({ success: true });
            });

            it("simple interop between two web clients should work after the platform was reloaded while on preferred - method is registered after reload", async () => {
                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const webClientTwo = await platform.openClient();

                clientsToClear.push(webClientTwo);

                await platform.reload();

                const methodName = gtf.getName();

                await webClientTwo.registerMethod(methodName, () => {
                    return { success: true };
                });

                const invResult = await webClient.invokeMethod(methodName);

                expect(invResult.returned).to.eql({ success: true });
            });

            it("simple interop between a platform and a web client should work when back on default, after the platform was reloaded on preferred - platform registers the method", async () => {
                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                await platform.reload();

                const reconnectionWrapper = gtf.wrapPromise();

                const reconUnsub = await platform.reconnected(() => reconnectionWrapper.resolve());

                unsubFuncs.push(reconUnsub);

                const reconnectionWrapperClient = gtf.wrapPromise();

                const reconUnsubClient = await webClient.reconnected(() => reconnectionWrapperClient.resolve());

                unsubFuncs.push(reconUnsubClient);

                await gtf.puppet.stopDesktopGateway(gw);

                await Promise.all([reconnectionWrapper.promise, reconnectionWrapperClient.promise]);

                const methodName = gtf.getName();

                await platform.registerMethod(methodName, () => {
                    return { success: true };
                });

                const invResult = await webClient.invokeMethod(methodName);

                expect(invResult.returned).to.eql({ success: true });
            });

            it("simple interop between a platform and a web client should work when back on default, after the platform was reloaded on preferred - the client registers the method before reload", async () => {
                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const methodName = gtf.getName();

                await webClient.registerMethod(methodName, () => {
                    return { success: true };
                });

                await platform.reload();

                const reconnectionWrapper = gtf.wrapPromise();

                const reconUnsub = await platform.reconnected(() => reconnectionWrapper.resolve());

                unsubFuncs.push(reconUnsub);

                const reconnectionWrapperClient = gtf.wrapPromise();

                const reconUnsubClient = await webClient.reconnected(() => reconnectionWrapperClient.resolve());

                unsubFuncs.push(reconUnsubClient);

                await gtf.puppet.stopDesktopGateway(gw);

                await Promise.all([reconnectionWrapper.promise, reconnectionWrapperClient.promise]);

                const invResult = await platform.invokeMethod(methodName);

                expect(invResult.returned).to.eql({ success: true });
            });

            it("simple interop between a platform and a web client should work when back on default, after the platform was reloaded on preferred - the client registers the method after reload", async () => {
                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                await platform.reload();

                const methodName = gtf.getName();

                await webClient.registerMethod(methodName, () => {
                    return { success: true };
                });

                const reconnectionWrapper = gtf.wrapPromise();

                const reconUnsub = await platform.reconnected(() => reconnectionWrapper.resolve());

                unsubFuncs.push(reconUnsub);

                const reconnectionWrapperClient = gtf.wrapPromise();

                const reconUnsubClient = await webClient.reconnected(() => reconnectionWrapperClient.resolve());

                unsubFuncs.push(reconUnsubClient);

                await gtf.puppet.stopDesktopGateway(gw);

                await Promise.all([reconnectionWrapper.promise, reconnectionWrapperClient.promise]);

                const invResult = await platform.invokeMethod(methodName);

                expect(invResult.returned).to.eql({ success: true });
            });

            it("simple interop between a platform and a web client should work when back on default, after the platform was reloaded on preferred - the client registers the method after reload, when back on default", async () => {
                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                await platform.reload();

                const reconnectionWrapper = gtf.wrapPromise();

                const reconUnsub = await platform.reconnected(() => reconnectionWrapper.resolve());

                unsubFuncs.push(reconUnsub);

                const reconnectionWrapperClient = gtf.wrapPromise();

                const reconUnsubClient = await webClient.reconnected(() => reconnectionWrapperClient.resolve());

                unsubFuncs.push(reconUnsubClient);

                await gtf.puppet.stopDesktopGateway(gw);

                await Promise.all([reconnectionWrapper.promise, reconnectionWrapperClient.promise]);

                const methodName = gtf.getName();

                await webClient.registerMethod(methodName, () => {
                    return { success: true };
                });

                const invResult = await platform.invokeMethod(methodName);

                expect(invResult.returned).to.eql({ success: true });
            });

            it("simple interop between two web clients should work when back on default, after their platform was reloaded on preferred - the method was registered before reload", async () => {
                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const webClientTwo = await platform.openClient();

                clientsToClear.push(webClientTwo);

                const methodName = gtf.getName();

                await webClient.registerMethod(methodName, () => {
                    return { success: true };
                });

                await platform.reload();

                const reconnectionWrapper = gtf.wrapPromise();

                const reconUnsub = await platform.reconnected(() => reconnectionWrapper.resolve());

                unsubFuncs.push(reconUnsub);

                const reconnectionWrapperClient = gtf.wrapPromise();

                const reconUnsubClient = await webClient.reconnected(() => reconnectionWrapperClient.resolve());

                unsubFuncs.push(reconUnsubClient);

                const reconnectionWrapperClientTwo = gtf.wrapPromise();

                const reconUnsubClientTwo = await webClient.reconnected(() => reconnectionWrapperClientTwo.resolve());

                unsubFuncs.push(reconUnsubClientTwo);

                await gtf.puppet.stopDesktopGateway(gw);

                await Promise.all([reconnectionWrapper.promise, reconnectionWrapperClient.promise, reconnectionWrapperClientTwo.promise]);

                const invResult = await webClientTwo.invokeMethod(methodName);

                expect(invResult.returned).to.eql({ success: true });
            });

            it("simple interop between two web clients should work when back on default, after their platform was reloaded on preferred - the method was registered after reload", async () => {
                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const webClientTwo = await platform.openClient();

                clientsToClear.push(webClientTwo);

                await platform.reload();

                const methodName = gtf.getName();

                await webClient.registerMethod(methodName, () => {
                    return { success: true };
                });

                const reconnectionWrapper = gtf.wrapPromise();

                const reconUnsub = await platform.reconnected(() => reconnectionWrapper.resolve());

                unsubFuncs.push(reconUnsub);

                const reconnectionWrapperClient = gtf.wrapPromise();

                const reconUnsubClient = await webClient.reconnected(() => reconnectionWrapperClient.resolve());

                unsubFuncs.push(reconUnsubClient);

                const reconnectionWrapperClientTwo = gtf.wrapPromise();

                const reconUnsubClientTwo = await webClient.reconnected(() => reconnectionWrapperClientTwo.resolve());

                unsubFuncs.push(reconUnsubClientTwo);

                await gtf.puppet.stopDesktopGateway(gw);

                await Promise.all([reconnectionWrapper.promise, reconnectionWrapperClient.promise, reconnectionWrapperClientTwo.promise]);

                const invResult = await webClientTwo.invokeMethod(methodName);

                expect(invResult.returned).to.eql({ success: true });
            });

            it("simple interop between two web clients should work when back on default, after their platform was reloaded on preferred - the method was registered after reload, when back on default", async () => {
                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const webClientTwo = await platform.openClient();

                clientsToClear.push(webClientTwo);

                await platform.reload();

                const reconnectionWrapper = gtf.wrapPromise();

                const reconUnsub = await platform.reconnected(() => reconnectionWrapper.resolve());

                unsubFuncs.push(reconUnsub);

                const reconnectionWrapperClient = gtf.wrapPromise();

                const reconUnsubClient = await webClient.reconnected(() => reconnectionWrapperClient.resolve());

                unsubFuncs.push(reconUnsubClient);

                const reconnectionWrapperClientTwo = gtf.wrapPromise();

                const reconUnsubClientTwo = await webClient.reconnected(() => reconnectionWrapperClientTwo.resolve());

                unsubFuncs.push(reconUnsubClientTwo);

                await gtf.puppet.stopDesktopGateway(gw);

                await Promise.all([reconnectionWrapper.promise, reconnectionWrapperClient.promise, reconnectionWrapperClientTwo.promise]);

                const methodName = gtf.getName();

                await webClient.registerMethod(methodName, () => {
                    return { success: true };
                });

                const invResult = await webClientTwo.invokeMethod(methodName);

                expect(invResult.returned).to.eql({ success: true });
            });
        });
    });
});