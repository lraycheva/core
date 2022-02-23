describe('setPath(), ', function () {
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

  describe('when manipulated by current app, ', function () {
    it('should throw when no arguments are passed', (done) => {
      try {
        glue.contexts.setPath();
        done('Should throw an error');
      } catch (error) {
        done();
      }
    });

    it('should throw when invoked with one argument', (done) => {
      try {
        glue.contexts.setPath('contextName');
        done('Should throw an error');
      } catch (error) {
        done();
      }
    });

    it.skip('should throw when invoked with two arguments', (done) => {
      try {
        glue.contexts.setPath('contextName', 'path1.path2');
        done('Should throw an error');
      } catch (error) {
        done();
      }
    });

    it('should not throw when invoked with three valid arguments', async () => {
      await glue.contexts.setPath('contextName', 'path1.path2', { data: 'data' });
    });

    [undefined, null, true, '', 42, [], { tick: 42 }].forEach((invalidName) => {
      it(`should throw when an invalid first argument (${JSON.stringify(invalidName)}) is passed`, (done) => {
        try {
          glue.contexts.setPath(invalidName, 'path1.path2', { data: 'data' });
          done('Should throw an error');
        } catch (error) {
          done();
        }
      });
    });

    [undefined, null, true, 42, [], { tick: 42 }].forEach((invalidPath) => {
      it(`should throw when an invalid second argument (${JSON.stringify(invalidPath)}) is passed`, (done) => {
        try {
          glue.contexts.setPath('contextName', invalidPath, { data: 'data' });
          done('Should throw an error');
        } catch (error) {
          done();
        }
      });
    });

    it.skip('should return undefined', async () => {
      const returned = await glue.contexts.setPath('contextName', 'prop1.prop2', 'value');
      expect(returned).to.eql(undefined);
    });

    it("should create a new context when there isn't one with the given context name", async () => {
      const contextName = gtf.contexts.getContextName();
      await glue.contexts.setPath(contextName, 'prop', 'value');

      const newContext = await glue.contexts.get(contextName);
      expect(newContext).to.eql({ prop: 'value' });
    });

    it("should add one more element to the array returned from all() when there isn't a context with passed name", async () => {
      const contextName = gtf.contexts.getContextName();
      const complexObject = gtf.contexts.generateComplexObject(10);

      const oldLength = glue.contexts.all().length;
      await glue.contexts.setPath(contextName, 'prop1.prop2', complexObject);
      const newLength = glue.contexts.all().length;

      expect(oldLength + 1).to.eql(newLength);
    });

    it('should not add one more element to the array returned from all() when there is a context with passed name', async () => {
      const contextName = gtf.contexts.getContextName();
      const complexObject = gtf.contexts.generateComplexObject(10);
      const anotherComplexObject = gtf.contexts.generateComplexObject(10);

      await glue.contexts.setPath(contextName, 'prop1.prop2', complexObject);
      const oldLength = glue.contexts.all().length;
      await glue.contexts.setPath(contextName, 'prop3.prop4', anotherComplexObject);
      const newLength = glue.contexts.all().length;

      expect(oldLength).to.eql(newLength);
    });

    it('should add new nested properties to the passed path', async () => {
      const contextName = gtf.contexts.getContextName();
      await glue.contexts.setPath(contextName, 'prop1.prop2.prop3', 'prop3 value');

      const newContext = await glue.contexts.get(contextName);
      expect(newContext).to.eql({
        prop1: { prop2: { prop3: 'prop3 value' } },
      });
    });

    it('should not change previous context properties', async () => {
      const contextName = gtf.contexts.getContextName();
      const context = gtf.contexts.generateComplexObject(10);

      await glue.contexts.update(contextName, context);
      await glue.contexts.setPath(contextName, 'prop1.prop2.prop3', 'prop3 value');

      const newContext = await glue.contexts.get(contextName);
      expect(newContext).to.eql(
        Object.assign({}, context, {
          prop1: { prop2: { prop3: 'prop3 value' } },
        })
      );
    });

    it('should update already existing context key values when invoked with valid data', async () => {
      const contextName = gtf.contexts.getContextName();
      const initContext = gtf.contexts.generateComplexObject(10);

      await glue.contexts.setPath(contextName, 'path1.path2', initContext);
      const newContext = gtf.contexts.generateComplexObject(10);
      await glue.contexts.setPath(contextName, 'path1.path2', newContext);

      expect(await glue.contexts.get(contextName)).to.eql({
        path1: { path2: newContext },
      });
    });

    it("should add properties on top level of context when invoked with an empty string ('') as a second argument", async () => {
      const contextName = gtf.contexts.getContextName();
      const initContext = gtf.contexts.generateComplexObject(10);
      await glue.contexts.setPath(contextName, '', initContext);

      const newContext = await glue.contexts.get(contextName);
      expect(newContext).to.eql(initContext);
    });

    it('should remove context key when passed data has an already existing key set to null', async () => {
      const context = {
        id: 'unique identifier',
        name: gtf.contexts.getContextName(),
        complexObject: gtf.contexts.generateComplexObject(10),
      };

      await glue.contexts.update(context.name, context);
      await glue.contexts.setPath(context.name, 'prop1.prop2', 'prop2 value');

      const initialKeys = Object.keys(await glue.contexts.get(context.name));
      await glue.contexts.setPath(context.name, 'prop1', null);
      const newKeys = Object.keys(await glue.contexts.get(context.name));

      expect(newKeys.includes('prop1')).to.be.false;
      expect(initialKeys.length - 1).to.eql(newKeys.length);
    });

    it('should create a new complex context when invoked with valid arguments', async () => {
      const contextName = gtf.contexts.getContextName();
      const complexObj = gtf.contexts.generateComplexObject(200);

      await glue.contexts.setPath(contextName, 'prop1', complexObj);

      const newContext = await glue.contexts.get(contextName);
      expect(newContext).to.eql({ prop1: complexObj });
    });

    it('should add new prop with complex data when updating an existing complex context', async () => {
      const contextName = gtf.contexts.getContextName();
      const initComplexObj = gtf.contexts.generateComplexObject(200);
      const anotherComplexObj = gtf.contexts.generateComplexObject(200);

      await glue.contexts.setPath(contextName, 'prop1', initComplexObj);
      await glue.contexts.setPath(contextName, 'prop2', anotherComplexObj);

      const newContext = await glue.contexts.get(contextName);
      expect(newContext).to.eql({ prop1: initComplexObj, prop2: anotherComplexObj });
    });

    it('should replace an already existing complex property with another complex object', async () => {
      const contextName = gtf.contexts.getContextName();
      const initComplexObj = gtf.contexts.generateComplexObject(200);
      const anotherComplexObj = gtf.contexts.generateComplexObject(200);

      await glue.contexts.setPath(contextName, 'prop1', initComplexObj);
      await glue.contexts.setPath(contextName, 'prop1', anotherComplexObj);

      const newContext = await glue.contexts.get(contextName);
      expect(newContext).to.eql({ prop1: anotherComplexObj });
    });

    it("should invoke the callback registered with subscribe() method when there's a subscription for the context", (done) => {
      const contextName = gtf.contexts.getContextName();

      glue.contexts
        .subscribe(contextName, () => {
          done();
        })
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);

          return glue.contexts.setPath(contextName, 'prop', 'value');
        })
        .catch((err) => done(err));
    });

    it("should invoke the callback registered with subscribe() method with the correct data as first argument when there's a subscription for the context", (done) => {
      const contextName = gtf.contexts.getContextName();
      const context = {
        id: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(10),
      };

      glue.contexts
        .subscribe(contextName, (updatedObject) => {
          if (Object.keys(updatedObject).length) {
            try {
              expect(updatedObject).to.eql({ prop1: context });
              done();
            } catch (err) {
              done(err);
            }
          }
        })
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return glue.contexts.setPath(contextName, 'prop1', context);
        })
        .catch((err) => done(err));
    });

    it('should invoke the callback registered with subscribe() method 3 times when a context is updated 3 times', (done) => {
      const contextName = gtf.contexts.getContextName();
      const context = {
        id: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(10),
      };

      const ready = gtf.waitFor(3, done);

      glue.contexts
        .subscribe(contextName, (data) => {
          if (data.prop1.id === context.id) {
            ready();
          }
        })
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return glue.contexts.setPath(contextName, 'prop1', context);
        })
        .then(() => glue.contexts.setPath(contextName, 'prop2', { date: new Date() }))
        .then(() => glue.contexts.setPath(contextName, 'prop3', 'value3'))
        .catch((err) => done(err));
    });
  });

  describe('when manipulate by another glue app, ', function () {
    let supportApp;

    beforeEach(async () => {
      supportApp = await gtf.createApp();
    });

    afterEach(() => supportApp.stop());

    it('should return undefined', async () => {
      const returned = await supportApp.contexts.setPath('contextName', 'prop1.prop2', 'value');
      expect(returned).to.eql(undefined);
    });

    it("should create a new context when there isn't one with the given context name", async () => {
      const contextName = gtf.contexts.getContextName();
      await supportApp.contexts.setPath(contextName, 'prop', 'value');

      const newContext = await glue.contexts.get(contextName);
      expect(newContext).to.eql({ prop: 'value' });
    });

    it("should add one more element to the array returned from all() when there isn't a context with passed name", async () => {
      const contextName = gtf.contexts.getContextName();
      const complexObject = gtf.contexts.generateComplexObject(10);

      const oldLength = glue.contexts.all().length;
      await supportApp.contexts.setPath(contextName, 'prop1.prop2', complexObject);
      const newLength = glue.contexts.all().length;

      expect(oldLength + 1).to.eql(newLength);
    });

    it('should not add one more element to the array returned from all() when there is a context with passed name', async () => {
      const contextName = gtf.contexts.getContextName();
      const complexObject = gtf.contexts.generateComplexObject(10);
      const anotherComplexObject = gtf.contexts.generateComplexObject(10);

      await supportApp.contexts.setPath(contextName, 'prop1.prop2', complexObject);
      const oldLength = glue.contexts.all().length;
      await supportApp.contexts.setPath(contextName, 'prop3.prop4', anotherComplexObject);
      const newLength = glue.contexts.all().length;

      expect(oldLength).to.eql(newLength);
    });

    it('should add new nested properties to the passed path', async () => {
      const contextName = gtf.contexts.getContextName();
      await supportApp.contexts.setPath(contextName, 'prop1.prop2.prop3', 'prop3 value');

      const newContext = await glue.contexts.get(contextName);
      expect(newContext).to.eql({
        prop1: { prop2: { prop3: 'prop3 value' } },
      });
    });

    it('should not change previous context properties', async () => {
      const contextName = gtf.contexts.getContextName();
      const context = gtf.contexts.generateComplexObject(10);

      await supportApp.contexts.update(contextName, context);
      await supportApp.contexts.setPath(contextName, 'prop1.prop2.prop3', 'prop3 value');

      const newContext = await glue.contexts.get(contextName);
      expect(newContext).to.eql(
        Object.assign({}, context, {
          prop1: { prop2: { prop3: 'prop3 value' } },
        })
      );
    });

    it('should update already existing context key values when invoked with valid data', async () => {
      const contextName = gtf.contexts.getContextName();
      const initContext = gtf.contexts.generateComplexObject(10);

      await supportApp.contexts.setPath(contextName, 'path1.path2', initContext);
      const newContext = gtf.contexts.generateComplexObject(10);
      await supportApp.contexts.setPath(contextName, 'path1.path2', newContext);

      expect(await glue.contexts.get(contextName)).to.eql({
        path1: { path2: newContext },
      });
    });

    it("should add properties on top level of context when invoked with an empty string ('') as a second argument", async () => {
      const contextName = gtf.contexts.getContextName();
      const initContext = gtf.contexts.generateComplexObject(10);
      await supportApp.contexts.setPath(contextName, '', initContext);

      const newContext = await glue.contexts.get(contextName);
      expect(newContext).to.eql(initContext);
    });

    it('should remove context key when passed data has an already existing key set to null', async () => {
      const context = {
        id: 'unique identifier',
        name: gtf.contexts.getContextName(),
        complexObject: gtf.contexts.generateComplexObject(10),
      };

      await glue.contexts.update(context.name, context);
      await supportApp.contexts.setPath(context.name, 'prop1.prop2', 'prop2 value');

      const initialKeys = Object.keys(await glue.contexts.get(context.name));
      await supportApp.contexts.setPath(context.name, 'prop1', null);
      const newKeys = Object.keys(await glue.contexts.get(context.name));

      expect(newKeys.includes('prop1')).to.be.false;
      expect(initialKeys.length - 1).to.eql(newKeys.length);
    });

    it('should create a new complex context when invoked with valid arguments', async () => {
      const contextName = gtf.contexts.getContextName();
      const complexObj = gtf.contexts.generateComplexObject(200);

      await supportApp.contexts.setPath(contextName, 'prop1', complexObj);

      const newContext = await glue.contexts.get(contextName);
      expect(newContext).to.eql({ prop1: complexObj });
    });

    it('should add new prop with complex data when updating an existing complex context', async () => {
      const contextName = gtf.contexts.getContextName();
      const initComplexObj = gtf.contexts.generateComplexObject(200);
      const anotherComplexObj = gtf.contexts.generateComplexObject(200);

      await supportApp.contexts.setPath(contextName, 'prop1', initComplexObj);
      await supportApp.contexts.setPath(contextName, 'prop2', anotherComplexObj);

      const newContext = await glue.contexts.get(contextName);
      expect(newContext).to.eql({ prop1: initComplexObj, prop2: anotherComplexObj });
    });

    it('should replace an already existing complex property with another complex object', async () => {
      const contextName = gtf.contexts.getContextName();
      const initComplexObj = gtf.contexts.generateComplexObject(200);
      const anotherComplexObj = gtf.contexts.generateComplexObject(200);

      await supportApp.contexts.setPath(contextName, 'prop1', initComplexObj);
      await supportApp.contexts.setPath(contextName, 'prop1', anotherComplexObj);

      const newContext = await glue.contexts.get(contextName);
      expect(newContext).to.eql({ prop1: anotherComplexObj });
    });

    it("should invoke the callback registered with subscribe() method when there's a subscription for the context", (done) => {
      const contextName = gtf.contexts.getContextName();

      glue.contexts
        .subscribe(contextName, () => {
          done();
        })
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return supportApp.contexts.setPath(contextName, 'prop', 'value');
        })
        .catch((err) => done(err));
    });

    it("should invoke the callback registered with subscribe() method with the correct data as first argument when there's a subscription for the context", (done) => {
      const contextName = gtf.contexts.getContextName();
      const context = {
        id: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(10),
      };

      glue.contexts
        .subscribe(contextName, (updatedObject) => {
          if (Object.keys(updatedObject)) {
            try {
              expect(updatedObject).to.eql({ prop1: context });
              done();
            } catch (err) {
              done(err);
            }
          }
        })
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return supportApp.contexts.setPath(contextName, 'prop1', context);
        })
        .catch((err) => done(err));
    });

    it('should invoke the callback registered with subscribe() method 3 times when a context is updated 3 times', (done) => {
      const contextName = gtf.contexts.getContextName();
      const context = {
        id: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(10),
      };

      const ready = gtf.waitFor(3, done);

      glue.contexts
        .subscribe(contextName, (data) => {
          if (data.prop1.id === context.id) {
            ready();
          }
        })
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return supportApp.contexts.setPath(contextName, 'prop1', context);
        })
        .then(() => supportApp.contexts.setPath(contextName, 'prop2', { date: new Date() }))
        .then(() => supportApp.contexts.setPath(contextName, 'prop3', 'value3'))
        .catch((err) => done(err));
    });
  });
});
