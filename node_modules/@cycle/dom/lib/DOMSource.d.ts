export interface EventsFnOptions {
    useCapture?: boolean;
}
export declare type GenericStream = any;
export interface DOMSource {
    select(selector: string): DOMSource;
    elements(): GenericStream;
    events(eventType: string, options?: EventsFnOptions): GenericStream;
}
