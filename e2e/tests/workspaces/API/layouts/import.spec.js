// validated V2
describe('import() Should ', function () {
    let preExistingLayouts = [];
    let basicImport;

    const basicConfig = {
        children: [
            {
                type: "row",
                children: [
                    {
                        type: "window",
                        appName: "dummyApp"
                    }
                ]
            }
        ]
    };

    before(async () => {
        await coreReady;
        preExistingLayouts = await glue.workspaces.layouts.export();

        const workspace = await glue.workspaces.createWorkspace(basicConfig);
        await workspace.saveLayout("layout.random.1");
        basicImport = (await glue.workspaces.layouts.export()).find(l => l.name === "layout.random.1");

        await glue.workspaces.layouts.delete("layout.random.1");
    });

    afterEach(async () => {
        await glue.workspaces.layouts.import(preExistingLayouts, "replace");
        const frames = await glue.workspaces.getAllFrames();
        await Promise.all(frames.map((f) => f.close()));
    });

    it("import the layout when the layout is valid", async () => {
        await glue.workspaces.layouts.import([basicImport]);

        const summaries = await glue.workspaces.layouts.getSummaries();

        const summariesContainLayout = summaries.some(s => s.name === basicImport.name);

        expect(summariesContainLayout).to.be.true;
    });

    it("reject when the layout is an invalid object", (done) => {
        glue.workspaces.layouts.import({ a: "not a layout" }).then(() => {
            done("Should not resolve");
        }).catch(() => done());
    });

    Array.from([null, undefined, {}, "layout", 42]).forEach((input) => {
        it(`reject when the layout is a ${JSON.stringify(input)}`, (done) => {
            glue.workspaces.layouts.import(input).then(() => {
                done("Should not resolve");
            }).catch(() => done());
        });
    });

    describe('bulk operations', function () {
        this.timeout(60000);

        const getMassLayouts = (numberOfDefs, namePrefix) => {
            const originalName = basicImport.name;

            const layouts = Array.from({ length: numberOfDefs }).map((el, idx) => {

                const name = namePrefix ? namePrefix + originalName + idx.toString() : originalName + idx.toString();

                return Object.assign({}, basicImport, { name });
            });

            return layouts;
        };

        it('should import 900 new layouts with mode replace', async () => {
            const massDefs = getMassLayouts(900);

            await glue.workspaces.layouts.import(massDefs, "replace");

            const exported = await glue.workspaces.layouts.export();

            expect(exported.length).to.eql(900);
        });

        it('should import 900 existing layouts with mode replace', async () => {
            const massDefs = getMassLayouts(900);

            await glue.workspaces.layouts.import(massDefs, "replace");
            await glue.workspaces.layouts.import(massDefs, "replace");

            const exported = await glue.workspaces.layouts.export();

            expect(exported.length).to.eql(900);
        });

        it('should import 900 new layouts with mode merge', async () => {
            const massDefs = getMassLayouts(900);

            await glue.workspaces.layouts.import(massDefs, "merge");

            const exported = await glue.workspaces.layouts.export();

            expect(exported.length).to.eql(900);
        });

        it('should import 900 non-changed existing layouts with mode merge', async () => {
            const massDefs = getMassLayouts(900);

            await glue.workspaces.layouts.import(massDefs, "merge");
            await glue.workspaces.layouts.import(massDefs, "merge");

            const exported = await glue.workspaces.layouts.export();

            expect(exported.length).to.eql(900);
        });

        it('should import 900 non-changed existing layouts with mode merge faster than 10000MS', async () => {
            const massDefs = getMassLayouts(900);

            await glue.workspaces.layouts.import(massDefs, "merge");

            const startOfTimer = performance.now();

            await glue.workspaces.layouts.import(massDefs, "merge");

            const endOfTimer = performance.now();

            expect(endOfTimer - startOfTimer).to.be.lessThan(10000);
        });

        it('should import 900 changed existing layouts with mode merge', async () => {
            const massDefs = getMassLayouts(900);

            await glue.workspaces.layouts.import(massDefs, "merge");

            massDefs.forEach((def) => def.metadata = { item: "new" });

            await glue.workspaces.layouts.import(massDefs, "merge");

            const exported = await glue.workspaces.layouts.export();

            expect(exported.length).to.eql(900);
        });

        it('should remove 900 layouts with import mode replace', async () => {
            const massDefs = getMassLayouts(900);

            await glue.workspaces.layouts.import(massDefs, "replace");
            await glue.workspaces.layouts.import([], "replace");

            const exported = await glue.workspaces.layouts.export();

            expect(exported.length).to.eql(0);
        });

        it('should throw when importing 1001 layouts with mode replace', (done) => {
            const massDefs = getMassLayouts(1001);

            glue.workspaces.layouts.import(massDefs, "replace")
                .then(() => done("should have resolve, because importing more than the allowed limit of layouts"))
                .catch(() => done());
        });

        it('should throw when importing 1001 layouts with mode merge', async () => {
            const massDefs = getMassLayouts(1001);

            glue.workspaces.layouts.import(massDefs, "merge")
                .then(() => done("should have resolve, because importing more than the allowed limit of layouts"))
                .catch(() => done());
        });
    });
});
