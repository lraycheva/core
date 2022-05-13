import generate from "shortid";

export class TimedCache<T> {

    private cache: Array<{ id: string; element: T }> = [];
    private timeoutIds: NodeJS.Timeout[] = [];

    constructor(private readonly config: { ELEMENT_TTL_MS: number }) { }

    public add(element: T): void {

        const id = generate();

        this.cache.push({ id, element });

        const timeoutId = setTimeout(() => {

            const elementIdx = this.cache.findIndex((entry) => entry.id === id);

            if (elementIdx < 0) {
                return;
            }

            this.cache.splice(elementIdx, 1);

        }, this.config.ELEMENT_TTL_MS);

        this.timeoutIds.push(timeoutId);
    }

    public flush(): T[] {
        const elements = this.cache.map((entry) => entry.element);
        this.timeoutIds.forEach((id) => clearInterval(id));

        this.cache = [];
        this.timeoutIds = [];

        return elements;
    }
}
