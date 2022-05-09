import { Glue42Core } from "@glue42/core";
import { generate } from "shortid";
import { Transaction } from "../common/types";
import logger from "../shared/logger";

/* eslint-disable @typescript-eslint/no-explicit-any */
export class TransactionsController {
    private readonly transactionLocks: { [key in string]: Transaction<any> } = {};

    private get logger(): Glue42Core.Logger.API | undefined {
        return logger.get("transactions.controller");
    }

    public completeTransaction(id: string, transactionData?: any): void {
        if (typeof id !== "string") {
            throw new Error(`Cannot complete the transaction, because the provided id is not a string: ${JSON.stringify(id)}`);
        }

        const foundTransaction = this.transactionLocks[id];

        if (!foundTransaction) {
            this.logger?.warn(`Cannot mark a transaction as complete, because there is not lock with id ${id}`);
            return;
        }

        foundTransaction.lift(transactionData);
    }

    public failTransaction(id: string, reason: any): void {
        const foundTransaction = this.transactionLocks[id];

        if (!foundTransaction) {
            this.logger?.warn(`Cannot mark a transaction as failed, because there is not lock with id ${id}`);
            return;
        }

        foundTransaction.fail(reason);
    }

    public createTransaction<T>(operation: string, timeout: number): Transaction<T> {
        const transaction: Transaction<T> = {} as Transaction<T>;

        const transactionId = generate();

        const transactionLock = new Promise<T>((resolve, reject) => {
            let transactionLive = true;

            transaction.lift = (args): void => {
                transactionLive = false;
                delete this.transactionLocks[transactionId];
                resolve(args);
            };

            transaction.fail = (reason): void => {
                transactionLive = false;
                delete this.transactionLocks[transactionId];
                reject(reason);
            };

            setTimeout(() => {
                if (!transactionLive) {
                    return;
                }

                transactionLive = false;
                this.logger?.warn(`Transaction for operation: ${operation} timed out.`);
                delete this.transactionLocks[transactionId];
                reject(`Transaction for operation: ${operation} timed out.`);
            }, timeout);
        });

        transaction.lock = transactionLock;

        transaction.id = transactionId;

        this.transactionLocks[transactionId] = transaction;

        return transaction;
    }
}