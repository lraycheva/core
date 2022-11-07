describe("findInstances()", function() {
    const supportAppName = 'coreSupport';

    before(async() => {
        await coreReady;
    });

    afterEach(async() => {
        gtf.clearWindowActiveHooks();

        await Promise.all(glue.appManager.instances().map(inst => inst.stop()));
    });

    it("Should throw an error when invoked with no argument", (done) => {
        fdc3.findInstances()
            .then(() => done("Should have thrown"))
            .catch(() => done());
    });

    [undefined, null, false, true, () => {}, [], "", 42, { test: 42 }].forEach(invalidArg => {
        it(`Should throw when invoked with invalid argument (${JSON.stringify(invalidArg)})`, (done) => {
            fdc3.findInstances(invalidArg)
                .then(() => done("Should have thrown"))
                .catch(() => done());         
        });
    });

    [undefined, null, false, true, () => {}, [], "", 42].forEach(invalidArg => {
        it(`Should throw when invoked with object but the appId prop is of invalid type (${JSON.stringify(invalidArg)})`, (done) => {
            fdc3.findInstances({ appId: invalidArg })
                .then(() => done("Should have thrown"))
                .catch(() => done());
        });
    });

    it("Should throw when there's no application with such ID", (done) => {
        fdc3.findInstances({ appId: "noAppWithSuchName"})
            .then(() => done("Should have thrown"))
            .catch(() => done());
    });

    it("Should return an array", async() => {
        const instances = await fdc3.findInstances({ appId: supportAppName });

        expect(instances).to.be.an("array");
    });

    it("Should return an empty array when there's an app with such ID but no instances are opened", async() => {
        const instances = await fdc3.findInstances({ appId: supportAppName });

        expect(instances.length).to.eql(0);
    });

    it("Should return an array with 1 element when there's one opened instance of the passed application", async() => {
        await fdc3.open({ appId: supportAppName });

        const instances = await fdc3.findInstances({ appId: supportAppName });

        expect(instances.length).to.eql(1);
    });
    
    it("Should return an array with the correct appIdentifier when there's one opened instance of the passed application", async() => {
        const inst = await fdc3.open({ appId: supportAppName });

        const instances = await fdc3.findInstances({ appId: supportAppName });

        expect(instances[0]).to.eql(inst);
    });

    it("Should return an array with 3 correct appIdentifiers when there are 3 opened instances of the passed application", async() => {
        const appIdentifiers = await Promise.all([ fdc3.open({ appId: supportAppName }), fdc3.open({ appId: supportAppName }), fdc3.open({ appId: supportAppName }) ]);

        const instances = await fdc3.findInstances({ appId: supportAppName });

        expect(instances.length).to.eql(3);

        expect(instances.every(inst => inst.appId === supportAppName && appIdentifiers.find(appIdentifier => appIdentifier.instanceId === inst.instanceId))).to.eql(true);
    });
});