import { StreamAdapter } from '@cycle/base';
import { Stream } from 'xstream';
import { VNode } from './interfaces';
export declare function makeTransposeVNode(runStreamAdapter: StreamAdapter): (vnode: VNode) => Stream<VNode>;
