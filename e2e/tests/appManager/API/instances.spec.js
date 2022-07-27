describe('instances()', () => {
    const appName = "dummyApp";
    let app;

    before(() => coreReady);

    beforeEach(() => {
        app = glue.appManager.application(appName);
    });

    afterEach(() => gtf.appManager.stopAllOtherInstances());

    it("Should return an array", () => {
        expect(glue.appManager.instances()).to.be.an("array");
    });

    it("Should be an empty array when no app instances are started", () => {
        expect(glue.appManager.instances().length).to.eql(0);
    });

    it('Should be an array with one correct instance when app.start() is invoked', (done) => {
        app.start()
            .then((inst) => {
                expect(glue.appManager.instances().length).to.eql(1);
                expect(glue.appManager.instances()[0].id).to.eql(inst.id);
                expect(glue.appManager.instances()[0].application.name).to.eql(appName);
                done();
            })
            .catch(done);
    });

    it('Should add 3 correct instances when app.start() is invoked 3 times', (done) => {
        Promise.all([app.start(), app.start(), app.start()])
            .then(appInstArr => {
                expect(glue.appManager.instances().length).to.eql(appInstArr.length);
                expect(glue.appManager.instances().filter(inst => appInstArr.some(returnedInst => returnedInst.id === inst.id)).length).to.eql(3);
                done();
            })
            .catch(done);
    });

    it('Should remove one element when an application instance is stopped', (done) => {
        let removedInstId;

        Promise.all([app.start(), app.start(), app.start()])
            .then(([inst1]) => {
                removedInstId = inst1.id;
                return inst1.stop();
            })
            .then(() => {
                expect(glue.appManager.instances().length).to.eql(2);
                expect(glue.appManager.instances().some(inst => inst.id === removedInstId)).to.eql(false);
                done();
            })
            .catch(done);
    });
});
