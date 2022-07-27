describe("getContext() ", () => {
    const appName = "coreSupport";
    let app;

    before(() => coreReady);

    beforeEach(() => {
        app = glue.appManager.application(appName);
    });

    afterEach(() => Promise.all(glue.appManager.instances().map(inst => inst.stop())));

    it("should be async method", async() => {
        const appInst = await app.start();
        const context = appInst.getContext();

        expect(context.then).to.be.a("function");
        expect(context.catch).to.be.a("function");
    });

    it("should return the correct context", async() => {
        const startContext = { test: 42 };
        const appInst = await app.start(startContext);

        const context = await appInst.getContext();

        expect(context).to.eql(startContext);
    });
});
