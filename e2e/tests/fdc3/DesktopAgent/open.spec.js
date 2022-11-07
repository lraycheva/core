describe("open() ", function() {
    const supportAppName = "coreSupport";

    before(async() => {
        await coreReady;
    });

    afterEach(async() => {
        gtf.clearWindowActiveHooks();

        await Promise.all(glue.appManager.instances().map(inst => inst.stop()));
    });

    it("Should throw when invoked with no arguments", (done) => {
        fdc3.open()
            .then(() => done("Should have thrown"))
            .catch(() => done());
    });

    [undefined, null, false, true, () => {}, [], "", 42].forEach(invalidArg => {
        it(`Should throw when invoked with invalid argument (${JSON.stringify(invalidArg)})`, (done) => {
            fdc3.open(invalidArg)
                .then(() => done("Should have thrown"))
                .catch(() => done());         
        });
    });
    
    [undefined, null, false, true, () => {}, [], "", 42].forEach(invalidArg => {
        it(`Should throw when invoked with object but the name prop is invalid type (${JSON.stringify(invalidArg)})`, (done) => {
            fdc3.open({ name: invalidArg })
                .then(() => done("Should have thrown"))
                .catch(() => done());
        });
    });

    it("Should throw when invoked with string as an argument but there's no app with such name", (done) => {
        fdc3.open("noAppWithSuchName")
            .then(() => done("Should have thrown"))
            .catch(() => done());
    });
    
    it("Should not throw when invoked with a valid first argument ({ appId: string })", async() => {
        await fdc3.open({ appId: supportAppName });
    });

    [true, () => {}, [], { test: 42 }, "test", 42].forEach(invalidArg => {
        it(`Should throw when invoked with an existing app as a first arg(string) but invalid context (${JSON.stringify(invalidArg)}) as a second arg`, (done) => {
            fdc3.open(supportAppName, invalidArg)
                .then(() => done("Should have thrown"))
                .catch(() => done());         
        });

        it(`Should throw when invoked with an existing app as a first arg(object) but invalid context (${JSON.stringify(invalidArg)}) as a second arg`, (done) => {
            fdc3.open({ name: supportAppName }, invalidArg)
                .then(() => done("Should have thrown"))
                .catch(() => done());         
        });
    });

    describe("when invoked with a valid first argument of type string", async() => {
        it("Should not throw", async() => {
            await fdc3.open(supportAppName);
        });  

        it("Should be async", async() => {
            const res = fdc3.open(supportAppName);
            
            expect(res.then).to.be.a("function");
            expect(res.catch).to.be.a("function");

            await res;
        });

        it("Should return an object", async() => {
            const returned = await fdc3.open(supportAppName);

            expect(returned).to.be.an("object");
        });

        it("Should return a valid AppIdentifier", async() => {
            const returned = await fdc3.open(supportAppName);

            expect(returned.appId).to.eql(supportAppName);
            expect(returned.instanceId).to.be.a('string');
        })

        it("Should add one more element to the array returned from glue.appManager.instances()", async() => {
            const initLength = glue.appManager.instances().length;
    
            await fdc3.open(supportAppName);
    
            const newLength = glue.appManager.instances().length;
    
            expect(initLength + 1).to.eql(newLength);
        });

        it("Should open a new instance of the passed application", async() => {
            const instanceOpened = gtf.wrapPromise();

            const un = glue.appManager.onInstanceStarted((inst) => {
                if (inst.application.name === supportAppName) {
                    instanceOpened.resolve();
                }
            });

            gtf.addWindowHook(un);

            await fdc3.open(supportAppName);

            await instanceOpened.promise;
        });

        it("Should add the correct application instance to the array returned from glue.appManager.instances()", async() => {
            await fdc3.open(supportAppName);
    
            const inst = glue.appManager.instances().find(inst => inst.application.name === supportAppName);
    
            expect(inst).to.not.be.undefined;
        });

        it("Should add one element to the array returned from application.instances", async() => {
            const app = glue.appManager.application(supportAppName);
    
            const initLength = app.instances.length;
            
            await fdc3.open(supportAppName);
    
            const newLength = app.instances.length;
    
            expect(initLength + 1).to.eql(newLength);
        });

        it("Should open an instance of the app with the passed context", async() => {
            const context = { 
                type: "fdc3.test",
                test:  42
            };
    
            const onInstanceStartedHeard = gtf.wrapPromise();
    
            const un = glue.appManager.onInstanceStarted(async(inst) => {
                if (inst.application.name === supportAppName) {
                    try {
                        const instContext = await inst.getContext();
                        expect(instContext).to.eql(context);
                        onInstanceStartedHeard.resolve();
                    } catch (error) {
                        onInstanceStartedHeard.reject(error);
                    }
                }
            });
    
            gtf.addWindowHook(un);
            
            await fdc3.open(supportAppName, context);
    
            await onInstanceStartedHeard.promise;
        });
    });

    describe("when invoked with a valid first argument of type { appId: string }", async() => {
        it("Should not throw", async() => {
            await fdc3.open({ appId: supportAppName });
        });  

        it("Should be async", async() => {
            const res = fdc3.open({ appId: supportAppName });
            
            expect(res.then).to.be.a("function");
            expect(res.catch).to.be.a("function");

            await res;
        });

        it("Should return an object", async() => {
            const returned = await fdc3.open({ appId: supportAppName });

            expect(returned).to.be.an("object");
        });

        it("Should return a valid AppIdentifier", async() => {
            const returned = await fdc3.open({ appId: supportAppName });

            expect(returned.appId).to.eql(supportAppName);
            expect(returned.instanceId).to.be.a('string');
        })

        it("Should add one more element to the array returned from glue.appManager.instances()", async() => {
            const initLength = glue.appManager.instances().length;
    
            await fdc3.open({ appId: supportAppName });
    
            const newLength = glue.appManager.instances().length;
    
            expect(initLength + 1).to.eql(newLength);
        });

        it("Should open a new instance of the passed application", async() => {
            const instanceOpened = gtf.wrapPromise();

            const un = glue.appManager.onInstanceStarted((inst) => {
                if (inst.application.name === supportAppName) {
                    instanceOpened.resolve();
                }
            });

            gtf.addWindowHook(un);

            await fdc3.open({ appId: supportAppName });

            await instanceOpened.promise;
        });

        it("Should add the correct application instance to the array returned from glue.appManager.instances()", async() => {
            await fdc3.open({ appId: supportAppName });
    
            const inst = glue.appManager.instances().find(inst => inst.application.name === supportAppName);
    
            expect(inst).to.not.be.undefined;
        });

        it("Should add one element to the array returned from application.instances", async() => {
            const app = glue.appManager.application(supportAppName);
    
            const initLength = app.instances.length;
            
            await fdc3.open({ appId: supportAppName });
    
            const newLength = app.instances.length;
    
            expect(initLength + 1).to.eql(newLength);
        });

        it("Should open an instance of the app with the passed context", async() => {
            const context = { 
                type: "fdc3.test",
                test:  42
            };
    
            const onInstanceStartedHeard = gtf.wrapPromise();
    
            const un = glue.appManager.onInstanceStarted(async(inst) => {
                if (inst.application.name === supportAppName) {
                    try {
                        const instContext = await inst.getContext();
                        expect(instContext).to.eql(context);
                        onInstanceStartedHeard.resolve();
                    } catch (error) {
                        onInstanceStartedHeard.reject(error);
                    }
                }
            });
    
            gtf.addWindowHook(un);
            
            await fdc3.open({ appId: supportAppName }, context);
    
            await onInstanceStartedHeard.promise;
        });
    });
});