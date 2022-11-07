describe("getUserChannels()", function () {
    const recommendedFdc3UserChannelSet = ['fdc3.channel.1', 'fdc3.channel.2', 'fdc3.channel.3', 'fdc3.channel.4', 'fdc3.channel.5', 'fdc3.channel.6', 'fdc3.channel.7', 'fdc3.channel.8'];

    before(async() => {
        await coreReady;
    });

    it("Should return a promise", () => {
        const channelsPromise = fdc3.getUserChannels();

        expect(channelsPromise.then).to.be.a("function");
        expect(channelsPromise.catch).to.be.a("function");
    });

    it("Should return an array", async() => {
        const channels = await fdc3.getUserChannels();

        expect(channels).to.be.an("array");
    });

    it("Should return an array of objects with correct key types", async() => {
        const channels = await fdc3.getUserChannels();

        channels.forEach(channel => {
            expect(channel.type).to.be.a("string");
            expect(channel.id).to.be.a("string");
            expect(channel.displayMetadata).to.be.an("object");
        });
    });

    it("Should return an array of objects with correct key types", async() => {
        const channels = await fdc3.getUserChannels();

        channels.forEach(channel => {
            expect(channel.type).to.be.a("string");
            expect(channel.id).to.be.a("string");
            expect(channel.displayMetadata).to.be.an("object");
        });
    });

    it("Should return correct channel objects with type:system", async() => {
        const channels = await fdc3.getUserChannels();

        channels.forEach(ch => expect(ch.type).to.eql("user"));
    });

    it("Should return an array of valid system channels with addContextListener, broadcast and getCurrentContext methods", async() => {
        const channels = await fdc3.getUserChannels();

        channels.forEach(ch => {
            expect(ch.addContextListener).to.be.a("function");
            expect(ch.broadcast).to.be.a("function");
            expect(ch.getCurrentContext).to.be.a("function");
        })
    });

    it("Should have default fdc3 user channels set", async() => {      
        const channels = await fdc3.getUserChannels();

        recommendedFdc3UserChannelSet.forEach(channelName => {
            expect(channels.some(ch => ch.id === channelName)).to.eql(true);
        });
    });

    describe("integration with glue channels", function() {
        it("Should return an array with the same length as the array returned from glue.channels.list()", async() => {
            const fdc3ChannelsLength = (await fdc3.getUserChannels()).length;
    
            const glueChannelsLength = (await glue.channels.list()).length;
    
            expect(fdc3ChannelsLength).to.eql(glueChannelsLength);
        });

        it("Should return correct channel objects with the same id as glueChannel.name ", async() => {
            const fdc3Channels = await fdc3.getUserChannels();
    
            const glueChannels = await glue.channels.list();
    
            fdc3Channels.forEach(ch => expect(glueChannels.find(glueCh => glueCh.meta.fdc3.id === ch.id)).to.not.be.undefined);
        });
    });
});