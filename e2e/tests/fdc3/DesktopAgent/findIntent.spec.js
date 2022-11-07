describe("findIntent() ", function () {
    let definitionsOnStart;

    const supportAppName = 'coreSupport';
    let supportApp;

    const existingIntentName = "core-intent";
    const existingResultType = "test-result-type";

    before(async() => {
        await coreReady;

        definitionsOnStart = await glue.appManager.inMemory.export();
    });

    beforeEach(async() => {
        supportApp = await gtf.createApp({ name: supportAppName, exposeFdc3: true });
    });

    afterEach(async() => {
        await supportApp.stop();

        await glue.appManager.inMemory.import(definitionsOnStart, "replace");
    });

    [undefined, null, "", true, false, { test: 42 }, [], () => {}, 42].forEach((invalidArg) => {
        it(`Should throw when invoked with invalid first argument: (${JSON.stringify(invalidArg)})`, (done) => {
            fdc3.findIntent(invalidArg)
                .then(() => done("Should have thrown"))
                .catch(() => done());
        });
    });
    
    [true, false, { test: 42 }, [], () => {}, 42, "test"].forEach((invalidArg) => {
        it(`Should throw when invoked with invalid context (${JSON.stringify(invalidArg)}) as a second argument`, (done) => {
            fdc3.findIntent(existingIntentName, invalidArg)
                .then(() => done("Should have thrown"))
                .catch(() => done());
        });
    });

    [true, { test: 42 }, [], () => {}, 42].forEach((invalidArg) => {
        it(`Should throw when invoked with invalid resultType (${JSON.stringify(invalidArg)}) as a third argument`, (done) => {
            fdc3.findIntent(existingIntentName, { type: "test-context" }, invalidArg)
                .then(() => done("Should have thrown"))
                .catch(() => done());
        });
    });

    it("Should throw an error when there's no intent with such name", (done) => {
        fdc3.findIntent("nonExistingIntentName")
            .then(() => done("Should have thrown"))
            .catch(() => done());
    });

    it("Should return a valid AppIntent object", async() => {
        const appIntent = await fdc3.findIntent(existingIntentName);

        expect(appIntent.intent).to.be.an("object");
        expect(appIntent.apps).to.be.an("array");
    });

    it("Should return a valid AppMetadata intent object", async() => {
        const { intent } = await fdc3.findIntent(existingIntentName);

        expect(intent.name).to.be.a("string");
        expect(intent.displayName).to.be.a("string");
    });

    it("Should return a valid AppMetadata apps array", async() => {
        const { apps } = await fdc3.findIntent(existingIntentName);

        expect(apps.length).to.eql(1);
        expect(apps[0].name).to.eql(supportAppName);
    });

    it("Should return correct intents when invoked with resultType as a third argument", async() => {
        const resultType = "test-result-type";
        const appName = "coreSupport";
        const context = { type: "test-context" };

        const { apps } = await fdc3.findIntent(existingIntentName, context, existingResultType);

        const appsWithSuchResultType = gtf.appManager.getLocalApplications().filter(app => app.name === appName && app.intents?.some(intent => intent.resultType === resultType));

        expect(apps.length).to.eql(appsWithSuchResultType.length);
    });

    it("Should throw when there's no app with such resultType in intents definitions", async() => {
        const methodThrown = gtf.wrapPromise();

        const resultType = "nonExistingResultType";
        const context = { type: "test-context" };
        
        try {
            await fdc3.findIntent(existingIntentName, context, resultType);
            methodThrown.reject("Should have thrown");
        } catch (error) {
            methodThrown.resolve();
        }

        await methodThrown.promise;
    });

    describe("when there are two apps registering intents with the same name", function() {
        const secondSupportAppDef = {
            name: "secondAppDef",
            type: "window",
            details: {
                url: "https://github.com"
            },
            intents: [
                {
                    name: existingIntentName
                }
            ]
        };

        beforeEach(async() => {
            await glue.appManager.inMemory.import([secondSupportAppDef], "merge");
        });

        it("Should return a valid AppMetadata apps array", async() => {
            const { apps } = await fdc3.findIntent(existingIntentName);

            expect(apps.length).to.eql(2);
            expect(apps.some(appDef => appDef.name === supportAppName)).to.eql(true);
            expect(apps.some(appDef => appDef.name === secondSupportAppDef.name)).to.eql(true);
        })

    });
});