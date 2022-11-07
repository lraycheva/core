describe("onUnsubscribe", function() {
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

        await supportApp.stop();
    });

    [undefined, null, true, false, "", 42, { test: 42 }, [], [ { test: 42 }]].forEach(invalidArg => {
        it(`Should throw when an invalid argument is passed (${JSON.stringify(invalidArg)})`, (done) => {
            try {
                const listener = currentChannel.onUnsubscribe(invalidArg);
                gtf.fdc3.addActiveListener(listener);
                done("Should have thrown");
            } catch (error) {
                done();
            }
        });
    });

    it("Should not invoke the handler when onUnsubscribe is added and then a context listener is removed by the creator of the private channel", async() => {
        const handlerInvokedPromise = gtf.wrapPromise();
    
        const onUnsubscribeListener = await currentChannel.onUnsubscribe((contextType) => {
            console.log(contextType);
            handlerInvokedPromise.reject("Should not have fired the event");
        });

        gtf.fdc3.addActiveListener(onUnsubscribeListener);

        const listener = await currentChannel.addContextListener("test", () => {});

        listener.unsubscribe();

        gtf.wait(3000, handlerInvokedPromise.resolve);

        await handlerInvokedPromise.promise;
    });

    it("Should not invoke the handler when a context listener is removed and then onUnsubscribe handler is registered by the creator of the private channel", async() => {
        const handlerInvokedPromise = gtf.wrapPromise();
    
        const listener = await currentChannel.addContextListener(null, () => {});

        listener.unsubscribe();

        const onAddContextListener = await currentChannel.onUnsubscribe(() => {
            handlerInvokedPromise.reject("Should not have fired the event");
        });

        gtf.fdc3.addActiveListener(onAddContextListener);

        gtf.wait(3000, handlerInvokedPromise.resolve);

        await handlerInvokedPromise.promise;
    });

    describe("when another app adds a listener on the channel", function() {
        it("Should invoke the handler when listener is removed after subscribing for onUnsubscribe", async() => {
            const handlerInvokedPromise = gtf.wrapPromise();

            const intentName = Date.now().toString();
            const context = gtf.fdc3.getContext();

            const onUnsubscribeListener = await currentChannel.onUnsubscribe((contextType) => {
                if (contextType === context.type) {
                    handlerInvokedPromise.resolve();
                }
            });

            gtf.fdc3.addActiveListener(onUnsubscribeListener);

            const intentListener = await fdc3.addIntentListener(intentName, () => {
                return currentChannel;
            });

            gtf.fdc3.addActiveListener(intentListener);

            await supportApp.fdc3.raiseIntent(intentName, context);

            await supportApp.fdc3.addContextListenerOnPrivateChannel(context.type);

            await supportApp.fdc3.unsubscribeFromPrivateChannelListener();

            await handlerInvokedPromise.promise;
        });

        it("Should invoke the handler 3 times with the correct context types when unsubscribing from 3 context listeners on a private channel", async() => {
            const handlerInvokedPromise1 = gtf.wrapPromise();
            const handlerInvokedPromise2 = gtf.wrapPromise();
            const handlerInvokedPromise3 = gtf.wrapPromise();
    
            const fdc3Context1 = gtf.fdc3.getContext();
            const fdc3Context2 = gtf.fdc3.getContext();
            const fdc3Context3 = gtf.fdc3.getContext();

            const intentName = Date.now().toString();
    
            const listener1 = await currentChannel.addContextListener(fdc3Context1.type, () => {});
            gtf.fdc3.addActiveListener(listener1);
    
            const listener2 = await currentChannel.addContextListener(fdc3Context2.type, () => {});
            gtf.fdc3.addActiveListener(listener2);
    
            const listener3 = await currentChannel.addContextListener(fdc3Context3.type, () => {});
            gtf.fdc3.addActiveListener(listener3);
            
            const onUnsubscribeListener = await currentChannel.onUnsubscribe((contextType) => {
                if (contextType === fdc3Context1.type) {
                    handlerInvokedPromise1.resolve();
                }
    
                if (contextType === fdc3Context2.type) {
                    handlerInvokedPromise2.resolve();
                }
    
                if (contextType === fdc3Context3.type) {
                    handlerInvokedPromise3.resolve();
                }
            });
    
            gtf.fdc3.addActiveListener(onUnsubscribeListener);
    
            const intentListener = await fdc3.addIntentListener(intentName, () => {
                return currentChannel;
            });

            gtf.fdc3.addActiveListener(intentListener);

            await supportApp.fdc3.raiseIntent(intentName, fdc3Context1);

            await supportApp.fdc3.addContextListenerOnPrivateChannel(fdc3Context1.type);
            
            await supportApp.fdc3.unsubscribeFromPrivateChannelListener();

            await supportApp.fdc3.addContextListenerOnPrivateChannel(fdc3Context2.type);

            await supportApp.fdc3.unsubscribeFromPrivateChannelListener();

            await supportApp.fdc3.addContextListenerOnPrivateChannel(fdc3Context3.type);

            await supportApp.fdc3.unsubscribeFromPrivateChannelListener();

            await Promise.all([handlerInvokedPromise1.promise, handlerInvokedPromise2.promise, handlerInvokedPromise3.promise]);
        });

        it("Should not invoke the callback when a listener is added > unsubscribe from context listener > add onUnsubscribe handler", async() => {
            const handlerNotInvokedPromise = gtf.wrapPromise();

            const intentName = Date.now().toString();
            const context = gtf.fdc3.getContext();

            const intentListener = await fdc3.addIntentListener(intentName, () => {
                return currentChannel;
            });

            gtf.fdc3.addActiveListener(intentListener);
            
            await supportApp.fdc3.raiseIntent(intentName, context);

            await supportApp.fdc3.addContextListenerOnPrivateChannel(context.type);

            await supportApp.fdc3.unsubscribeFromPrivateChannelListener();

            const onUnsubscribeListener = await currentChannel.onUnsubscribe((contextType) => {
                handlerNotInvokedPromise.reject("Should not have fired the event");
            });

            gtf.fdc3.addActiveListener(onUnsubscribeListener);

            gtf.wait(3000, handlerNotInvokedPromise.resolve);

            await handlerNotInvokedPromise.promise;
        });
    });
});
