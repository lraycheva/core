describe('focus()', () => {
    before(() => {
        return coreReady;
    });

    afterEach(() => {
        return gtf.windows.closeAllOtherWindows();
    });

    it('Should resolve when trying to focus the Platform.', async () => {
        const platformWin = await gtf.windows.getPlatformWindow();

        await platformWin.focus();
    });

    it('Should return a promise that resolves with the window.', async () => {
        const newlyOpenedWindow = await glue.windows.open(gtf.windows.getWindowName(), gtf.windows.SUPPORT_DETAILS.url);

        const focusedWindow = await newlyOpenedWindow.focus();

        expect(await gtf.windows.compareWindows(newlyOpenedWindow, focusedWindow)).to.be.true;
    });
});
