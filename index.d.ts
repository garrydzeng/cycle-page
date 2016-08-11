import {Stream} from "xstream"

declare enum Action {
  push,
  replace,
  forward,
  back
}

interface Location {
  host: string,
  protocol: string,
  path: string,
  canonicalPath: string, // path without baseName
  baseName?: string,
  state?: any,
  queryString?: {
    [name: string]: string
  }
}

interface Context {
  name?: string,
  location: Location,
  args?: {
    [name: string]: string
  }
}

interface Directive {
  location?: Location,
  action: Action
}

type PageDriver = (request$ : Stream<Directive>) => Stream<Context>

interface Option {
  hash?: boolean,
  baseName?: string,
  click?: boolean,
  patterns?: {
    [name: string]: string
  }
}

declare function makePageDriver(option : Option) : PageDriver