describe("findIntentsByContext()", function() {
    const fdc3AppDefinition = {
        name: "fdc3-support",
        type: "window",
        details: {
            url: "https://google.com"
        },
        intents: [
            {   
                name: "fdc3.test1",
                displayName: "fdc3.test1.displayName",
                contexts: [ "fdc3.test1.context1", "fdc3.test1.context2" ]
            },
            {
                name: "fdc3.test2",
                displayName: "fdc3.test2.displayName",
                contexts: [ "fdc3.test2.context1", "fdc3.test2.context2" ]
            }
        ]
    };

    let definitionsOnStart;

    const existingContext = { type: "test-context" };

    before(async() => {
        await coreReady;

        definitionsOnStart = await glue.appManager.inMemory.export();
    });

    beforeEach(async() => {
        await glue.appManager.inMemory.import([fdc3AppDefinition], "merge");
    });

    afterEach(async() => {
        await glue.appManager.inMemory.import(definitionsOnStart, "replace");
    });

    it("Should throw when invoked with no argument", (done) => {
        fdc3.findIntentsByContext()
            .then(() => done("Should have thrown"))
            .catch(() => done());
    });
    
    [undefined, null, "", true, false, { test: 42 }, [], () => {}, 42, "test"].forEach((invalidArg) => {
        it(`Should throw when invoked with invalid context (${JSON.stringify(invalidArg)})`, (done) => {
            fdc3.findIntentsByContext(invalidArg)
                .then(() => done("Should have thrown"))
                .catch(() => done());
        });
    });

    [true, { test: 42 }, [], () => {}, 42].forEach((invalidArg) => {
        it(`Should throw when invoked with invalid resultType (${JSON.stringify(invalidArg)}) as a second argument`, (done) => {
            fdc3.findIntentsByContext({ type: "test-context" }, invalidArg)
                .then(() => done("Should have thrown"))
                .catch(() => done());
        });
    });

    it("Should return an array", async() => {
        const context = { type: "fdc3.test1.context1" };
        const appIntents = await fdc3.findIntentsByContext(context);

        expect(appIntents).to.be.an("array");
    });

    it("Should return an array with the correct AppIntent", async() => {
        const context = { type: "fdc3.test1.context1" };
        const [ appIntent ] = await fdc3.findIntentsByContext(context);

        expect(appIntent.apps).to.be.an("array");
        expect(appIntent.intent).to.be.an("object");
    });

    it("Should return the correct an array with the correct AppMetadata", async() => {
        const context = { type: "fdc3.test1.context1" };
        const [ appIntent ] = await fdc3.findIntentsByContext(context);
        const [ app ] = appIntent.apps;

        expect(app.name).to.eql(fdc3AppDefinition.name);
        expect(app.displayName).to.eql(fdc3AppDefinition.displayName);
    });

    it("Should return the correct an array with the correct IntentMetadata", async() => {
        const context = { type: "fdc3.test1.context1" };
        const [ appIntent ] = await fdc3.findIntentsByContext(context);
        const { intent } = appIntent;

        expect(intent.name).to.eql("fdc3.test1");
        expect(intent.displayName).to.eql("fdc3.test1.displayName");
    });

    it("Should return the correct array when resultType is passed as a second argument", async() => {
        const resultType = "test-result-type";
        const apps = await fdc3.findIntentsByContext(existingContext, resultType);

        const localAppsWithSuchContextAndResultType = gtf.appManager.getLocalApplications().filter(localApp => localApp.intents?.some(intent => intent.contexts.some(ctx => ctx === existingContext.type) && intent.resultType === resultType));

        expect(apps.length).to.eql(localAppsWithSuchContextAndResultType.length);
    });

    it("Should throw when there're no apps with such context and resultType", async() => {
        const methodThrown = gtf.wrapPromise();

        try {
            await fdc3.findIntentsByContext({ type: "nonExistingContext" }, "nonExistingResultType");
            methodThrown.reject("Should have thrown");
        } catch (error) {
            methodThrown.resolve();
        }
    });
    
    describe("integration with glue intents", function() {
        it("Should return an array with the same length as glue.intents.find({ contextType })", async() => {
            const contextType = "test-context";

            const fdc3AppIntentsArr = await fdc3.findIntentsByContext({ type: contextType });

            const glueIntentsArr = await glue.intents.find({ contextType });

            expect(fdc3AppIntentsArr.length).to.eql(glueIntentsArr.length);
        });
    });
});
