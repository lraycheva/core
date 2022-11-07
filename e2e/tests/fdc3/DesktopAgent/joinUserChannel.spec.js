describe("joinUserChannel() ", function () {
    before(async() => {
        await coreReady;
    });

    afterEach(async() => {
        await fdc3.leaveCurrentChannel();
        
        await gtf.fdc3.removeCreatedChannels();
    });

    [undefined, null, false, true, () => {}, [], "", 42].forEach(invalidArg => {
        it(`Should throw when invoked with invalid argument (${JSON.stringify(invalidArg)})`, (done) => {
            fdc3.joinUserChannel(invalidArg)
                .then(() => done("Should have thrown"))
                .catch(() => done());         
        });
    });

    it("Should throw when invoked with no arguments", (done) => {
        fdc3.joinUserChannel()
            .then(() => done("Should have thrown"))
            .catch(() => done());
    });

    it("Should throw when there's no channel with passed name", (done) => {
        fdc3.joinUserChannel("noSuchChannel")
            .then(() => done("Should have thrown"))
            .catch(() => done());
    });

    it("Should join the passed system channel", async() => {
        const [ channel ] = await fdc3.getSystemChannels();
        const channelName = channel.id;

        await fdc3.joinUserChannel(channelName);

        const current = await fdc3.getCurrentChannel();

        expect(current).to.eql(channel);
    });

    it("Should not join a channel when there's no channel with passed name", async() => {
        const errorThrownPromise = gtf.wrapPromise();
        
        try {
            await fdc3.joinUserChannel("nonExistingChannel");
            errorThrownPromise.reject("Should have thrown");
        } catch (error) {
            errorThrownPromise.resolve();
        }

        await errorThrownPromise.promise;

        const current = await fdc3.getCurrentChannel();

        expect(current).to.eql(null);
    });

    describe("integration with glue channels", function() {
        it("Should join the passed glue channel", async() => {
            const [channel] = await fdc3.getSystemChannels();
            const fdc3ChannelName = channel.id;

            const glueChannels = await glue.channels.list();
            const glueChannelWithFdc3Id = glueChannels.find(channel => channel.meta.fdc3 && channel.meta.fdc3.id === fdc3ChannelName);

            await fdc3.joinUserChannel(fdc3ChannelName);
    
            const current = glue.channels.my();
    
            expect(current).to.eql(glueChannelWithFdc3Id.name);
        });

        it("Should not join a glue channel when there's no channel with passed name", async() => {
            const errorThrownPromise = gtf.wrapPromise();
        
            try {
                await fdc3.joinUserChannel("nonExistingChannel");
                errorThrownPromise.reject("Should have thrown");
            } catch (error) {
                errorThrownPromise.resolve();
            }
    
            await errorThrownPromise.promise;
    
            const current = glue.channels.current();
    
            expect(current).to.be.undefined;
        });
    });
});