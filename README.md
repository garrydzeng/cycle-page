# Introduction

Welcome use this driver!  
It help you manage browser history and receive newly `Location`.  
This document, I will explain all concepts.  
and take a Tutorials.  

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

`Action` is set of operator of history.  

- push 
- replace
- forward
- back 

```ts
enum Action {
  push,
  replace,
  forward,
  back
}
```

