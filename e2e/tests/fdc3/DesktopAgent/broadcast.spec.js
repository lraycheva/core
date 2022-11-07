describe("broadcast() ", function () {
    before(async() => {
        await coreReady;
    });

    afterEach(async() => {
        await fdc3.leaveCurrentChannel();
        
        gtf.fdc3.removeActiveListeners();

        await gtf.channels.resetContexts();

        await gtf.fdc3.removeCreatedChannels();
    });

    describe("when invoked in the current app", () => {
        [undefined, null, true, false, () => {}, 42, "", "test", { test: 42 }].forEach(invalidArg => {
            it(`Should throw when the passed context (${JSON.stringify(invalidArg)}) is not a valid context`, (done) => {
                fdc3.getUserChannels()
                    .then(([channel]) => fdc3.joinUserChannel(channel.id))
                    .then(() => fdc3.broadcast(invalidArg))
                    .then(() => done("Should have thrown"))
                    .catch(() => done());
            });
        });
    
        it("Should not broadcast the passed context on any channel when not joined on a channel", async() => {
            const ctx = gtf.fdc3.getContext();
    
            await fdc3.broadcast(ctx);
    
            const allChannels = await fdc3.getSystemChannels();
    
            const allChannelsContexts = await Promise.all(allChannels.map(ch => ch.getCurrentContext()));
    
            allChannelsContexts.forEach(channelCtx => expect(channelCtx).to.eql(null));
        });

        it("Should broadcast the passed context on the current FDC3 channel when it's a system channel", async() => {
            const fdc3Context = gtf.fdc3.getContext();
    
            const [channel] = await fdc3.getUserChannels();
    
            await fdc3.joinUserChannel(channel.id);
    
            await fdc3.broadcast(fdc3Context);
    
            const fdc3Channel = await fdc3.getCurrentChannel();
    
            const broadcastedCtx = await fdc3Channel.getCurrentContext();
    
            expect(fdc3Context).to.eql(broadcastedCtx);
        });

        it("Should not invoke the callback from addContextListener in the current app when subscribed for context updates", async() => {
            const wrapper = gtf.wrapPromise();
    
            const [channel] = await fdc3.getUserChannels();
        
            await fdc3.joinUserChannel(channel.id);
    
            const fdc3Context = { ...gtf.fdc3.getContext(), ...gtf.contexts.generateComplexObject(10) };
    
            const listener = await fdc3.addContextListener(fdc3Context.type, (context) => {
                if (fdc3Context.id === context.id ) {
                    wrapper.reject("Should not have been invoked - addContextListener() should skip updates from current app");
                }
            });
    
            gtf.fdc3.addActiveListener(listener);
    
            await fdc3.broadcast(fdc3Context);
    
            gtf.wait(3000, wrapper.resolve());
    
            await wrapper.promise;
        });
    });

    describe("when invoked in another FDC3 app", function() {
        const supportAppName = 'coreSupport';
        let supportApp;

        beforeEach(async() => {
            supportApp = await gtf.createApp({ name: supportAppName, exposeFdc3: true });
        });

        afterEach(async() => {
            await supportApp.stop();
        });

        [undefined, null, true, false, () => {}, 42, "", "test", { test: 42 }].forEach(invalidArg => {
            it(`Should throw when the passed context (${JSON.stringify(invalidArg)}) is not a valid context`, (done) => {
                fdc3.getUserChannels()
                    .then(([channel]) => supportApp.fdc3.joinUserChannel(channel.id))
                    .then(() => supportApp.fdc3.broadcast(invalidArg))
                    .then(() => done("Should have thrown"))
                    .catch(() => done());
            });
        });
    
        it("Should not broadcast the passed context on any channel when not joined on a channel", async() => {
            const ctx = gtf.fdc3.getContext();
    
            await supportApp.fdc3.broadcast(ctx);
    
            const allChannels = await fdc3.getSystemChannels();
    
            const allChannelsContexts = await Promise.all(allChannels.map(ch => ch.getCurrentContext()));
    
            allChannelsContexts.forEach(channelCtx => expect(channelCtx).to.eql(null));
        });

        it("Should get the correct fdc3 context in the current app when joined on a system channel", async() => {
            const fdc3Context = gtf.fdc3.getContext();

            const [channel] = await fdc3.getUserChannels();

            await fdc3.joinUserChannel(channel.id);

            await supportApp.fdc3.joinUserChannel(channel.id);

            await supportApp.fdc3.broadcast(fdc3Context);

            const currentCh = await fdc3.getCurrentChannel();

            const contextInCurrentChannel = await currentCh.getCurrentContext();

            expect(contextInCurrentChannel).to.eql(fdc3Context);
        });

        it("Should invoke the callback from addContextListener with the passed context when joined on a system channel", async() => {
            const wrapper = gtf.wrapPromise();
    
            const fdc3Context = gtf.fdc3.getContext();
            
            const [channel] = await fdc3.getUserChannels();
    
            await fdc3.joinUserChannel(channel.id);

            const listener = await fdc3.addContextListener(fdc3Context.type, (ctx) => {
                if(ctx.name === fdc3Context.name) {
                    try {
                        expect(ctx).to.eql(fdc3Context);
                        wrapper.resolve();
                    } catch (error) {
                        wrapper.reject(error)
                    }
                }
            });
    
            gtf.fdc3.addActiveListener(listener);

            await supportApp.fdc3.joinUserChannel(channel.id);
    
            await supportApp.fdc3.broadcast(fdc3Context);

            await wrapper.promise;
        });
    });

    describe("integration with glue channels ", function () {
        const channelPrefix = `___channel___`;
        const fdc3Delimiter = "&";
        const fdc3Prefix = "fdc3_";

        it("Should broadcast the passed context as a fdc3 context on the current Glue channel", async() => {
            const fdc3Context = gtf.fdc3.getContext();

            const [fdc3Channel] = await fdc3.getUserChannels();
    
            await fdc3.joinUserChannel(fdc3Channel.id);
    
            await fdc3.broadcast(fdc3Context);

            const glueChannel = (await glue.channels.list()).find(glueChannel => glueChannel.meta.fdc3.id === fdc3Channel.id);

            const { data } = await glue.channels.get(glueChannel.name);

            const fdc3Type = Object.keys(data).map(key => key.split(fdc3Prefix).slice(1).join("_").split(fdc3Delimiter).join("."))[0];

            const parsedChannelsDataToFdc3Ctx = { type: fdc3Type, ...data[Object.keys(data)[0]] };

            expect(fdc3Context).to.eql(parsedChannelsDataToFdc3Ctx);
        });

        it("Should add the new broadcasted context to the current Glue channel data when there's another fdc3 context already published to that channel", async() => {
            const firstFdc3Context = gtf.fdc3.getContext();
            const secondFdc3Context = gtf.fdc3.getContext();

            const [channel] = await fdc3.getUserChannels();
    
            await fdc3.joinUserChannel(channel.id);
    
            await fdc3.broadcast(firstFdc3Context);

            await fdc3.broadcast(secondFdc3Context);

            const glueChannel = (await glue.channels.list()).find(glueChannel => glueChannel.meta.fdc3.id === channel.id);

            const glueChannelWithPrefix = `${channelPrefix}${glueChannel.name}`;

            const { data, latest_fdc3_type } = await glue.contexts.get(glueChannelWithPrefix);

            const parsedType = latest_fdc3_type.split(fdc3Delimiter).join(".");

            const latestPublishedData = { type: parsedType, ...data[`${fdc3Prefix}${latest_fdc3_type}`] };

            const initialFDC3DataArr = Object.entries(data).map(([fdc3Type, dataValue]) => {
                const type = fdc3Type.split("_").slice(1).join("");
                return { type, ...dataValue };
             });
    
            const channelsData = Object.assign({}, ...initialFDC3DataArr, latestPublishedData);

            expect(channelsData).to.eql({ ...firstFdc3Context, ...secondFdc3Context });
        });

        it("Should update an already existing broadcasted FDC3 context to the current Glue channel when the new broadcasted context is of the same type", async() => {
            const firstFdc3Context = {
                type: "fdc3.client",
                date: Date.now().toLocaleString(),
                id: {
                    name: "John Doe",
                    email: 'john.doe@gmail.com'
                }
            };

            const secondFdc3Context = {
                type: "fdc3.client",
                date: Date.now().toLocaleString(),
                id: {
                    name: "Jane Doe",
                    email: 'jane.doe@gmail.com'
                }
            };

            const [channel] = await fdc3.getUserChannels();
    
            await fdc3.joinUserChannel(channel.id);
    
            await fdc3.broadcast(firstFdc3Context);

            await fdc3.broadcast(secondFdc3Context);

            const glueChannel = (await glue.channels.list()).find(glueChannel => glueChannel.meta.fdc3.id === channel.id);

            const glueChannelWithPrefix = `${channelPrefix}${glueChannel.name}`;

            const { data, latest_fdc3_type } = await glue.contexts.get(glueChannelWithPrefix);

            const parsedType = latest_fdc3_type.split(fdc3Delimiter).join(".");

            const channelsData = { type: parsedType, ...data[`${fdc3Prefix}${latest_fdc3_type}`] };

            expect(channelsData).to.eql(secondFdc3Context);
        });
    });
});
