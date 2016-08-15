import Cycle from "@cycle/xstream-run"
import xstream from "xstream"
import {makePageDriver, action} from "../index"
import assert from "assert"

function noop() {}
function main() {
  return {
    page: xstream.of({
      action: action.push,
      location: {
        path: "/test"
      }
    })
  }
}

describe("cycle-page", () => {

  it("should change url.", () => {
    const pathname = location.pathname, page = makePageDriver()
    Cycle.run(main, { page })
    assert.notStrictEqual(location.pathname, pathname)
  })

  it("should navigate url by hash fragment when option.hash == true.", () => {
    const page = makePageDriver({ hash: true })
    Cycle.run(main, { page })
    assert.strictEqual(location.hash, "#/test")
  })

  it("should contains basename.", () => {
    const page = makePageDriver({ baseName: "cycle" })
    Cycle.run(main, { page })
    assert.strictEqual(location.pathname, "/cycle/test")
  })

  it("should send an Context when history changed.", done => {

    const {sources, run} = Cycle(main, {
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
          action: action.push,
          location: {
            path: "/test/identity"
          }
        })
      }
    }
    
    const {sources, run} = Cycle(main, {
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

    Cycle.run(main, {
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
})