describe("onDisconnect", function() {
    let currentChannel;
    let supportApp;

    const supportAppName = 'coreSupport';

    before(async() => {
        await coreReady;
    });

    beforeEach(async() => {
        currentChannel = await fdc3.createPrivateChannel();

        supportApp = await gtf.createApp({ exposeFdc3: true, name: supportAppName });
    });

    afterEach(async() => {
        currentChannel = undefined;

        gtf.fdc3.removeActiveListeners();

        await gtf.fdc3.removeCreatedChannels();
        
        await Promise.all(glue.appManager.instances().map(inst => inst.stop()));
    });

    [undefined, null, true, false, "", 42, { test: 42 }, [], [ { test: 42 }]].forEach(invalidArg => {
        it(`Should throw when an invalid argument is passed (${JSON.stringify(invalidArg)})`, (done) => {
            try {
                const listener = currentChannel.onDisconnect(invalidArg);
                gtf.fdc3.addActiveListener(listener);
                done("Should have thrown");
            } catch (error) {
                done();
            }
        });
    });

    describe("when another app disconnects from private channel", function() {
        it("Should invoke the handler when the other client of the channel close the application", async() => {
            const handlerInvokedPromise = gtf.wrapPromise();

            const intentName = Date.now().toString();
            const context = gtf.fdc3.getContext();

            const onDisconnectListener = await currentChannel.onDisconnect(() => {
                handlerInvokedPromise.resolve();
            });

            gtf.fdc3.addActiveListener(onDisconnectListener);

            const intentListener = await fdc3.addIntentListener(intentName, () => {
                return currentChannel;
            });

            gtf.fdc3.addActiveListener(intentListener);

            await supportApp.fdc3.raiseIntent(intentName, context);

            await supportApp.fdc3.addContextListenerOnPrivateChannel(context.type);

            await supportApp.stop();
        
            await handlerInvokedPromise.promise;
        });

        it("Should invoke the handler when the other client of the chanel invoke channel.disconnect()", async() => {
            const handlerInvokedPromise = gtf.wrapPromise();

            const intentName = Date.now().toString();
            const context = gtf.fdc3.getContext();

            const onDisconnectListener = await currentChannel.onDisconnect(() => {
                handlerInvokedPromise.resolve();
            });

            gtf.fdc3.addActiveListener(onDisconnectListener);

            const intentListener = await fdc3.addIntentListener(intentName, () => {
                return currentChannel;
            });

            gtf.fdc3.addActiveListener(intentListener);

            await supportApp.fdc3.raiseIntent(intentName, context);

            await supportApp.fdc3.disconnectFromPrivateChannel();        

            await handlerInvokedPromise.promise;
        });

        it("Should first invoke onUnsubscribe handler, then onDisconnect handler, when the other client of the channel close the application", async() => {
            const onUnsubscribeHandlerInvokedPromise = gtf.wrapPromise();
            const onDisconnectHandlerInvokedPromise = gtf.wrapPromise();

            const intentName = Date.now().toString();
            const context = gtf.fdc3.getContext();

            const onUnsubscribeListener = currentChannel.onUnsubscribe(() => {
                onUnsubscribeHandlerInvokedPromise.resolve();
            });

            gtf.fdc3.addActiveListener(onUnsubscribeListener);

            const onDisconnectListener = currentChannel.onDisconnect(() => {
                onDisconnectHandlerInvokedPromise.resolve();
            });

            gtf.fdc3.addActiveListener(onDisconnectListener);

            const intentListener = await fdc3.addIntentListener(intentName, () => {
                return currentChannel;
            });

            gtf.fdc3.addActiveListener(intentListener);

            await supportApp.fdc3.raiseIntent(intentName, context);

            await supportApp.fdc3.addContextListenerOnPrivateChannel(context.type);

            await supportApp.stop();

            await onUnsubscribeHandlerInvokedPromise.promise;

            await onDisconnectHandlerInvokedPromise.promise;
        });

        it("Should first invoke onUnsubscribe handler with correct contextType, then onDisconnect handler, when the other client of the channel close the application", async() => {
            const onUnsubscribeHandlerInvokedPromise = gtf.wrapPromise();
            const onDisconnectHandlerInvokedPromise = gtf.wrapPromise();

            const intentName = Date.now().toString();
            const context = gtf.fdc3.getContext();

            const onUnsubscribeListener = currentChannel.onUnsubscribe((contextType) => {
                if (contextType === context.type) {
                    onUnsubscribeHandlerInvokedPromise.resolve();
                }
            });

            gtf.fdc3.addActiveListener(onUnsubscribeListener);

            const onDisconnectListener = currentChannel.onDisconnect(() => {
                onDisconnectHandlerInvokedPromise.resolve();
            });

            gtf.fdc3.addActiveListener(onDisconnectListener);

            const intentListener = await fdc3.addIntentListener(intentName, () => {
                return currentChannel;
            });

            gtf.fdc3.addActiveListener(intentListener);

            await supportApp.fdc3.raiseIntent(intentName, context);

            await supportApp.fdc3.addContextListenerOnPrivateChannel(context.type);

            await supportApp.stop();

            await onUnsubscribeHandlerInvokedPromise.promise;

            await onDisconnectHandlerInvokedPromise.promise;
        });

        it("Should first invoke onUnsubscribe handler, then onDisconnect handler, when the other client of the channel invoke channel.disconnect()", async() => {
            const onUnsubscribeHandlerInvokedPromise = gtf.wrapPromise();
            const onDisconnectHandlerInvokedPromise = gtf.wrapPromise();

            const intentName = Date.now().toString();
            const context = gtf.fdc3.getContext();

            const onUnsubscribeListener = currentChannel.onUnsubscribe(() => {
                onUnsubscribeHandlerInvokedPromise.resolve();
            });

            gtf.fdc3.addActiveListener(onUnsubscribeListener);

            const onDisconnectListener = currentChannel.onDisconnect(() => {
                onDisconnectHandlerInvokedPromise.resolve();
            });

            gtf.fdc3.addActiveListener(onDisconnectListener);

            const intentListener = await fdc3.addIntentListener(intentName, () => {
                return currentChannel;
            });

            gtf.fdc3.addActiveListener(intentListener);

            await supportApp.fdc3.raiseIntent(intentName, context);

            await supportApp.fdc3.addContextListenerOnPrivateChannel(context.type);

            await supportApp.fdc3.disconnectFromPrivateChannel();

            await onUnsubscribeHandlerInvokedPromise.promise;

            await onDisconnectHandlerInvokedPromise.promise;
        });

        it("Should first invoke onUnsubscribe handler with correct contextType, then onDisconnect handler, when the other client of the channel invoke channel.disconnect()", async() => {
            const onUnsubscribeHandlerInvokedPromise = gtf.wrapPromise();
            const onDisconnectHandlerInvokedPromise = gtf.wrapPromise();

            const intentName = Date.now().toString();
            const context = gtf.fdc3.getContext();

            const onUnsubscribeListener = currentChannel.onUnsubscribe((contextType) => {
                if (contextType === context.type) {
                    onUnsubscribeHandlerInvokedPromise.resolve();
                }
            });

            gtf.fdc3.addActiveListener(onUnsubscribeListener);

            const onDisconnectListener = currentChannel.onDisconnect(() => {
                onDisconnectHandlerInvokedPromise.resolve();
            });

            gtf.fdc3.addActiveListener(onDisconnectListener);

            const intentListener = await fdc3.addIntentListener(intentName, () => {
                return currentChannel;
            });

            gtf.fdc3.addActiveListener(intentListener);

            await supportApp.fdc3.raiseIntent(intentName, context);

            await supportApp.fdc3.addContextListenerOnPrivateChannel(context.type);

            await supportApp.fdc3.disconnectFromPrivateChannel();

            await onUnsubscribeHandlerInvokedPromise.promise;

            await onDisconnectHandlerInvokedPromise.promise;
        });
    });
});