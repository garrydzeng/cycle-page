import { StreamAdapter } from '@cycle/base';
import { DOMSource, EventsFnOptions } from './DOMSource';
export declare type GenericStream = any;
export declare type ElementStream = any;
export declare type EventStream = any;
export declare type MockConfig = {
    [name: string]: GenericStream | MockConfig;
    elements?: GenericStream;
};
export declare class MockedDOMSource implements DOMSource {
    private _streamAdapter;
    private _mockConfig;
    private _elements;
    constructor(_streamAdapter: StreamAdapter, _mockConfig: MockConfig);
    elements(): any;
    events(eventType: string, options: EventsFnOptions): any;
    select(selector: string): DOMSource;
    isolateSource(source: MockedDOMSource, scope: string): DOMSource;
    isolateSink(sink: any, scope: string): any;
}
export declare function mockDOMSource(streamAdapter: StreamAdapter, mockConfig: Object): DOMSource;
