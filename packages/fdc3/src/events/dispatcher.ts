import { FDC3_READY, GLUE42_EVENT_NAME, NOTIFY_STARTED, REQUEST_GLUE } from './constants';

export class EventDispatcher {
    public fireFdc3Ready(): void {
        const event = new Event(FDC3_READY);
        window.dispatchEvent(event);
    }

    public fireNotifyStarted(): void {
        this.send(NOTIFY_STARTED);
    }

    public fireRequestGlue(): void {
        this.send(REQUEST_GLUE);
    }

    private send(eventName: string, message?: any): void {
        const payload = { glue42: { event: eventName, message } };

        const event = new CustomEvent(GLUE42_EVENT_NAME, { detail: payload });

        window.dispatchEvent(event);
    }
}