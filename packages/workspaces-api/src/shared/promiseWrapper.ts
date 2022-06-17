export class PromiseWrapper<T> {
    public resolve: (value: T | PromiseLike<T>) => void;
    public reject: (err: string) => void;
    public readonly promise: Promise<T>;
    constructor() {
        this.promise = new Promise<T>((res, rej) => {
            this.resolve = res;
            this.reject = rej;
        });
    }
}