describe("raiseIntent()", function() {
    const supportAppName = 'coreSupport';
    let supportApp;

    let intentName;

    before(async() => {
        await coreReady;
    });

    beforeEach(async() => {
        supportApp = await gtf.createApp({ name: supportAppName, exposeFdc3: true });
    })

    afterEach(async() => {
        intentName = undefined;

        gtf.clearWindowActiveHooks();

        gtf.fdc3.removeActiveListeners();

        supportApp.intents.unregisterIntent(intentName);

        await Promise.all(glue.appManager.instances().map(inst => inst.stop()));
    });

    it("Should throw when invoked without arguments", (done) => {
        fdc3.raiseIntent()
            .then(() => done("Should have thrown"))
            .catch(() => done());
    });

    [undefined, null, "", true, false, { test: 42 }, [], () => {}, 42].forEach((invalidArg) => {
        it(`Should throw when invoked with invalid intent - (${JSON.stringify(invalidArg)})`, (done) => {
            fdc3.raiseIntent(invalidArg)
                .then(() => done("Should have thrown"))
                .catch(() => done());
        });
    });

    [undefined, null, "", true, false, { test: 42 }, [], () => {}, 42, "test"].forEach((invalidArg) => {
        it(`Should throw when invoked with invalid context - (${JSON.stringify(invalidArg)})`, (done) => {
            fdc3.raiseIntent("core-intent", invalidArg)
                .then(() => done("Should have thrown"))
                .catch(() => done());
        });
    });

    [null, "", true, false, { test: 42 }, [], () => {}, 42].forEach((invalidArg) => {
        it(`"Should throw when invoked with invalid TargetApp as third argument - (${JSON.stringify(invalidArg)})`, (done) => {
            fdc3.raiseIntent("core-intent", { type: "fdc3.type" }, invalidArg)
                .then(() => done("Should have thrown"))
                .catch(() => done());
        });
    });

    it("Should return an object", async() => {
        intentName = Date.now().toString();
        await supportApp.intents.addIntentListener(intentName);

        const context = gtf.fdc3.getContext();

        const resolution = await fdc3.raiseIntent(intentName, context);

        expect(resolution).to.be.an("object");
    });

    it("Should return a valid IntentResolution object", async() => {
        intentName = Date.now().toString();
        await supportApp.intents.addIntentListener(intentName);
        
        const context = gtf.fdc3.getContext();

        const resolution = await fdc3.raiseIntent(intentName, context);

        expect(resolution.source).to.be.an("object");
        expect(resolution.intent).to.be.a("string");
        expect(resolution.getResult).to.be.a("function");
    });

    it("Should return correct IntentResolution object", async() => {
        intentName = Date.now().toString();

        await supportApp.intents.addIntentListener(intentName);

        const context = gtf.fdc3.getContext();

        const resolution = await fdc3.raiseIntent(intentName, context);

        expect(resolution.source.appId).to.eql(supportAppName);
        expect(resolution.intent).to.eql(intentName);
        expect(resolution.getResult).to.not.be.undefined;
    });

    it("Should throw when there's no app registering an intent with such name", done => {
        const intentName = "noAppWithSuchIntent";
        const context = gtf.fdc3.getContext();

        fdc3.raiseIntent(intentName, context)
            .then(() => done("Should have rejected"))
            .catch(() => done());
    });

    it("Should throw when there's an app registering an intent with such name but it's not the same app that is passed as a third argument", async() => {
        const raiseIntentThrownPromise = gtf.wrapPromise();

        intentName = Date.now().toString();

        await supportApp.intents.addIntentListener(intentName);
        
        const context = gtf.fdc3.getContext();

        try {
            await fdc3.raiseIntent(intentName, context, "noSuchApp");
            raiseIntentThrownPromise.reject("Should have thrown");
        } catch (error) {
            raiseIntentThrownPromise.resolve();
        }

        await raiseIntentThrownPromise.promise;
    });

    describe("when the same app raises the intent, intentResolution.getResult() method", function() {
        const defaultChannelMethods = ["broadcast", "addContextListener", "getCurrentContext"];
        const defaultPrivateChannelMethods = ["id", "type", "displayMetadata", ...defaultChannelMethods, "onAddContextListener", "onUnsubscribe", "onDisconnect", "disconnect"];

        it("Should be async", async() => {
            const intentName = "fdc3-private-channel-intent";
            const context = gtf.fdc3.getContext();
            
            const listener = await fdc3.addIntentListener(intentName, async(ctx) => {
                if (ctx.name === context.name) {
                    return Promise.resolve();
                }
            });

            gtf.fdc3.addActiveListener(listener);

            const resolution = await fdc3.raiseIntent(intentName, context);

            const getResultPromise = resolution.getResult();

            expect(getResultPromise.then).to.be.a("function");
            expect(getResultPromise.catch).to.be.a("function");
        });

        it("Should return correct context when intent handler returns a context", async() => {
            const intentName = "fdc3.test.intent.name";
            const context = gtf.fdc3.getContext();
            const anotherContextToReturn = gtf.fdc3.getContext();

            const listener = await fdc3.addIntentListener(intentName, (ctx) => {
                if (ctx.name === context.name) {
                    return anotherContextToReturn;
                }
            });

            gtf.fdc3.addActiveListener(listener);

            const resolution = await fdc3.raiseIntent(intentName, context);

            const result = await resolution.getResult();

            expect(result).to.eql(anotherContextToReturn);
        });

        it("Should return correct channel when intent handler returns a channel", async() => {
            const intentName = "fdc3.test.intent.name";
            const context = gtf.fdc3.getContext();
            
            let privateChannel;

            const listener = await fdc3.addIntentListener(intentName, async(ctx) => {
                if (ctx.name === context.name) {
                    const channel = await fdc3.createPrivateChannel();

                    privateChannel = channel;

                    return channel;
                }
            });

            gtf.fdc3.addActiveListener(listener);

            const resolution = await fdc3.raiseIntent(intentName, context);

            const result = await resolution.getResult();

            expect(result.id).to.eql(privateChannel.id);
            expect(result.type).to.eql(privateChannel.type);
            expect(defaultChannelMethods.every(method => Object.keys(result).includes(method))).to.eql(true);
        });

        it("Should be able to retrieve the same correct channel 3 times when getResult() is invoked 3 times", async() => {
            const intentName = "fdc3-private-channel-intent";
            const context = gtf.fdc3.getContext();

            const privateChannel = await fdc3.createPrivateChannel();
        
            const listener = await fdc3.addIntentListener(intentName, () => {
                return privateChannel;
            });

            gtf.fdc3.addActiveListener(listener);

            const resolution1 = await fdc3.raiseIntent(intentName, context);
            const channel1 = await resolution1.getResult();

            const resolution2 = await fdc3.raiseIntent(intentName, context);
            const channel2 = await resolution2.getResult();

            const resolution3 = await fdc3.raiseIntent(intentName, context);
            const channel3 = await resolution3.getResult();

            const channels = [channel1, channel2, channel3];

            expect(channels.every(channel => channel.id === privateChannel.id)).to.eql(true);
            expect(channels.every(channel => channel.type === privateChannel.type)).to.eql(true);
            // check the shape of each channel
            expect(Object.keys(channel1)).to.have.members(defaultPrivateChannelMethods);
            expect(Object.keys(channel2)).to.have.members(defaultPrivateChannelMethods);
            expect(Object.keys(channel3)).to.have.members(defaultPrivateChannelMethods);
        });
    });

    describe("when support app raises the intent, intentResolution.getResult() method", function() {
        it("Should be async", async() => {
            const intentName = "fdc3-private-channel-intent";
            const context = gtf.fdc3.getContext();
            
            const listener = await fdc3.addIntentListener(intentName, async(ctx) => {
                if (ctx.name === context.name) {
                    return Promise.resolve();
                }
            });

            gtf.fdc3.addActiveListener(listener);

            const resolution = await fdc3.raiseIntent(intentName, context);

            const getResultPromise = resolution.getResult();

            expect(getResultPromise.then).to.be.a("function");
            expect(getResultPromise.catch).to.be.a("function");
        });

        it("Should return correct context when intent handler returns a context", async() => {
            const intentName = "fdc3.test.intent.name";
            const context = gtf.fdc3.getContext();
            const anotherContextToReturn = gtf.fdc3.getContext();

            const listener = await fdc3.addIntentListener(intentName, (ctx) => {
                if (ctx.name === context.name) {
                    return anotherContextToReturn;
                }
            });

            gtf.fdc3.addActiveListener(listener);

            const resolution = await supportApp.fdc3.raiseIntent(intentName, context);

            const result = await resolution.getResult();

            expect(result).to.eql(anotherContextToReturn);
        });

        it("Should return correct channel.id and channel.type when returning a channel", async() => {
            const intentName = "fdc3-private-channel-intent";
            const context = gtf.fdc3.getContext();

            let channelId;
            let channelType;

            const listener = await fdc3.addIntentListener(intentName, async(ctx) => {
                if (ctx.name === context.name) {
                    const channel = await fdc3.createPrivateChannel();

                    channelId = channel.id;
                    channelType = channel.type;

                    return channel;
                }
            });

            gtf.fdc3.addActiveListener(listener);

            const resolution = await supportApp.fdc3.raiseIntent(intentName, context);

            const channelMeta = await resolution.getResult();

            // only id and type properties are checked because getResult() method returns channelMetadata (cannot send object with methods through postMessage)
            expect(channelMeta.id).to.eql(channelId);
            expect(channelMeta.type).to.eql(channelType);
        });
        
        it("Should not be able to retrieve the same channel metadata when getResult() is invoked in a third app after the private channel was received from an intent", async() => {
            const getResultPromise = gtf.wrapPromise();

            const intentName = "fdc3-private-channel-intent";
            const context = gtf.fdc3.getContext();

            const supportApp1 = await gtf.createApp({exposeFdc3: true});
            const supportApp2 = await gtf.createApp({exposeFdc3: true});

            const privateChannel = await fdc3.createPrivateChannel();
        
            const listener = await fdc3.addIntentListener(intentName, () => {
                return privateChannel;
            });

            gtf.fdc3.addActiveListener(listener);

            const resolution1 = await supportApp1.fdc3.raiseIntent(intentName, context);
            await resolution1.getResult();
            
            try {
                const resolution2 = await supportApp2.fdc3.raiseIntent(intentName, context);
                await resolution2.getResult();
                getResultPromise.reject("Should have thrown");
            } catch (error) {
                getResultPromise.resolve();
            }

            await getResultPromise.promise;
        });
    });

    describe("integration with Glue42", function() {
        it("Should open an instance of the app that registers an intent with such name", async() => {
            const instanceStarted = gtf.wrapPromise();

            const allIntents = await glue.intents.all();

            const { name, handlers } = allIntents[0];

            const context = gtf.fdc3.getContext();
            
            const un = glue.appManager.onInstanceStarted((inst) => {
                const isInstanceOfIntentHandler = handlers.find(handler => handler.applicationName === inst.application.name);

                if (isInstanceOfIntentHandler) {
                    instanceStarted.resolve();
                }
            });

            gtf.addWindowHook(un);

            await fdc3.raiseIntent(name, context);

            await instanceStarted.promise;
        });

        /* fdc3 specification: target provided & there is a running instance => target instance */
        it("Should not open a new instance of the app that registers an intent with such name if there's an already running instance of that app", async() => {
            intentName = Date.now().toString();
            const context = gtf.fdc3.getContext();

            const initInstancesCount = glue.appManager.application(supportAppName).instances.length;

            await supportApp.intents.addIntentListener(intentName, context);

            await fdc3.raiseIntent(intentName, context, { appId: supportAppName });

            const newInstancesCount = glue.appManager.application(supportAppName).instances.length;

            expect(initInstancesCount).to.eql(newInstancesCount);
        });

        it("Should not add one more element to the array returned from glue.appManager.instances() when there's no app registering an intent with that name", async() => {
            const initInstancesCount = glue.appManager.instances().length;

            const intentName = "noAppWithSuchIntent";
            const context = gtf.fdc3.getContext();
    
            try {
                await fdc3.raiseIntent(intentName, context);
            } catch (error) { }

            const newInstancesCount = glue.appManager.instances().length;

            expect(initInstancesCount).to.eql(newInstancesCount);
        });
    });
});
