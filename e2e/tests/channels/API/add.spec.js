describe('add()', () => {
    const channelsPrefix = "___channel___";

    before(async() => {
        await coreReady;
    });

    afterEach(async() => {
        await gtf.channels.resetContexts();

        const channelNamesWithPrefixes = (await gtf.getChannelNames()).map(channelName => `${channelsPrefix}${channelName}`);

        const contextsToDestroy = glue.contexts.all().filter((contextName) => !channelNamesWithPrefixes.includes(contextName));

        await Promise.all(contextsToDestroy.map(ctxName => glue.contexts.destroy(ctxName)));

    });

    [undefined, null, true, false, 42, "test", [{ test: 42 }], () => {}].forEach((invalidArg) => {
        it(`Should reject when invoked with invalid argument: ${JSON.stringify(invalidArg)}`, (done) => {
            glue.channels.add(invalidArg)
                .then(() => done("Should have thrown"))
                .catch(() => done());
        });
    });

    it('Should reject when info doesn\'t contain a name.', (done) => {
        const info = {
            meta: {
                color: 'red'
            },
            data: {}
        };

        glue.channels.add(info)
            .then(() => done("Should have thrown"))
            .catch(() => done());
    });

    [undefined, null, false, true, 42, { test: 42 }, [], () => {}].forEach(invalidArg => {
        it(`Should reject when info.name is of invalid type (${typeof invalidArg})`, (done) => {
            const info = {
                name: invalidArg,
                meta: {
                    color: 'red'
                },
                data: {}
            };

            glue.channels.add(info)
                .then(() => done("Should have thrown"))
                .catch(() => done());
        });
    });

    it('Should reject when info doesn\'t contain meta', (done) => {
        const info = {
            name: 'redChannel',
            data: {}
        };

        glue.channels.add(info)
            .then(() => done("Should have thrown"))
            .catch(() => done());
    });

    [undefined, null, true, false, 42, "test", [{ test: 42 }], () => {}].forEach((invalidArg) => {
        it(`Should reject when info.meta is of invalid type (${typeof invalidArg})`, (done) => {
            const info = {
                name: 'redChannel',
                meta: invalidArg,
                data: {}
            };

            glue.channels.add(info)
                .then(() => done("Should have thrown"))
                .catch(() => done());
        });
    });

    it('Should reject when info.meta doesn\'t contain color property', (done) => {
        const info = {
            name: 'red',
            meta: {},
            data: {}
        };

        glue.channels.add(info)
            .then(() => done("Should have thrown"))
            .catch(() => done());
    });

    [undefined, null, false, true, 42, { test: 42 }, [], () => {}].forEach(invalidArg => {
        it(`Should reject when info.meta.color is of invalid type (${typeof invalidArg})`, (done) => {
            const info = {
                name: 'redChannel',
                meta: {
                    color: invalidArg
                },
                data: {}
            };

            glue.channels.add(info)
                .then(() => done("Should have thrown"))
                .catch(() => done());
        });
    });

    it("Should not throw when info.data is not passed", async() => {
        const info = {
            name: "redChannel",
            meta: {
                color: "red"
            }
        };

        await glue.channels.add(info);
    });

    it("Should throw when there's an already existing channel with such name", async() => {
        const errorThrownPromise = gtf.wrapPromise();

        const existingName = (await gtf.getChannelNames())[0];

        const info = {
            name: existingName,
            meta: {
                color: "red"
            }
        };

        try {
            await glue.channels.add(info);
            errorThrownPromise.reject("Should have thrown");
        } catch (error) {
            errorThrownPromise.resolve();
        }

        await errorThrownPromise.promise;
    });

    it("Should add one more element to the array returned from glue.contexts.all()", async() => {
        const info = {
            name: "newChannel",
            meta: {
                color: "red"
            }
        };

        const initContextsLength = glue.contexts.all().length;

        await glue.channels.add(info);

        const newContextsLength = glue.contexts.all().length;

        expect(initContextsLength + 1).to.eql(newContextsLength);
    });

    it("Should add a new context with name including channel's prefix and the passed info.name", async() => {
        const info = {
            name: "newChannel",
            meta: {
                color: "red"
            }
        };

        await glue.channels.add(info);
        
        const channelContextName = `${channelsPrefix}${info.name}`;
        
        const contexts = glue.contexts.all();

        expect(contexts.includes(channelContextName)).to.eql(true);
    });

    it("Should add a new context with correct context data", async() => {
        const info = {
            name: "newChannel",
            meta: {
                color: "red"
            },
            data: { test: 42 }
        };

        const channelContextName = `${channelsPrefix}${info.name}`;
        
        await glue.channels.add(info);

        const { data } = await glue.contexts.get(channelContextName);

        expect(data).to.eql(info.data);
    });

    it("Should add one more element to the array returned from glue.channels.all()", async() => {
        const initChannelsLength = (await glue.channels.all()).length;

        const info = {
            name: "newChannel",
            meta: {
                color: "red"
            },
            data: { test: 42 }
        };

        await glue.channels.add(info);

        const newChannelsLength = (await glue.channels.all()).length;

        expect(initChannelsLength + 1).to.eql(newChannelsLength);
    });

    it("Should add one more element to the array returned from glue.channels.list()", async() => {
        const initChannelContexts = (await glue.channels.list()).length;

        const info = {
            name: "newChannel",
            meta: {
                color: "red"
            },
            data: { test: 42 }
        };

        await glue.channels.add(info);

        const newChannelContexts = (await glue.channels.list()).length;

        expect(initChannelContexts + 1).to.eql(newChannelContexts);
    });

    it("Should add a valid channel context to the array returned from glue.channels.list()", async() => {
        const info = {
            name: "newChannel",
            meta: {
                color: "red"
            },
            data: { test: 42 }
        };

        await glue.channels.add(info);

        const channelContexts = await glue.channels.list();

        const channel = channelContexts.find(ch => ch.name === info.name);

        expect(channel).to.not.be.undefined;
        expect(channel).to.eql(info);
    });
});
