describe('onInstanceStarted()', () => {
    const appName = "dummyApp";
    let app;

    const supportAppName = "coreSupport";
    let supportApp;

    before(() => coreReady);

    beforeEach(() => {
        app = glue.appManager.application(appName);

        supportApp = glue.appManager.application(supportAppName);
    });

    afterEach(() => {
        gtf.clearWindowActiveHooks();

        return gtf.appManager.stopAllOtherInstances();
    });

    [undefined, null, "", false, 42, "test"].forEach(invalidArg => {
        it(`Should throw an error when the passed argument (${JSON.stringify(invalidArg)}) isn\'t of type function`, (done) => {
            try {
                const un = app.onInstanceStarted(invalidArg);
                gtf.addWindowHook(un);
                done("Should have thrown");
            } catch (error) {
                done();
            }
        });
    });

    it("Should invoke the callback", async() => {
        const eventHeard = gtf.wrapPromise();

        const un = app.onInstanceStarted((inst) => {
                eventHeard.resolve();
        });

        gtf.addWindowHook(un);

        await app.start();

        await eventHeard.promise;
    })

    it('Should invoke the callback with the newly started application instance', async() => {
        const eventHeard = gtf.wrapPromise();

        const un = app.onInstanceStarted((instance) => {
            if (instance.application.name === appName) {
                eventHeard.resolve();
            }
        });

        gtf.addWindowHook(un);

        await app.start();

        await eventHeard.promise;
    });

    it('Should not call the callback when an instance of another application is started', (done) => {
        const ready = gtf.waitFor(2, done);

        const un = app.onInstanceStarted(() => {
            done("Should not be invoked");
        });

        gtf.addWindowHook(un);

        supportApp.start().then(ready).catch(done);
        
        gtf.wait(3000, ready);
    });

    it('Should return a function', async () => {
        const returned = app.onInstanceStarted(() => {});

        gtf.addWindowHook(returned);

        expect(returned).to.be.a("function");
    });

    it('Should return a working unsubscribe function', async() => {
        const onInstanceStartedHeard = gtf.wrapPromise();
        const onInstanceStartedHeardSecondEvent = gtf.wrapPromise();
     
        const un = app.onInstanceStarted((inst) => {
            if (inst.application.instances.length === 1 && inst.application.instances.find((appInst) => appInst.id === inst.id)) {
                onInstanceStartedHeard.resolve();
            }

            if (inst.application.instances.length > 1) {
                onInstanceStartedHeardSecondEvent.reject("Should not have fired the event");
            }
        });

        gtf.addWindowHook(un);

        await app.start();

        await onInstanceStartedHeard.promise;

        un();

        await app.start();

        gtf.wait(3000, () => onInstanceStartedHeardSecondEvent.resolve());

        await onInstanceStartedHeardSecondEvent.promise;
    });

    it('Should not invoke the callback when the setup is there but no instance is started', (done) => {
        const un = app.onInstanceStarted(() => {
            done("Should not be invoked");
        });

        gtf.addWindowHook(un);

        gtf.wait(3000, done);
    });

    it("Should invoke the callback with the same instance returned from application.start()", (done) => {
        let instance;

        const un = app.onInstanceStarted((inst) => {
            instance = inst;
        });

        gtf.addWindowHook(un);

        app.start()
            .then((returnedInst) => {
                expect(returnedInst.id).to.eql(instance.id);
                expect(returnedInst.application.name).to.eql(instance.application.name);
                done();
            })
            .catch(done);
    });

    it("Should invoke the callback 3 times when 3 instances are opened", (done) => {
        const ready = gtf.waitFor(4, done);

        const un = app.onInstanceStarted((inst) => {
            if (inst.application.name === appName) {
                ready();
            }
        });

        gtf.addWindowHook(un);

        Promise.all([app.start(), app.start(), app.start()]).then(ready).catch(done);
    });
});
