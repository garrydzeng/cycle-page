import { IsolateModule } from './isolateModule';
export declare class ElementFinder {
    namespace: Array<string>;
    isolateModule: IsolateModule;
    constructor(namespace: Array<string>, isolateModule: IsolateModule);
    call(rootElement: Element): Element | Array<Element>;
}
