import {Stream} from "xstream"

export enum Action {
  push,
  replace,
  forward,
  back
}

export interface Option {
  hash?: boolean,
  baseName?: string,
  click?: boolean,
  globalObject?: Window,
  routes?: {
    [id: string]: string
  }
}

export interface Location {
  host: string,
  protocol?: string,
  path: string,
  canonicalPath: string,
  baseName?: string,
  state?: any,
  queryString?: {
    [name: string]: any
  }
}

export interface Directive {
  location?: Location,
  action: Action
}

export interface Context {
  name?: string,
  location: Location,
  args?: {
    [name: string] : string
  }
}

export function pageDriver(directive$: Stream<Directive>, runStreamAdapter?: any) : Stream<Context>
export type makePageDriver = (option: Option) => pageDriver