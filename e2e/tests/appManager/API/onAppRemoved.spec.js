describe("onAppRemoved() ", () => {
    let alreadyImportedAppNames;

    const extraDefOne = {
        name: "ExtraOne",
        type: "window",
        details: {
            url: "http://localhost:4242/dummyApp/index.html"
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
                const un = glue.appManager.onAppRemoved(invalidArg);
                gtf.addWindowHook(un);
                done('Should have thrown');
            } catch (error) {
                done();
            }
        });
    });

    it("Should invoke the callback when an application is removed", async() => {
        const onAppRemovedHeard = gtf.wrapPromise();

        const un = glue.appManager.onAppRemoved((app) => {
            if (app.name === extraDefOne.name) {
                onAppRemovedHeard.resolve();
            }
        });

        gtf.addWindowHook(un);

        await glue.appManager.inMemory.import([extraDefOne], "replace");

        await glue.appManager.inMemory.remove(extraDefOne.name);

        await onAppRemovedHeard.promise;
    });

    it("Should invoke the callback with the removed application", async() => {
        const onAppRemovedHeard = gtf.wrapPromise();

        const un = glue.appManager.onAppRemoved((app) => {
            if (app.name === extraDefOne.name) {
                try {
                    expect(app.userProperties.details.url).to.eql(extraDefOne.details.url);
                    expect(app.instances).to.eql([]);
                    onAppRemovedHeard.resolve();
                } catch (error) {
                    onAppRemovedHeard.reject(error);
                }
            }
        });

        gtf.addWindowHook(un);

        await glue.appManager.inMemory.import([extraDefOne], "replace");

        await glue.appManager.inMemory.remove(extraDefOne.name);

        await onAppRemovedHeard.promise;
    });

    it("Should return a function", () => {
        const un = glue.appManager.onAppRemoved(() => {});

        gtf.addWindowHook(un);

        expect(un).to.be.a("function");
    });

    it("Should return a working unsubscribe function", async() => {
        const newAppDef = Object.assign({}, extraDefOne, { name: Date.now().toString() });

        const onAppRemovedHeard = gtf.wrapPromise();
        const onAppRemovedHeardSecondEvent = gtf.wrapPromise();

        const un = glue.appManager.onAppRemoved((app) => {
            if (app.name === extraDefOne.name) {
                onAppRemovedHeard.resolve();
            }

            if (app.name === newAppDef.name){
                onAppRemovedHeardSecondEvent.reject("Should not have fired the event");
            }
        });

        gtf.addWindowHook(un);
        
        await glue.appManager.inMemory.import([extraDefOne, newAppDef], "replace");

        await glue.appManager.inMemory.remove(extraDefOne.name);

        await onAppRemovedHeard.promise;

        un();

        await glue.appManager.inMemory.remove(newAppDef.name, "replace");

        gtf.wait(3000, () => onAppRemovedHeardSecondEvent.resolve());

        await onAppRemovedHeardSecondEvent.promise;

    });

    it("Should invoke the callback with all removed applications", (done) => {
        const ready = gtf.waitFor(alreadyImportedAppNames.length, done);

        const un = glue.appManager.onAppRemoved(app => {
            if (alreadyImportedAppNames.indexOf(app.name) > -1) {
                ready();
            }
        });

        gtf.addWindowHook(un);

        Promise.all(alreadyImportedAppNames.map(name => glue.appManager.inMemory.remove(name)))
            .then(ready)
            .catch(done);
    });

    it("Should invoke the callback 3 times when 3 applications are removed sequentially", (done) => {
        const ready = gtf.waitFor(4, done);

        const newAppName1 = Date.now().toString();
        const newAppName2 = (Date.now() + 2).toString();
        
        const appNamesToBeRemoved = [extraDefOne.name, newAppName1, newAppName2 ];

        const newAppDef1 = Object.assign({}, extraDefOne, { name: newAppName1 });
        const newAppDef2 = Object.assign({}, extraDefOne, { name: newAppName2 });

        const un = glue.appManager.onAppRemoved((app) => {
            if (appNamesToBeRemoved.indexOf(app.name) > -1) {
                ready();
            }
        });

        gtf.addWindowHook(un);

        glue.appManager.inMemory.import([extraDefOne, newAppDef1, newAppDef2], "merge")
            .then(() => glue.appManager.inMemory.remove(extraDefOne.name))
            .then(() => glue.appManager.inMemory.remove(newAppName1))
            .then(() => glue.appManager.inMemory.remove(newAppName2))
            .then(ready)
            .catch(done);
    });

    it("Should invoke the callback 3 times when 3 applications are removed in parallel", (done) => {
        const ready = gtf.waitFor(4, done);

        const newAppName1 = Date.now().toString();
        const newAppName2 = (Date.now() + 2).toString();
        
        const appNamesToBeRemoved = [extraDefOne.name, newAppName1, newAppName2 ];

        const newAppDef1 = Object.assign({}, extraDefOne, { name: newAppName1 });
        const newAppDef2 = Object.assign({}, extraDefOne, { name: newAppName2 });

        const un = glue.appManager.onAppRemoved((app) => {
            if (appNamesToBeRemoved.indexOf(app.name) > -1) {
                ready();
            }
        });

        gtf.addWindowHook(un);

        glue.appManager.inMemory.import([extraDefOne, newAppDef1, newAppDef2], "merge")
            .then(() => Promise.all([
                glue.appManager.inMemory.remove(extraDefOne.name),
                glue.appManager.inMemory.remove(newAppName1),
                glue.appManager.inMemory.remove(newAppName2)
            ]))
            .then(ready)
            .catch(done);
    });
});
