describe("raiseIntentForContext()", function() {
    const contextType = "test-context";

    let intentsWithContextType;

    before(async() => {
        await coreReady;
    });

    beforeEach(async() => { 
        intentsWithContextType = await glue.intents.find({ contextType });
    });

    afterEach(async() => {
        gtf.clearWindowActiveHooks();

        await Promise.all(glue.appManager.instances().map(inst => inst.stop()));
    });

    it("Should throw when invoked without arguments", (done) => {
        fdc3.raiseIntentForContext()
            .then(() => done("Should have thrown"))
            .catch(() => done());
    });

    [undefined, null, "", true, false, { test: 42 }, [], () => {}, 42, "test"].forEach((invalidArg) => {
        it(`Should throw when invoked with invalid context - (${JSON.stringify(invalidArg)})`, (done) => {
            fdc3.raiseIntentForContext(invalidArg)
                .then(() => done("Should have thrown"))
                .catch(() => done());
        });
    });

    [undefined, null, "", true, false, { test: 42 }, [], () => {}, 42, "test"].forEach((invalidArg) => {
        it(`Should throw when invoked invalid context type - (${JSON.stringify()})`, (done) => {
            fdc3.raiseIntentForContext({ type: invalidArg })
                .then(() => done("Should have thrown"))
                .catch(() => done());
        });
    });

    [null, "", true, false, { test: 42 }, [], () => {}, 42, "test"].forEach((invalidArg) => {
        it(`Should throw when invoked with invalid target - (${JSON.stringify(invalidArg)})`, (done) => {
            fdc3.raiseIntentForContext(invalidArg)
                .then(() => done("Should have thrown"))
                .catch(() => done());
        });
    });

    it("Should return an object", async() => {
        const resolution = await fdc3.raiseIntentForContext({ type: contextType });

        expect(resolution).to.be.an("object");
    });

    it("Should return a valid IntentResolution object", async() => {
        const resolution = await fdc3.raiseIntentForContext({ type: contextType });

        expect(resolution.source).to.be.an("object");
    });

    it("Should return correct IntentResolution object", async() => {
        const resolution = await fdc3.raiseIntentForContext({ type: contextType });

        const applicationsWithSuchContextType = intentsWithContextType.flatMap(intent => intent.handlers).map(handler => handler.applicationName);

        expect(applicationsWithSuchContextType.includes(resolution.source.appId)).to.eql(true);
    });

    it("Should throw when there's no app registering an intent with such context", done => {
        const context = "noAppWithSuchIntentContext";

        fdc3.raiseIntentForContext({ type: context })
            .then(() => done("Should have rejected"))
            .catch(() => done());
    });

    it("Should throw when there's an app registering an intent with such name but it's not the same app that is passed as a second argument", done => {
        fdc3.raiseIntentForContext({ type: contextType }, "noSuchApp")
            .then(() => done("Should have rejected"))
            .catch(() => done());
    });

    describe("integration with Glue42", function() {
        it("Should open an instance of the app that registers an intent with such name", async() => {
            const instanceStarted = gtf.wrapPromise();

            const un = glue.appManager.onInstanceStarted((inst) => {
                const isInstanceOfIntentHandler = intentsWithContextType.find(intent => intent.handlers.some(handler => handler.applicationName === inst.application.name));

                if (isInstanceOfIntentHandler) {
                    instanceStarted.resolve();
                }
            });

            gtf.addWindowHook(un);

            await fdc3.raiseIntentForContext({ type: contextType });

            await instanceStarted.promise;
        });

        it("Should add one more element to the app instances when raising an existing intent", async() => {
            const openedInstancesCount = glue.appManager.instances().length;

            await fdc3.raiseIntentForContext({ type: contextType });

            const newOpenedInstancesCount = glue.appManager.instances().length;

            expect(openedInstancesCount + 1).to.eql(newOpenedInstancesCount);
        });

        it("Should not add one more element to the array returned from glue.appManager.instances() when there's no app registering an intent with that name", async() => {
            const initInstancesCount = glue.appManager.instances().length;

            const context = "noAppWithSuchIntentContext";
    
            try {
                await fdc3.raiseIntentForContext({ type: context });
            } catch (error) { }

            const newInstancesCount = glue.appManager.instances().length;

            expect(initInstancesCount).to.eql(newInstancesCount);
        });
    });
});
