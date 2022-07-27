describe('properties', () => {
    const appConfig = {
        name: "coreSupport",
        type: "window",
        details: {
            url: "http://localhost:4242/coreSupport/index.html"
        },
        intents: [
            {
                name: "core-intent",
                displayName: "core-intent-displayName",
                contexts: [
                    "test-context"
                ]
            }
        ]
    };

    let app;

    before(() => coreReady);

    beforeEach(() => {
        app = glue.appManager.application(appConfig.name);
    });

    afterEach(() => Promise.all(glue.appManager.instances().map((inst) => inst.stop())));

    describe('name', () => {
        it("Should return a string", () => {
            expect(app.name).to.be.a("string");
        });

        it("Should return the correct application name", () => {
            expect(app.name).to.eql(appConfig.name);
        });

        it("Should be set correctly regarding the app configuration", () => {
            const localApps = gtf.appManager.getLocalApplications();

            localApps.forEach(localAppConfig => {
                const app = glue.appManager.application(localAppConfig.name);
                expect(app.name).to.eql(localAppConfig.name);
            })
        });
    });

    describe("title", () => {
        it("Should be set correctly regarding the app configuration", () => {
            const localApps = gtf.appManager.getLocalApplications().filter(app => app.title);

            localApps.forEach(localAppConfig => {
                const app = glue.appManager.application(localAppConfig.name);

                expect(app.title).to.be.a("string");
                expect(app.title).to.eql(localAppConfig.title);
            })
        });
    });

    describe("version", () => {
        it("Should be set correctly regarding the app configuration", () => {
            const localApps = gtf.appManager.getLocalApplications().filter(app => app.version);

            localApps.forEach(localAppConfig => {
                const app = glue.appManager.application(localAppConfig.name);
                
                expect(app.version).to.be.a("string");
                expect(app.version).to.eql(localAppConfig.version);
            })
        });
    });

    describe("icon", () => {
        it("Should be set correctly regarding the app configuration", () => {
            const localApps = gtf.appManager.getLocalApplications().filter(app => app.icon);

            localApps.forEach(localAppConfig => {
                const app = glue.appManager.application(localAppConfig.name);

                expect(app.icon).to.be.a("string");
                expect(app.icon).to.eql(localAppConfig.icon);
            })
        });
    });

    describe("caption", () => {
        it("Should be set correctly regarding the app configuration", () => {
            const localApps = gtf.appManager.getLocalApplications().filter(app => app.caption);

            localApps.forEach(localAppConfig => {
                const app = glue.appManager.application(localAppConfig.name);

                expect(app.caption).to.be.a("string");
                expect(app.caption).to.eql(localAppConfig.caption);
            })
        });
    });

    describe('instances', () => {
        it('Should be an array', () => {
            expect(app.instances).to.be.an('array');            
        });

        it('Should be an empty array when no app instances are started', () => {
            expect(app.instances.length).to.eql(0);
        });

        it('Should be an array with one correct instance when app.start() is invoked', (done) => {
            app.start()
                .then((inst) => {
                    expect(app.instances.length).to.eql(1);
                    expect(inst.id).to.eql(app.instances[0].id);
                    done();
                })
                .catch(done);
        });

        it('Should add 3 correct instances when app.start() is invoked 3 times', (done) => {
            Promise.all([app.start(), app.start(), app.start()])
                .then(appInstArr => {
                    expect(app.instances.length).to.eql(appInstArr.length);
                    expect(app.instances.filter(inst => appInstArr.some(returnedInst => returnedInst.id === inst.id)).length).to.eql(3);
                    done();
                })
                .catch(done);
        });

        it('Should remove one element when an application instance is stopped', (done) => {
            let removedInstId;
    
            Promise.all([app.start(), app.start(), app.start()])
                .then(([inst1]) => {
                    removedInstId = inst1.id;
                    return inst1.stop();
                })
                .then(() => {
                    expect(app.instances.length).to.eql(2);
                    expect(app.instances.some(inst => inst.id === removedInstId)).to.eql(false);
                    done();
                })
                .catch(done);
        });

        it('Should be set correctly.', async () => {
            const appName = 'coreSupport';
            const app = glue.appManager.application(appName);

            expect(app.instances).to.be.empty;

            const appInstance = await app.start();

            const appInstances = app.instances;

            expect(appInstances).to.be.of.length(1);

            const onlyInstance = appInstances[0];
            expect(onlyInstance.id).to.equal(appInstance.id);
            expect(onlyInstance.application.name).to.equal(appName);

            await appInstance.stop();

            expect(app.instances).to.be.empty;
        });
    });

    describe("userProperties", () => {
        it("Should have details property", () => {
            expect(Object.keys(app.userProperties).includes("details")).to.eql(true);
        });

        it("Should have details object with url property", () => {
            expect(Object.keys(app.userProperties.details).includes("url")).to.eql(true);
        });

        it("Should have details object with url property which is a string", () => {
            expect(app.userProperties.details.url).to.be.a("string");
        });

        it("Should have details object with the correct url", () => {
            expect(app.userProperties.details.url).to.eql(appConfig.details.url);
        });

        it('Should set the correct url regarding the app configuration', () => {
            // removing FDC3 apps because they don't have details prop
            const localApps = gtf.appManager.getLocalApplications().filter(app => !app.name.includes("FDC3"));

            localApps.forEach(localAppConfig => {
                const app = glue.appManager.application(localAppConfig.name);
                expect(localAppConfig.details.url).to.eql(app.userProperties.details.url);
            });
        });
    });
});
