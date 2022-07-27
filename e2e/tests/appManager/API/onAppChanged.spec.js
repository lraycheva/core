describe("onAppChanged() ", () => {
    const extraDefOne = {
        name: "Imported-At-Runtime",
        type: "window",
        details: {
            url: "https://github.com"
        }
    };

    let definitionsOnStart;

    before(async () => {
        await coreReady;

        definitionsOnStart = await glue.appManager.inMemory.export();
    });

    beforeEach(() => glue.appManager.inMemory.import([extraDefOne], "merge"));

    afterEach(async () => {
        gtf.clearWindowActiveHooks();

        await gtf.appManager.stopAllOtherInstances();

        await glue.appManager.inMemory.import(definitionsOnStart, "replace");
    });

    [undefined, null, '', false, 42, 'test'].forEach((invalidArg) => {
        it(`Should throw an error when the passed argument (${JSON.stringify(invalidArg)}) isn\'t of type function`, (done) => {
            try {
                const un = glue.appManager.onAppChanged(invalidArg);
                gtf.addWindowHook(un);
                done('Should have thrown');
            } catch (error) {
                done();
            }
        });
    });

    it("Should invoke the callback when app definition is changed", async() => {
        const newAppDef = { ...extraDefOne, ...{ caption: "new-caption", icon: "new-icon" }};

        const onAppChangedHeard = gtf.wrapPromise();

        const un = glue.appManager.onAppChanged((app) => {
            if (app.name === extraDefOne.name) {
                onAppChangedHeard.resolve();
            }
        });

        gtf.addWindowHook(un);

        await glue.appManager.inMemory.import([newAppDef], "merge");

        await onAppChangedHeard.promise;
    });

    it("Should invoke the callback with the updated application", async() => {
        const newAppDef = { ...extraDefOne, ...{ caption: "new-caption", icon: "new-icon", details: { url: "new-url.com"} }};

        const onAppChangedHeard = gtf.wrapPromise();

        const un = glue.appManager.onAppChanged((app) => {
            if (app.name === extraDefOne.name) {
                try {
                    expect(app.userProperties.details.url).to.eql(newAppDef.details.url);
                    expect(app.caption).to.eql(newAppDef.caption);
                    expect(app.icon).to.eql(newAppDef.icon);
                    expect(app.instances).to.eql([]);
                    onAppChangedHeard.resolve();
                } catch (error) {
                    onAppChangedHeard.reject(error);
                }
            }
        });

        gtf.addWindowHook(un);

        await glue.appManager.inMemory.import([newAppDef], "merge");

        await onAppChangedHeard.promise;
    });

    it("Should return a function", () => {
        const un = glue.appManager.onAppChanged(() => {});

        gtf.addWindowHook(un);

        expect(un).to.be.a("function");
    });

    it("Should return a working unsubscribe function", async() => {
        const newAppDef = { ...extraDefOne, ...{ details: { url: "https://abv.bg"} }};
        const newAppDef2 = { ...extraDefOne, ...{ details: { url: "new-url.com"} }};

        const onAppChangedHeard = gtf.wrapPromise();
        const onAppChangedHeardSecondEvent = gtf.wrapPromise();

        const un = glue.appManager.onAppChanged((app) => {
            if (app.userProperties.details.url === newAppDef.details.url) {
                onAppChangedHeard.resolve();
            }

            if (app.userProperties.details.url === newAppDef2.details.url) {
                onAppChangedHeardSecondEvent.reject("Should not have fired the event");
            }
        });

        gtf.addWindowHook(un);
        
        await glue.appManager.inMemory.import([newAppDef], "merge");

        await onAppChangedHeard.promise;

        un();

        gtf.wait(3000, () => onAppChangedHeardSecondEvent.resolve());

        await onAppChangedHeardSecondEvent.promise;
    });

    it("Should not invoke the callback when the setup is there but no app is changed", (done) => {
        const un = glue.appManager.onAppChanged(() => done("Should have not been invoked"));

        gtf.addWindowHook(un);

        gtf.wait(3000, done);
    });

    it("Should invoke the callback 3 times when application is changed 3 times sequentially", (done) => {
        const ready = gtf.waitFor(4, done);

        const newAppDef1 = Object.assign({}, extraDefOne, { details: { url: "https://abv.bg" }});
        const newAppDef2 = Object.assign({}, extraDefOne, { details: { url: "https://glue42.com" }});
        const newAppDef3 = Object.assign({}, extraDefOne, { details: { url: "https://github.com" }});

        const un = glue.appManager.onAppChanged((app) => {
            if (app.name === extraDefOne.name) {
                ready();
            }
        });

        gtf.addWindowHook(un);

        glue.appManager.inMemory.import([newAppDef1], "merge")
            .then(() => glue.appManager.inMemory.import([newAppDef2], "merge"))
            .then(() => glue.appManager.inMemory.import([newAppDef3], "merge"))
            .then(ready)
            .catch(done);
    });

    it("Should invoke the callback 3 times when application is changed 3 times in parallel", (done) => {
        const ready = gtf.waitFor(4, done);

        const newAppDef1 = Object.assign({}, extraDefOne, { details: { url: "https://abv.bg" }});
        const newAppDef2 = Object.assign({}, extraDefOne, { details: { url: "https://glue42.com" }});
        const newAppDef3 = Object.assign({}, extraDefOne, { details: { url: "https://github.com" }});

        const un = glue.appManager.onAppChanged((app) => {
            if (app.name === extraDefOne.name) {
                ready();
            }
        });

        gtf.addWindowHook(un);

        Promise.all([
            glue.appManager.inMemory.import([newAppDef1], "merge"),
            glue.appManager.inMemory.import([newAppDef2], "merge"),
            glue.appManager.inMemory.import([newAppDef3], "merge")
        ])
            .then(ready)
            .catch(done);
    });
});
