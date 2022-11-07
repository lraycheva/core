describe('subscribe()', () => {
    let glueApplication;

    before(() => {
        return coreReady;
    });

    afterEach(async () => {
        const promisesToAwait = [gtf.channels.resetContexts(), glue.channels.leave()];

        if (typeof glueApplication !== "undefined") {
            promisesToAwait.push(glueApplication.stop());

            glueApplication = undefined;
        }

        await Promise.all(promisesToAwait);
    });

    it('Should throw an error when callback isn\'t of type function.', () => {
        try {
            glue.channels.subscribe('string');
            throw new Error('subscribe() should have thrown an error because callback wasn\'t of type function!');
        } catch (error) {
            expect(error.message).to.equal('Cannot subscribe to channels, because the provided callback is not a function!');
        }
    });

    it('Should invoke the callback with the correct data, context (name, meta and data) and updaterId whenever data is published to the current channel by another party.', async () => {
        glueApplication = await gtf.createApp();

        const channel = gtf.getChannelsConfigDefinitions()[0];
        const channelName = channel.name;

        // Join the channel.
        await glue.channels.join(channelName);

        // Subscribe for channel context update.
        const subscriptionPromise = new Promise((resolve) => {
            const unsubscribeFunc = glue.channels.subscribe((data, context, updaterId) => {
                unsubscribeFunc();
                return resolve({
                    data,
                    context,
                    updaterId
                });
            });
        });

        // The data to be published by the other party.
        const data = {
            test: 42
        };
        // Publish the data by the other party.
        await glueApplication.channels.publish(data, channelName);

        // The received channel context update.
        const result = await subscriptionPromise;

        // The expected new context.
        const context = {
            ...channel,
            data
        };

        expect(result.context).to.eql(context);
        expect(result.data).to.eql(data);
        expect(glueApplication.agm.instance.peerId).to.equal(result.updaterId);
    });

    it('Should invoke the callback with the correct data, context (name, meta and data) and updaterId whenever data is published to the current channel by us.', async () => {
        const channel = gtf.getChannelsConfigDefinitions()[0];
        const channelName = channel.name;

        // Join the channel.
        await glue.channels.join(channelName);

        // Subscribe for channel context update.
        const subscriptionPromise = new Promise((resolve) => {
            const unsubscribeFunc = glue.channels.subscribe((data, context, updaterId) => {
                unsubscribeFunc();
                return resolve({
                    data,
                    context,
                    updaterId
                });
            });
        });

        // The data to be published.
        const data = {
            test: 42
        };
        // Publish the data.
        await glue.channels.publish(data);

        // The received channel context update.
        const result = await subscriptionPromise;

        // The expected new context.
        const context = {
            ...channel,
            data
        };

        expect(result.context).to.eql(context);
        expect(result.data).to.eql(data);
        expect(glue.connection.peerId).to.equal(result.updaterId);
    });

    it('Should invoke the callback with the correct data, context (name, meta and data) and updaterId whenever a new channel is joined and data is published to that channel by another party.', async () => {
        glueApplication = await gtf.createApp();

        const [firstChannel, secondChannel] = gtf.getChannelsConfigDefinitions();
        const firstChannelName = firstChannel.name;
        const secondChannelName = secondChannel.name;

        // Join the first channel.
        await glue.channels.join(firstChannelName);

        // After joining the second channel our callback will be called with the current context. We want to skip it and wait for the publish by the other party.
        let secondChannelInitialContextReceived = false;

        // Subscribe for channel context update.
        const subscriptionPromise = new Promise((resolve) => {
            const unsubscribeFunc = glue.channels.subscribe((data, context, updaterId) => {
                if (secondChannelInitialContextReceived) {
                    unsubscribeFunc();
                    return resolve({
                        data,
                        context,
                        updaterId
                    });
                } else {
                    secondChannelInitialContextReceived = true;
                }
            });
        });

        // Join the second channel.
        await glue.channels.join(secondChannelName);

        // The data to be published by the other party.
        const data = {
            test: 42
        };
        // Publish the data by the other party.
        await glueApplication.channels.publish(data, secondChannelName);

        // The received channel context update.
        const result = await subscriptionPromise;

        // The expected new context.
        const context = {
            ...secondChannel,
            data
        };

        expect(result.context).to.eql(context);
        expect(result.data).to.eql(data);
        expect(glueApplication.agm.instance.peerId).to.equal(result.updaterId);
    });

    it('Should invoke the callback with the correct data, context (name, meta and data) and updaterId whenever a new channel is joined and data is published to that channel by us.', async () => {
        const [firstChannel, secondChannel] = gtf.getChannelsConfigDefinitions();
        const firstChannelName = firstChannel.name;
        const secondChannelName = secondChannel.name;

        // Join the first channel.
        await glue.channels.join(firstChannelName);

        // After joining the second channel our callback will be called with the current context. We want to skip it and wait for the publish.
        let secondChannelInitialContextReceived = false;

        // Subscribe for channel context update.
        const subscriptionPromise = new Promise((resolve) => {
            const unsubscribeFunc = glue.channels.subscribe((data, context, updaterId) => {
                if (secondChannelInitialContextReceived) {
                    unsubscribeFunc();
                    return resolve({
                        data,
                        context,
                        updaterId
                    });
                } else {
                    secondChannelInitialContextReceived = true;
                }
            });
        });

        // Join the second channel.
        await glue.channels.join(secondChannelName);

        // The data to be published.
        const data = {
            test: 42
        };
        // Publish the data.
        await glue.channels.publish(data);

        // The received channel context update.
        const result = await subscriptionPromise;

        // The expected new context.
        const context = {
            ...secondChannel,
            data
        };

        expect(result.context).to.eql(context);
        expect(result.data).to.eql(data);
        expect(glue.connection.peerId).to.equal(result.updaterId);
    });

    it('Should return a working unsubscribe function.', async () => {
        const [channelName] = await gtf.getChannelNames();

        // Join the channel.
        await glue.channels.join(channelName);

        // Set to true if we receive any context after unsubscribing.
        let contextReceived = false;

        // Subscribe for channel context update.
        const unsubscribeFunc = glue.channels.subscribe(() => {
            contextReceived = true;
        });
        // Immediately unsubscribe.
        unsubscribeFunc();

        // Promise that will be rejected after 3k ms if we received any context.
        const timeoutPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                if (contextReceived) {
                    return reject('Received context.');
                }

                return resolve();
            }, 3000);
        });

        // The data to be published.
        const data = {
            test: 42
        };
        // Publish the data.
        await glue.channels.publish(data);

        return timeoutPromise;
    });

    it('Should not invoke the callback a second time when the same data is published two times.', async () => {
        const [channelName] = await gtf.getChannelNames();

        // Join the channel.
        await glue.channels.join(channelName);

        // The number of times our callback gets called.
        let numberOfTimesCallbackCalled = 0;

        // Subscribe for channel context update.
        const unsubscribeFunc = glue.channels.subscribe(() => {
            numberOfTimesCallbackCalled++;
        });

        // Promise that will be rejected after 3k ms if we received any more than once.
        const timeoutPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                unsubscribeFunc();
                if (numberOfTimesCallbackCalled !== 1) {
                    return reject('The callback should have been called once.');
                }

                return resolve();
            }, 3000);
        });

        // The data to be published.
        const data = {
            test: 42
        };
        // Publish the data.
        await glue.channels.publish(data);
        // Publish the same data a second time.
        await glue.channels.publish(data);

        return timeoutPromise;
    });

    it('Should not invoke the callback when the setup is there but no data is published (3k ms).', async () => {
        const [channelName] = await gtf.getChannelNames();

        // Join the channel.
        await glue.channels.join(channelName);

        // Set to true if we receive any context.
        let contextReceived = false;

        // Subscribe for channel context update.
        const unsubscribeFunc = glue.channels.subscribe(() => {
            contextReceived = true;
        });

        // Promise that will be rejected after 3k ms if we received any context.
        const timeoutPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                unsubscribeFunc();
                if (contextReceived) {
                    return reject('Received context.');
                }

                return resolve();
            }, 3000);
        });

        return timeoutPromise;
    });

    it("Should invoke the callback when FDC3 data is published", (done) => {
        gtf.getChannelNames()
            .then(([channelName]) => glue.channels.join(channelName))
            .then(() => {
                const unsubscribeFn = glue.channels.subscribe((data) => {
                    if (data.fdc3_client) {
                        done();
                    }
                });

                gtf.addWindowHook(unsubscribeFn);

                return glue.channels.publish({ fdc3_client: { name: "John Smith", id:{ email: "john.smith@company.com" }}});
            })
            .catch(done);
    });

    it("Should invoke the callback 3 times when FDC3 data is updated 3 times", (done) => {
        const ready = gtf.waitFor(3, done);
        const id = Date.now();
        const fdc3Client = {
            id,
            name: "John Smith", 
            contact: { 
                email: "john.smith@company.com" 
            }
        }

        gtf.getChannelNames()
            .then(([channelName]) => glue.channels.join(channelName))
            .then(() => {
                const unsubscribeFn = glue.channels.subscribe((data) => {
                    if (data.fdc3_client && data.fdc3_client.id === id) {
                        ready();
                    }
                });

                gtf.addWindowHook(unsubscribeFn);
                
                return glue.channels.publish({ fdc3_client: fdc3Client});
            })
            .then(() => glue.channels.publish({ fdc3_address: { street: "ABC Str", no: 5 }}))
            .then(() => glue.channels.publish({ fdc3_portfolio: { ticker: "aapl", ISIN: "US0378331005", CUSIP: "037833100"}}))
            .catch(done);
    });

    it("Should invoke the callback with context as a second parameter which has latest_fdc3_type prop when the published data is FDC3", (done) => {
        gtf.getChannelNames()
            .then(([channelName]) => glue.channels.join(channelName))
            .then(() => {
                const unsubscribeFn = glue.channels.subscribe((data, context) => {
                    if (data.fdc3_client) {
                        try {
                            expect(context.latest_fdc3_type).to.eql("client");
                            done();
                        } catch (error) {
                            done(error);
                        }
                    }
                });

                gtf.addWindowHook(unsubscribeFn);

                return glue.channels.publish({ fdc3_client: { name: "John Smith", id:{ email: "john.smith@company.com" }}});
            })
            .catch(done);
    });

    it("Should invoke the callback 3 times with updated latest_fdc3_type prop of the context when publishing 3 times different FDC3 data", (done) => {
        const ready = gtf.waitFor(3, done);
        let invocationCounter = 0;
        const id = Date.now();

        gtf.getChannelNames()
            .then(([channelName]) => glue.channels.join(channelName))
            .then(() => {
                const unsubscribeFn = glue.channels.subscribe((data, context) => {
                    invocationCounter++;
    
                    if (data.id) {
                        try {
                            if (invocationCounter === 1) {
                                expect(context.latest_fdc3_type).to.eql(undefined);
                                ready();
                            }
        
                            if (invocationCounter === 2) {
                                expect(context.latest_fdc3_type).to.eql("portfolio");
                                ready();
                            }
    
                            if (invocationCounter === 3) {
                                expect(context.latest_fdc3_type).to.eql("client");
                                ready();
                            }
                        } catch (error) {
                            done(error);
                        }
                    }
    
                });

                gtf.addWindowHook(unsubscribeFn);
      
                return glue.channels.publish({ id });
            })
            .then(() => glue.channels.publish({ fdc3_portfolio: { ticker: "aapl", ISIN: "US0378331005", CUSIP: "037833100"}}))
            .then(() => glue.channels.publish({ fdc3_client: { name: "John Smith", id:{ email: "john.smith@company.com" }}}))
            .catch(done);
    });

    it("Should not add latest_fdc3_type prop to the second parameter of the callback when the published data is not FDC3", (done) => {
        const id = Date.now();
        const data = { id, test: 42 };

        gtf.getChannelNames()
            .then(([channelName]) => glue.channels.join(channelName))
            .then(() => {
                const unsubscribeFn = glue.channels.subscribe((data, context) => {
                    if (data.id === id) {
                        try {
                            expect(context.latest_fdc3_type).to.eql(undefined);
                            done();
                        } catch (error) {
                            done(error);
                        }
                    }
    
                });

                gtf.addWindowHook(unsubscribeFn);
      
                return glue.channels.publish(data);
            })
            .catch(done);
    });

    it("Should invoke the callback when there's published data on the current channel", async() => {
        const channel = gtf.getChannelsConfigDefinitions()[0];
        const channelName = channel.name;

        await glue.channels.join(channelName);

        const data = { test: 42 };

        await glue.channels.publish(data);

        const subscriptionPromise = new Promise((resolve) => {
            const unsubscribeFn = glue.channels.subscribe((data, context) => {
                unsubscribeFn();
                resolve({ data, context });
            })
        })

        const result = await subscriptionPromise;

        const channelData = await glue.channels.get(channelName)

        expect(result.data).to.eql(data);
        expect(result.context).to.eql({ name: channelName, meta: channelData.meta, data });
    });

    it("Should invoke the callback with the correct data when there's published data on the current channel", async() => {
        const channel = gtf.getChannelsConfigDefinitions()[0];
        const channelName = channel.name;

        await glue.channels.join(channelName);

        const data = { test: 42 };

        const newData = { test: 77 };

        await glue.channels.publish(data);

        await glue.channels.publish(newData);

        const subscriptionPromise = new Promise((resolve) => {
            const unsubscribeFn = glue.channels.subscribe((data, context) => {
                unsubscribeFn();
                resolve({ data, context });
            })
        });

        const result = await subscriptionPromise;

        const channelData = await glue.channels.get(channelName);

        expect(result.data).to.eql(newData);
        expect(result.context).to.eql({ name: channelName, meta: channelData.meta, data: newData});
    });
});
