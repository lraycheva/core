describe('subscribe() ', () => {
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
        glue.contexts.subscribe();
        done('should throw an error');
      } catch (error) {
        done();
      }
    });

    [undefined, null, false, true, '', 42, [], { tick: 42 }].forEach((invalidName) => {
      it(`should throw when an invalid name (${JSON.stringify(invalidName)}) is passed`, (done) => {
        try {
          glue.contexts.subscribe(invalidName, () => {});
          done('should throw an error');
        } catch (error) {
          done();
        }
      });
    });

    it('should throw when invoked with only one argument', (done) => {
      try {
        glue.contexts.subscribe('contextName');
        done('should throw an error');
      } catch (error) {
        done();
      }
    });

    [undefined, null, false, true, '', 42, [], { tick: 42 }].forEach((invalidSecondArg) => {
      it(`should throw when invoked with an invalid second argument - ${JSON.stringify(invalidSecondArg)}`, (done) => {
        try {
          glue.contexts.subscribe('contextName', invalidSecondArg);
          done('should throw an error');
        } catch (error) {
          done();
        }
      });
    });

    it('should invoke the callback when the specified context has been created with update()', (done) => {
      const contextName = gtf.contexts.getContextName();
      const context = { id: gtf.contexts.getContextName() };

      glue.contexts
        .subscribe(contextName, (data) => {
          if (data.id === context.id) {
            done();
          }
        })
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return glue.contexts.update(contextName, context);
        })
        .catch((err) => done(err));
    });

    it('should invoke the callback when the specified context has been created with set()', (done) => {
      const contextName = gtf.contexts.getContextName();
      const context = { id: gtf.contexts.getContextName() };

      glue.contexts
        .subscribe(contextName, (data) => {
          if (data.id === context.id) {
            done();
          }
        })
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return glue.contexts.set(contextName, context);
        })
        .catch((err) => done(err));
    });

    it('should invoke the callback when the specified context has been created with setPath()', (done) => {
      const contextName = gtf.contexts.getContextName();

      glue.contexts
        .subscribe(contextName, (data) => {
          if (data.prop === 'value') {
            done();
          }
        })
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return glue.contexts.setPath(contextName, 'prop', 'value');
        })
        .catch((err) => done(err));
    });

    it('should invoke the callback when the specified context has been created with setPaths()', (done) => {
      const contextName = gtf.contexts.getContextName();
      const contextPaths = [
        { path: 'prop1', value: 'value1' },
        { path: 'prop2', value: 'value2' },
      ];

      glue.contexts
        .subscribe(contextName, (data) => {
          if (data.prop1 === 'value1') {
            done();
          }
        })
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return glue.contexts.setPaths(contextName, contextPaths);
        })
        .catch((err) => done(err));
    });

    it('should invoke the callback with an object as first argument when the specified context has been created with update()', (done) => {
      const contextName = gtf.contexts.getContextName();
      const context = {
        id: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(10),
      };

      glue.contexts
        .subscribe(contextName, (updatedObject) => {
          if (updatedObject.id === context.id) {
            try {
              expect(updatedObject).to.be.an('object');
              done();
            } catch (error) {
              done(error);
            }
          }
        })
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);

          return glue.contexts.update(contextName, context);
        })
        .catch((err) => done(err));
    });

    it('should invoke the callback with an object as first argument when the specified context has been created with set()', (done) => {
      const contextName = gtf.contexts.getContextName();
      const context = {
        id: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(10),
      };

      glue.contexts
        .subscribe(contextName, (updatedObject) => {
          if (updatedObject.id === context.id) {
            try {
              expect(updatedObject).to.be.an('object');
              done();
            } catch (error) {
              done(error);
            }
          }
        })
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return glue.contexts.set(contextName, context);
        })
        .catch((err) => done(err));
    });

    it('should invoke the callback with an object as first argument  when the specified context has been created with setPath()', (done) => {
      const contextName = gtf.contexts.getContextName();
      const context = {
        id: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(10),
      };

      glue.contexts
        .subscribe(contextName, (updatedObject) => {
          if (updatedObject.prop1.id === context.id) {
            try {
              expect(updatedObject).to.be.an('object');
              done();
            } catch (error) {
              done(error);
            }
          }
        })
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return glue.contexts.setPath(contextName, 'prop1', context);
        })
        .catch((err) => done(err));
    });

    it('should invoke the callback with an object as first argument  when the specified context has been created with setPaths()', (done) => {
      const contextName = gtf.contexts.getContextName();

      glue.contexts
        .subscribe(contextName, (updatedObject) => {
          if (updatedObject.prop1 === 'value1') {
            try {
              expect(updatedObject).to.be.an('object');
              done();
            } catch (error) {
              done(error);
            }
          }
        })
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return glue.contexts.setPaths(contextName, [
            { path: 'prop1', value: 'value1' },
            { path: 'prop2', value: 'value2' },
          ]);
        })

        .catch((err) => done(err));
    });

    it('should invoke the callback with correct data as first argument when the specified context has been created with update()', (done) => {
      const contextName = gtf.contexts.getContextName();
      const context = {
        id: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(10),
      };

      glue.contexts
        .subscribe(contextName, (updatedObject) => {
          if (updatedObject.id === context.id) {
            try {
              expect(updatedObject).to.eql(context);
              done();
            } catch (error) {
              done(error);
            }
          }
        })
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return glue.contexts.update(contextName, context);
        })
        .catch((err) => done(err));
    });

    it('should invoke the callback with correct data as first argument when the specified context has been created with set()', (done) => {
      const contextName = gtf.contexts.getContextName();
      const context = {
        id: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(10),
      };

      glue.contexts
        .subscribe(contextName, (updatedObject) => {
          if (updatedObject.id === context.id) {
            try {
              expect(updatedObject).to.eql(context);
              done();
            } catch (error) {
              done(error);
            }
          }
        })
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return glue.contexts.set(contextName, context);
        })
        .catch((err) => done(err));
    });

    it('should invoke the callback with correct data as first argument when the specified context has been created with setPath()', (done) => {
      const contextName = gtf.contexts.getContextName();
      const context = {
        id: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(10),
      };

      glue.contexts
        .subscribe(contextName, (updatedObject) => {
          if (updatedObject.prop1.id === context.id) {
            try {
              expect(updatedObject).to.eql({ prop1: context });
              done();
            } catch (error) {
              done(error);
            }
          }
        })
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return glue.contexts.setPath(contextName, 'prop1', context);
        })
        .catch((err) => done(err));
    });

    it('should invoke the callback with correct data as first argument when the specified context has been created with setPaths()', (done) => {
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
          if (updatedObject.prop1.id === prop1Context.id) {
            try {
              expect(updatedObject).to.eql({
                prop1: prop1Context,
                prop2: prop2Context,
              });
              done();
            } catch (error) {
              done(error);
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

    it('should invoke the callback 3 times when a context is updated 3 times with update()', (done) => {
      const ready = gtf.waitFor(3, done);
      const context = {
        id: gtf.contexts.getContextName(),
        name: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(10),
      };

      glue.contexts
        .subscribe(context.name, (data) => {
          if (data.id === context.id) {
            ready();
          }
        })
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return glue.contexts.update(context.name, context);
        })
        .then(() => glue.contexts.update(context.name, { date: new Date() }))
        .then(() => glue.contexts.update(context.name, { prop: 'value' }))
        .catch((err) => done(err));
    });

    it('should invoke the callback 3 times when a context is changed 3 times with set()', (done) => {
      const ready = gtf.waitFor(3, done);
      const contextName = gtf.contexts.getContextName();
      const id = gtf.contexts.getContextName();
      const context = {
        id,
        name: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(10),
      };

      glue.contexts
        .subscribe(contextName, (data) => {
          if (data.id === context.id) {
            ready();
          }
        })
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);

          return glue.contexts.set(contextName, context);
        })
        .then(() => glue.contexts.set(contextName, { id, date: new Date() }))
        .then(() => glue.contexts.set(contextName, { id, prop: 'value' }))
        .catch((err) => done(err));
    });

    it('should invoke the callback 3 times when a context is changed 3 times with setPath()', (done) => {
      const ready = gtf.waitFor(3, done);
      const context = {
        id: gtf.contexts.getContextName(),
        name: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(10),
      };

      glue.contexts
        .subscribe(context.name, (data) => {
          if (data.prop1.id === context.id) {
            ready();
          }
        })
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return glue.contexts.setPath(context.name, 'prop1', context);
        })
        .then(() => glue.contexts.setPath(context.name, 'prop2', { date: new Date() }))
        .then(() => glue.contexts.setPath(context.name, 'prop3', { prop: 'value' }))
        .catch((err) => done(err));
    });

    it('should invoke the callback 3 times when a context is changed 3 times with setPaths()', (done) => {
      const ready = gtf.waitFor(3, done);
      const context = {
        id: gtf.contexts.getContextName(),
        name: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(10),
      };

      glue.contexts
        .subscribe(context.name, (data) => {
          if (data.prop1.id === context.id) {
            ready();
          }
        })
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return glue.contexts.setPaths(context.name, [{ path: 'prop1', value: context }]);
        })
        .then(() => glue.contexts.setPaths(context.name, [{ path: 'prop2', value: { date: new Date() } }]))
        .then(() => glue.contexts.setPaths(context.name, [{ path: 'prop3', value: { prop: 'value' } }]))
        .catch((err) => done(err));
    });

    it('should invoke the callback with the updated data as first argument when the specified context has been changed with update()', (done) => {
      const context = {
        name: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(10),
      };
      const newContext = {
        id: gtf.contexts.getContextName(),
        date: new Date(),
        title: 'new context',
      };

      glue.contexts
        .update(context.name, context)
        .then(() =>
          glue.contexts.subscribe(context.name, (updatedObject) => {
            if (updatedObject.id === newContext.id) {
              try {
                expect(updatedObject).to.eql(Object.assign({}, context, newContext));
                done();
              } catch (error) {
                done(error);
              }
            }
          })
        )
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return glue.contexts.update(context.name, newContext);
        })
        .catch((err) => done(err));
    });

    it('should invoke the callback with the new data as first argument when the specified context has been changed with set()', (done) => {
      const contextName = gtf.contexts.getContextName();
      const context = gtf.contexts.generateComplexObject(10);
      const newContext = {
        id: gtf.contexts.getContextName(),
        date: new Date(),
        title: 'new context',
      };

      glue.contexts
        .set(contextName, context)
        .then(() =>
          glue.contexts.subscribe(contextName, (updatedObject) => {
            if (updatedObject.id === newContext.id) {
              try {
                expect(updatedObject).to.eql(newContext);
                done();
              } catch (error) {
                done(error);
              }
            }
          })
        )
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return glue.contexts.set(contextName, newContext);
        })
        .catch((err) => done(err));
    });

    it('should invoke the callback with the new data as first argument when the specified context has been updated with setPath()', (done) => {
      const contextName = gtf.contexts.getContextName();
      const prop1Context = {
        date: new Date(),
        title: 'new context',
      };
      const prop2Context = {
        id: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(10),
      };

      glue.contexts
        .setPath(contextName, 'prop1', prop1Context)
        .then(() =>
          glue.contexts.subscribe(contextName, (updatedObject) => {
            if (updatedObject.prop2.id === prop2Context.id) {
              try {
                expect(updatedObject).to.eql({
                  prop1: prop1Context,
                  prop2: prop2Context,
                });
                done();
              } catch (error) {
                done(error);
              }
            }
          })
        )
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return glue.contexts.setPath(contextName, 'prop2', prop2Context);
        })
        .catch((err) => done(err));
    });

    it('should invoke the callback with the new data as first argument when the specified context has been updated with setPaths()', (done) => {
      const contextName = gtf.contexts.getContextName();
      const prop1Context = {
        date: new Date(),
        title: 'new context',
      };
      const prop2Context = {
        id: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(10),
      };

      glue.contexts
        .setPaths(contextName, [{ path: 'prop1', value: prop1Context }])
        .then(() =>
          glue.contexts.subscribe(contextName, (updatedObject) => {
            if (updatedObject.prop2.id === prop2Context.id) {
              try {
                expect(updatedObject).to.eql({
                  prop1: prop1Context,
                  prop2: prop2Context,
                });
                done();
              } catch (error) {
                done(error);
              }
            }
          })
        )
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return glue.contexts.setPaths(contextName, [{ path: 'prop2', value: prop2Context }]);
        })
        .catch((err) => done(err));
    });

    it('should invoke the callback with the object to update the context with as a second argument when the specified context has been updated with update()', (done) => {
      const contextName = gtf.contexts.getContextName();
      const initContext = {
        id: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(10),
      };
      const newContext = gtf.contexts.generateComplexObject(10);

      glue.contexts
        .update(contextName, initContext)
        .then(() =>
          glue.contexts.subscribe(contextName, (updatedObject, objectToUpdateWith) => {
            if (Object.keys(objectToUpdateWith).length) {
              try {
                expect(objectToUpdateWith).to.eql(newContext);
                done();
              } catch (error) {
                done(error);
              }
            }
          })
        )
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return glue.contexts.update(contextName, newContext);
        })
        .catch((err) => done(err));
    });

    it('should invoke the callback with the object to update the context with as a second argument when the specified context has been changed with set()', (done) => {
      const contextName = gtf.contexts.getContextName();
      const initContext = gtf.contexts.generateComplexObject(10);
      const newContext = {
        id: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(10),
      };

      glue.contexts
        .set(contextName, initContext)
        .then(() =>
          glue.contexts.subscribe(contextName, (updatedObject, objectToUpdateWith) => {
            if (Object.keys(objectToUpdateWith).length) {
              try {
                expect(objectToUpdateWith).to.eql(newContext);
                done();
              } catch (error) {
                done(error);
              }
            }
          })
        )
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return glue.contexts.set(contextName, newContext);
        })
        .catch((err) => done(err));
    });

    it('should invoke the callback with the object to update the context with as a second argument when the specified context has been updated with setPath()', (done) => {
      const contextName = gtf.contexts.getContextName();
      const prop1Context = {
        id: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(10),
      };
      const prop2Context = {
        date: new Date(),
        title: 'new context',
      };

      glue.contexts
        .setPath(contextName, 'prop1', prop1Context)
        .then(() =>
          glue.contexts.subscribe(contextName, (updatedObject, objectToUpdateWith) => {
            if (Object.keys(objectToUpdateWith).length) {
              try {
                expect(objectToUpdateWith).to.eql({ prop2: prop2Context });
                done();
              } catch (error) {
                done(error);
              }
            }
          })
        )
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return glue.contexts.setPath(contextName, 'prop2', prop2Context);
        })
        .catch((err) => done(err));
    });

    it('should invoke the callback with the object to update the context with as a second argument when the specified context has been updated with setPaths()', (done) => {
      const contextName = gtf.contexts.getContextName();
      const prop1Context = {
        date: new Date(),
        title: 'new context',
      };
      const prop2Context = {
        id: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(10),
      };

      glue.contexts
        .setPaths(contextName, [{ path: 'prop1', value: prop1Context }])
        .then(() =>
          glue.contexts.subscribe(contextName, (updatedObject, objectToUpdateWith) => {
            if (Object.keys(objectToUpdateWith).length) {
              try {
                expect(objectToUpdateWith).to.eql({
                  prop2: prop2Context,
                });
                done();
              } catch (error) {
                done(error);
              }
            }
          })
        )
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return glue.contexts.setPaths(contextName, [{ path: 'prop2', value: prop2Context }]);
        })
        .catch((err) => done(err));
    });

    it('should invoke the callback with an array as third argument when context is updated with existing keys set to null with update()', (done) => {
      const contextName = gtf.contexts.getContextName();
      const context = {
        name: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(10),
        id: 'unique identifier',
        title: 'title',
        date: new Date(),
      };

      glue.contexts
        .update(contextName, context)
        .then(() =>
          glue.contexts.subscribe(contextName, (updatedObject, objectToUpdateWith, removedKeys) => {
            if (Object.keys(objectToUpdateWith).length) {
              try {
                expect(removedKeys).to.eql(['title', 'date']);
                done();
              } catch (error) {
                done(error);
              }
            }
          })
        )
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return glue.contexts.update(contextName, { title: null, date: null });
        })
        .catch((err) => done(err));
    });

    it('should invoke the callback with an array of the removed keys as third argument when context is updated with existing keys set to null with setPath()', (done) => {
      const contextName = gtf.contexts.getContextName();

      glue.contexts
        .setPath(contextName, 'prop1.prop2', 'prop2 value')
        .then(() =>
          glue.contexts.subscribe(contextName, (updatedObject, objectToUpdateWith, removedKeys) => {
            if (Object.keys(objectToUpdateWith).length) {
              try {
                expect(removedKeys).to.be.an('array');
                expect(removedKeys).to.eql(['prop1']);
                done();
              } catch (error) {
                done(error);
              }
            }
          })
        )
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return glue.contexts.setPath(contextName, 'prop1', null);
        })
        .catch((err) => done(err));
    });

    it('should invoke the callback with an array of the removed keys as third argument when context is updated with existing keys set to null with setPaths()', (done) => {
      const contextName = gtf.contexts.getContextName();

      glue.contexts
        .setPaths(contextName, [{ path: 'prop1.prop2', value: 'prop2 value' }])
        .then(() =>
          glue.contexts.subscribe(contextName, (updatedObject, objectToUpdateWith, removedKeys) => {
            if (Object.keys(objectToUpdateWith).length) {
              try {
                expect(removedKeys).to.be.an('array');
                expect(removedKeys).to.eql(['prop1']);
                done();
              } catch (error) {
                done(error);
              }
            }
          })
        )
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return glue.contexts.setPaths(contextName, [{ path: 'prop1', value: null }]);
        })
        .catch((err) => done(err));
    });

    it('should invoke the callback with an unsubscribe function as a fourth argument and be able to unsubscribe when invoking that function', (done) => {
      const contextName = gtf.contexts.getContextName();
      const context = {
        id: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(10),
        date: new Date(),
      };

      let counter = 0;

      glue.contexts
        .subscribe(contextName, (updatedObject, objectToUpdateWith, removedKeys, unsubscribeFn) => {
          if (updatedObject.id === context.id) {
            if (updatedObject.unsubscribe === true) {
              unsubscribeFn();
            } else {
              counter++;
            }
          }
        })
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return glue.contexts.update(contextName, context);
        })
        .then(() => glue.contexts.update(contextName, { test: 'test' }))
        .then(() => glue.contexts.update(contextName, { tick: 42 }))
        .then(() => glue.contexts.update(contextName, { unsubscribe: true }))
        .then(() => glue.contexts.update(contextName, { glue: 42 }))
        .then(() => glue.contexts.update(contextName, { prop: 'value' }))
        .then(() => {
          expect(counter).to.eql(3);
          done();
        })
        .catch((err) => done(err));
    });

    it('should return a function', (done) => {
      const contextName = gtf.contexts.getContextName();

      glue.contexts
        .subscribe(contextName, () => {})
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          expect(unsubscribeFn).to.be.a('function');
          done();
        })
        .catch((err) => done(err));
    });

    it('should return an unsubscribe function which unsubscribes from context updates when invoked', (done) => {
      const contextName = gtf.contexts.getContextName();
      const context = {
        id: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(10),
      };

      let un;
      let counter = 0;

      glue.contexts
        .subscribe(contextName, (data) => {
          if (data.id === context.id) {
            counter++;
          }
        })
        .then((unsubscribeFn) => {
          un = unsubscribeFn;
          gtf.addWindowHook(un);
          return glue.contexts.update(contextName, context);
        })
        .then(() => glue.contexts.update(contextName, { tick: 42 }))
        .then(() => glue.contexts.update(contextName, { glue: 42 }))
        .then(() => un())
        .then(() => glue.contexts.update(contextName, { data: 'new data' }))
        .then(() => glue.contexts.update(contextName, { date: new Date() }))
        .then(() => {
          expect(counter).to.eql(3);
          done();
        })
        .catch((err) => done(err));
    });

    it('should return snapshot when get() is followed by subscribe()', (done) => {
      const contextName = gtf.contexts.getContextName();
      const context = gtf.contexts.generateComplexObject(10);
      const ready = gtf.waitFor(2, done);

      glue.contexts
        .subscribe(contextName, async () => {
          try {
            const contextData = await glue.contexts.get(contextName);
            expect(contextData).to.eql(context);
            ready();
          } catch (error) {
            done(error);
          }

          await glue.contexts.subscribe(contextName, (dataFromSubscribe) => {
            try {
              expect(dataFromSubscribe).to.eql(context);
              ready();
            } catch (error) {
              done(error);
            }
          });
        })
        .then((unFn) => {
          gtf.addWindowHook(unFn);
          return glue.contexts.update(contextName, context);
        })
        .catch((err) => done(err));
    });
  });

  describe('when manipulated by another app, ', function () {
    let secondApp;

    beforeEach(async () => {
      secondApp = await gtf.createApp();
    });

    afterEach(() => secondApp.stop());

    it('should be invoked when a context is updated and is invoked after the context was created', (done) => {
      const contextName = gtf.contexts.getContextName();
      const sampleContext = { test: 1 };

      secondApp.contexts
        .update(contextName, sampleContext)
        .then(() => {
          return glue.contexts.subscribe(contextName, () => {
            done();
          });
        })
        .then((unsubscribeFn) => gtf.addWindowHook(unsubscribeFn))
        .then(() => {
          return secondApp.contexts.update(contextName, { test: 2 });
        })
        .catch(done);
    });

    it('should be invoked when a context is set and is invoked after the context was created', (done) => {
      const contextName = gtf.contexts.getContextName();
      const sampleContext = { test: 1 };

      secondApp.contexts
        .set(contextName, sampleContext)
        .then(() => {
          return glue.contexts.subscribe(contextName, () => {
            done();
          });
        })
        .then((unsubscribeFn) => gtf.addWindowHook(unsubscribeFn))
        .then(() => {
          return secondApp.contexts.set(contextName, { test: 2 });
        })
        .catch(done);
    });

    it('should invoke the callback when the specified context has been created with update()', (done) => {
      const contextName = gtf.contexts.getContextName();
      const context = { id: gtf.contexts.getContextName() };

      glue.contexts
        .subscribe(contextName, (data) => {
          if (data.id === context.id) {
            done();
          }
        })
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return secondApp.contexts.update(contextName, context);
        })
        .catch((err) => done(err));
    });

    it('should invoke the callback when the specified context has been created with set()', (done) => {
      const contextName = gtf.contexts.getContextName();
      const context = { id: gtf.contexts.getContextName() };

      glue.contexts
        .subscribe(contextName, (data) => {
          if (data.id === context.id) {
            done();
          }
        })
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return secondApp.contexts.set(contextName, context);
        })
        .catch((err) => done(err));
    });

    it('should invoke the callback when the specified context has been created with setPath()', (done) => {
      const contextName = gtf.contexts.getContextName();

      glue.contexts
        .subscribe(contextName, (data) => {
          if (data.prop === 'value') {
            done();
          }
        })
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return secondApp.contexts.setPath(contextName, 'prop', 'value');
        })
        .catch((err) => done(err));
    });

    it('should invoke the callback when the specified context has been created with setPaths()', (done) => {
      const contextName = gtf.contexts.getContextName();
      const contextPaths = [
        { path: 'prop1', value: 'value1' },
        { path: 'prop2', value: 'value2' },
      ];

      glue.contexts
        .subscribe(contextName, (data) => {
          if (data.prop1 === 'value1') {
            done();
          }
        })
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return secondApp.contexts.setPaths(contextName, contextPaths);
        })
        .catch((err) => done(err));
    });

    it('should invoke the callback with an object as first argument  when the specified context has been created with update()', (done) => {
      const contextName = gtf.contexts.getContextName();
      const context = {
        id: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(10),
      };

      glue.contexts
        .subscribe(contextName, (updatedObject) => {
          try {
            expect(updatedObject).to.be.an('object');
            done();
          } catch (error) {
            done(error);
          }
        })
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return secondApp.contexts.update(contextName, context);
        })
        .catch((err) => done(err));
    });

    it('should invoke the callback with an object as first argument  when the specified context has been created with set()', (done) => {
      const contextName = gtf.contexts.getContextName();
      const context = {
        id: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(10),
      };

      glue.contexts
        .subscribe(contextName, (updatedObject) => {
          if (updatedObject.id === context.id) {
            try {
              expect(updatedObject).to.be.an('object');
              done();
            } catch (error) {
              done(error);
            }
          }
        })
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return secondApp.contexts.set(contextName, context);
        })
        .catch((err) => done(err));
    });

    it('should invoke the callback with an object as first argument  when the specified context has been created with setPath()', (done) => {
      const contextName = gtf.contexts.getContextName();
      const context = {
        id: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(10),
      };

      glue.contexts
        .subscribe(contextName, (updatedObject) => {
          if (updatedObject.prop1.id === context.id) {
            try {
              expect(updatedObject).to.be.an('object');
              done();
            } catch (error) {
              done(error);
            }
          }
        })
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return secondApp.contexts.setPath(contextName, 'prop1', context);
        })
        .catch((err) => done(err));
    });

    it('should invoke the callback with an object as first argument  when the specified context has been created with setPaths()', (done) => {
      const contextName = gtf.contexts.getContextName();

      glue.contexts
        .subscribe(contextName, (updatedObject) => {
          if (updatedObject.prop1 === 'value1') {
            try {
              expect(updatedObject).to.be.an('object');
              done();
            } catch (error) {
              done(error);
            }
          }
        })
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return secondApp.contexts.setPaths(contextName, [
            { path: 'prop1', value: 'value1' },
            { path: 'prop2', value: 'value2' },
          ]);
        })

        .catch((err) => done(err));
    });

    it('should invoke the callback with correct data as first argument when the specified context has been created with update()', (done) => {
      const contextName = gtf.contexts.getContextName();
      const context = {
        id: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(10),
      };

      glue.contexts
        .subscribe(contextName, (updatedObject) => {
          if (updatedObject.id === context.id) {
            try {
              expect(updatedObject).to.eql(context);
              done();
            } catch (error) {
              done(error);
            }
          }
        })
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return secondApp.contexts.update(contextName, context);
        })
        .catch((err) => done(err));
    });

    it('should invoke the callback with correct data as first argument when the specified context has been created with set()', (done) => {
      const contextName = gtf.contexts.getContextName();
      const context = {
        id: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(10),
      };

      glue.contexts
        .subscribe(contextName, (updatedObject) => {
          if (updatedObject.id === context.id) {
            try {
              expect(updatedObject).to.eql(context);
              done();
            } catch (error) {
              done(error);
            }
          }
        })
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return secondApp.contexts.set(contextName, context);
        })
        .catch((err) => done(err));
    });

    it('should invoke the callback with correct data as first argument when the specified context has been created with setPath()', (done) => {
      const contextName = gtf.contexts.getContextName();
      const context = {
        id: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(10),
      };

      glue.contexts
        .subscribe(contextName, (updatedObject) => {
          if (updatedObject.prop1.id === context.id) {
            try {
              expect(updatedObject).to.eql({ prop1: context });
              done();
            } catch (error) {
              done(error);
            }
          }
        })
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return secondApp.contexts.setPath(contextName, 'prop1', context);
        })
        .catch((err) => done(err));
    });

    it('should invoke the callback with correct data as first argument when the specified context has been created with setPaths()', (done) => {
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
          if (updatedObject.prop1.id === prop1Context.id) {
            try {
              expect(updatedObject).to.eql({
                prop1: prop1Context,
                prop2: prop2Context,
              });
              done();
            } catch (error) {
              done(error);
            }
          }
        })
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return secondApp.contexts.setPaths(contextName, [
            { path: 'prop1', value: prop1Context },
            { path: 'prop2', value: prop2Context },
          ]);
        })

        .catch((err) => done(err));
    });

    it('should invoke the callback 3 times when a context is updated 3 times with update()', (done) => {
      const ready = gtf.waitFor(3, done);
      const context = {
        id: gtf.contexts.getContextName(),
        name: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(10),
      };

      glue.contexts
        .subscribe(context.name, (data) => {
          if (data.id === context.id) {
            ready();
          }
        })
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return secondApp.contexts.update(context.name, context);
        })
        .then(() => secondApp.contexts.update(context.name, { date: new Date() }))
        .then(() => secondApp.contexts.update(context.name, { prop: 'value' }))
        .catch((err) => done(err));
    });

    it('should invoke the callback 3 times when a context is changed 3 times with set()', (done) => {
      const ready = gtf.waitFor(3, done);
      const contextName = gtf.contexts.getContextName();
      const id = gtf.contexts.getContextName();

      const context = {
        id,
        name: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(10),
      };

      glue.contexts
        .subscribe(contextName, (data) => {
          if (data.id === context.id) {
            ready();
          }
        })
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return secondApp.contexts.set(contextName, context);
        })
        .then(() => secondApp.contexts.set(contextName, { id, date: new Date() }))
        .then(() => secondApp.contexts.set(contextName, { id, prop: 'value' }))
        .catch((err) => done(err));
    });

    it('should invoke the callback 3 times when a context is changed 3 times with setPath()', (done) => {
      const ready = gtf.waitFor(3, done);
      const context = {
        id: gtf.contexts.getContextName(),
        name: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(10),
      };

      glue.contexts
        .subscribe(context.name, (data) => {
          if (data.prop1.id === context.id) {
            ready();
          }
        })
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return secondApp.contexts.setPath(context.name, 'prop1', context);
        })
        .then(() => secondApp.contexts.setPath(context.name, 'prop2', { date: new Date() }))
        .then(() => secondApp.contexts.setPath(context.name, 'prop3', { prop: 'value' }))
        .catch((err) => done(err));
    });

    it('should invoke the callback 3 times when a context is changed 3 times with setPaths()', (done) => {
      const ready = gtf.waitFor(3, done);
      const context = {
        id: gtf.contexts.getContextName(),
        name: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(10),
      };

      glue.contexts
        .subscribe(context.name, (data) => {
          if (data.prop1.id === context.id) {
            ready();
          }
        })
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return secondApp.contexts.setPaths(context.name, [{ path: 'prop1', value: context }]);
        })
        .then(() => secondApp.contexts.setPaths(context.name, [{ path: 'prop2', value: { date: new Date() } }]))
        .then(() => secondApp.contexts.setPaths(context.name, [{ path: 'prop3', value: { prop: 'value' } }]))
        .catch((err) => done(err));
    });

    it('should invoke the callback with the updated data as first argument when the specified context has been changed with update()', (done) => {
      const context = {
        name: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(10),
      };
      const newContext = {
        id: gtf.contexts.getContextName(),
        date: new Date(),
        title: 'new context',
      };

      glue.contexts
        .update(context.name, context)
        .then(() => {
          return glue.contexts.subscribe(context.name, (updatedObject) => {
            if (updatedObject.id === newContext.id) {
              try {
                expect(updatedObject).to.eql(Object.assign({}, context, newContext));
                done();
              } catch (error) {
                done(error);
              }
            }
          });
        })
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return secondApp.contexts.update(context.name, newContext);
        })
        .catch((err) => done(err));
    });

    it('should invoke the callback with the new data as first argument when the specified context has been changed with set()', (done) => {
      const contextName = gtf.contexts.getContextName();
      const context = gtf.contexts.generateComplexObject(10);
      const newContext = {
        id: gtf.contexts.getContextName(),
        date: new Date(),
        title: 'new context',
      };

      glue.contexts
        .set(contextName, context)
        .then(() => {
          return glue.contexts.subscribe(contextName, (updatedObject) => {
            if (updatedObject.id === newContext.id) {
              try {
                expect(updatedObject).to.eql(newContext);
                done();
              } catch (error) {
                done(error);
              }
            }
          });
        })
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return secondApp.contexts.set(contextName, newContext);
        })
        .catch((err) => done(err));
    });

    it('should invoke the callback with the new data as first argument when the specified context has been updated with setPath()', (done) => {
      const contextName = gtf.contexts.getContextName();
      const prop1Context = {
        date: new Date(),
        title: 'new context',
      };
      const prop2Context = {
        id: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(10),
      };

      secondApp.contexts
        .setPath(contextName, 'prop1', prop1Context)
        .then(() =>
          glue.contexts.subscribe(contextName, (updatedObject) => {
            if (updatedObject.prop2.id === prop2Context.id) {
              try {
                expect(updatedObject).to.eql({
                  prop1: prop1Context,
                  prop2: prop2Context,
                });
                done();
              } catch (error) {
                done(error);
              }
            }
          })
        )
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return secondApp.contexts.setPath(contextName, 'prop2', prop2Context);
        })
        .catch((err) => done(err));
    });

    it('should invoke the callback with the new data as first argument when the specified context has been updated with setPaths()', (done) => {
      const contextName = gtf.contexts.getContextName();
      const prop1Context = {
        date: new Date(),
        title: 'new context',
      };
      const prop2Context = {
        id: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(10),
      };

      secondApp.contexts
        .setPaths(contextName, [{ path: 'prop1', value: prop1Context }])
        .then(() =>
          glue.contexts.subscribe(contextName, (updatedObject) => {
            if (updatedObject.prop2.id === prop2Context.id) {
              try {
                expect(updatedObject).to.eql({
                  prop1: prop1Context,
                  prop2: prop2Context,
                });
                done();
              } catch (error) {
                done(error);
              }
            }
          })
        )
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return secondApp.contexts.setPaths(contextName, [{ path: 'prop2', value: prop2Context }]);
        })
        .catch((err) => done(err));
    });

    it('should invoke the callback with the object to update the context with as a second argument when the specified context has been updated with update()', (done) => {
      const contextName = gtf.contexts.getContextName();
      const initContext = {
        id: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(10),
      };
      const newContext = gtf.contexts.generateComplexObject(10);

      glue.contexts
        .update(contextName, initContext)
        .then(() => {
          return glue.contexts.subscribe(contextName, (updatedObject, objectToUpdateWith) => {
            if (Object.keys(objectToUpdateWith).length) {
              try {
                expect(objectToUpdateWith).to.eql(newContext);
                done();
              } catch (error) {
                done(error);
              }
            }
          });
        })
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return secondApp.contexts.update(contextName, newContext);
        })
        .catch((err) => done(err));
    });

    it('should invoke the callback with the object to update the context with as a second argument when the specified context has been changed with set()', (done) => {
      const contextName = gtf.contexts.getContextName();
      const initContext = gtf.contexts.generateComplexObject(10);
      const newContext = {
        id: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(10),
      };

      glue.contexts
        .set(contextName, initContext)
        .then(() => {
          return glue.contexts.subscribe(contextName, (updatedObject, objectToUpdateWith) => {
            if (Object.keys(objectToUpdateWith).length) {
              try {
                expect(objectToUpdateWith).to.eql(newContext);
                done();
              } catch (error) {
                done(error);
              }
            }
          });
        })
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return secondApp.contexts.set(contextName, newContext);
        })
        .catch((err) => done(err));
    });

    it('should invoke the callback with the object to update the context with as a second argument when the specified context has been updated with setPath()', (done) => {
      const contextName = gtf.contexts.getContextName();
      const prop1Context = {
        id: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(10),
      };
      const prop2Context = {
        date: new Date(),
        title: 'new context',
      };

      secondApp.contexts
        .setPath(contextName, 'prop1', prop1Context)
        .then(() =>
          glue.contexts.subscribe(contextName, (updatedObject, objectToUpdateWith) => {
            if (Object.keys(objectToUpdateWith).length) {
              try {
                expect(objectToUpdateWith).to.eql({ prop2: prop2Context });
                done();
              } catch (error) {
                done(error);
              }
            }
          })
        )
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return secondApp.contexts.setPath(contextName, 'prop2', prop2Context);
        })
        .catch((err) => done(err));
    });

    it('should invoke the callback with the object to update the context with as a second argument when the specified context has been updated with setPaths()', (done) => {
      const contextName = gtf.contexts.getContextName();
      const prop1Context = {
        date: new Date(),
        title: 'new context',
      };
      const prop2Context = {
        id: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(10),
      };

      secondApp.contexts
        .setPaths(contextName, [{ path: 'prop1', value: prop1Context }])
        .then(() =>
          glue.contexts.subscribe(contextName, (updatedObject, objectToUpdateWith) => {
            if (Object.keys(objectToUpdateWith).length) {
              try {
                expect(objectToUpdateWith).to.eql({
                  prop2: prop2Context,
                });
                done();
              } catch (error) {
                done(error);
              }
            }
          })
        )
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return secondApp.contexts.setPaths(contextName, [{ path: 'prop2', value: prop2Context }]);
        })
        .catch((err) => done(err));
    });

    it('should invoke the callback with an array as third argument when context is updated with existing keys set to null with update()', (done) => {
      const contextName = gtf.contexts.getContextName();
      const context = {
        name: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(10),
        id: 'unique identifier',
        title: 'title',
        date: new Date(),
      };

      glue.contexts
        .update(contextName, context)
        .then(() => {
          return glue.contexts.subscribe(contextName, (updatedObject, objectToUpdateWith, removedKeys) => {
            if (Object.keys(objectToUpdateWith).length) {
              try {
                expect(removedKeys).to.eql(['title', 'date']);
                done();
              } catch (error) {
                done(error);
              }
            }
          });
        })
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return secondApp.contexts.update(contextName, { title: null, date: null });
        })
        .catch((err) => done(err));
    });

    it('should invoke the callback with an array of the removed keys as third argument when context is updated with existing keys set to null with setPath()', (done) => {
      const contextName = gtf.contexts.getContextName();

      secondApp.contexts
        .setPath(contextName, 'prop1.prop2', 'prop2 value')
        .then(() =>
          glue.contexts.subscribe(contextName, (updatedObject, objectToUpdateWith, removedKeys) => {
            if (Object.keys(objectToUpdateWith).length) {
              try {
                expect(removedKeys).to.be.an('array');
                expect(removedKeys).to.eql(['prop1']);
                done();
              } catch (error) {
                done(error);
              }
            }
          })
        )
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return secondApp.contexts.setPath(contextName, 'prop1', null);
        })
        .catch((err) => done(err));
    });

    it('should invoke the callback with an array of the removed keys as third argument when context is updated with existing keys set to null with setPaths()', (done) => {
      const contextName = gtf.contexts.getContextName();

      secondApp.contexts
        .setPaths(contextName, [{ path: 'prop1.prop2', value: 'prop2 value' }])
        .then(() =>
          glue.contexts.subscribe(contextName, (updatedObject, objectToUpdateWith, removedKeys) => {
            if (Object.keys(objectToUpdateWith).length) {
              try {
                expect(removedKeys).to.be.an('array');
                expect(removedKeys).to.eql(['prop1']);
                done();
              } catch (error) {
                done(error);
              }
            }
          })
        )
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return secondApp.contexts.setPaths(contextName, [{ path: 'prop1', value: null }]);
        })
        .catch((err) => done(err));
    });

    it('should invoke the callback with an unsubscribe function as a fourth argument and be able to unsubscribe when invoking that function', (done) => {
      const contextName = gtf.contexts.getContextName();
      const context = {
        id: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(10),
        date: new Date(),
      };

      let counter = 0;

      glue.contexts
        .subscribe(contextName, (_u, _o, _r, unsubscribeFn) => {
          if (_u.id === context.id) {
            if (_u.unsubscribe === true) {
              unsubscribeFn();
            } else {
              counter++;
            }
          }
        })
        .then((unsubscribeFn) => {
          gtf.addWindowHook(unsubscribeFn);
          return secondApp.contexts.update(contextName, context);
        })
        .then(() => secondApp.contexts.update(contextName, { test: 'test' }))
        .then(() => secondApp.contexts.update(contextName, { tick: 42 }))
        .then(() => secondApp.contexts.update(contextName, { unsubscribe: true }))
        .then(() => secondApp.contexts.update(contextName, { glue: 42 }))
        .then(() => secondApp.contexts.update(contextName, { prop: 'value' }))
        .then(() => {
          expect(counter).to.eql(3);
          done();
        })
        .catch((err) => done(err));
    });

    it('should return an unsubscribe function which unsubscribes from context updates when invoked', async () => {
      const context = {
        name: gtf.contexts.getContextName(),
        complexObj: gtf.contexts.generateComplexObject(10),
      };
      let counter = 0;

      const unsubscribeFn = await glue.contexts.subscribe(context.name, () => {
        counter++;
      });
      gtf.addWindowHook(unsubscribeFn);

      await secondApp.contexts.update(context.name, {
        anotherComplexObj: gtf.contexts.generateComplexObject(10),
      });
      await secondApp.contexts.update(context.name, { tick: 42 });
      await secondApp.contexts.update(context.name, { glue: 42 });

      unsubscribeFn();

      await secondApp.contexts.update(context.name, { data: 'new data' });
      await secondApp.contexts.update(context.name, { date: new Date() });

      expect(counter).to.eql(3);
    });

    it("should return correct data when another app resolves creating a context and subscribe should also return correct data when there's a subscription for the given context", (done) => {
      const contextName = gtf.contexts.getContextName();
      const context = gtf.contexts.generateComplexObject(10);

      const ready = gtf.waitFor(2, done);

      secondApp.contexts
        .update(contextName, context)
        .then(() => {
          return glue.contexts.subscribe(contextName, (data) => {
            try {
              expect(data).to.eql(context);
              ready();
            } catch (error) {
              done(error);
            }
          });
        })
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
  });
});
