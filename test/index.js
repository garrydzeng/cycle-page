import {run, setup} from "@cycle/run"
import xstream from "xstream"
import {makePageDriver, Action} from "../index"
import assert from "assert"

function noop() {}
function main() {
  return {
    page: xstream.of({
      action: Action.push,
      location: {
        path: "/test"
      }
    })
  }
}

describe("cycle-page", () => {

  it("should change url.", () => {
    const pathname = location.pathname, page = makePageDriver()
    run(main, { page })
    assert.notStrictEqual(location.pathname, pathname)
  })

  it("should navigate url by hash fragment when option.hash == true.", () => {
    const page = makePageDriver({ hash: true })
    run(main, { page })
    assert.strictEqual(location.hash, "#/test")
  })

  it("should contains basename.", () => {
    const page = makePageDriver({ baseName: "cycle" })
    run(main, { page })
    assert.strictEqual(location.pathname, "/cycle/test")
  })

  it("should send an Context when history changed.", done => {

    const {sources, run} = setup(main, {
      page: makePageDriver()
    })

    sources.page.addListener({
      error: noop,
      complete: noop,
      next: context => {
        assert.deepEqual(context, {
          args: {},
          location: {
            host: location.host,
            protocol: location.protocol,
            path: "/test",
            canonicalPath: "/test",
            hash: "",
            baseName: undefined,
            state: undefined,
            queryString: {}
          }
        })
        done()
      }
    })

    run()
  })

  it("should pass path arguments.", done => {
    
    const main = () => {
      return {
        page: xstream.of({
          action: Action.push,
          location: {
            path: "/test/identity"
          }
        })
      }
    }
    
    const {sources, run} = setup(main, {
      page: makePageDriver({
        patterns: {
          test: "/test/:id"
        }
      })
    })

    sources.page.addListener({
      error: noop,
      complete: noop,
      next: context => {
        assert.deepEqual(context.args, { id: "identity" })
        done()
      }
    })

    run()
  })

  it("should capture link clicks when option.click === true", () => {

    run(main, {
      page: makePageDriver({
        click: true
      })
    })

    const node = document.createElement("a")
    node.href = "/"
    document.body.appendChild(node)
    node.click()

    assert.strictEqual(location.pathname, "/")
  })

  // it("should rediret to foreign domain", () => {

  //   const main = () => {
  //     return {
  //       page: xstream.of({
  //         action: Action.push,
  //         location: {
  //           host: "www.google.com",
  //           protocol: "https",
  //           path: "/search",
  //           queryString: {
  //             q: "aa"
  //           }
  //         }
  //       })
  //     }
  //   }

  //   run(main, {
  //     page: makePageDriver()
  //   })
  // })
})
