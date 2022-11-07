describe("disconnect()", function() {
    let currentChannel;
    let supportApp;

    const supportAppName = 'coreSupport';

    before(async() => {
        await coreReady;
    });

    beforeEach(async() => {
        currentChannel = await fdc3.createPrivateChannel();

        supportApp = await gtf.createApp({ name: supportAppName, exposeFdc3: true });
    });

    afterEach(async() => {
        currentChannel = undefined;

        gtf.fdc3.removeActiveListeners();

        await gtf.fdc3.removeCreatedChannels();

        await Promise.all(glue.appManager.instances().map(inst => inst.stop()));
    });

    describe("invoked on the current app", function() {
        it("Should throw when a context is broadcasted on the channel after disconnect was invoked", async() => {
            const broadcastNotHeardPromise = gtf.wrapPromise();
            
            await currentChannel.disconnect();

            const context = gtf.fdc3.getContext();

            try {
                await currentChannel.broadcast(context);
                broadcastNotHeardPromise.reject("Should have rejected");
            } catch (error) {
                broadcastNotHeardPromise.resolve();
            }

            await broadcastNotHeardPromise.promise;
        });

        it("Should not broadcast a new context after disconnect was invoked and there's a context on the current channel", async() => {
            const broadcastNotHeardPromise = gtf.wrapPromise();

            const initialContext = gtf.fdc3.getContext();

            await currentChannel.broadcast(initialContext);

            await currentChannel.disconnect();

            const newContext = gtf.fdc3.getContext();

            try {
                await currentChannel.broadcast(newContext);
                broadcastNotHeardPromise.reject("Should have thrown");
            } catch (error) {
                broadcastNotHeardPromise.resolve();
            }

            await broadcastNotHeardPromise.promise;

            const channelContext = await currentChannel.getCurrentContext();

            expect(channelContext).to.eql(initialContext);
        });
    });

    describe("invoked from the other app", function() {
        it("Should trigger onUnsubscribe handlers", async() => {
            const onUnsubscribeHeard = gtf.wrapPromise();

            const intentName = "fdc3.intent.private.channel.disconnect";
            const context = gtf.fdc3.getContext();

            const intentListener = await fdc3.addIntentListener(intentName, () => {
                return currentChannel;
            });

            gtf.fdc3.addActiveListener(intentListener);

            const onUnsubscribeListener = await currentChannel.onUnsubscribe(() => {
                onUnsubscribeHeard.resolve();
            });

            gtf.fdc3.addActiveListener(onUnsubscribeListener);

            await supportApp.fdc3.raiseIntent(intentName, context);

            await supportApp.fdc3.addContextListenerOnPrivateChannel(context.type);

            await supportApp.stop();

            await onUnsubscribeHeard.promise;
        });
    });
});