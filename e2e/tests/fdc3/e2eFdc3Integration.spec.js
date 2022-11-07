describe("e2e in FDC3 mode ", () => {
    const props = ['open', 'findIntent', 'findIntentsByContext', 'raiseIntent', 'raiseIntentForContext', 'addIntentListener', 'broadcast', 'addContextListener', 'getOrCreateChannel', 'getSystemChannels', 'joinChannel', 'getCurrentChannel', 'leaveCurrentChannel', 'getInfo'];

    const v2AdditionalProps = ['findInstances', 'getAppMetadata', 'getUserChannels', 'joinUserChannel'];

    before(async() => {
        await coreReady;
    });

    it("Should have access to global fdc3 object", () => {
        expect(window.fdc3).to.be.an("object");
    });

    props.forEach(prop => {
        it(`Should have the following prop ${prop}`, () => {
            expect(Object.keys(window.fdc3).find(fdc3Prop => fdc3Prop === prop)).to.not.be.undefined;
        });
    });

    describe("FDC3 2.0", async() => {
        const info = await fdc3.getInfo();

        const fdc3MajorVersion = info.fdc3Version.split(".")[0];

        if (fdc3MajorVersion >= 2) {
            v2AdditionalProps.forEach(prop => {
                it(`Should have the following prop ${prop}`, () => {
                    expect(Object.keys(window.fdc3).find(fdc3Prop => fdc3Prop === prop)).to.not.be.undefined;
                });
            });
        }
    })
});