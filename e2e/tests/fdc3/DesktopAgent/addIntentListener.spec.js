describe("addIntentListener()", function () {
    before(async() => {
        await coreReady;
    });

    afterEach(async() => {
        gtf.fdc3.removeActiveListeners();

        await Promise.all(glue.appManager.instances().map(inst => inst.stop()));
    });

    it("Should throw when no argument is passed", (done) => {
        fdc3.addIntentListener()
            .then((listener) => {
                gtf.fdc3.addActiveListener(listener);
                done("Should have thrown");
            })
            .catch(() => done());
    });

    it("Should throw when there's an already registered intent with passed name", async() => {
        const intentName = Date.now().toString();

        const listener = await fdc3.addIntentListener(intentName, () => {});

        gtf.fdc3.addActiveListener(listener);

        const errorThrown = gtf.wrapPromise();

        try {
            const listener = await fdc3.addIntentListener(intentName, () => {});
            gtf.fdc3.addActiveListener(listener);
            errorThrown.reject("Should have thrown - there's an already registered intent with such name");
        } catch (error) {
            errorThrown.resolve();
        }

        await errorThrown.promise;
    });

    [undefined, null, true, false, "", 42, { test: 42 }, [], [ { test: 42 }], () => {}].forEach(invalidArg => {
        it(`Should throw when an invalid first argument (${JSON.stringify(invalidArg)}) is passed`, (done) => {
            fdc3.addIntentListener(invalidArg, () => {})
                .then((listener) => {
                    gtf.fdc3.addActiveListener(listener);
                    done("Should have thrown");
                })
                .catch(() => done());
        });
    });

    [undefined, null, true, false, "", 42, { test: 42 }, [], [ { test: 42 }]].forEach(invalidArg => {
        it(`Should throw when an invalid second argument (${JSON.stringify(invalidArg)}) is passed`, async() => {
            const allIntents = await glue.intents.all()
            const intentName = allIntents[0].name;

            const errorThrown = gtf.wrapPromise();

            try {
                const listener = await fdc3.addIntentListener(intentName, invalidArg);
                gtf.fdc3.addActiveListener(listener);
                errorThrown.reject("Should have thrown");                
            } catch (error) {
                errorThrown.resolve();
            }

            await errorThrown.promise;
        });
    });

    it("Should not throw when invoked with valid arguments", async() => {
        const allIntents = await glue.intents.all();
        const intentName = allIntents[0].name;

        const listener = await fdc3.addIntentListener(intentName, () => {});

        gtf.fdc3.addActiveListener(listener);
    });

    it("Should return an object with unsubscribe function", async() => {
        const allIntents = await glue.intents.all();
        const intentName = allIntents[0].name;

        const listener = await fdc3.addIntentListener(intentName, () => {});

        gtf.fdc3.addActiveListener(listener);

        expect(listener).to.be.an("object");
        expect(typeof listener.unsubscribe).to.eql("function");
    });

    it("Should not invoke the callback when the setup is there but no intent is raised", async() => {
        const wrapper = gtf.wrapPromise();

        const intentName = Date.now().toString();

        const listener = await fdc3.addIntentListener(intentName, () => {
            wrapper.reject("Should not have been invoked");
        });

        gtf.fdc3.addActiveListener(listener);

        gtf.wait(3000, wrapper.resolve);

        await wrapper.promise;
    });

    it("Should invoke the callback when an intent is raised", async() => {
        const intentListenerHeard = gtf.wrapPromise();
        
        const intentName = Date.now().toString();
        const context = gtf.fdc3.getContext();

        const listener = await fdc3.addIntentListener(intentName, (ctx) => {
            if (ctx.name === context.name) {
                intentListenerHeard.resolve();
            }
        });

        gtf.fdc3.addActiveListener(listener);

        await fdc3.raiseIntent(intentName, context);

        await intentListenerHeard.promise;
    });

    it("Should invoke the callback with the correct context when an intent is raised", async() => {
        const intentListenerHeard = gtf.wrapPromise();
        
        const intentName = Date.now().toString();
        const context = { ...gtf.fdc3.getContext(), ...gtf.contexts.generateComplexObject(10) };

        const listener = await fdc3.addIntentListener(intentName, (ctx) => {
            if (ctx.type === context.type) {
                try {
                    expect(ctx).to.eql(context)
                    intentListenerHeard.resolve();
                } catch (error) {
                    intentListenerHeard.reject(error);
                }
            }
        });

        gtf.fdc3.addActiveListener(listener);

        await fdc3.raiseIntent(intentName, context);

        await intentListenerHeard.promise;
    });

    it("Should throw when listener.unsubscribe is invoked and user tries to raise the intent", async() => {
        const firstInvocationPromise = gtf.wrapPromise();
        const errorThrownPromise = gtf.wrapPromise();

        const intentName = Date.now().toString();

        const listener = await fdc3.addIntentListener(intentName, (ctx) => {
            if (ctx.type === "first") {
                firstInvocationPromise.resolve();
            }

            if (ctx.type === "second") {
                errorThrownPromise.reject("Should not have fired");
            }
        });

        await fdc3.raiseIntent(intentName, { type: "first" });

        await firstInvocationPromise.promise;

        listener.unsubscribe();

        try {
            await fdc3.raiseIntent(intentName, { type: "second" });
            gtf.fdc3.addActiveListener(listener);
            errorThrownPromise.reject("Should have thrown");
        } catch (error) {
            errorThrownPromise.resolve();
        }

        await errorThrownPromise.promise;
    });

    it("Should not invoke the callback when listener.unsubscribe is invoked", async() => {
        const firstInvocationPromise = gtf.wrapPromise();
        const secondInvocationPromise = gtf.wrapPromise();

        const intentName = Date.now().toString();

        const listener = await fdc3.addIntentListener(intentName, (ctx) => {
            if (ctx.type === "first") {
                firstInvocationPromise.resolve();
            }

            if (ctx.type === "second") {
                secondInvocationPromise.reject("Should not have fired");
            }
        });

        await fdc3.raiseIntent(intentName, { type: "first" });

        await firstInvocationPromise.promise;

        listener.unsubscribe();

        try {
            await fdc3.raiseIntent(intentName, { type: "second" });
            secondInvocationPromise.reject("Should have thrown");
        } catch (error) { }

        gtf.wait(3000, secondInvocationPromise.resolve);

        await secondInvocationPromise.promise;
    });
});