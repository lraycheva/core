describe("addContextListener() ", function () {
    before(async() => {
        await coreReady;
    });

    afterEach(async() => {
        await fdc3.leaveCurrentChannel();
        
        gtf.fdc3.removeActiveListeners();

        await gtf.fdc3.removeCreatedChannels();

        await gtf.channels.resetContexts();
    });

    it("Should throw when subscribing while not joined on a channel using deprecated addContextListener(handler)", (done) => {
        fdc3.addContextListener(() => {})
            .then(listener => {
                gtf.fdc3.addActiveListener(listener);
                done("Should have thrown");
            })
            .catch(() => done());
    });
    
    it("Should throw when subscribing while not joined on a channel using  addContextListener(null, handler)", (done) => {
        fdc3.addContextListener(null, () => {})
            .then(listener => {
                gtf.fdc3.addActiveListener(listener);
                done("Should have thrown");
            })
            .catch(() => done());
    });
    
    it("Should throw when subscribing while not joined on a channel using addContextListener(contextType, handler)", (done) => {
        fdc3.addContextListener('test', () => {})
            .then(listener => {
                gtf.fdc3.addActiveListener(listener);
                done("Should have thrown");
            })
            .catch(() => done());
    });

    describe("when subscribing while on a system channel", () => {
        let sysChannelNameToJoin;
        let anotherSysChannelNameToJoin;
        let supportApp;

        const supportAppName = "coreSupport";

        beforeEach(async() => {
            const allChannels = await fdc3.getUserChannels();

            sysChannelNameToJoin = allChannels[0].id;
            anotherSysChannelNameToJoin = allChannels[1].id;

            await fdc3.joinUserChannel(sysChannelNameToJoin);

            supportApp = await gtf.createApp({ name: supportAppName, exposeFdc3: true });
            
            await supportApp.fdc3.joinUserChannel(sysChannelNameToJoin);
        });

        afterEach(async() => {
            await supportApp.stop();
        });

        it("Should throw when no argument is passed", (done) => {
            fdc3.addContextListener()
                .then(listener => {
                    gtf.fdc3.addActiveListener(listener);
                    done("Should have thrown");
                })
                .catch(() => done());
        });

        it("Should invoke the callback when support app broadcasts a context", async() => {
            const broadcastedContextHeard = gtf.wrapPromise();

            const fdc3Context = gtf.fdc3.getContext();

            const listener = await fdc3.addContextListener(null, ctx => {
                if (ctx.type === fdc3Context.type) {
                    broadcastedContextHeard.resolve();
                }
            });

            gtf.fdc3.addActiveListener(listener);

            await supportApp.fdc3.broadcast(fdc3Context);

            await broadcastedContextHeard.promise;
        });

        it("Should invoke the callback with the correct context when support app broadcasts a context", async() => {
            const broadcastedContextHeard = gtf.wrapPromise();

            const fdc3Context = gtf.fdc3.getContext();

            const listener = await fdc3.addContextListener(null, ctx => {
                if (ctx.type === fdc3Context.type) {
                    try {
                        expect(ctx).to.eql(fdc3Context);
                        broadcastedContextHeard.resolve();
                    } catch (error) {
                        broadcastedContextHeard.reject(error);
                    }
                }
            });

            gtf.fdc3.addActiveListener(listener);

            await supportApp.fdc3.broadcast(fdc3Context);

            await broadcastedContextHeard.promise;
        });

        describe("using deprecated addContextListener(handler)", () => {
            [undefined, null, true, false, "", 42, { test: 42 }, [], [ { test: 42 }]].forEach(invalidArg => {
                it(`Should throw when an invalid (${JSON.stringify(invalidArg)}) argument is passed`, (done) => {
                    fdc3.addContextListener(invalidArg)
                        .then(listener => {
                            gtf.fdc3.addActiveListener(listener);
                            done("Should have thrown");
                        })
                        .catch(() => done());
                });
            });

            it("Should not throw when invoked with a function as a first arg", async() => {
                const listener = await fdc3.addContextListener(() => {});

                gtf.fdc3.addActiveListener(listener);
            });

            it("Should ignore context updates from current instance", async() => {
                const wrapper = gtf.wrapPromise();

                const fdc3Context = gtf.fdc3.getContext();

                const listener = await fdc3.addContextListener((ctx) => {
                    if (ctx.type === fdc3Context.type) {
                        wrapper.reject("Should not have been invoked");
                    }
                });

                gtf.fdc3.addActiveListener(listener);

                await fdc3.broadcast(fdc3Context);

                gtf.wait(3000, wrapper.resolve);

                await wrapper.promise;
            });

            it("Should return an object", async() => {
                const listener = await fdc3.addContextListener(() => {});
    
                gtf.fdc3.addActiveListener(listener);
    
                expect(listener).to.be.an("object");
            });
    
            it("Should return a valid listener (object with unsubscribe function)", async() => {
                const listener = await fdc3.addContextListener(() => {});
    
                gtf.fdc3.addActiveListener(listener);
    
                expect(listener.unsubscribe).to.be.a("function");
            });

            it("Should invoke the callback for different context types", async() => {
                const firstContextHeard = gtf.wrapPromise();
                const secondContextHeard = gtf.wrapPromise();

                const firstContextToBroadcast = gtf.fdc3.getContext();
                const secondContextToBroadcast = gtf.fdc3.getContext();

                const listener = await fdc3.addContextListener((ctx) => {
                    if (ctx.name === firstContextToBroadcast.name) {
                        firstContextHeard.resolve();
                    }

                    if (ctx.name === secondContextToBroadcast.name) {
                        secondContextHeard.resolve();
                    }
                });

                gtf.fdc3.addActiveListener(listener);

                await supportApp.fdc3.broadcast(firstContextToBroadcast);

                await firstContextHeard.promise;

                await supportApp.fdc3.broadcast(secondContextToBroadcast);

                await secondContextHeard.promise;
            });

            it("Should invoke the callback in another system channel", async() => {
                const currentChannelContextHeard = gtf.wrapPromise();
                const anotherChannelContextNotHeard = gtf.wrapPromise();
    
                const currentChannelContextToBroadcast = gtf.fdc3.getContext();
                const anotherChannelContextToBroadcast = gtf.fdc3.getContext();

                const listener = await fdc3.addContextListener((ctx) => {
                    if (ctx.name === currentChannelContextToBroadcast.name) {
                        currentChannelContextHeard.resolve();
                    }

                    if (ctx.name === anotherChannelContextToBroadcast.name) {
                        anotherChannelContextNotHeard.resolve();
                    }
                });

                gtf.fdc3.addActiveListener(listener);

                // support app broadcasts a context on the current channel
                await supportApp.fdc3.broadcast(currentChannelContextToBroadcast);

                await currentChannelContextHeard.promise;

                 // current app joins another system channel
                await fdc3.joinUserChannel(anotherSysChannelNameToJoin);

                // support app joins another system channel
                await supportApp.fdc3.joinUserChannel(anotherSysChannelNameToJoin); 

                // support app broadcasts context on the other system channel
                await supportApp.fdc3.broadcast(anotherChannelContextToBroadcast);

                await anotherChannelContextNotHeard.promise;
            });

            it("Should stop invoking the callback after invoking listener.unsubscribe()", async() => {
                const contextHeard = gtf.wrapPromise();
                const contextNotHeard = gtf.wrapPromise();

                const firstContext = gtf.fdc3.getContext();
                const secondContext = gtf.fdc3.getContext();
    
                const listener = await fdc3.addContextListener(async(ctx) => {
                    if (ctx.type === firstContext.type) {
                        contextHeard.resolve();
                    }

                    if (ctx.type === secondContext.type) {
                        contextNotHeard.reject("Should not have fires");
                    }
                });
    
                gtf.fdc3.addActiveListener(listener);
    
                await supportApp.fdc3.broadcast(firstContext);
    
                await contextHeard.promise;
        
                listener.unsubscribe();
    
                await supportApp.fdc3.broadcast(secondContext);
                
                gtf.wait(3000, contextNotHeard.resolve);
    
                await contextNotHeard.promise;
            });

            it("Should invoke the callback with the correct context if the function is called after the app has already joined a channel and the channel already contains context", async() => {
                const contextHeard = gtf.wrapPromise();

                const context = gtf.fdc3.getContext();

                await supportApp.fdc3.broadcast(context);

                const listener = await fdc3.addContextListener((ctx) => {
                    if (ctx.type === context.type) {
                        try {
                            expect(ctx).to.eql(context);
                            contextHeard.resolve();
                        } catch (error) {
                            contextHeard.reject(error);
                        }
                    }
                });

                gtf.fdc3.addActiveListener(listener);

                await contextHeard.promise;
            });

            it("Should invoke the callback with metadata as a second argument", async() => {
                const metadataHeard = gtf.wrapPromise();

                const fdc3Context = gtf.fdc3.getContext();

                const listener = await fdc3.addContextListener((ctx, metadata) => {
                    if (ctx.type === fdc3Context.type) {
                        try {
                            expect(metadata).to.not.be.undefined;
                            metadataHeard.resolve();
                        } catch (error) {
                            metadata.reject("Metadata is not defined");
                        }
                    }
                });
    
                gtf.fdc3.addActiveListener(listener);

                await supportApp.fdc3.broadcast(fdc3Context);

                await metadataHeard.promise;
            });
            
            it("Should invoke the callback with the correct metadata type (object)", async() => {
                const metadataHeard = gtf.wrapPromise();

                const fdc3Context = gtf.fdc3.getContext();

                const listener = await fdc3.addContextListener((ctx, metadata) => {
                    if (ctx.type === fdc3Context.type) {
                        try {
                            expect(metadata).to.be.an("object");
                            expect(metadata.source).to.be.an("object");
                            metadataHeard.resolve();
                        } catch (error) {
                            metadata.reject(error);
                        }
                    }
                });
    
                gtf.fdc3.addActiveListener(listener);

                await supportApp.fdc3.broadcast(fdc3Context);

                await metadataHeard.promise;
            });

            it("Should invoke the callback with the correct metadata", async() => {
                const metadataHeard = gtf.wrapPromise();

                const fdc3Context = gtf.fdc3.getContext();

                const listener = await fdc3.addContextListener((ctx, metadata) => {
                    if (ctx.type === fdc3Context.type) {
                        try {
                            const { appId } = metadata.source;
                            expect(appId).to.eql(supportAppName);
                            metadataHeard.resolve();
                        } catch (error) {
                            metadata.reject(error);
                        }
                    }
                });
    
                gtf.fdc3.addActiveListener(listener);

                await supportApp.fdc3.broadcast(fdc3Context);

                await metadataHeard.promise;
            });
        });

        describe("using addContextListener(null, handler)", () => {
            [undefined, null, true, false, "", 42, { test: 42 }, [], [ { test: 42 }]].forEach(invalidArg => {
                it(`Should throw when first passed arg is valid (null) but the second arg (${JSON.stringify(invalidArg)}) is not of type function`, (done) => {
                    fdc3.addContextListener(null, invalidArg)
                        .then(listener => {
                            gtf.fdc3.addActiveListener(listener);
                            done("Should have thrown");
                        })
                        .catch(() => done());
                });
            });

            it("Should not throw when invoked with null and a function as arguments", async() => {
                const listener = await fdc3.addContextListener(null, () => {});

                gtf.fdc3.addActiveListener(listener);
            });

            it("Should ignore context updates from current instance", async() => {
                const wrapper = gtf.wrapPromise();

                const fdc3Context = gtf.fdc3.getContext();

                const listener = await fdc3.addContextListener(null, (ctx) => {
                    if (ctx.type === fdc3Context.type) {
                        wrapper.reject("Should not have been invoked");
                    }
                });

                gtf.fdc3.addActiveListener(listener);

                await fdc3.broadcast(fdc3Context);

                gtf.wait(3000, wrapper.resolve);

                await wrapper.promise;
            });

            it("Should return an object", async() => {
                const listener = await fdc3.addContextListener(null, () => {});
    
                gtf.fdc3.addActiveListener(listener);
    
                expect(listener).to.be.an("object");
            });
    
            it("Should return a valid listener (object with unsubscribe function)", async() => {
                const listener = await fdc3.addContextListener(null, () => {});
    
                gtf.fdc3.addActiveListener(listener);
    
                expect(listener.unsubscribe).to.be.a("function");
            });

            it("Should invoke the callback for different context types", async() => {
                const firstContextHeard = gtf.wrapPromise();
                const secondContextHeard = gtf.wrapPromise();

                const firstContextToBroadcast = gtf.fdc3.getContext();
                const secondContextToBroadcast = gtf.fdc3.getContext();

                const listener = await fdc3.addContextListener(null, (ctx) => {
                    if (ctx.type === firstContextToBroadcast.type) {
                        firstContextHeard.resolve();
                    }

                    if (ctx.type === secondContextToBroadcast.type) {
                        secondContextHeard.resolve();
                    }
                });

                gtf.fdc3.addActiveListener(listener);

                await supportApp.fdc3.broadcast(firstContextToBroadcast);

                await firstContextHeard.promise;

                await supportApp.fdc3.broadcast(secondContextToBroadcast);

                await secondContextHeard.promise;
            });

            it("Should invoke the callback in another system channel", async() => {
                const currentChannelContextHeard = gtf.wrapPromise();
                const anotherChannelContextNotHeard = gtf.wrapPromise();
    
                const currentChannelContextToBroadcast = gtf.fdc3.getContext();
                const anotherChannelContextToBroadcast = gtf.fdc3.getContext();

                const listener = await fdc3.addContextListener(null, (ctx) => {
                    if (ctx.name === currentChannelContextToBroadcast.name) {
                        currentChannelContextHeard.resolve();
                    }

                    if (ctx.name === anotherChannelContextToBroadcast.name) {
                        anotherChannelContextNotHeard.resolve();
                    }
                });

                gtf.fdc3.addActiveListener(listener);

                // support app broadcasts a context on the current channel
                await supportApp.fdc3.broadcast(currentChannelContextToBroadcast);

                await currentChannelContextHeard.promise;

                 // current app joins another system channel
                await fdc3.joinUserChannel(anotherSysChannelNameToJoin);

                // support app joins another system channel
                await supportApp.fdc3.joinUserChannel(anotherSysChannelNameToJoin); 

                // support app broadcasts context on the other system channel
                await supportApp.fdc3.broadcast(anotherChannelContextToBroadcast);

                await anotherChannelContextNotHeard.promise;
            });

            it("Should stop invoking the callback after invoking listener.unsubscribe()", async() => {
                const contextHeard = gtf.wrapPromise();
                const contextNotHeard = gtf.wrapPromise();
    
                const firstContext = gtf.fdc3.getContext();
                const secondContext = gtf.fdc3.getContext();
    
                const listener = await fdc3.addContextListener(null, async(ctx) => {
                    if (ctx.type === firstContext.type) {
                        contextHeard.resolve();
                    }

                    if (ctx.type === secondContext.type) {
                        contextNotHeard.reject("Should not have fired");
                    }
                });
    
                gtf.fdc3.addActiveListener(listener);
    
                listener.unsubscribe();

                await supportApp.fdc3.broadcast(secondContext);
                
                gtf.wait(3000, contextNotHeard.resolve);
    
                await contextNotHeard.promise;
            });

            it("Should invoke the callback with the correct context if the function is called after the app has already joined a channel and the channel already contains context", async() => {
                const contextHeard = gtf.wrapPromise();

                const context = gtf.fdc3.getContext();

                await supportApp.fdc3.broadcast(context);

                const listener = await fdc3.addContextListener(null, (ctx) => {
                    if (ctx.type === context.type) {
                        try {
                            expect(ctx).to.eql(context);
                            contextHeard.resolve();
                        } catch (error) {
                            contextHeard.reject(error);
                        }
                    }
                });

                gtf.fdc3.addActiveListener(listener);

                await contextHeard.promise;
            });

            it("Should invoke the callback with metadata as a second argument", async() => {
                const metadataHeard = gtf.wrapPromise();

                const fdc3Context = gtf.fdc3.getContext();

                const listener = await fdc3.addContextListener(null, (ctx, metadata) => {
                    if (ctx.type === fdc3Context.type) {
                        try {
                            expect(metadata).to.not.be.undefined;
                            metadataHeard.resolve();
                        } catch (error) {
                            metadata.reject("Metadata is not defined");
                        }
                    }
                });
    
                gtf.fdc3.addActiveListener(listener);

                await supportApp.fdc3.broadcast(fdc3Context);

                await metadataHeard.promise;
            });
            
            it("Should invoke the callback with the correct metadata type (object)", async() => {
                const metadataHeard = gtf.wrapPromise();

                const fdc3Context = gtf.fdc3.getContext();

                const listener = await fdc3.addContextListener(null, (ctx, metadata) => {
                    if (ctx.type === fdc3Context.type) {
                        try {
                            expect(metadata).to.be.an("object");
                            expect(metadata.source).to.be.an("object");
                            metadataHeard.resolve();
                        } catch (error) {
                            metadata.reject(error);
                        }
                    }
                });
    
                gtf.fdc3.addActiveListener(listener);

                await supportApp.fdc3.broadcast(fdc3Context);

                await metadataHeard.promise;
            });

            it("Should invoke the callback with the correct metadata", async() => {
                const metadataHeard = gtf.wrapPromise();

                const fdc3Context = gtf.fdc3.getContext();

                const listener = await fdc3.addContextListener(null, (ctx, metadata) => {
                    if (ctx.type === fdc3Context.type) {
                        try {
                            const { appId } = metadata.source;
                            expect(appId).to.eql(supportAppName);
                            metadataHeard.resolve();
                        } catch (error) {
                            metadata.reject(error);
                        }
                    }
                });
    
                gtf.fdc3.addActiveListener(listener);

                await supportApp.fdc3.broadcast(fdc3Context);

                await metadataHeard.promise;
            });
        });

        describe("using addContextListener(string, handler)", () => {
            [undefined, null, true, "", 42, { test: 42 }, [], [ { test: 42 }]].forEach(invalidArg => {
                it(`Should throw when first passed arg is valid (string) but the second arg (${JSON.stringify(invalidArg)}) is not of type function`, (done) => {
                    fdc3.addContextListener("fdc3.test", invalidArg)
                        .then(listener => {
                            gtf.fdc3.addActiveListener(listener);
                            done("Should have thrown");
                        })
                        .catch(() => done());
                });
            });
            
            it("Should not throw when invoked with a string and a function as arguments", async() => {
                const listener = await fdc3.addContextListener("fdc3.test", () => {});

                gtf.fdc3.addActiveListener(listener);
            });

            it("Should ignore context updates from current instance", async() => {
                const wrapper = gtf.wrapPromise();

                const fdc3Context = gtf.fdc3.getContext();

                const listener = await fdc3.addContextListener("fdc3.test", (ctx) => {
                    if (ctx.type === fdc3Context.type) {
                        wrapper.reject("Should not have been invoked");
                    }
                });

                gtf.fdc3.addActiveListener(listener);

                await fdc3.broadcast(fdc3Context);

                gtf.wait(3000, wrapper.resolve);

                await wrapper.promise;
            });

            it("Should return an object", async() => {
                const listener = await fdc3.addContextListener("fdc3.test", () => {});
    
                gtf.fdc3.addActiveListener(listener);
    
                expect(listener).to.be.an("object");
            });
    
            it("Should return a valid listener (object with unsubscribe function)", async() => {
                const listener = await fdc3.addContextListener("fdc3.test", () => {});
    
                gtf.fdc3.addActiveListener(listener);
    
                expect(listener.unsubscribe).to.be.a("function");
            });

            it("Should invoke the callback only when broadcasting a context of the specified type", async() => {
                const contextHeard = gtf.wrapPromise();
                const contextNotHeard = gtf.wrapPromise();

                const firstContextToBroadcast = gtf.fdc3.getContext();
                const secondContextToBroadcast = gtf.fdc3.getContext();

                const listener = await fdc3.addContextListener(firstContextToBroadcast.type, (ctx) => {
                    if (ctx.name === firstContextToBroadcast.name) {
                        contextHeard.resolve();
                        return;
                    }

                    contextNotHeard.reject("Should not have been invoked");
                });

                gtf.fdc3.addActiveListener(listener);

                await supportApp.fdc3.broadcast(firstContextToBroadcast);

                await contextHeard.promise;

                await supportApp.fdc3.broadcast(secondContextToBroadcast);

                gtf.wait(3000, contextNotHeard.resolve);

                await contextNotHeard.promise;
            });

            it("Should invoke the callback in another system channel", async() => {
                const contextHeard = gtf.wrapPromise();
                const contextNotHeard = gtf.wrapPromise();

                const contextType = "fdc3.context.type";
    
                const firstContext = { ...gtf.fdc3.getContext(), type: contextType };
                const secondContext = { ...gtf.fdc3.getContext(), type: contextType };;

                const listener = await fdc3.addContextListener(contextType, (ctx) => {
                    if (ctx.name === firstContext.name) {
                        contextHeard.resolve();
                    }

                    if (ctx.name === secondContext.name) {
                        contextNotHeard.resolve();
                    }
                });

                gtf.fdc3.addActiveListener(listener);

                // support app broadcasts a context on the current channel
                await supportApp.fdc3.broadcast(firstContext);

                await contextHeard.promise;

                // current app joins another system channel
                await fdc3.joinUserChannel(anotherSysChannelNameToJoin);

                // support app joins another system channel
                await supportApp.fdc3.joinUserChannel(anotherSysChannelNameToJoin); 

                // support app broadcasts context on the other system channel
                await supportApp.fdc3.broadcast(secondContext);
               
                await contextNotHeard.promise;
            });

            it("Should stop invoking the callback after invoking listener.unsubscribe()", async() => {
                const contextHeard = gtf.wrapPromise();
                const contextNotHeard = gtf.wrapPromise();

                const contextType = "fdc3.context.type";
                const firstContext = { ...gtf.fdc3.getContext(), type: contextType };
                const secondContext = { ...gtf.fdc3.getContext(), type: contextType };
    
                const listener = await fdc3.addContextListener(firstContext.type, async(ctx) => {
                    if (ctx.name === firstContext.name) {
                        contextHeard.resolve();
                    }

                    if (ctx.name === secondContext.name) {
                        contextNotHeard.reject("Should not have fired");
                    }
                });
    
                gtf.fdc3.addActiveListener(listener);
    
                await supportApp.fdc3.broadcast(firstContext);
    
                await contextHeard.promise;
        
                listener.unsubscribe();
    
                await supportApp.fdc3.broadcast(secondContext);
                
                gtf.wait(3000, contextNotHeard.resolve);
    
                await contextNotHeard.promise;
            });

            it("Should invoke the callback with the correct context if the function is called after the app has already joined a channel and the channel already contains context", async() => {
                const contextHeard = gtf.wrapPromise();

                const context = gtf.fdc3.getContext();

                await supportApp.fdc3.broadcast(context);

                const listener = await fdc3.addContextListener(context.type, (ctx) => {
                    if (ctx.name === context.name) {
                        try {
                            expect(ctx).to.eql(context);
                            contextHeard.resolve();
                        } catch (error) {
                            contextHeard.reject(error);
                        }
                    }
                });

                gtf.fdc3.addActiveListener(listener);

                await contextHeard.promise;
            });

            it("Should invoke the callback with metadata as a second argument", async() => {
                const metadataHeard = gtf.wrapPromise();

                const fdc3Context = gtf.fdc3.getContext();

                const listener = await fdc3.addContextListener(fdc3Context.type, (ctx, metadata) => {
                    if (ctx.name === fdc3Context.name) {
                        try {
                            expect(metadata).to.not.be.undefined;
                            metadataHeard.resolve();
                        } catch (error) {
                            metadata.reject("Metadata is not defined");
                        }
                    }
                });
    
                gtf.fdc3.addActiveListener(listener);

                await supportApp.fdc3.broadcast(fdc3Context);

                await metadataHeard.promise;
            });
            
            it("Should invoke the callback with the correct metadata type (object)", async() => {
                const metadataHeard = gtf.wrapPromise();

                const fdc3Context = gtf.fdc3.getContext();

                const listener = await fdc3.addContextListener(fdc3Context.type, (ctx, metadata) => {
                    if (ctx.name === fdc3Context.name) {
                        try {
                            expect(metadata).to.be.an("object");
                            expect(metadata.source).to.be.an("object");
                            metadataHeard.resolve();
                        } catch (error) {
                            metadata.reject(error);
                        }
                    }
                });
    
                gtf.fdc3.addActiveListener(listener);

                await supportApp.fdc3.broadcast(fdc3Context);

                await metadataHeard.promise;
            });

            it("Should invoke the callback with the correct metadata", async() => {
                const metadataHeard = gtf.wrapPromise();

                const fdc3Context = gtf.fdc3.getContext();

                const listener = await fdc3.addContextListener(fdc3Context.type, (ctx, metadata) => {
                    if (ctx.name === fdc3Context.name) {
                        try {
                            const { appId } = metadata.source;
                            expect(appId).to.eql(supportAppName);
                            metadataHeard.resolve();
                        } catch (error) {
                            metadata.reject(error);
                        }
                    }
                });
    
                gtf.fdc3.addActiveListener(listener);

                await supportApp.fdc3.broadcast(fdc3Context);

                await metadataHeard.promise;
            });
        });
    });
});