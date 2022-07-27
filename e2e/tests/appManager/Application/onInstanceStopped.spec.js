describe("onInstanceStopped() ", () => {
    const appName = "dummyApp";
    let app;
    let appInst;

    before(() => coreReady);

    beforeEach(async () => {
        app = glue.appManager.application(appName);

        appInst = await app.start();
    })

    afterEach(() => {
        gtf.clearWindowActiveHooks();

        return gtf.appManager.stopAllOtherInstances();
    });

    [undefined, null, "", false, 42, "test"].forEach(invalidArg => {
        it(`Should throw an error when the passed argument (${JSON.stringify(invalidArg)}) isn\'t of type function`, (done) => {
            try {
                const un = app.onInstanceStopped(invalidArg);
                gtf.addWindowHook(un);
                done("Should have thrown");
            } catch (error) {
                done();
            }
        });
    });

    it("Should invoke the callback", async() => {
        const onInstanceStoppedHeard = gtf.wrapPromise();
        
        const un = app.onInstanceStopped(() => onInstanceStoppedHeard.resolve());

        gtf.addWindowHook(un);

        await appInst.stop();

        await onInstanceStoppedHeard.promise;
    });

    it("Should invoke the callback with the correct application instance", async() => {
        const onInstanceStoppedHeard = gtf.wrapPromise();

        const un = app.onInstanceStopped((instance) => {
            if (instance.id === appInst.id) {
                onInstanceStoppedHeard.resolve();
            }
        });

        gtf.addWindowHook(un);

        await appInst.stop();

        await onInstanceStoppedHeard.promise;
    });

    it('Should not call the callback when an instance of another application is stopped', (done) => {
        const ready = gtf.waitFor(2, done);

        const un = app.onInstanceStopped(() => {
            done("Should not be invoked");
        });

        gtf.addWindowHook(un);
        
        const supportApp = glue.appManager.application("coreSupport");

        supportApp.start()
            .then(inst => inst.stop())
            .then(ready)
            .catch(done);
        
        gtf.wait(3000, ready);
    });

    it('Should return a function', async () => {
        const returned = app.onInstanceStopped(() => {});

        gtf.addWindowHook(returned);

        expect(returned).to.be.a("function");
    });

    it("Should return a working unsubscribe function", async() => {
        const onInstanceStoppedHeard = gtf.wrapPromise();
        const onInstanceStoppedHeardSecondEvent = gtf.wrapPromise();

        let secondCbInvocationCount = 0;

        const un = app.onInstanceStopped(() => {
            secondCbInvocationCount++;

            onInstanceStoppedHeard.resolve();
        });

        gtf.addWindowHook(un);

        await appInst.stop();

        await onInstanceStoppedHeard.promise;

        un();

        const appInst2 = await app.start();

        await appInst2.stop();
        
        gtf.wait(3000, () => {
            if (secondCbInvocationCount > 1) {
                onInstanceStoppedHeardSecondEvent.reject("Should not have fired the event");
            }

            onInstanceStoppedHeardSecondEvent.resolve()
        });

        await onInstanceStoppedHeardSecondEvent.promise;
    });

    it('Should not invoke the callback when the setup is there but no instance is stopped', (done) => {
        const un = app.onInstanceStopped(() => {
            done("Should not be invoked");
        });

        gtf.addWindowHook(un);

        gtf.wait(3000, done);
    });

    it("Should invoke the callback with the same instance returned from application.start()", async() => {
        const onInstanceStoppedHeard = gtf.wrapPromise();

        let instFromCallback;

        const un = app.onInstanceStopped((inst) => {
            instFromCallback = inst;
            onInstanceStoppedHeard.resolve();
        });

        gtf.addWindowHook(un);
        
        await appInst.stop();

        await onInstanceStoppedHeard.promise;

        expect(appInst.id).to.eql(instFromCallback.id);
        expect(appInst.application.name).to.eql(instFromCallback.application.name);
    });

    it("Should invoke the callback 3 times when 3 instances are stopped", (done) => {
        const ready = gtf.waitFor(4, done);

        const un = app.onInstanceStopped((inst) => {
            if (inst.application.name === appName) {
                ready();
            }
        });

        gtf.addWindowHook(un);

        Promise.all([app.start(), app.start(), app.start()])
            .then(appInstArr => Promise.all(appInstArr.map(inst => inst.stop())))
            .then(ready)
            .catch(done);
    });
});