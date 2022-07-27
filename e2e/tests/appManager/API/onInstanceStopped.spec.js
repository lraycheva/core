describe("onInstanceStopped() ", () => {
    const appName = "dummyApp";
    let app;
    let appInst;

    const supportAppName = 'coreSupport';
    let supportApp;
    let supportInst;

    before(() => coreReady);

    beforeEach(async() => {
        app = glue.appManager.application(appName);

        appInst = await app.start();

        supportApp = glue.appManager.application(supportAppName);

        supportInst = await supportApp.start();
    })

    afterEach(() => {
        gtf.clearWindowActiveHooks();
        
        return gtf.appManager.stopAllOtherInstances();
    });

    [undefined, null, "", false, 42, "test"].forEach(invalidArg => {
        it(`Should throw an error when the passed argument (${JSON.stringify(invalidArg)}) isn\'t of type function`, (done) => {
            try {
                const un = glue.appManager.onInstanceStopped(invalidArg);
                gtf.addWindowHook(un);
                done("Should have thrown");
            } catch (error) {
                done();
            }
        });
    });

    it("Should invoke the callback", async() => {
        const onInstanceStoppedHeard = gtf.wrapPromise();

        const un = glue.appManager.onInstanceStopped((inst) => {
            if (inst.application.name === appName) {
                onInstanceStoppedHeard.resolve();
            }
        });

        gtf.addWindowHook(un);

        await appInst.stop();

        await onInstanceStoppedHeard.promise;
    });

    it("Should invoke the callback with the correct application instance", async() => {
        const onInstanceStoppedHeard = gtf.wrapPromise();

        const un = glue.appManager.onInstanceStopped((instance) => {
            if (instance.id === appInst.id) {
                onInstanceStoppedHeard.resolve();
            }
        });

        gtf.addWindowHook(un);

        await appInst.stop();

        await onInstanceStoppedHeard.promise;
    });

    it('Should return a function', async () => {
        const returned = glue.appManager.onInstanceStopped(() => {});
        
        gtf.addWindowHook(returned);

        expect(returned).to.be.a("function");
    });

    it("Should return a working unsubscribe function", async() => {
        const onInstanceStoppedHeard = gtf.wrapPromise();
        const onInstanceStoppedHeardSecondEvent = gtf.wrapPromise();

         const un = glue.appManager.onInstanceStopped((inst) => {
            if (inst.application.name === appName) {
                onInstanceStoppedHeard.resolve();
            }

            if (inst.application.name === supportAppName) {
                onInstanceStoppedHeardSecondEvent.reject("Should not have fired the event");
            }
        });

        gtf.addWindowHook(un);

        await appInst.stop();

        await onInstanceStoppedHeard.promise;

        un();

        await supportInst.stop();

        gtf.wait(3000, () => onInstanceStoppedHeardSecondEvent.resolve());

        await onInstanceStoppedHeardSecondEvent.promise;
    });

    it('Should not invoke the callback when the setup is there but no instance is stopped', (done) => {
        const un = glue.appManager.onInstanceStopped(() => {
            done("Should not be invoked");
        });

        gtf.addWindowHook(un);

        gtf.wait(3000, done);
    });

    it("Should invoke the callback with the same instance returned from application.start()", async() => {
        const onInstanceStoppedHeard = gtf.wrapPromise();

        let instFromCallback;

        const un = glue.appManager.onInstanceStopped((inst) => {
            instFromCallback = inst;
            onInstanceStoppedHeard.resolve();
        });

        gtf.addWindowHook(un);
        
        await appInst.stop();

        await onInstanceStoppedHeard.promise;

        expect(appInst.id).to.eql(instFromCallback.id);
        expect(appInst.application.name).to.eql(instFromCallback.application.name);
    });

    it("Should invoke the callback 3 times when 3 instances are stopped in parallel", (done) => {
        const ready = gtf.waitFor(4, done);

        app.onInstanceStopped((inst) => {
            if (inst.application.name === appName) {
                ready();
            }
        });

        Promise.all([app.start(), app.start(), app.start()])
            .then(appInstArr => Promise.all(appInstArr.map(inst => inst.stop())))
            .then(ready)
            .catch(done);
    });

    it("Should invoke the callback 3 times when 3 instances are stopped sequentially", (done) => {
        const ready = gtf.waitFor(4, done);

        app.onInstanceStopped((inst) => {
            if (inst.application.name === appName) {
                ready();
            }
        });

        let startedInstances;

        Promise.all([app.start(), app.start(), app.start()])
            .then(appInstArr => {
                startedInstances = appInstArr;

                return startedInstances[0].stop();
            })
            .then(() => startedInstances[1].stop())
            .then(() => startedInstances[2].stop())
            .then(ready)
            .catch(done);
    });
});
