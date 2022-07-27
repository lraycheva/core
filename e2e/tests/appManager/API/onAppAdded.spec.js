describe("onAppAdded() ", () => {
    let alreadyImportedAppNames;

    const extraDefOne = {
        name: "ExtraOne",
        type: "window",
        details: {
            url: "http://localhost:4242/dummyApp/index.html"
        },
        customProperties: {
            includeInWorkspaces: true
        }
    };

    let definitionsOnStart;

    before(async () => {
        await coreReady;

        definitionsOnStart = await glue.appManager.inMemory.export();

        alreadyImportedAppNames = gtf.appManager.getLocalApplications().map(app => app.name);
    });

    afterEach(async () => {
        gtf.clearWindowActiveHooks();

        await gtf.appManager.stopAllOtherInstances();

        await glue.appManager.inMemory.import(definitionsOnStart, "replace");
    });

    [undefined, null, '', false, 42, 'test'].forEach((invalidArg) => {
        it(`Should throw an error when the passed argument (${JSON.stringify(invalidArg)}) isn\'t of type function`, (done) => {
            try {
                const un = glue.appManager.onAppAdded(invalidArg);
                gtf.addWindowHook(un);
                done("Should have thrown")
            } catch (error) {
                done();
            }
        });
    });

    it("Should invoke the callback when new application is added", async() => {
        const onAppAddedHeard = gtf.wrapPromise();

        const un = glue.appManager.onAppAdded((app) => {
            if (app.name === extraDefOne.name) {
                onAppAddedHeard.resolve();
            }
        });

        gtf.addWindowHook(un);

        await glue.appManager.inMemory.import([extraDefOne], "replace");

        await onAppAddedHeard.promise;
    });
    
    it("Should invoke the callback with the newly added application", async() => {
        const onAppAddedHeard = gtf.wrapPromise();

        const un = glue.appManager.onAppAdded((app) => {
            if (app.name === extraDefOne.name) {
                try {
                    expect(app.userProperties.details.url).to.eql(extraDefOne.details.url);
                    expect(app.instances).to.eql([]);
                    onAppAddedHeard.resolve();
                } catch (error) {
                    onAppAddedHeard.reject(error);
                }
            }
        });

        gtf.addWindowHook(un);

        await glue.appManager.inMemory.import([extraDefOne], "replace");
    });

    it("Should return a function", () => {
        const un = glue.appManager.onAppAdded(() => {});

        gtf.addWindowHook(un);

        expect(un).to.be.a("function");
    });

    it("Should return a working unsubscribe function", async() => {
        const newAppDef = Object.assign({}, extraDefOne, { name: Date.now().toString() });

        const onAppAddedHeard = gtf.wrapPromise();
        const onAppAddedHeardSecondEvent = gtf.wrapPromise();
        
        const un = glue.appManager.onAppAdded((app) => {
            if (app.name === extraDefOne.name) {
                onAppAddedHeard.resolve();
            };

           if (app.name === newAppDef.name) {
            onAppAddedHeardSecondEvent.reject("Should not have fired the event");
           }
        });

        gtf.addWindowHook(un);
        
        await glue.appManager.inMemory.import([extraDefOne], "replace");

        await onAppAddedHeard.promise;

        un();

        await glue.appManager.inMemory.import([newAppDef], "replace");
        
        gtf.wait(3000, () => onAppAddedHeardSecondEvent.resolve());

        await onAppAddedHeardSecondEvent.promise;
    });

    it("Should replay existing applications by invoking the callback with all previously added applications", (done) => {
        const ready = gtf.waitFor(alreadyImportedAppNames.length, done);

        const un = glue.appManager.onAppAdded(app => {
            if (alreadyImportedAppNames.indexOf(app.name) > -1) {
                ready();
            }
        });

        gtf.addWindowHook(un);
    });

    it("Should invoke the callback 3 times when new applications are added 3 times", (done) => {
        const ready = gtf.waitFor(4, done);

        const newAppName1 = Date.now().toString();
        const newAppName2 = (Date.now() + 2).toString();
        
        const appNamesToBeAdded = [extraDefOne.name, newAppName1, newAppName2 ];

        const newAppDef1 = Object.assign({}, extraDefOne, { name: newAppName1 });
        const newAppDef2 = Object.assign({}, extraDefOne, { name: newAppName2 });

        const un = glue.appManager.onAppAdded((app) => {
            if (appNamesToBeAdded.indexOf(app.name) > -1) {
                ready();
            }
        });

        gtf.addWindowHook(un);

        glue.appManager.inMemory.import([extraDefOne], "merge")
            .then(() => glue.appManager.inMemory.import([newAppDef1], "merge"))
            .then(() => glue.appManager.inMemory.import([newAppDef2], "merge"))
            .then(ready)
            .catch(done);
    });

    it("Should invoke the callback 3 times when adding 3 new applications in parallel", (done) => {
        const ready = gtf.waitFor(4, done);

        const newAppName1 = Date.now().toString();
        const newAppName2 = (Date.now() + 2).toString();
        
        const appNamesToBeAdded = [extraDefOne.name, newAppName1, newAppName2 ];

        const newAppDef1 = Object.assign({}, extraDefOne, { name: newAppName1 });
        const newAppDef2 = Object.assign({}, extraDefOne, { name: newAppName2 });

        const un = glue.appManager.onAppAdded((app) => {
            if (appNamesToBeAdded.indexOf(app.name) > -1) {
                ready();
            }
        });

        gtf.addWindowHook(un);

        Promise.all([
            glue.appManager.inMemory.import([extraDefOne], "merge"),
            glue.appManager.inMemory.import([newAppDef1], "merge"),
            glue.appManager.inMemory.import([newAppDef2], "merge")
        ])
            .then(ready)
            .catch(done);
    });
});

