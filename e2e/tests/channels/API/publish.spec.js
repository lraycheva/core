describe('publish()', () => {
    const channelsPrefix = "___channel___";

    before(() => {
        return coreReady;
    });

    afterEach(async () => {
        return Promise.all([gtf.channels.resetContexts(), glue.channels.leave()]);
    });

    it('Should reject with an error when data isn\'t of type object.', async () => {
        const [channelName] = await gtf.getChannelNames();

        // Join the channel.
        await glue.channels.join(channelName);

        try {
            await glue.channels.publish(1);
            throw new Error('publish() should have thrown an error because data wasn\'t of type object!');
        } catch (error) {
            expect(error.message).to.equal('Cannot publish to channel, because the provided data is not an object!');
        }
    });

    it('Should reject with an error when name is provided, but isn\'t of type string.', async () => {
        const [channelName] = await gtf.getChannelNames();

        // Join the channel.
        await glue.channels.join(channelName);

        // The data to be published.
        const data = {
            test: 42
        };

        try {
            await glue.channels.publish(data, 1);
            throw new Error('publish() should have thrown an error because name wasn\'t of type string!');
        } catch (error) {
            expect(error.message).to.equal('expected a string, got a number');
        }
    });

    it('Should reject with an error when not in a channel.', async () => {
        // The data to be published.
        const data = {
            test: 42
        };

        try {
            await glue.channels.publish(data);
            throw new Error('publish() should have thrown an error because not joined to any channel!');
        } catch (error) {
            expect(error.message).to.equal('Cannot publish to channel, because not joined to a channel!');
        }
    });

    it('Should correctly update the data of the current channel when no name is provided.', async () => {
        const [channelName] = await gtf.getChannelNames();

        // Join the channel.
        await glue.channels.join(channelName);

        // The data to be published.
        const data = {
            test: 42
        };
        // Publish the data.
        await glue.channels.publish(data);

        // The channel context from get().
        const channelContextFromGet = await glue.channels.get(channelName);

        // The channels contexts.
        const channelContexts = await glue.channels.list();

        // The channel context from list().
        const channelContextFromList = channelContexts.find((channelContext) => channelContext.name === channelName);

        expect(channelContextFromGet.data).to.eql(data);
        expect(channelContextFromList.data).to.eql(data);
    });

    it('Should correctly update the data of the provided channel when name is provided.', async () => {
        const [channelName] = await gtf.getChannelNames();

        // The data to be published.
        const data = {
            test: 42
        };

        // Publish the data.
        await glue.channels.publish(data, channelName);

        // The channel context from get().
        const channelContextFromGet = await glue.channels.get(channelName);

        // The channels contexts.
        const channelContexts = await glue.channels.list();

        // The channel context from list().
        const channelContextFromList = channelContexts.find((channelContext) => channelContext.name === channelName);

        expect(channelContextFromGet.data).to.eql(data);
        expect(channelContextFromList.data).to.eql(data);
    });

    it('Should not update the data of the current channel when name is provided.', async () => {
        const [firstChannelName, secondChannelName] = await gtf.getChannelNames();

        // The initial data of the first channel.
        const firstChannelInitialData = {
            test: 24
        };

        // Join the first channel.
        await glue.channels.join(firstChannelName);
        // Publish the data.
        await glue.channels.publish(firstChannelInitialData);

        // The data to be published to the second channel.
        const data = {
            test: 42
        };
        // Publish the data.
        await glue.channels.publish(data, secondChannelName);

        // The channel context from get().
        const firstChannelContextFromGet = await glue.channels.get(firstChannelName);

        // The channels contexts.
        const channelContexts = await glue.channels.list();

        // The channel context from list().
        const firstChannelContextFromList = channelContexts.find((channelContext) => channelContext.name === firstChannelName);

        expect(firstChannelContextFromGet.data).to.eql(firstChannelInitialData);
        expect(firstChannelContextFromList.data).to.eql(firstChannelInitialData);
    });

    it("test FDC3 compliance with glue channels api", async () => {
        const [firstChannelName] = await gtf.getChannelNames();

        const fdc3data = {
            fdc3_client: {
                name: "Peter Smith", id: { email: "peter.smith@company.com" }
            }
        };
        const randomData = { 
            client: { 
                name: "Peter Smith", id: { email: "peter.smith@company.com" } 
            }
        }

        await glue.channels.join(firstChannelName);
        await glue.channels.publish(fdc3data);
        await glue.channels.publish(randomData);

        const { data } = await glue.channels.get(firstChannelName);

        expect(data).to.eql({...fdc3data, ...randomData});
    });

    it("Should not update latest_fdc3_type to the object returned from channels.get() when the updated data is not FDC3", async() => {
        const [firstChannelName] = await gtf.getChannelNames();

        const firstChannelInitialData = {
            test: 24
        };

        await glue.channels.join(firstChannelName);
        await glue.channels.publish(firstChannelInitialData);

        const fdc3data = {
            fdc3_client: {
                fullName: "John Doe",
                age: 55
            }
        };

        await glue.channels.publish(fdc3data);

        const firstChannelContextFromGet = await glue.channels.get(firstChannelName);

        expect(firstChannelContextFromGet.latest_fdc3_type).to.eql(undefined);
    });

    it("Should add latest_fdc3_type to the channel context returned from contexts.get() when the updated data is FDC3", async() => {
        const [firstChannelName] = await gtf.getChannelNames();

        const fdc3data = {
            fdc3_client: {
                name: "Peter Smith", id: { email: "peter.smith@company.com" }
            }
        };
        
        await glue.channels.join(firstChannelName);
        
        await glue.channels.publish(fdc3data);

        const channelsContext = await glue.contexts.get(`${channelsPrefix}${firstChannelName}`);

        expect(channelsContext.latest_fdc3_type).to.not.eql(undefined);
    });
    
    it("Should add the correct latest_fdc3_type to the channel context", async() => {
        const [firstChannelName] = await gtf.getChannelNames();

        const fdc3data = {
            fdc3_client: {
                name: "Peter Smith", id: { email: "peter.smith@company.com" }
            }
        };
        
        await glue.channels.join(firstChannelName);
        
        await glue.channels.publish(fdc3data);

        const channelsContext = await glue.contexts.get(`${channelsPrefix}${firstChannelName}`);

        expect(channelsContext.latest_fdc3_type).to.eql("client");
    });

    it("Should update latest_fdc3_type prop to the channel context when new FDC3 data is published", async() => {
        const [firstChannelName] = await gtf.getChannelNames();

        const fdc3data = {
            fdc3_client: {
                name: "Peter Smith", id: { email: "peter.smith@company.com" }
            }
        };
        
        await glue.channels.join(firstChannelName);
        await glue.channels.publish(fdc3data);

        const newFdc3Data = {
            fdc3_instrument: {
                id: { ticker: 'AAPL' }
            }
        };

        await glue.channels.publish(newFdc3Data);

        const channelsContext = await glue.contexts.get(`${channelsPrefix}${firstChannelName}`);

        expect(channelsContext.latest_fdc3_type).to.eql("instrument");
    })

    it("Should change the existing FDC3 data when it's from the same type ", async() => {
        const [firstChannelName] = await gtf.getChannelNames();

        const fdc3data = {
            fdc3_client: {
                name: "Peter Smith", id: { email: "peter.smith@company.com" }
            }
        };
        
        await glue.channels.join(firstChannelName);
        await glue.channels.publish(fdc3data);

        const newFdc3Data = {
            fdc3_client: {
                name: "John Smith", id:{email: "john.smith@company.com"}
            }
        };

        await glue.channels.publish(newFdc3Data);
        const { data } = await glue.channels.get(firstChannelName);

        expect(data).to.eql(newFdc3Data);
    });

    it("Should not update the existing FDC3 data when it's not from the same type", async() => {
        const [firstChannelName] = await gtf.getChannelNames();

        const fdc3data = {
            fdc3_client: {
                name: "Peter Smith", id: { email: "peter.smith@company.com" }
            }
        };
        
        await glue.channels.join(firstChannelName);
        await glue.channels.publish(fdc3data);

        const newFdc3Data = {
            fdc3_instrument: {
                id: { ticker: 'AAPL' }
            }
        };

        await glue.channels.publish(newFdc3Data);
        const { data } = await glue.channels.get(firstChannelName);

        expect(data).to.eql({ ...fdc3data, ...newFdc3Data});
    });

    it(`Should add correct latest_fdc3_type when the passed FDC3 data has multiple "_" in the key`, async() => {
        const [firstChannelName] = await gtf.getChannelNames();
        const fdc3LatestType = "client_portfolio_test";
        const latestFDC3Type = `fdc3_${fdc3LatestType}`;

        const data = { 
            [latestFDC3Type]: {
                name: "Peter Smith", contact: { email: "peter.smith@company.com" },
                portfolio: { ticker: "aapl", ISIN: "US0378331005", CUSIP: "037833100"}
            }
         };

        await glue.channels.join(firstChannelName);
        await glue.channels.publish(data);

        const contextData = await glue.contexts.get(`${channelsPrefix}${firstChannelName}`);

        expect(contextData.latest_fdc3_type).to.eql(fdc3LatestType);
    });
    
    it("Should throw when publish data with multiple FDC3 keys", (done) => {
        const fdc3IncorrectData = {
            fdc3_client: { name: "John Smith", contact: { email: "john.smith@company.com" }},
            fdc3_address: { street: "ABC Str", no: 5 }
        };

        gtf.getChannelNames()
            .then(([channelName]) => glue.channels.join(channelName))
            .then(() => glue.channels.publish(fdc3IncorrectData))
            .then(() => done("Should have thrown"))
            .catch(err => done());
    });

    it("Should not update the published FDC3 data when it has multiple FDC3 keys", (done) => {
        let channel;
        const fdc3IncorrectData = {
            fdc3_client: { name: "John Smith", contact: { email: "john.smith@company.com" }},
            fdc3_address: { street: "ABC Str", no: 5 }
        };

        gtf.getChannelNames()
            .then(([channelName]) => {
                channel = channelName;
                return glue.channels.join(channelName);
            })
            .then(() => glue.channels.publish(fdc3IncorrectData))
            .then(() => done("should have thrown"))
            .catch(async (err) => {
                const channelData = await glue.channels.get(channel);
                try {
                    expect(channelData.data).to.eql({});
                    done();
                } catch (error) {
                    done(error)
                }
            });
    });

    it.skip(`Should add a top-level key when there's a "." in the FDC3 type`, async () => {
        const [channelName] = await gtf.getChannelNames();

        const fdc3DataKey = "fdc3_fdc3.instrument";
        const fdc3Data = {
            [fdc3DataKey]: {
                name : "Apple",
                id : 
                {  
                    ticker : "aapl",
                    ISIN : "US0378331005",
                    CUSIP : "037833100"
                },
                country: "US"
            }
        }

        await glue.channels.join(channelName);
        await glue.channels.publish(fdc3Data);

        const { data } = await glue.channels.get(channelName);

        expect(Object.keys(data).includes(fdc3DataKey)).to.eql(true);
    });

    it.skip(`Should not nest objects where there's a "." in the FDC3 type`, async() => {
        const [channelName] = await gtf.getChannelNames();

        const fdc3DataKey = "fdc3_fdc3.instrument";
        const data = {
            name : "Apple",
            id : 
            {  
                ticker : "aapl",
                ISIN : "US0378331005",
                CUSIP : "037833100"
            },
            country: "US"
        };

        const fdc3Data = {
            [fdc3DataKey]: data
        };

        await glue.channels.join(channelName);
        await glue.channels.publish(fdc3Data);

        const channelData = await glue.channels.get(channelName);

        expect(channelData.data[fdc3DataKey]).to.eql(data);
    });
});
