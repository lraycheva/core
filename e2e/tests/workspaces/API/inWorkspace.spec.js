describe('inWorkspace() Should ', function () {
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
    }

    before(() => coreReady);

    beforeEach(async () => {
        await glue.workspaces.createWorkspace(basicConfig);
    })

    afterEach(async () => {
        const frames = await glue.workspaces.getAllFrames();
        await Promise.all(frames.map((frame) => frame.close()));
    });

    it('return a promise', async () => {
        const getAllWorkspacesPromise = glue.workspaces.inWorkspace();

        expect(getAllWorkspacesPromise.then).to.be.a("function");
        expect(getAllWorkspacesPromise.catch).to.be.a("function");
    });

    it('resolve', async () => {
        await glue.workspaces.inWorkspace();
    });


    it('return false when the window is not in a workspace', async () => {
        const inWorkspaceResult = await glue.workspaces.inWorkspace();

        expect(inWorkspaceResult).to.be.false;
    });
});
