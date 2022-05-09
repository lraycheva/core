/* eslint-disable @typescript-eslint/no-explicit-any */

export const waitForInvocations = (invocations: number, callback: () => any): () => void => {
    let left = invocations;
    return (): void => {
        left--;

        if (left === 0) {
            callback();
        }
    };
};
