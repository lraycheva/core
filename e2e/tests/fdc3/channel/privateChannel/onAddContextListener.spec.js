describe("onAddContextListener()", function() {
    const supportAppName = "coreSupport";
    let supportApp;
    
    let currentChannel;

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
                const listener = currentChannel.onAddContextListener(invalidArg);
                gtf.fdc3.addActiveListener(listener);
                done("Should have thrown");
            } catch (error) {
                done();
            }
        });
    });

    it("Should not invoke the handler when onAddContextListener is added and then a context listener by the creator of the private channel", async() => {
        const handlerInvokedPromise = gtf.wrapPromise();
    
        const onAddContextListener = await currentChannel.onAddContextListener(() => {
            handlerInvokedPromise.reject("Should not have fired the event");
        });

        gtf.fdc3.addActiveListener(onAddContextListener);

        const listener = await currentChannel.addContextListener(null, () => {});

        gtf.fdc3.addActiveListener(listener);

        gtf.wait(3000, handlerInvokedPromise.resolve);

        await handlerInvokedPromise.promise;
    });

    it("Should not invoke the handler when a context listener is added and then onAddContextListener handler is registered by the creator of the private channel", async() => {
        const handlerInvokedPromise = gtf.wrapPromise();
    
        const listener = await currentChannel.addContextListener(null, () => {});

        gtf.fdc3.addActiveListener(listener);

        const onAddContextListener = await currentChannel.onAddContextListener(() => {
            handlerInvokedPromise.reject("Should not have fired the event");
        });

        gtf.fdc3.addActiveListener(onAddContextListener);

        gtf.wait(3000, handlerInvokedPromise.resolve);

        await handlerInvokedPromise.promise;
    });

    describe("when another app adds a listener on the channel", function() {
        it("Should invoke the handler when listener is added after subscribing for onAddContextListener", async() => {
            const handlerInvokedPromise = gtf.wrapPromise();

            const intentName = Date.now().toString();
            const context = gtf.fdc3.getContext();

            const onAddContextListener = await currentChannel.onAddContextListener((contextType) => {
                if (contextType === context.type) {
                    handlerInvokedPromise.resolve();
                }
            });

            gtf.fdc3.addActiveListener(onAddContextListener);

            const intentListener = await fdc3.addIntentListener(intentName, () => {
                return currentChannel;
            });

            gtf.fdc3.addActiveListener(intentListener);

            await supportApp.fdc3.raiseIntent(intentName, context);

            await supportApp.fdc3.addContextListenerOnPrivateChannel(context.type);

            await handlerInvokedPromise.promise;
        });

        it("Should invoke the handler 3 times with the correct context types when there are 3 active context listeners on a private channel", async() => {
            const handlerInvokedPromise1 = gtf.wrapPromise();
            const handlerInvokedPromise2 = gtf.wrapPromise();
            const handlerInvokedPromise3 = gtf.wrapPromise();
    
            const fdc3Context1 = gtf.fdc3.getContext();
            const fdc3Context2 = gtf.fdc3.getContext();
            const fdc3Context3 = gtf.fdc3.getContext();

            const intentName = Date.now().toString();
    
            const onAddContextListener = await currentChannel.onAddContextListener((contextType) => {
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
    
            gtf.fdc3.addActiveListener(onAddContextListener);
    
            const intentListener = await fdc3.addIntentListener(intentName, () => {
                return currentChannel;
            });

            gtf.fdc3.addActiveListener(intentListener);

            await supportApp.fdc3.raiseIntent(intentName, fdc3Context1);

            await supportApp.fdc3.addContextListenerOnPrivateChannel(fdc3Context1.type);

            await supportApp.fdc3.addContextListenerOnPrivateChannel(fdc3Context2.type);

            await supportApp.fdc3.addContextListenerOnPrivateChannel(fdc3Context3.type);

            await Promise.all([handlerInvokedPromise1.promise, handlerInvokedPromise2.promise, handlerInvokedPromise3.promise]);
        });
    });
});
