describe('addIntentListener()', () => {
    // An unsub function returned by `addIntentListener()`.
    let unsubObj;

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
    });

    it('Should throw an error when intent isn\'t of type string or type object.', (done) => {
        try {
            glue.intents.addIntentListener(42, () => { });

            done('addIntentListener() should have thrown an error because intent wasn\'t of type string or object!');
        } catch (error) {
            done();
        }
    });

    it('Should throw an error when intent.intent isn\'t of type string.', (done) => {
        try {
            glue.intents.addIntentListener({ intent: 42 }, () => { });

            done('addIntentListener() should have thrown an error because intent.intent wasn\'t of type string or object!');
        } catch (error) {
            done();
        }
    });

    it('Should throw an error when handler isn\'t of type function.', (done) => {
        try {
            glue.intents.addIntentListener('our-intent', 42);

            done('addIntentListener() should have thrown an error because handler wasn\'t of type function!');
        } catch (error) {
            done();
        }
    });

    it('Should invoke the handler when the intent is raised.', (done) => {
        const intentName = 'our-intent';
        const raiseContext = {
            data: {
                a: 42
            },
            type: 'test-context'
        };
        unsubObj = glue.intents.addIntentListener(intentName, (context) => {
            try {
                expect(context).to.eql(raiseContext);

                done();
            } catch (error) {
                done(error);
            }
        });
        unsubObj.intent = intentName;

        glue.intents.raise({
            intent: intentName,
            context: raiseContext
        });
    });

    it('Should return a working unsubscribe function.', (done) => {
        const intentName = 'test-intent';

        const unsub = glue.intents.addIntentListener(intentName, () => { });
        unsub.unsubscribe();

        glue.intents.raise(intentName)
            .then(() => done(`raise() should have thrown an error because an intent with name ${intentName} shouldn't be present!`))
            .catch((error) => done());
    });

    it('Should throw an error when called twice for the same intent.', (done) => {
        const intentName = 'test-intent';

        unsubObj = glue.intents.addIntentListener(intentName, () => { });
        unsubObj.intent = intentName;

        try {
            glue.intents.addIntentListener(intentName, () => { });

            done(`addIntentListener() should have thrown an error because a listener for intent with name ${intentName} is already present!`);
        } catch (error) {
            done();
        }
    });

    it('Should not throw an error when called twice for the same intent after unregistering the first one.', async () => {
        const intentName = 'test-intent';

        const intentListenerRemovedPromise = gtf.intents.waitForIntentListenerRemoved(intentName);

        const unsub = glue.intents.addIntentListener(intentName, () => { });
        unsub.unsubscribe();

        await intentListenerRemovedPromise;

        unsubObj = glue.intents.addIntentListener(intentName, () => { });
        unsubObj.intent = intentName;
    });

    it('Should find interop method with such intent name after adding an intent listener', (done) => {
        const GlueWebIntentsPrefix = "Tick42.FDC3.Intents.";
        const intentName = 'test-intent';

        unsubObj = glue.intents.addIntentListener(intentName, () => {
            try {
                const methodsWithSuchName = glue.interop.methods({ name: `${GlueWebIntentsPrefix}${intentName}` });
                expect(methodsWithSuchName.length).to.eql(1);
                done();
            } catch (error) {
                done(error);
            }
        });

        unsubObj.intent = intentName;
        glue.intents.raise(intentName);
    });

    it('Should first register and then unregister interop method with such intent name when immediately invoking the unsubscribe function', (done) => {
        const GlueWebIntentsPrefix = "Tick42.FDC3.Intents.";
        const intentName = 'test-intent';
        const interopMethodName = `${GlueWebIntentsPrefix}${intentName}`;

        const ready = gtf.waitFor(2, done);

        const unsubMethodAdded = glue.interop.methodAdded((method) => {
            if (method.name === interopMethodName) {
                ready();
                unsubMethodAdded();
            }
        });

        const unsubMethodRemoved = glue.interop.methodRemoved((method) => {
            if (method.name === interopMethodName) {
                ready();
                unsubMethodRemoved();
            }
        });

        const unsubIntentListener = glue.intents.addIntentListener(intentName, () => { });
        unsubIntentListener.unsubscribe();
    });
});
