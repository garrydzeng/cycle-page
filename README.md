# Introduction

This driver help you manage browser history and receive `Location`.  

# Concepts

`Location` represents a url with related state.

```ts
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
```

`Action` represents a history operation:  

- push : Adds new `Location` into history stack.
- replace : Updates the most recent entry on the history stack to newly `Location`.
- forward : Goes to the next page in history stack.
- back : Goes to the previous page.

```ts
enum Action {
  push,
  replace,
  forward,
  back
}
```

User uses `Directive` to controls history behavior.  
location is optional,  
because not all action needs it.  
such as `back` action.

```ts
interface Directive {
  location?: Location,
  action: Action
}
```

Driver sends a `Context` to your data component when history changed.  

```ts
interface Context {
  name?: string,
  location: Location,
  args?: {
    [name: string]: string
  }
}
```

Finally, driver accepts an optional `Option` to initialization.

```ts
interface Option {
  hash?: boolean,
  baseName?: string,
  click?: boolean,
  patterns?: {
    [name: string]: string
  }
}
```

Detail of option:

- hash : Use hash fragment instead of url.
- baseName : If provided, all path will relatives to it.
- click : Whether to capture DOM click event.
- patterns : Define url pattern.

# Driver exports

Main function

```ts
function makePageDriver(option : Option) : (directive$ : Stream<Directive>) => Stream<Context>
```

and Action constant...

```ts
const action = {
  push,
  replace,
  forward,
  back
}
```

# Work with path arguments.

please see [path-to-regexp#parameters](https://github.com/pillarjs/path-to-regexp#parameters) !

# Examples

Send initial `Directive`.

```ts
import {run} from "@cycle/xstream-run"
import {makePageDriver, action} from "cycle-page"
import xstream from "xstream"

function main() {
  return {
    page: xstream.of({
      action: action.push,
      location: {
        path: "/"
      }
    })
  }
}

run(main, {
  page: makePageDriver({
    hash: true
  })
})
```

Show component by url.

```ts
import {run} from "@cycle/xstream-run"
import {makePageDriver, action} from "cycle-page"
import xstream from "xstream"
import {makeDOMDriver, div} from "@cycle/dom"

function main({ dom, page }) {
  return {
    dom: page.map(context => {
      // name will be matched pattern's name defined in option.
      switch (context.name) {
        case "index": return div("index")
        case "userDetail": return div(`Hello ${context.args.id}`)
        default: return div("404")
      }
    }),
    page: xstream.of({
      action: action.push,
      location: {
        path: "/"
      }
    })
  }
}

run(main, {
  dom: makeDOMDriver(document.body),
  page: makePageDriver({
    patterns: {
      userDetail: "/users/:id",
      index: "/"
    }
  })
})

```

Use path argument.

```ts
import {run} from "@cycle/xstream-run"
import {makePageDriver, action} from "cycle-page"
import xstream from "xstream"
import {makeDOMDriver, div} from "@cycle/dom"

function main({ dom, page }) {
  return {
    dom: page.map(context => {
      return div(`Hello ${context.args.id}!`)
    }),
    page: xstream.of({
      action: action.push,
      location: {
        path: "/users/cycle"
      }
    })
  }
}

run(main, {
  dom: makeDOMDriver(document.body),
  page: makePageDriver({
    patterns: {
      userDetail: "/users/:id",
      index: "/"
    }
  })
})
```
