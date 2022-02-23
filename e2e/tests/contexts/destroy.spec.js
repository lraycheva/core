describe('destroy(), ', function () {
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
    return Promise.all(glue.contexts.all().map(async (context) => await glue.contexts.destroy(context)));
  });

  after(() => {
    return Promise.all(
      initialContexts.map(({ name, context }) => {
        glue.contexts.update(name, context);
      })
    );
  });

  describe('when manipulated by current app, ', function () {
    it('should throw when no argument is passed', (done) => {
      try {
        glue.contexts.destroy();
        done('Should throw an error');
      } catch (err) {
        done();
      }
    });

    [undefined, null, false, true, '', 42, [], { tick: 42 }].forEach((invalidName) => {
      it('should throw when an invalid argument is passed', (done) => {
        try {
          glue.contexts.destroy(invalidName);
          done('Should throw an error');
        } catch (error) {
          done();
        }
      });
    });

    it("should reject when there's no context with passed name", (done) => {
      glue.contexts
        .destroy(gtf.contexts.getContextName())
        .then(() => done('Expected method to reject'))
        .catch(() => done());
    });

    it('should destroy all the data associated with the passed context name', async () => {
      const newContext = {
        name: gtf.contexts.getContextName(),
        complexObject: gtf.contexts.generateComplexObject(10),
      };

      await glue.contexts.update(newContext.name, newContext);
      await glue.contexts.destroy(newContext.name);

      const currentContext = await glue.contexts.get(newContext.name);
      expect(currentContext).to.eql({});
    });

    it('should remove the context name from the array returned from all()', async () => {
      const randomContextName = gtf.contexts.getContextName();
      await glue.contexts.update(randomContextName, {});
      await glue.contexts.destroy(randomContextName);

      const contextNameExists = glue.contexts.all().includes(randomContextName);
      expect(contextNameExists).to.be.false;
    });

    it('should destroy all the data associated with the passed context name when it is a complex object', async () => {
      const context = {
        name: gtf.contexts.getContextName(),
        complexObject: gtf.contexts.generateComplexObject(200),
      };

      await glue.contexts.update(context.name, context);
      await glue.contexts.destroy(context.name);

      const currentContext = await glue.contexts.get(context.name);
      expect(currentContext).to.eql({});
    });
  });

  describe('when manipulated by another app, ', function () {
    let secondApp;

    beforeEach(async () => {
      secondApp = await gtf.createApp();
    });

    afterEach(() => secondApp.stop());

    it('should destroy all the data associated with the passed context name', async () => {
      const newContext = {
        name: gtf.contexts.getContextName(),
        complexObject: gtf.contexts.generateComplexObject(10),
      };

      await secondApp.contexts.update(newContext.name, newContext);
      await glue.contexts.destroy(newContext.name);

      const currentContext = await glue.contexts.get(newContext.name);
      expect(currentContext).to.eql({});
    });

    it('should destroy all the data associated with the passed context name when it is a complex object', async () => {
      const context = {
        name: gtf.contexts.getContextName(),
        complexObject: gtf.contexts.generateComplexObject(200),
      };

      await secondApp.contexts.update(context.name, context);
      await secondApp.contexts.destroy(context.name);

      const currentContext = await glue.contexts.get(context.name);
      expect(currentContext).to.eql({});
    });
  });
});
