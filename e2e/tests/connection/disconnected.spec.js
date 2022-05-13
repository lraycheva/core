describe("disconnected() ", function () {
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

        it("connection.disconnected should be fired when the client's gateway disappears", (done) => {
            const ready = gtf.waitFor(2, done);

            let platformClient;

            gtf.puppet.startWebPlatform()
                .then((platform) => {
                    platformClient = platform;
                    return platform.openClient()
                })
                .then((webClient) => {
                    clientsToClear.push(webClient);
                    return webClient.disconnected(() => {
                        ready();
                    })
                })
                .then((unsub) => {
                    unsubFuncs.push(unsub);
                    return platformClient.close();
                })
                .then(() => {
                    ready();
                })
                .catch(done);
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
    });

    describe("desktop gw only", () => {

        it("connection.disconnected should be fired when the client's gateway disappears", async () => {
            const wrapper = gtf.wrapPromise();

            const gw = await gtf.puppet.startDesktopGateway();

            gwsToClose.push(gw);

            const coreClient = await gtf.puppet.startCoreClient();

            clientsToClear.push(coreClient);

            const unsub = await coreClient.disconnected(() => wrapper.resolve());

            unsubFuncs.push(unsub);

            await gtf.puppet.stopDesktopGateway(gw);

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
    });

    describe("web platform to desktop gw", () => {
        const platformConfig = {
            connection: {
                preferred: {
                    url: gtf.puppet.defaultGWUrl,
                    auth: gtf.puppet.defaultGWAuth,
                    discoveryIntervalMS: 1000
                }
            }
        };

        describe("web platform exists before the preferred GW", () => {
            it("connection.disconnected should be fired when a preferred desktop gateway appears - web-platform check", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const wrapper = gtf.wrapPromise();

                const unsub = await platform.disconnected(() => wrapper.resolve());

                unsubFuncs.push(unsub);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                await wrapper.promise;

            });

            it("connection.disconnected should be fired when a preferred desktop gateway appears - web-client check", async () => {
                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const wrapper = gtf.wrapPromise();

                const unsub = await webClient.disconnected(() => wrapper.resolve());

                unsubFuncs.push(unsub);

                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                await wrapper.promise;
            });
        });

        describe("preferred GW exists before the web platform", () => {

            it("connection.disconnected should be not fired when a preferred desktop gateway is present before the web-platform starts - web-platform check", async () => {
                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const wrapper = gtf.wrapPromise();

                const unsub = await platform.disconnected(() => wrapper.reject("Should have been called"));

                unsubFuncs.push(unsub);

                gtf.wait(5000, () => wrapper.resolve());

                await wrapper.promise;

            });

            it("connection.disconnected should be not fired when a preferred desktop gateway is present before the web-platform starts - web-client check", async () => {
                const gw = await gtf.puppet.startDesktopGateway();

                gwsToClose.push(gw);

                const platform = await gtf.puppet.startWebPlatform(platformConfig);

                clientsToClear.push(platform);

                const webClient = await platform.openClient();

                clientsToClear.push(webClient);

                const wrapper = gtf.wrapPromise();

                const unsub = await webClient.disconnected(() => wrapper.reject("Should have been called"));

                unsubFuncs.push(unsub);

                gtf.wait(5000, () => wrapper.resolve());

                await wrapper.promise;
            });
        });

    });
});