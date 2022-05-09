// describe("first ", function () {

//     before(async () => await coreReady);

//     it("case", () => {
//         expect(1).to.eql(1);
//     });

//     it("gtf", () => {
//         expect(gtf.puppet).to.not.be.undefined;
//     });

//     it("try it", async () => {
//         const gw = await gtf.puppet.startDesktopGateway();
//         await gtf.puppet.stopDesktopGateway(gw);
//     });

//     it("try platform", async () => {
//         const plat = await gtf.puppet.startWebPlatform();
//         await plat.close();
//     });

//     it("try platform reload", async () => {
//         const plat = await gtf.puppet.startWebPlatform();
//         await plat.reload();
//         await plat.close();
//     });

//     it("try core", async () => {
//         const gw = await gtf.puppet.startDesktopGateway();
//         const coreClient = await gtf.puppet.startCoreClient();
//         await coreClient.close();
//         await gtf.puppet.stopDesktopGateway(gw);
//     });

//     it("try core reload", async () => {
//         const gw = await gtf.puppet.startDesktopGateway();
//         const coreClient = await gtf.puppet.startCoreClient();
//         await coreClient.reload();
//         await coreClient.close();
//         await gtf.puppet.stopDesktopGateway(gw);
//     });

//     it("try web", async () => {
//         const plat = await gtf.puppet.startWebPlatform();
//         const web = await plat.openClient();
//         await web.close();
//         await plat.close();
//     });

//     it("try web reload", async () => {
//         const plat = await gtf.puppet.startWebPlatform();
//         const web = await plat.openClient();
//         await web.reload();
//         await web.close();
//         await plat.close();
//     });
// });

// test initialization
// test reconnection
// test cross-gw-connection