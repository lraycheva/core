describe("properties", () => {
    const extraDefOne = {
        name: "ExtraOne",
        title: "ExtraOne title",
        type: "window",
        icon: "test-icon",
        caption: "#test",
        details: {
            url: "http://localhost:4242/dummyApp/index.html"
        }
    };

    let definitionsOnStart;
    let app;
    const appName = "coreSupport";

    before(async() => {
        await coreReady;

        definitionsOnStart = await glue.appManager.inMemory.export();
    });

    beforeEach(() => {
        app = glue.appManager.application(appName);
    })

    afterEach(async() => {
        await Promise.all(glue.appManager.instances().map(inst => inst.stop()));

        await glue.appManager.inMemory.import(definitionsOnStart, "replace");
    });

    describe("id", () => {
        it("should be defined", async() => {
            const appInst = await app.start();

            expect(appInst.id).to.not.be.undefined;
            expect(appInst.id).to.be.a("string");
        });

        it("should be a correct string", async() => {
            const appInst = await app.start();

            const inst = glue.appManager.instances().find(inst => inst.application.name === appName);

            expect(appInst.id).to.eql(inst.id);
        })
    });

    describe("application", () => {
        it("should be defined", async() => {
            const appInst = await app.start();

            expect(appInst.application).to.not.be.undefined;
        });

        it("should be the correct application", async() => {
            await glue.appManager.inMemory.import([extraDefOne], "replace");

            const appInst = await glue.appManager.application(extraDefOne.name).start();

            expect(appInst.application.name).to.eql(extraDefOne.name);
            expect(appInst.application.title).to.eql(extraDefOne.title);
            expect(appInst.application.caption).to.eql(extraDefOne.caption);
            expect(appInst.application.icon).to.eql(extraDefOne.icon);
            expect(appInst.application.userProperties.details.url).to.eql(extraDefOne.details.url);
        });
    });

    describe("agm", () => {
        it("should be defined", async() => {
            const appInst = await app.start();

            expect(appInst.agm).to.not.be.undefined;
        });

        it('Should be set correctly.', async () => {
            const instance = await app.start();

            expect(instance.agm.application).to.eql(appName);
            expect(instance.agm.applicationName).to.eql(appName);
        });
    });
});