describe("createPrivateChannel()", function() {
    const expectedProps = ["id", "type", "broadcast", "addContextListener", "getCurrentContext", "onAddContextListener", "onUnsubscribe", "onDisconnect", "disconnect"];

    before(async() => {
        await coreReady;
    });

    afterEach(async() => {
        await gtf.fdc3.removeCreatedChannels();
    });

    it("Should return an object", async() => {
        const channel = await fdc3.createPrivateChannel();
        expect(channel).to.be.an("object");
    });

    it("Should return an object with id property of type string", async() => {
        const channel = await fdc3.createPrivateChannel();
        expect(channel.id).to.be.a("string");
    });
    
    it("Should return an object with correct type", async() => {
        const channel = await fdc3.createPrivateChannel();
        expect(channel.type).to.eql("private");
    });

    it("Should add one more element to the array returned from glue.contexts.all()", async() => {
        const initialContextsLength = glue.contexts.all().length;

        await fdc3.createPrivateChannel();

        const newContextsLength = glue.contexts.all().length;

        expect(initialContextsLength + 1).to.eql(newContextsLength);
    });

    expectedProps.forEach(prop => {
        it(`Should return a valid object that has the following prop: ${prop}`, async() => {
            const channel = await fdc3.createPrivateChannel();
            const channelKeys = Object.keys(channel);

            expect(channelKeys.includes(prop)).to.eql(true);
        });
    });
});