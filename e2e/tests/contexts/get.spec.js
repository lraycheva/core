describe('get(), ', function () {
  const contextsForTesting = [
    { type: 'simple' },
    {
      type: 'simpleWithArray',
      arr: [1, 2, 3],
    },
    {
      type: 'arrayWithDifferentTypes',
      arr: [1, '2', {}],
    },
    {
      type: 'nestedObjects',
      first: {
        second: {
          third: {},
        },
      },
    },
    {
      type: 'cubeRepresentation',
      cube: [[[1]], [[2]], [[3]]],
    },
  ];
  let initialContexts;

  before(async () => {
    await coreReady;

    initialContexts = await Promise.all(
      glue.contexts.all().map((contextName) => {
        const context = glue.contexts.get(contextName);
        return { name: contextName, context };
      })
    );

    return Promise.all(glue.contexts.all().map((contextName) => glue.contexts.destroy(contextName)));
  });

  afterEach(() => {
    gtf.clearWindowActiveHooks();

    return Promise.all(glue.contexts.all().map((context) => glue.contexts.destroy(context)));
  });

  after(() => {
    return Promise.all(
      initialContexts.map(({ name, context }) => {
        glue.contexts.update(name, context);
      })
    );
  });

  describe('when manipulated by current app, ', function () {
    it('should throw when no arguments are passed', (done) => {
      try {
        glue.contexts.get();
        done('Should throw an error!');
      } catch (error) {
        done();
      }
    });

    [undefined, null, true, false, 42, '', { tick: 42 }, []].forEach((invalidName) => {
      it(`should throw when an invalid context name (${JSON.stringify(invalidName)}) is passed`, (done) => {
        try {
          glue.contexts.get(invalidName);
          done('Should throw an error!');
        } catch (error) {
          done();
        }
      });
    });

    it('should not throw when invoked with a non-existent context name', (done) => {
      try {
        glue.contexts.get('randomContextName');
        done();
      } catch (error) {
        done(error);
      }
    });

    it('should return an object', async () => {
      const context = {
        name: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(10),
      };
      await glue.contexts.update(context.name, context);

      const currentContext = await glue.contexts.get(context.name);
      expect(currentContext).to.be.an('object');
    });

    it('should return an empty object when invoked with a non-existent context name', async () => {
      const nonExistentContext = await glue.contexts.get('randomContextName');
      expect(nonExistentContext).to.eql({});
    });

    it('should return the same data as the one created with update()', async () => {
      const context = {
        name: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(10),
      };
      await glue.contexts.update(context.name, context);

      const currentContext = await glue.contexts.get(context.name);
      expect(currentContext).to.eql(context);
    });

    it('should return the same data as the one created with set()', async () => {
      const context = {
        name: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(10),
      };
      await glue.contexts.set(context.name, context);

      const currentContext = await glue.contexts.get(context.name);
      expect(currentContext).to.eql(context);
    });

    it('should return correct data after updating it 3 times with update()', async () => {
      let contextName = gtf.contexts.getContextName();
      const initContext = {
        companyName: 'Tick42',
        location: 'Sofia',
      };
      await glue.contexts.update(contextName, initContext);

      const secondContextToUpdate = {
        products: [
          {
            name: 'Glue42 Enterprise',
            description: 'Desktop application integration platform',
          },
          {
            name: 'Glue42 Core',
            description: 'Web application integration platform',
          },
        ],
      };

      await glue.contexts.update(contextName, secondContextToUpdate);

      const thirdContextToUpdate = {
        coreValues: ['keep learning', "don't be a mushroom", 'give a shit'],
      };

      await glue.contexts.update(contextName, thirdContextToUpdate);

      const currentContext = await glue.contexts.get(contextName);
      expect(currentContext).to.eql(Object.assign({}, initContext, secondContextToUpdate, thirdContextToUpdate));
    });

    it('should return correct data after replacing an existing context data with set()', async () => {
      const contextName = gtf.contexts.getContextName();
      const context = {
        complexObj: gtf.contexts.generateComplexObject(10),
      };

      await glue.contexts.set(contextName, context);

      const newContext = {
        id: 'unique identifier',
        date: new Date(),
        title: 'new context',
      };
      await glue.contexts.set(contextName, newContext);

      const currentContext = await glue.contexts.get(contextName);
      expect(currentContext).to.eql(newContext);
    });

    it('should return correct data when creating a complex object with update()', async () => {
      const context = {
        name: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(200),
      };
      await glue.contexts.update(context.name, context);

      const currentContext = await glue.contexts.get(context.name);
      expect(currentContext).to.eql(context);
    });

   
    it('should return correct data when updating an existing complex context with another complex object', async () => {
      const contextName = gtf.contexts.getContextName();
      const context = {
        complexObj: gtf.contexts.generateComplexObject(200),
      };
      await glue.contexts.update(contextName, context);

      const newContext = {
        newComplexObj: gtf.contexts.generateComplexObject(200),
      };

      await glue.contexts.update(contextName, newContext);

      const currentContext = await glue.contexts.get(contextName);
      expect(currentContext).to.eql(Object.assign({}, context, newContext));
    });

    it('should return correct data when creating a complex object with set()', async () => {
      const context = {
        name: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(200),
      };
      await glue.contexts.set(context.name, context);

      const currentContext = await glue.contexts.get(context.name);
      expect(currentContext).to.eql(context);
    });

    it('should return correct data after replacing an existing complex context with another complex object', async () => {
      const contextName = gtf.contexts.getContextName();
      const context = {
        complexObj: gtf.contexts.generateComplexObject(200),
      };
      await glue.contexts.set(contextName, context);

      const newContext = {
        newComplexObj: gtf.contexts.generateComplexObject(200),
      };

      await glue.contexts.set(contextName, newContext);

      const currentContext = await glue.contexts.get(contextName);
      expect(currentContext).to.eql(newContext);
    });

    it('should return correct data as soon as data becomes available', (done) => {
      const context = {
        name: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(10),
      };

      const ready = gtf.waitFor(2, done);

      glue.contexts
        .update(context.name, context)
        .then(() => glue.contexts.get(context.name))
        .then((ctxData) => {
          expect(ctxData).to.eql(context);
          ready();
        })
        .then(() => glue.contexts.get(context.name))
        .then((ctxData2) => {
          expect(ctxData2).to.eql(context);
          ready();
        })
        .catch((err) => done(err));
    });

    it('double get should return snapshot', (done) => {
      const contextName = gtf.contexts.getContextName();
      const context = gtf.contexts.generateComplexObject(10);

      glue.contexts
        .subscribe(contextName, async (updatedCtx) => {
          try {
            const contexts = await Promise.all([glue.contexts.get(contextName), glue.contexts.get(contextName)]);
            expect(contexts[0]).to.eql(context);
            expect(contexts[1]).to.eql(context);
            expect(updatedCtx).to.eql(context);
            done();
          } catch (err) {
            done(err);
          }
        })
        .then((unFn) => {
          gtf.addWindowHook(unFn);
          return glue.contexts.update(contextName, context);
        })
        .catch((err) => done(err));
    });

    it('should return snapshot when get() is followed by subscribe()', (done) => {
      const contextName = gtf.contexts.getContextName();
      const context = {
        id: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(10),
      };
      const ready = gtf.waitFor(2, done);

      glue.contexts
        .subscribe(contextName, async (updatedCtx) => {
          if (updatedCtx.id === context.id) {
            try {
              const contextData = await glue.contexts.get(contextName);
              expect(contextData).to.eql(context);
              expect(updatedCtx).to.eql(context);
              ready();
            } catch (err) {
              done(err);
            }
          }

          await glue.contexts.subscribe(contextName, (dataFromSubscribe) => {
            if (dataFromSubscribe.id === context.id) {
              try {
                expect(dataFromSubscribe).to.eql(context);
                ready();
              } catch (err) {
                done(err);
              }
            }
          });
        })
        .then((unFn) => gtf.addWindowHook(unFn))
        .then(() => glue.contexts.update(contextName, context))
        .catch((err) => done(err));
    });
  });

  describe('when manipulated by another app, ', function () {
    let secondApp;

    beforeEach(async () => {
      secondApp = await gtf.createApp();
    });

    afterEach(() => secondApp.stop());

    it('should return the same data as the one created with update()', async () => {
      const contextName = gtf.contexts.getContextName();
      const context = {
        complexObj: gtf.contexts.generateComplexObject(10),
      };

      await secondApp.contexts.update(contextName, context);

      const currentContext = await glue.contexts.get(contextName);
      expect(currentContext).to.eql(context);
    });

    it('should return the same data as the one created with set()', async () => {
      const contextName = gtf.contexts.getContextName();
      const context = {
        complexObj: gtf.contexts.generateComplexObject(10),
      };
      await secondApp.contexts.set(contextName, context);

      const currentContext = await glue.contexts.get(contextName);
      expect(currentContext).to.eql(context);
    });

    it('should return correct data after updating it 3 times with update()', async () => {
      const contextName = gtf.contexts.getContextName();
      const initialContext = {
        complexObj: gtf.contexts.generateComplexObject(10),
      };

      await secondApp.contexts.update(contextName, initialContext);

      const secondContextToUpdate = {
        date: new Date(),
        title: 'second context',
      };

      await secondApp.contexts.update(contextName, secondContextToUpdate);

      const thirdContextToUpdate = {
        id: 'unique identifier',
        name: contextName,
      };

      await secondApp.contexts.update(contextName, thirdContextToUpdate);

      const currentContext = await glue.contexts.get(contextName);
      expect(currentContext).to.eql(Object.assign({}, initialContext, secondContextToUpdate, thirdContextToUpdate));
    });

    it('should return correct data when replacing an existing context data with set()', async () => {
      const contextName = gtf.contexts.getContextName();
      const initContext = {
        complexObj: gtf.contexts.generateComplexObject(10),
        title: 'initial context',
      };

      await secondApp.contexts.set(contextName, initContext);

      const newContext = {
        name: gtf.contexts.getContextName(),
        date: new Date(),
      };

      await secondApp.contexts.set(contextName, newContext);

      const currentContext = await glue.contexts.get(contextName);
      expect(currentContext).to.eql(newContext);
    });

    it('should return correct data when creating a complex object with update()', async () => {
      const context = {
        name: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(200),
      };
      await secondApp.contexts.update(context.name, context);

      const currentContext = await glue.contexts.get(context.name);
      expect(currentContext).to.eql(context);
    });

    it('should return correct data when updating an existing complex context with another complex object', async () => {
      const contextName = gtf.contexts.getContextName();
      const context = {
        complexObj: gtf.contexts.generateComplexObject(200),
      };
      await secondApp.contexts.update(contextName, context);

      const newContext = {
        newComplexObj: gtf.contexts.generateComplexObject(200),
      };

      await secondApp.contexts.update(contextName, newContext);

      const currentContext = await glue.contexts.get(contextName);
      expect(currentContext).to.eql(Object.assign({}, context, newContext));
    });

    it('should return correct data when creating a complex object with set()', async () => {
      const context = {
        name: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(200),
      };
      await secondApp.contexts.set(context.name, context);

      const currentContext = await glue.contexts.get(context.name);
      expect(currentContext).to.eql(context);
    });

    it('should return correct data when replacing an existing complex context with another complex object', async () => {
      const contextName = gtf.contexts.getContextName();
      const context = {
        complexObj: gtf.contexts.generateComplexObject(200),
      };
      await secondApp.contexts.set(contextName, context);

      const newContext = {
        newComplexObj: gtf.contexts.generateComplexObject(200),
      };

      await secondApp.contexts.set(contextName, newContext);

      const currentContext = await glue.contexts.get(contextName);
      expect(currentContext).to.eql(newContext);
    });

    it('should return correct data as soon as data becomes available', (done) => {
      const context = {
        name: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(10),
      };

      const ready = gtf.waitFor(2, done);

      secondApp.contexts
        .update(context.name, context)
        .then(() => glue.contexts.get(context.name))
        .then((ctxData) => {
          expect(ctxData).to.eql(context);
          ready();
        })
        .then(() => glue.contexts.get(context.name))
        .then((ctxData2) => {
          expect(ctxData2).to.eql(context);
          ready();
        })
        .catch((err) => done(err));
    });

    it("should return correct data when another app resolves creating a context and subscribe should also return correct data when there's a subscription for the given context", (done) => {
      const contextName = gtf.contexts.getContextName();
      const context = gtf.contexts.generateComplexObject(10);
      const ready = gtf.waitFor(2, done);

      secondApp.contexts
        .update(contextName, context)
        .then(() =>
          glue.contexts.subscribe(contextName, (data) => {
            try {
              expect(data).to.eql(context);
              ready();
            } catch (error) {
              done(error);
            }
          })
        )
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return glue.contexts.get(contextName);
        })
        .then((ctxData) => {
          expect(ctxData).to.eql(context);
          ready();
        })
        .catch((err) => done(err));
    });

    contextsForTesting.forEach((context) => {
      it(`should get the old context when the new context is ${context.type} and 2 applications are used`, async () => {
        const contextName = gtf.contexts.getContextName();
        const initialContext = {
          isSaved: true,
        };

        await secondApp.contexts.set(contextName, initialContext);
        await secondApp.contexts.set(contextName, context);

        const myContext = await glue.contexts.get(contextName);

        expect(myContext.isSaved).to.be.undefined;
      });

      it(`should get a merged context when the new context is ${context.type} and 2 applications are used`, async () => {
        const contextName = gtf.contexts.getContextName();
        const initialContext = {
          isSaved: true,
        };

        await secondApp.contexts.update(contextName, initialContext);
        await secondApp.contexts.update(contextName, context);

        const myContext = await glue.contexts.get(contextName);

        expect(myContext.isSaved).to.be.true;
      });
    });
  });
});
