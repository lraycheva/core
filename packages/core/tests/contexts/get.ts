import { expect } from "chai";
import { createGlue, doneAllGlues } from "../initializer";
import { Glue42Core } from "../../glue";
import { dataStore } from "../data";
import { Update, testCases, verify } from "./cases";
import { generate } from "shortid";
import { PromiseWrapper } from "../../src/utils/pw";
// tslint:disable:no-unused-expression

describe("contexts.get", () => {

    let glue!: Glue42Core.GlueCore;
    let glue2!: Glue42Core.GlueCore;

    beforeEach(async () => {
        glue = await createGlue();
        glue2 = await createGlue();
    });

    afterEach(async () => {
        await doneAllGlues();
    });

    it("gets returns empty object for unknown context ", async () => {
        const name = generate();
        const b = await glue.contexts.get(name);
        expect(b).to.deep.eq({});
    });

    it("gets returns the state of a context created by set", async () => {
        const name = generate();
        const initial = { a: 1 };
        await glue.contexts.set(name, initial);
        const b = await glue.contexts.get(name);
        expect(b).to.deep.eq(initial);
    });

    it("gets returns the state of a context created by update", async () => {
        const name = generate();
        const initial = { a: 1 };
        await glue.contexts.update(name, initial);
        const b = await glue.contexts.get(name);
        expect(b).to.deep.eq(initial);
    });

    it("gets returns the state of a context created by update from another glue", async () => {
        const pw = new PromiseWrapper();
        const name = generate();
        const initial = { a: 1 };
        await glue2.contexts.update(name, initial);
        // wait to hear the update in our glue
        glue2.contexts.subscribe(name, async () => {
            // get the context fom the other glue
            const b = await glue.contexts.get(name);
            expect(b).to.deep.eq(initial);
            pw.resolve();
        });
        return pw.promise;
    });

    it("gets works inside subscribe", async () => {
        const pw = new PromiseWrapper();
        const name = generate();
        const initial = { a: 1 };
        let updates = 0;
        glue.contexts.subscribe(name, async (data) => {
            const b = await glue.contexts.get(name);
            expect(b).to.deep.eq(data);
            updates++;
            if (updates === 2) {
                pw.resolve();
            }
        });
        await glue.contexts.update(name, initial);
        await glue.contexts.update(name, { b: 2 });
        return pw.promise;
    });

    it("double get returns snapshot", async () => {
        const pw = new PromiseWrapper();
        const name = generate();
        const data = { a: 1 };
        await glue2.contexts.update(name, data);

        glue2.contexts.subscribe(name, async () => {
            const ab = await Promise.all([glue.contexts.get(name), glue.contexts.get(name)]);
            console.log(ab);
            expect(ab[0]).to.deep.eq(data);
            expect(ab[1]).to.deep.eq(data);
            pw.resolve();
        });

        return pw.promise;
    });

    it("get followed by subscribe returns snapshot", async () => {
        const pw = new PromiseWrapper();
        const name = generate();
        const data = { a: 1 };
        await glue2.contexts.update(name, data);
        glue2.contexts.subscribe(name, async () => {
            const pa = glue.contexts.get(name);
            glue.contexts.subscribe(name, (dataFromSubscribe) => {
                expect(dataFromSubscribe).to.deep.eq(data);
            });
            const a = await pa;
            expect(a).to.deep.eq(data);
            pw.resolve();
        });
        return pw.promise;
    });
});
