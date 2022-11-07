describe("getInfo() ", function() {
    before(async() => {
        await coreReady;
    });

    it("Should not throw when arguments are passed", async() => {
        await fdc3.getInfo({ test: 42});
    });

    it("Should be async method", async() => {
        const returned = fdc3.getInfo();

        await returned;

        expect(returned.then).to.be.a("function");
        expect(returned.catch).to.be.a("function");
    });

    it("Should return an object", async() => {
        const returned = await fdc3.getInfo();

        expect(returned).to.be.an("object");
    });

    it("Should return an object with fdc3Version and provider properties", async() => {
        const info = await fdc3.getInfo();

        expect(Object.keys(info).includes("fdc3Version")).to.eql(true);
        expect(Object.keys(info).includes("provider")).to.eql(true);
    });

    it("Should return fdc3Version and provider properties as strings", async() => {
        const { fdc3Version, provider } = await fdc3.getInfo();

        expect(fdc3Version).to.be.a("string");
        expect(provider).to.be.a("string");
    });

    it("Should return the correct provider:Glue42", async() => {
        const { provider } = await fdc3.getInfo();

        expect(provider).to.eql("Glue42");
    });
})