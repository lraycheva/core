describe('onInstanceStarted() ', () => {
    const appName = 'dummyApp';
    let app;

    const supportAppName = 'coreSupport';
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

    [undefined, null, '', false, 42, 'test'].forEach((invalidArg) => {
        it(`Should throw an error when the passed argument (${JSON.stringify(invalidArg)}) isn\'t of type function`, (done) => {
            try {
                const un = glue.appManager.onInstanceStarted(invalidArg);
                gtf.addWindowHook(un);
                done('Should have thrown');
            } catch (error) {
                done();
            }
        });
    });

    it('Should invoke the callback', async() => {
        const onInstanceStartedHeard = gtf.wrapPromise();

        const un = glue.appManager.onInstanceStarted(() => {
            if (app.name === appName) {
                onInstanceStartedHeard.resolve();
            }
        });

        gtf.addWindowHook(un);

        await app.start();

        await onInstanceStartedHeard.promise;
    });

    it('Should invoke the callback with the correct application instance', async() => {
        const onInstanceStartedHeard = gtf.wrapPromise();

        const un = glue.appManager.onInstanceStarted((instance) => {
            if (instance.application.name === appName) {
                onInstanceStartedHeard.resolve();
            }
        });

        gtf.addWindowHook(un);

        await app.start();

        await onInstanceStartedHeard.promise;
    });

    it('Should return a function', () => {
        const returned = glue.appManager.onInstanceStarted(() => {});

        gtf.addWindowHook(returned);

        expect(returned).to.be.a('function');
    });

    it('Should return a working unsubscribe function', async() => {
        const onInstanceStartedHeard = gtf.wrapPromise();
        const onInstanceStartedHeardSecondEvent = gtf.wrapPromise();

        const un = glue.appManager.onInstanceStarted((inst) => {
            if (inst.application.name === appName) {
                onInstanceStartedHeard.resolve();
            }

            if (inst.application.name === supportAppName) {
                onInstanceStartedHeardSecondEvent.reject("Should not have fired the event");
            }
        });

        gtf.addWindowHook(un);

        firstInstanceId = (await app.start()).id;

        await onInstanceStartedHeard.promise;

        un();

        await supportApp.start();

        gtf.wait(3000, () => onInstanceStartedHeardSecondEvent.resolve());

        await onInstanceStartedHeardSecondEvent.promise;

    });

    it('Should not invoke the callback when the setup is there but no instance is started', (done) => {
        const un = glue.appManager.onInstanceStarted(() => {
            done('Should not be invoked');
        });

        gtf.addWindowHook(un);

        gtf.wait(3000, done);
    });

    it('Should invoke the callback with the same instance returned from application.start()', async() => {
        const onInstanceStartedHeard = gtf.wrapPromise();

        let instFromCallback;
        let instFromAppStartFn;

        const un = glue.appManager.onInstanceStarted((inst) => {
            instFromCallback = inst;
            onInstanceStartedHeard.resolve();
        });

        gtf.addWindowHook(un);

        instFromAppStartFn = await app.start();

        await onInstanceStartedHeard.promise;

        expect(instFromCallback.id).to.eql(instFromAppStartFn.id);
        expect(instFromAppStartFn.application.name).to.eql(instFromCallback.application.name);
    });

    it('Should invoke the callback 3 times when 3 instances are opened', (done) => {
        const ready = gtf.waitFor(4, done);

        const un = glue.appManager.onInstanceStarted(ready);

        gtf.addWindowHook(un);

        Promise.all([app.start(), app.start(), app.start()])
            .then(ready)
            .catch(done);
    });

    it('Should replay by invoking the callback with the previous started instance', (done) => {
        const ready = gtf.waitFor(2, done);

        let startedInst;

        app.start()
            .then((started) => {
                startedInst = started;
            })
            .then(() => {
                const un = glue.appManager.onInstanceStarted((inst) => {
                    if (inst.id === startedInst.id) {
                        ready();
                    }
                });

                gtf.addWindowHook(un);

                ready();
            })
            .catch(done);
    });
});
