# Introduction

Welcome use this driver!  
It help you manage browser history and receive newly `Location`.  

# Concepts

`Location` represents a url with related state.

```ts
interface Location {
  host: string,
  protocol: string,
  path: string,
  canonicalPath: string,
  baseName?: string,
  state?: any,
  queryString?: {
    [name: string]: string
  }
}
```

`Action` represents a history operation.  

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
suce as `back` action.

```ts
interface Directive {
  location?: Location,
  action: Action
}
```

Driver send a `Context` to your data component when history changed.  

```ts
interface Context {
  name?: string,
  location: Location,
  args?: {
    [name: string]: string
  }
}
```

User uses `Option` to controls driver behavior.  

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

```ts
const action = {
  push,
  replace,
  forward,
  back
}

function PageDriver(directive$ : Stream<Directive>, runStreamAdapter : any = null) => Stream<Context>
function makePageDriver(option : Option = {}) => PageDriver
```

# Examples

Send inital `Directive` (requirement).

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
  page: makePageDriver()
})
```

Show difference component for difference url.

```ts
import {run} from "@cycle/xstream-run"
import {makePageDriver, action} from "cycle-page"
import xstream from "xstream"
import {makeDOMDriver} from "@cycle/dom"

function main({ dom, page }) {
  return {
    dom: page.map(context => {
      // name will be matched pattern's name defined in option.
      switch (context.name) {
        case "index": break
        case "userDetail": break
        default: break
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
    dom: page
      .map(context => context.args.id)
      .map(id => div(`Hello ${id}!`))
      .startWith(div())
    ,
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