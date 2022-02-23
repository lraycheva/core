describe('all() ', () => {
  let initialContexts;
  let contextName;

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
    it("should return an empty array when there aren't any contexts", () => {
      expect(glue.contexts.all()).to.eql([]);
    });

    [undefined, null, true, '', 'glue42', 42, [], { tick: 42 }, Symbol()].forEach((input) => {
      it('should not throw when arguments are passed', (done) => {
        try {
          expect(glue.contexts.all(input));
          done();
        } catch (error) {
          done('Should not throw an error');
        }
      });
    });

    it('should return an array', async () => {
      await glue.contexts.update(gtf.contexts.getContextName(), {});
      expect(glue.contexts.all()).to.be.an('array');
    });

    it('should return an array of strings', async () => {
      await glue.contexts.update(gtf.contexts.getContextName(), {});
      await glue.contexts.update(gtf.contexts.getContextName(), {});
      await glue.contexts.update(gtf.contexts.getContextName(), {});

      glue.contexts.all().forEach((contextName) => {
        expect(contextName).to.be.a('string');
      });
    });

    it('should return one more element when a valid context is created with update()', async () => {
      const oldLength = glue.contexts.all().length;
      await glue.contexts.update(gtf.contexts.getContextName(), {});
      const newLength = glue.contexts.all().length;

      expect(oldLength + 1).to.eql(newLength);
    });

    it('should return 3 more elements when 3 valid contexts are created with update()', async () => {
      const oldLength = glue.contexts.all().length;
      await glue.contexts.update(gtf.contexts.getContextName(), {});
      await glue.contexts.update(gtf.contexts.getContextName(), {});
      await glue.contexts.update(gtf.contexts.getContextName(), {});
      const newLength = glue.contexts.all().length;

      expect(oldLength + 3).to.eql(newLength);
    });

    it('should not return one more element when an invalid context is created with update()', (done) => {
      const oldLength = glue.contexts.all().length;

      try {
        glue.contexts.update(gtf.contexts.getContextName(), 'invalidContext');
        done('update() method should throw an error');
      } catch (error) {
        const newLength = glue.contexts.all().length;
        expect(oldLength).to.eql(newLength);
        done();
      }
    });

    it('should contain the new context after a new context is updated', async () => {
      const contextName = gtf.contexts.getContextName();
      await glue.contexts.update(contextName, { test: 42 });

      const allContexts = glue.contexts.all();

      const containsContext = allContexts.indexOf(contextName) >= 0;

      expect(containsContext).to.be.true;
    });

    it('should contain the new context after a new context is set', async () => {
      const contextName = gtf.contexts.getContextName();
      await glue.contexts.set(contextName, { test: 42 });

      const allContexts = glue.contexts.all();

      const containsContext = allContexts.indexOf(contextName) >= 0;

      expect(containsContext).to.be.true;
    });

    it('should not change when updating an already existing context with update()', async () => {
      const randomContextName = gtf.contexts.getContextName();

      await glue.contexts.update(randomContextName, {});
      const oldLength = glue.contexts.all().length;

      await glue.contexts.update(randomContextName, { tick: 42 });
      const newLength = glue.contexts.all().length;

      expect(oldLength).to.eql(newLength);
    });

    it('should return one more element when a valid context is created with set()', async () => {
      const oldLength = glue.contexts.all().length;
      await glue.contexts.set(gtf.contexts.getContextName(), {});
      const newLength = glue.contexts.all().length;

      expect(oldLength + 1).to.eql(newLength);
    });

    it('should return 3 more elements when 3 valid contexts are created with set()', async () => {
      const oldLength = glue.contexts.all().length;
      await glue.contexts.set(gtf.contexts.getContextName(), {});
      await glue.contexts.set(gtf.contexts.getContextName(), {});
      await glue.contexts.set(gtf.contexts.getContextName(), {});
      const newLength = glue.contexts.all().length;

      expect(oldLength + 3).to.eql(newLength);
    });

    it('should not return one more element when an invalid context is created with set()', (done) => {
      const oldLength = glue.contexts.all().length;

      try {
        glue.contexts.set(gtf.contexts.getContextName(), 'invalidContext');
        done('set() method should throw an error');
      } catch (error) {
        const newLength = glue.contexts.all().length;
        expect(oldLength).to.eql(newLength);
        done();
      }
    });

    it('should not change when updating an already existing context with set()', async () => {
      const randomContextName = gtf.contexts.getContextName();

      await glue.contexts.set(randomContextName, { tick: 42 });
      const oldLength = glue.contexts.all().length;

      await glue.contexts.set(randomContextName, { glue: 42 });
      const newLength = glue.contexts.all().length;

      expect(oldLength).to.eql(newLength);
    });

    it('should return one more element when a valid context is created with setPath()', async () => {
      const oldLength = glue.contexts.all().length;
      await glue.contexts.setPath(gtf.contexts.getContextName(), 'prop', {});
      const newLength = glue.contexts.all().length;

      expect(oldLength + 1).to.eql(newLength);
    });

    it('should return 3 more elements when 3 valid contexts are created with setPath()', async () => {
      const oldLength = glue.contexts.all().length;
      await glue.contexts.setPath(gtf.contexts.getContextName(), 'prop', {});
      await glue.contexts.setPath(gtf.contexts.getContextName(), 'prop', {});
      await glue.contexts.setPath(gtf.contexts.getContextName(), 'prop', {});
      const newLength = glue.contexts.all().length;

      expect(oldLength + 3).to.eql(newLength);
    });

    it('should not return one more element when an invalid context is created with setPath() - invoked with invalid first argument', (done) => {
      const oldLength = glue.contexts.all().length;

      try {
        glue.contexts.setPath(undefined, 'prop1', 'invalidContext');
        done('setPath() method should throw an error');
      } catch (error) {
        const newLength = glue.contexts.all().length;
        expect(oldLength).to.eql(newLength);
        done();
      }
    });

    it('should not return one more element when an invalid context is created with setPath() - invoked with invalid second argument', (done) => {
      const oldLength = glue.contexts.all().length;

      try {
        glue.contexts.setPath(gtf.contexts.getContextName(), undefined, 'invalidContext');
        done('setPath() method should throw an error');
      } catch (error) {
        const newLength = glue.contexts.all().length;
        expect(oldLength).to.eql(newLength);
        done();
      }
    });

    it('should not change when updating an already existing context with setPath()', async () => {
      const randomContextName = gtf.contexts.getContextName();

      await glue.contexts.setPath(randomContextName, 'prop1', {});
      const oldLength = glue.contexts.all().length;

      await glue.contexts.setPath(randomContextName, 'prop2', { tick: 42 });
      const newLength = glue.contexts.all().length;

      expect(oldLength).to.eql(newLength);
    });

    it('should return one more element when a valid context is created with setPaths()', async () => {
      const oldLength = glue.contexts.all().length;
      await glue.contexts.setPaths(gtf.contexts.getContextName(), [{ path: 'prop', value: 'value' }]);
      const newLength = glue.contexts.all().length;

      expect(oldLength + 1).to.eql(newLength);
    });

    it('should return 3 more elements when 3 valid contexts are created with setPaths()', async () => {
      const oldLength = glue.contexts.all().length;

      await glue.contexts.setPaths(gtf.contexts.getContextName(), [{ path: 'prop', value: 'value' }]);
      await glue.contexts.setPaths(gtf.contexts.getContextName(), [{ path: 'prop', value: 'value' }]);
      await glue.contexts.setPaths(gtf.contexts.getContextName(), [{ path: 'prop', value: 'value' }]);

      const newLength = glue.contexts.all().length;
      expect(oldLength + 3).to.eql(newLength);
    });

    it('should not return one more element when an invalid context is created with setPaths() - invoked with invalid first argument', (done) => {
      const oldLength = glue.contexts.all().length;

      try {
        glue.contexts.setPaths(undefined, [{ path: 'prop1', value: 'value' }]);
        done('setPaths() method should throw an error when invoked with invalid first argument');
      } catch (error) {
        const newLength = glue.contexts.all().length;
        expect(oldLength).to.eql(newLength);
        done();
      }
    });

    it('should not return one more element when an invalid context is created with setPaths() - invoked with invalid second argument', (done) => {
      const oldLength = glue.contexts.all().length;

      try {
        glue.contexts.setPaths('contextName', undefined);
        done('setPath() method should throw an error');
      } catch (error) {
        const newLength = glue.contexts.all().length;
        expect(oldLength).to.eql(newLength);
        done();
      }
    });

    it('should not change when updating an already existing context with setPaths()', async () => {
      const randomContextName = gtf.contexts.getContextName();

      await glue.contexts.setPaths(randomContextName, [
        { path: 'prop1', value: 'value1' },
        { path: 'prop2', value: 'value2' },
      ]);
      const oldLength = glue.contexts.all().length;

      await glue.contexts.setPaths(randomContextName, [
        { path: 'prop3', value: 'value3' },
        { path: 'prop4', value: 'value4' },
      ]);
      const newLength = glue.contexts.all().length;

      expect(oldLength).to.eql(newLength);
    });

    it('should return an array with decreased length when a valid context is destroyed', async () => {
      const randomContextName = gtf.contexts.getContextName();
      const randomContextNameTwo = gtf.contexts.getContextName();

      await glue.contexts.update(randomContextName, {});
      await glue.contexts.update(randomContextNameTwo, {});
      const oldLength = glue.contexts.all().length;
      await glue.contexts.destroy(randomContextNameTwo);
      const newLength = glue.contexts.all().length;

      expect(oldLength - 1).to.eql(newLength);
    });
  });

  describe('when manipulated by another app, ', function () {
    let secondApp;

    beforeEach(async () => {
      secondApp = await gtf.createApp();
    });

    afterEach(() => secondApp.stop());

    it('should contain the new context after a new context is updated', async () => {
      const contextName = gtf.contexts.getContextName();
      await secondApp.contexts.update(contextName, { test: 42 });

      const allContexts = glue.contexts.all();

      const containsContext = allContexts.indexOf(contextName) >= 0;

      expect(containsContext).to.be.true;
    });

    it('should contain the new context after a new context is set', async () => {
      const contextName = gtf.contexts.getContextName();
      await secondApp.contexts.set(contextName, { test: 42 });

      const allContexts = glue.contexts.all();

      const containsContext = allContexts.indexOf(contextName) >= 0;

      expect(containsContext).to.be.true;
    });

    it('should return one more element when a valid context is created with update()', async () => {
      const oldLength = glue.contexts.all().length;
      await secondApp.contexts.update(gtf.contexts.getContextName(), {});
      const newLength = glue.contexts.all().length;

      expect(oldLength + 1).to.eql(newLength);
    });

    it('should return 3 more elements when 3 valid contexts are created with update()', async () => {
      const oldLength = glue.contexts.all().length;

      await secondApp.contexts.update(gtf.contexts.getContextName(), {});
      await secondApp.contexts.update(gtf.contexts.getContextName(), {});
      await secondApp.contexts.update(gtf.contexts.getContextName(), {});

      const newLength = glue.contexts.all().length;
      expect(oldLength + 3).to.eql(newLength);
    });

    it('should not return one more element when an invalid context is created with update()', (done) => {
      const oldLength = glue.contexts.all().length;

      secondApp.contexts
        .update('', {})
        .then(() => {
          done('update() method should throw an error');
        })
        .catch((err) => {
          const newLength = glue.contexts.all().length;
          expect(oldLength).to.eql(newLength);
          done();
        });
    });

    it('should not change when updating an already existing context with update()', async () => {
      const randomContextName = gtf.contexts.getContextName();

      await glue.contexts.update(randomContextName, {});
      const oldLength = glue.contexts.all().length;

      await secondApp.contexts.update(randomContextName, { tick: 42 });
      const newLength = glue.contexts.all().length;

      expect(oldLength).to.eql(newLength);
    });

    it('should return one more element when a valid context is created with set()', async () => {
      const oldLength = glue.contexts.all().length;
      await secondApp.contexts.set(gtf.contexts.getContextName(), {});
      const newLength = glue.contexts.all().length;

      expect(oldLength + 1).to.eql(newLength);
    });

    it('should return 3 more elements when 3 valid contexts are created with set()', async () => {
      const oldLength = glue.contexts.all().length;

      await secondApp.contexts.set(gtf.contexts.getContextName(), {});
      await secondApp.contexts.set(gtf.contexts.getContextName(), {});
      await secondApp.contexts.set(gtf.contexts.getContextName(), {});

      const newLength = glue.contexts.all().length;
      expect(oldLength + 3).to.eql(newLength);
    });

    it('should not return one more element when an invalid context is created with set()', (done) => {
      const oldLength = glue.contexts.all().length;

      secondApp.contexts
        .set('', {})
        .then(() => {
          done('set() method should throw an error');
        })
        .catch((err) => {
          const newLength = glue.contexts.all().length;
          expect(oldLength).to.eql(newLength);
          done();
        });
    });

    it('should not change when updating an already existing context with set()', async () => {
      const randomContextName = gtf.contexts.getContextName();

      await glue.contexts.set(randomContextName, { tick: 42 });
      const oldLength = glue.contexts.all().length;

      await secondApp.contexts.set(randomContextName, { glue: 42 });
      const newLength = glue.contexts.all().length;

      expect(oldLength).to.eql(newLength);
    });

    it('should return an array with decreased length when a valid context is destroyed', async () => {
      const randomContextName = gtf.contexts.getContextName();
      const randomContextNameTwo = gtf.contexts.getContextName();

      await glue.contexts.update(randomContextName, {});
      await glue.contexts.update(randomContextNameTwo, {});
      const oldLength = glue.contexts.all().length;
      await secondApp.contexts.destroy(randomContextNameTwo);
      const newLength = glue.contexts.all().length;

      expect(oldLength - 1).to.eql(newLength);
    });
  });
});
