describe('getMyWorkspace() Should ', function () {
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

    it('reject when the window is not in a workspace', (done) => {
        glue.workspaces.getMyWorkspace().then(() => {
            done("Should not resolve")
        }).catch(() => done());
    });
});
