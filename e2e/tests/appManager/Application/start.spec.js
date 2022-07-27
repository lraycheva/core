describe("start() ", function() {
    const appName = "dummyApp";
    let app;

    before(() => coreReady);

    beforeEach(() => {
        app = glue.appManager.application(appName);
    })

    afterEach(() => {
        gtf.clearWindowActiveHooks();

        return Promise.all(glue.appManager.instances().map((inst) => inst.stop()));
    }
    );

    it("Should resolve when invoked with no arguments", async() => {
        await app.start();
    });

    it("Should resolve when invoked with one valid argument", async() => {
        await app.start({ test: 42 });
    });

    it("Should resolve when invoked with two valid arguments", async() => {
        await app.start({ test: 42 }, { height: 400, width: 400 });
    });

    [42, "test", () => {}, Symbol()]
        .forEach(invalidContext => {
            it(`Should reject when invoked with invalid context: ${JSON.stringify(invalidContext)}`, (done) => {
                app.start(invalidContext)
                    .then(() => done("Should not resolve"))
                    .catch(() => done());
            });
        });
    
    it("Should raise app onAppAdded event", (done) => {
        const ready = gtf.waitFor(2, done);

        const un = glue.appManager.onAppAdded(app => {
            if (app.name === appName) {
                ready();
            }
        });

        gtf.addWindowHook(un);

        app.start()
            .then(ready)
            .catch(done);
    });

    it("App should not be present in the instances collection when the promise is rejected due to invalid context", (done) => {
        const invalidContext = 42;

        app.start(invalidContext)
            .then(() => done("Should have not resolved"))
            .catch(() => {
                try {
                    expect(app.instances.length).to.equal(0);
                    done();
                } catch (error) {
                    done(error);
                }
            });
    });

    it("Should add the new instance to the array of app.instances", async() => {
        const initInstLength = app.instances.length;

        await app.start();

        const newInstLength = app.instances.length;

        expect(initInstLength + 1).to.eql(newInstLength);
    });

    it("Should add the application to the array returned from instances()", async() => {
        const instBeforeLength = glue.appManager.instances().length;

        await app.start();

        const instAfterLength = glue.appManager.instances().length;

        expect(instBeforeLength + 1).to.eql(instAfterLength);
    });

    it("Should start the app instance with the passed context", async() => {
        const context = { test: 42 };

        const inst = await app.start(context);
        const instContext = await inst.getContext();

        expect(instContext).to.eql(context);
    });

    it('Should assign different ids to two instances of the same application started at the same time.', async () => {
        const [instanceA, instanceB] = await Promise.all([app.start(), app.start()]);

        expect(app.instances).to.be.of.length(2);
        expect(instanceA.id).to.not.eql(instanceB.id);
    });

    describe("when invoked with startOptions", function() {
        const context = { test: 42 };

        ["height", "width"]
            .forEach(prop => {
                it(`Should start the app the passed property: ${prop}`, async() => {
                    const options = { [prop]: 200 };
        
                    const instId = (await app.start(context, options)).id;
        
                    const win = glue.windows.findById(instId);
                    const bounds = await win.getBounds();
        
                    expect(bounds[prop]).to.eql(options[prop]);
                });
            });

        ["top", "left"]
            .forEach(distance => {
                it(`Should start the app with passed distance from ${distance}`, async() => {
                    const options = { [distance]: 200, height: 200, width: 200 };
    
                    const instId = (await app.start(context, options)).id;
        
                    const win = glue.windows.findById(instId);
                    const bounds = await win.getBounds();

                    expect(bounds[distance]).to.eql(options[distance]);
                    expect(bounds.height).to.eql(200);
                    expect(bounds.width).to.eql(200);
                })
            });

        it("Should start the application with passed bounds", async() => {
            const bounds = { top: 100, left: 100, width: 400, height: 400 };

            const instId = (await app.start(context, { ...bounds } )).id;

            const win = glue.windows.findById(instId);
            const winBounds = await win.getBounds();

            expect(winBounds).to.eql(bounds);
        });
    });
});
