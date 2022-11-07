describe('all()', () => {
    // An unsub function returned by `addIntentListener()`.
    let unsubObj;
    let glueApplication;

    before(() => {
        return coreReady;
    });

    afterEach(async () => {
        if (typeof unsubObj !== "undefined") {
            const intentListenerRemovedPromise = gtf.intents.waitForIntentListenerRemoved(unsubObj.intent);
            unsubObj.unsubscribe();
            await intentListenerRemovedPromise;
            unsubObj = undefined;
        }
        if (typeof glueApplication !== "undefined") {
            await glueApplication.stop();

            glueApplication = undefined;
        }
    });

    it('Should return all app intents.', async () => {
        const localAppIntentsWithAppInfo = gtf.appManager.getLocalApplications().filter((localApp) => typeof localApp.intents !== 'undefined').flatMap((localApp) => localApp.intents.map((intent) => ({ ...localApp, ...intent, applicationName: localApp.name, intentName: intent.name })));

        const allIntents = await glue.intents.all();

        const appIntentHandlers = gtf.intents.flattenIntentsToIntentHandlers(allIntents).filter((handler) => handler.type === 'app');

        localAppIntentsWithAppInfo.forEach((localAppIntentWithAppInfo) => {
            const appIntentHandlersWithSameName = appIntentHandlers.filter((handler) => handler.intentName === localAppIntentWithAppInfo.intentName);
            expect(appIntentHandlersWithSameName).to.be.of.length(1);
            const onlyAppIntentHandler = appIntentHandlersWithSameName[0];
            expect(onlyAppIntentHandler.applicationName).to.equal(localAppIntentWithAppInfo.applicationName);
            expect(onlyAppIntentHandler.contextTypes).to.have.all.members(localAppIntentWithAppInfo.contexts);
            expect(onlyAppIntentHandler.instanceId).to.be.undefined;
        });
    });

    it('Should return all instance intents registered by another party.', async () => {
        const intentName = 'another-party-intent';
        const intent = {
            intent: intentName,
            contextTypes: ['test-context'],
            displayName: 'another-party-intent-displayName',
            icon: 'another-party-intent-icon',
            description: 'another-party-intent-description'
        };

        glueApplication = await gtf.createApp();
        await glueApplication.intents.addIntentListener(intent);

        const allIntents = await glue.intents.all();
        const instanceIntentHandlers = gtf.intents.flattenIntentsToIntentHandlers(allIntents).filter((handler) => handler.type === 'instance');

        // The coreSupport application also registers a listener for the core-support intent.
        expect(instanceIntentHandlers).to.be.of.length(2);
        const intentInstanceIntentHandler = instanceIntentHandlers.find((instanceIntentHandler) => instanceIntentHandler.intentName === intentName);

        expect(intentInstanceIntentHandler.intentName).to.equal(intent.intent);
        expect(intentInstanceIntentHandler.applicationName).to.equal('coreSupport');
        expect(intentInstanceIntentHandler.displayName).to.equal(intent.displayName);
        expect(intentInstanceIntentHandler.contextTypes).to.be.of.length(1);
        expect(intentInstanceIntentHandler.contextTypes[0]).to.equal(intent.contextTypes[0]);
        expect(intentInstanceIntentHandler.applicationIcon).to.equal(intent.icon);
        expect(intentInstanceIntentHandler.applicationDescription).to.equal(intent.description);
        expect(intentInstanceIntentHandler.instanceId).to.equal(glueApplication.myInstance.id);
    });

    it('Should return all instance intents registered by us.', async () => {
        const intentName = 'our-intent';
        const intent = {
            intent: intentName,
            contextTypes: ['test-context'],
            displayName: 'our-intent-displayName',
            icon: 'our-intent-icon',
            description: 'our-intent-description'
        };
        unsubObj = glue.intents.addIntentListener(intent, () => { });
        unsubObj.intent = intentName;

        const allIntents = await glue.intents.all();

        const instanceIntentHandlers = gtf.intents.flattenIntentsToIntentHandlers(allIntents).filter((handler) => handler.type === 'instance');

        expect(instanceIntentHandlers).to.be.of.length(1);
        const onlyInstanceIntentHandler = instanceIntentHandlers[0];
        expect(onlyInstanceIntentHandler.intentName).to.equal(intentName);
        expect(onlyInstanceIntentHandler.applicationName).to.equal(RUNNER);
        expect(onlyInstanceIntentHandler.displayName).to.equal(intent.displayName);
        expect(onlyInstanceIntentHandler.contextTypes).to.be.of.length(1);
        expect(onlyInstanceIntentHandler.contextTypes[0]).to.equal(intent.contextTypes[0]);
        expect(onlyInstanceIntentHandler.applicationIcon).to.equal(intent.icon);
        expect(onlyInstanceIntentHandler.applicationDescription).to.equal(intent.description);
        expect(onlyInstanceIntentHandler.instanceId).to.equal(glue.interop.instance.windowId);
    });

    it('Should be populated before `addIntentListener()` resolves.', async () => {
        const intentName = 'another-party-intent';
        const intent = {
            intent: intentName,
            contextTypes: ['test-context'],
            displayName: 'another-party-intent-displayName',
            icon: 'another-party-intent-icon',
            description: 'another-party-intent-description'
        };

        glueApplication = await gtf.createApp();
        await glueApplication.intents.addIntentListener(intent);

        const allIntents = await glue.intents.all();
        const instanceIntentHandlers = gtf.intents.flattenIntentsToIntentHandlers(allIntents).filter((handler) => handler.type === 'instance');

        // The coreSupport application also registers a listener for the core-support intent.
        expect(instanceIntentHandlers).to.be.of.length(2);
        const intentInstanceIntentHandler = instanceIntentHandlers.find((instanceIntentHandler) => instanceIntentHandler.intentName === intentName);

        expect(intentInstanceIntentHandler.intentName).to.equal(intentName);
        expect(intentInstanceIntentHandler.applicationName).to.equal('coreSupport');
        expect(intentInstanceIntentHandler.displayName).to.equal(intent.displayName);
        expect(intentInstanceIntentHandler.contextTypes).to.be.of.length(1);
        expect(intentInstanceIntentHandler.contextTypes[0]).to.equal(intent.contextTypes[0]);
        expect(intentInstanceIntentHandler.applicationIcon).to.equal(intent.icon);
        expect(intentInstanceIntentHandler.applicationDescription).to.equal(intent.description);
        expect(intentInstanceIntentHandler.instanceId).to.equal(glueApplication.myInstance.id);
    });

    it('Should be populated before `unregister()` resolves.', async () => {
        const intent = {
            intent: 'another-party-intent',
            contextTypes: ['test-context'],
            displayName: 'another-party-intent-displayName',
            icon: 'another-party-intent-icon',
            description: 'another-party-intent-description'
        };

        glueApplication = await gtf.createApp();
        await glueApplication.intents.addIntentListener(intent);
        await glueApplication.intents.unregisterIntent(intent);

        const allIntents = await glue.intents.all();
        const instanceIntentHandlers = gtf.intents.flattenIntentsToIntentHandlers(allIntents).filter((handler) => handler.type === 'instance');

        // The coreSupport application also registers a listener for the core-support intent.
        expect(instanceIntentHandlers).to.be.of.length(1);
    });

    it("Should add one more element to the array returned from all() when addIntentListenerRequest has resultType", async() => {
        const initIntents = await glue.intents.all();

        const resultType = "test-result-type";
        const intentToRegister = {
            intent: 'another-party-intent',
            contextTypes: ["contextType"],
            displayName: 'another-party-intent-displayName',
            icon: 'another-party-intent-icon',
            description: 'another-party-intent-description',
            resultType
        };

        unsubObj = glue.intents.addIntentListener(intentToRegister, () => { });
        unsubObj.intent = intentToRegister.intent;

        await gtf.intents.waitForIntentListenerAdded(intentToRegister.intent);

        const newIntents = await glue.intents.all();

        expect(initIntents.length + 1).to.eql(newIntents.length);
    });

    it("Should add one more element to the array returned from all() when another app registers an intent with addIntentListenerRequest and resultType", async() => {
        const initIntents = await glue.intents.all();
        
        const intentName = 'test-intent';
        const resultType = "test-result-type";

        const intentToRegister = {
            intent: intentName,
            displayName: 'another-party-intent-displayName',
            icon: 'another-party-intent-icon',
            description: 'another-party-intent-description',
            resultType
        };

        glueApplication = await gtf.createApp();
        await glueApplication.intents.addIntentListener(intentToRegister);

        const newIntents = await glue.intents.all();

        expect(initIntents.length + 1).to.eql(newIntents.length);
    });

    it("Should add a correct intent handler when current app registers an intent with resultType", async() => {
        const resultType = "test-result-type";
        const intentToRegister = {
            intent: 'another-party-intent',
            contextTypes: ["contextType"],
            displayName: 'another-party-intent-displayName',
            icon: 'another-party-intent-icon',
            description: 'another-party-intent-description',
            resultType
        };

        unsubObj = glue.intents.addIntentListener(intentToRegister, () => { });
        unsubObj.intent = intentToRegister.intent;

        await gtf.intents.waitForIntentListenerAdded(intentToRegister.intent);

        const allIntents = await glue.intents.all();
        const addedIntent = allIntents.find(intent => intent.handlers.some(handler => handler.resultType === resultType));

        expect(addedIntent).to.not.be.undefined;
    });

    it("Should add a correct intent handler when another app registers an intent with resultType", async() => {
        const resultType = "test-result-type";
        const intentToRegister = {
            intent: 'another-party-intent',
            contextTypes: ["contextType"],
            displayName: 'another-party-intent-displayName',
            icon: 'another-party-intent-icon',
            description: 'another-party-intent-description',
            resultType
        };

        glueApplication = await gtf.createApp();
        await glueApplication.intents.addIntentListener(intentToRegister);

        const allIntents = await glue.intents.all();
        const addedIntent = allIntents.find(intent => intent.handlers.some(handler => handler.resultType === resultType));

        expect(addedIntent).to.not.be.undefined;
    });

    it("Should consists correct handler when resultType is set in the application definition", async() => {
        const appName = "AppWithDetails-local";
        const resultType = "test-result-type";

        const allIntents = await glue.intents.all();

        const intentHandlerWithResultType = allIntents.find(intent => intent.handlers.some(handler => handler.applicationName === appName && handler.resultType === resultType));

        expect(intentHandlerWithResultType).to.not.be.undefined;
    });
});
