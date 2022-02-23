describe('setPaths() ', function () {
  let initialContexts;

  before(async () => {
    await coreReady;

    initialContexts = await Promise.all(
      glue.contexts.all().map((contextName) => {
        const context = glue.contexts.get(contextName);
        return { name: contextName, context };
      })
    );

    return Promise.all(glue.contexts.all().map((context) => glue.contexts.destroy(context)));
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

  describe('when manipulated by current app ', function () {
    it('should throw when no arguments are passed', (done) => {
      try {
        glue.contexts.setPaths();
        done('Should throw an error');
      } catch (error) {
        done();
      }
    });

    it('should throw when only one argument is passed', (done) => {
      try {
        glue.contexts.setPaths('contextName');
        done('Should throw an error');
      } catch (error) {
        done();
      }
    });

    [undefined, null, false, true, 42, [], '', { tick: 42 }].forEach((invalidName) => {
      it(`should throw when an invalid first argument (${JSON.stringify(invalidName)}) is passed`, (done) => {
        try {
          glue.contexts.setPaths(invalidName, [{ path: 'prop1', value: 'value' }]);
          done('Should throw an error');
        } catch (error) {
          done();
        }
      });
    });

    [undefined, null, false, true, 42, '', { tick: 42 }, [{ tick: 42 }]].forEach((invalidPaths) => {
      it(`should throw when an invalid argument (${JSON.stringify(invalidPaths)}) is passed`, (done) => {
        try {
          glue.contexts.setPaths('contextName', invalidPaths);
          done('Should throw an error');
        } catch (error) {
          done();
        }
      });
    });

    it.skip('should return undefined', async () => {
      const returned = await glue.contexts.setPaths('contextName', [
        { path: 'prop1', value: 'value' },
        { path: 'prop2', value: 'value' },
      ]);
      expect(returned).to.eql(undefined);
    });

    it('should not throw when invoked with valid arguments', (done) => {
      try {
        glue.contexts.setPaths('contextName', [{ path: 'prop1.prop2', value: 'value' }]);
        done();
      } catch (error) {
        done(error);
      }
    });

    it("should create a new context when there isn't one with the given context name", async () => {
      const contextName = gtf.contexts.getContextName();
      await glue.contexts.setPaths(contextName, [{ path: 'prop', value: 'value' }]);

      const newContext = await glue.contexts.get(contextName);
      expect(newContext).to.eql({ prop: 'value' });
    });

    it("should add one more element to the array returned from all() when there isn't a context with passed name", async () => {
      const contextName = gtf.contexts.getContextName();

      const oldLength = glue.contexts.all().length;
      await glue.contexts.setPaths(contextName, [{ path: 'prop1', value: 'value' }]);
      const newLength = glue.contexts.all().length;

      expect(oldLength + 1).to.eql(newLength);
    });

    it('should not add one more element to the array returned from all() when there is a context with passed name', async () => {
      const contextName = gtf.contexts.getContextName();
      const complexObject = gtf.contexts.generateComplexObject(10);
      const anotherComplexObject = gtf.contexts.generateComplexObject(10);

      await glue.contexts.setPaths(contextName, [{ path: 'prop1.prop2', value: complexObject }]);
      const oldLength = glue.contexts.all().length;
      await glue.contexts.setPaths(contextName, [{ path: 'prop1.prop2', value: anotherComplexObject }]);
      const newLength = glue.contexts.all().length;

      expect(oldLength).to.eql(newLength);
    });

    it('should add new nested properties to the passed paths', async () => {
      const contextName = gtf.contexts.getContextName();
      const complexObject = gtf.contexts.generateComplexObject(10);
      const anotherComplexObject = gtf.contexts.generateComplexObject(10);

      await glue.contexts.setPaths(contextName, [
        { path: 'prop1.prop2', value: complexObject },
        { path: 'prop3.prop4', value: anotherComplexObject },
      ]);

      const newContext = await glue.contexts.get(contextName);
      expect(newContext).to.eql({
        prop1: { prop2: complexObject },
        prop3: { prop4: anotherComplexObject },
      });
    });

    it('should not change previous context properties', async () => {
      const contextName = gtf.contexts.getContextName();
      const context = gtf.contexts.generateComplexObject(10);
      const complexObject = gtf.contexts.generateComplexObject(10);

      await glue.contexts.update(contextName, context);
      await glue.contexts.setPaths(contextName, [{ path: 'prop1.prop2', value: complexObject }]);

      const newContext = await glue.contexts.get(contextName);
      expect(newContext).to.eql(
        Object.assign({}, context, {
          prop1: { prop2: complexObject },
        })
      );
    });

    it('should update already existing context key values when invoked with valid data', async () => {
      const contextName = gtf.contexts.getContextName();
      const initContext = gtf.contexts.generateComplexObject(10);

      await glue.contexts.setPaths(contextName, [{ path: 'path1.path2', value: initContext }]);

      const newContext = gtf.contexts.generateComplexObject(10);
      await glue.contexts.setPaths(contextName, [{ path: 'path1.path2', value: newContext }]);

      const currentContext = await glue.contexts.get(contextName);
      expect(currentContext).to.eql({
        path1: { path2: newContext },
      });
    });

    it('should remove context key when passed data has an already existing key set to null', async () => {
      const context = {
        id: 'unique identifier',
        name: gtf.contexts.getContextName(),
        complexObject: gtf.contexts.generateComplexObject(10),
      };

      await glue.contexts.update(context.name, context);
      await glue.contexts.setPaths(context.name, [{ path: 'prop1.prop2', value: 'prop2 value' }]);

      const initialKeys = Object.keys(await glue.contexts.get(context.name));
      await glue.contexts.setPaths(context.name, [{ path: 'prop1', value: null }]);
      const newKeys = Object.keys(await glue.contexts.get(context.name));

      expect(newKeys.includes('prop1')).to.be.false;
      expect(initialKeys.length - 1).to.eql(newKeys.length);
    });

    it('should create a new complex context when invoked with valid arguments', async () => {
      const contextName = gtf.contexts.getContextName();
      const complexObj = gtf.contexts.generateComplexObject(200);

      await glue.contexts.setPaths(contextName, [{ path: 'prop1', value: complexObj }]);

      const newContext = await glue.contexts.get(contextName);
      expect(newContext).to.eql({ prop1: complexObj });
    });

    it('should add new prop with complex data when updating an existing complex context', async () => {
      const contextName = gtf.contexts.getContextName();
      const complexObject = gtf.contexts.generateComplexObject();
      const anotherComplexObject = gtf.contexts.generateComplexObject();

      await glue.contexts.setPaths(contextName, [
        { path: 'prop1', value: complexObject },
        { path: 'prop2', value: anotherComplexObject },
      ]);

      const newContext = await glue.contexts.get(contextName);
      expect(newContext).to.eql({
        prop1: complexObject,
        prop2: anotherComplexObject,
      });
    });

    it('should replace an already existing complex property with another complex object', async () => {
      const contextName = gtf.contexts.getContextName();
      const prop2Context = {
        id: gtf.contexts.getContextName(),
        prop2: 'value',
      };
      const initComplexObj = gtf.contexts.generateComplexObject(200);
      const anotherComplexObj = gtf.contexts.generateComplexObject(200);

      await glue.contexts.setPaths(contextName, [
        { path: 'prop1', value: initComplexObj },
        { path: 'prop2', value: prop2Context },
      ]);
      await glue.contexts.setPaths(contextName, [{ path: 'prop1', value: anotherComplexObj }]);

      const newContext = await glue.contexts.get(contextName);
      expect(newContext).to.eql({ prop1: anotherComplexObj, prop2: prop2Context });
    });

    it("should invoke the callback registered with subscribe() method when there's a subscription for the context", (done) => {
      const contextName = gtf.contexts.getContextName();

      glue.contexts
        .subscribe(contextName, (updatedCtx) => {
          if (updatedCtx.prop) {
            done();
          }
        })
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return glue.contexts.setPaths(contextName, [{ path: 'prop', value: 'value' }]);
        })
        .catch((err) => done(err));
    });

    it("should invoke the callback registered with subscribe() method with the correct data as first argument when there's a subscription for the context", (done) => {
      const contextName = gtf.contexts.getContextName();
      const prop1Context = {
        id: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(10),
      };
      const prop2Context = {
        title: 'prop2 context',
        value: 'prop2 value',
      };

      glue.contexts
        .subscribe(contextName, (updatedObject) => {
          if (Object.keys(updatedObject).length) {
            try {
              expect(updatedObject).to.eql({ prop1: prop1Context, prop2: prop2Context });
              done();
            } catch (err) {
              done(err);
            }
          }
        })
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);

          return glue.contexts.setPaths(contextName, [
            { path: 'prop1', value: prop1Context },
            { path: 'prop2', value: prop2Context },
          ]);
        })
        .catch((err) => done(err));
    });

    it('should invoke the callback registered with subscribe() method 3 times when a context is updated 3 times', (done) => {
      const contextName = gtf.contexts.getContextName();
      const prop1Context = {
        id: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(10),
      };
      const prop2Context = {
        title: 'prop2 context',
        value: 'prop2 value',
      };

      const ready = gtf.waitFor(3, done);

      glue.contexts
        .subscribe(contextName, (data) => {
          if (data.prop1.id === prop1Context.id) {
            ready();
          }
        })
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);

          return glue.contexts.setPaths(contextName, [{ path: 'prop1', value: prop1Context }]);
        })
        .then(() => glue.contexts.setPaths(contextName, [{ path: 'prop2', value: prop2Context }]))
        .then(() => glue.contexts.setPaths(contextName, [{ path: 'prop3', value: 'value3' }]))
        .catch((err) => done(err));
    });
  });

  describe('when manipulated by another app, ', function () {
    let supportApp;

    beforeEach(async () => {
      supportApp = await gtf.createApp();
    });

    afterEach(() => supportApp.stop());

    it("should create a new context when there isn't one with the given context name", async () => {
      const contextName = gtf.contexts.getContextName();
      await supportApp.contexts.setPaths(contextName, [{ path: 'prop', value: 'value' }]);

      const newContext = await glue.contexts.get(contextName);
      expect(newContext).to.eql({ prop: 'value' });
    });

    it("should add one more element to the array returned from all() when there isn't a context with passed name", async () => {
      const contextName = gtf.contexts.getContextName();

      const oldLength = glue.contexts.all().length;
      await supportApp.contexts.setPaths(contextName, [{ path: 'prop1', value: 'value' }]);
      const newLength = glue.contexts.all().length;

      expect(oldLength + 1).to.eql(newLength);
    });

    it('should not add one more element to the array returned from all() when there is a context with passed name', async () => {
      const contextName = gtf.contexts.getContextName();
      const complexObject = gtf.contexts.generateComplexObject(10);
      const anotherComplexObject = gtf.contexts.generateComplexObject(10);

      await supportApp.contexts.setPaths(contextName, [{ path: 'prop1.prop2', value: complexObject }]);
      const oldLength = glue.contexts.all().length;
      await supportApp.contexts.setPaths(contextName, [{ path: 'prop1.prop2', value: anotherComplexObject }]);
      const newLength = glue.contexts.all().length;

      expect(oldLength).to.eql(newLength);
    });

    it('should add new nested properties to the passed paths', async () => {
      const contextName = gtf.contexts.getContextName();
      const complexObject = gtf.contexts.generateComplexObject(10);
      const anotherComplexObject = gtf.contexts.generateComplexObject(10);

      await supportApp.contexts.setPaths(contextName, [
        { path: 'prop1.prop2', value: complexObject },
        { path: 'prop3.prop4', value: anotherComplexObject },
      ]);

      const newContext = await glue.contexts.get(contextName);
      expect(newContext).to.eql({
        prop1: { prop2: complexObject },
        prop3: { prop4: anotherComplexObject },
      });
    });

    it('should not change previous context properties', async () => {
      const contextName = gtf.contexts.getContextName();
      const context = gtf.contexts.generateComplexObject(10);
      const complexObject = gtf.contexts.generateComplexObject(10);

      await glue.contexts.update(contextName, context);
      await supportApp.contexts.setPaths(contextName, [{ path: 'prop1.prop2', value: complexObject }]);

      const newContext = await glue.contexts.get(contextName);
      expect(newContext).to.eql(
        Object.assign({}, context, {
          prop1: { prop2: complexObject },
        })
      );
    });

    it('should update already existing context key values when invoked with valid data', async () => {
      const contextName = gtf.contexts.getContextName();
      const initContext = gtf.contexts.generateComplexObject(10);

      await glue.contexts.setPaths(contextName, [{ path: 'path1.path2', value: initContext }]);

      const newContext = gtf.contexts.generateComplexObject(10);
      await supportApp.contexts.setPaths(contextName, [{ path: 'path1.path2', value: newContext }]);

      const currentContext = await glue.contexts.get(contextName);
      expect(currentContext).to.eql({
        path1: { path2: newContext },
      });
    });

    it('should remove context key when passed data has an already existing key set to null', async () => {
      const context = {
        id: 'unique identifier',
        name: gtf.contexts.getContextName(),
        complexObject: gtf.contexts.generateComplexObject(10),
      };

      await glue.contexts.update(context.name, context);
      await glue.contexts.setPaths(context.name, [{ path: 'prop1.prop2', value: 'prop2 value' }]);

      const initialKeys = Object.keys(await glue.contexts.get(context.name));
      await supportApp.contexts.setPaths(context.name, [{ path: 'prop1', value: null }]);
      const newKeys = Object.keys(await glue.contexts.get(context.name));

      expect(newKeys.includes('prop1')).to.be.false;
      expect(initialKeys.length - 1).to.eql(newKeys.length);
    });

    it('should create a new complex context when invoked with valid arguments', async () => {
      const contextName = gtf.contexts.getContextName();
      const complexObj = gtf.contexts.generateComplexObject(200);

      await supportApp.contexts.setPaths(contextName, [{ path: 'prop1', value: complexObj }]);

      const newContext = await glue.contexts.get(contextName);
      expect(newContext).to.eql({ prop1: complexObj });
    });

    it('should add new prop with complex data when updating an existing complex context', async () => {
      const contextName = gtf.contexts.getContextName();
      const complexObject = gtf.contexts.generateComplexObject();
      const anotherComplexObject = gtf.contexts.generateComplexObject();

      await supportApp.contexts.setPaths(contextName, [
        { path: 'prop1', value: complexObject },
        { path: 'prop2', value: anotherComplexObject },
      ]);

      const newContext = await glue.contexts.get(contextName);
      expect(newContext).to.eql({
        prop1: complexObject,
        prop2: anotherComplexObject,
      });
    });

    it('should replace an already existing complex property with another complex object', async () => {
      const contextName = gtf.contexts.getContextName();
      const prop2Context = {
        id: gtf.contexts.getContextName(),
        prop2: 'value',
      };
      const initComplexObj = gtf.contexts.generateComplexObject(200);
      const anotherComplexObj = gtf.contexts.generateComplexObject(200);

      await glue.contexts.setPaths(contextName, [
        { path: 'prop1', value: initComplexObj },
        { path: 'prop2', value: prop2Context },
      ]);
      await supportApp.contexts.setPaths(contextName, [{ path: 'prop1', value: anotherComplexObj }]);

      const newContext = await glue.contexts.get(contextName);
      expect(newContext).to.eql({ prop1: anotherComplexObj, prop2: prop2Context });
    });

    it("should invoke the callback registered with subscribe() method when there's a subscription for the context", (done) => {
      const contextName = gtf.contexts.getContextName();

      glue.contexts
        .subscribe(contextName, () => {
          done();
        })
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);

          return supportApp.contexts.setPaths(contextName, [{ path: 'prop', value: 'value' }]);
        })
        .catch((err) => done(err));
    });

    it("should invoke the callback registered with subscribe() method with the correct data as first argument when there's a subscription for the context", (done) => {
      const contextName = gtf.contexts.getContextName();
      const prop1Context = {
        id: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(10),
      };
      const prop2Context = {
        title: 'prop2 context',
        value: 'prop2 value',
      };

      glue.contexts
        .subscribe(contextName, (updatedObject) => {
          if (Object.keys(updatedObject).length) {
            try {
              expect(updatedObject).to.eql({ prop1: prop1Context, prop2: prop2Context });
              done();
            } catch (err) {
              done(err);
            }
          }
        })
        .then(() =>
          supportApp.contexts.setPaths(contextName, [
            { path: 'prop1', value: prop1Context },
            { path: 'prop2', value: prop2Context },
          ])
        )
        .catch((err) => done(err));
    });

    it('should invoke the callback registered with subscribe() method 3 times when a context is updated 3 times', (done) => {
      const contextName = gtf.contexts.getContextName();
      const prop1Context = {
        id: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(10),
      };
      const prop2Context = {
        title: 'prop2 context',
        value: 'prop2 value',
      };

      const ready = gtf.waitFor(3, done);

      glue.contexts
        .subscribe(contextName, (data) => {
          if (data.prop1.id === prop1Context.id) {
            ready();
          }
        })
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);

          return supportApp.contexts.setPaths(contextName, [{ path: 'prop1', value: prop1Context }]);
        })
        .then(() => supportApp.contexts.setPaths(contextName, [{ path: 'prop2', value: prop2Context }]))
        .then(() => supportApp.contexts.setPaths(contextName, [{ path: 'prop3', value: 'value3' }]))
        .catch((err) => done(err));
    });
  });
});
