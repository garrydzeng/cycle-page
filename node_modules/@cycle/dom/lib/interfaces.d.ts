export interface VNode {
    sel?: string;
    data?: VNodeData;
    children?: Array<VNode | string>;
    elm?: Element | Text;
    text?: string;
    key?: string | number;
}
export interface VNodeData {
    attrs?: any;
    class?: any;
    on?: any;
    hero?: any;
    props?: any;
    style?: any;
    hook?: Hooks;
    key?: string | number;
    ns?: string;
    fn?: () => VNode;
    args?: Array<any>;
    isolate?: string;
    static?: boolean;
}
export interface ThunkData extends VNodeData {
    fn: () => VNode;
    args: Array<any>;
}
export interface Thunk extends VNode {
    data: ThunkData;
}
export declare type PreHook = () => any;
export declare type InitHook = (vNode: VNode) => any;
export declare type CreateHook = (emptyVNode: VNode, vNode: VNode) => any;
export declare type InsertHook = (vNode: VNode) => any;
export declare type PrePatchHook = (oldVNode: VNode, vNode: VNode) => any;
export declare type UpdateHook = (oldVNode: VNode, vNode: VNode) => any;
export declare type PostPatchHook = (oldVNode: VNode, vNode: VNode) => any;
export declare type DestroyHook = (vNode: VNode) => any;
export declare type RemoveHook = (vNode: VNode, removeCallback: () => void) => any;
export declare type PostHook = () => any;
export interface Hooks {
    pre?: PreHook;
    init?: InitHook;
    create?: CreateHook;
    insert?: InsertHook;
    prepatch?: PrePatchHook;
    update?: UpdateHook;
    postpatch?: PostPatchHook;
    destroy?: DestroyHook;
    remove?: RemoveHook;
    post?: PostHook;
}
export interface Module {
    pre?: PreHook;
    create?: CreateHook;
    update?: UpdateHook;
    destroy?: DestroyHook;
    remove?: RemoveHook;
    post?: PostHook;
}
