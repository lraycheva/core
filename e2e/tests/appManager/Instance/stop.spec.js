describe("stop() ", () => {
    const appName = "dummyApp";
    let app;

    before(() => coreReady);

    beforeEach(() => {
        app = glue.appManager.application(appName);
    });

    afterEach(() => Promise.all(glue.appManager.instances().map(inst => inst.stop())));

    it("should not return", async() => {
        const inst = await app.start();
        const returned = await inst.stop();

        expect(returned).to.be.undefined;
    });

    it("should raise onInstanceStopped event", (done) => {
        const ready = gtf.waitFor(2, done);
        let instId;

        app.onInstanceStopped((inst) => {
            if (inst.id === instId) {
                ready();
            }
        });

        app.start() 
            .then(inst => {
                instId = inst.id;
                return inst.stop();
            })
            .then(ready)
            .catch(done);
    });

    it("should remove the instance from the array returned from appManager.instances() method", (done) => {
        app.start()
            .then(inst => inst.stop())
            .then(() => {
                const instExists = glue.appManager.instances().some(runningInst => runningInst.id === inst.id);
                expect(instExists).to.eql(false);
                done();
            })
            .catch(done);
    });

    it("should remove the instance from the array returned from app.instances prop", (done) => {
        app.start()
            .then(inst => inst.stop())
            .then(() => {
                const instExists = app.instances.some(runningInst => runningInst.id === inst.id);
                expect(instExists).to.eql(false);
                done();
            })
            .catch(done);
    });
});
