import { IsolateModule } from './isolateModule';
export declare class ScopeChecker {
    private scope;
    private isolateModule;
    constructor(scope: string, isolateModule: IsolateModule);
    isStrictlyInRootScope(leaf: Element): boolean;
}
