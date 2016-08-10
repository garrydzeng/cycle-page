import {run} from "@cycle/xstream-run"
import xstream from "xstream"
import {makePageDriver, action} from "./index"
import assert from "assert"
import {makeDOMDriver, a} from "@cycle/dom"

function noop(){}

const main = () => {
  return {
    page: xstream.of({
      action: action.push,
      location: {
        path: "/"
      }
    })
  }
}

describe("cycle-page", () => {
  
  it("should nagivate url by hash fragment, if option.hash == true.", () => {
    const page = makePageDriver({ hash: true })
    run(main, { page })
    assert.strictEqual(location.hash, "#/")
  })

  it("should contains basename.", () => {
    const page = makePageDriver({ hash: true, baseName: "cycle" })
    run(main, { page })
    assert.strictEqual(location.hash, "#cycle/")
  })

  it("should receive a Context with specified properties.", () => {
    const main2 = ({ page }) => {
      page.addListener({
        error: noop,
        complete: noop,
        next: context => {
          assert.deepEqual(context, {
            args: {},
            location: {
              host: location.host,
              protocol: location.protocol,
              path: "/",
              canonicalPath: "/",
              baseName: undefined,
              state: undefined,
              queryString: {}
            }
          })
        }
      })
      return main({
        page
      })
    }
    run(main2, {
      page: makePageDriver({
        hash: true
      })
    })
  })

  it("should pass url arguments.", () => {
    const main2 = ({ page }) => {
      page.addListener({
        error: noop,
        complete: noop,
        next: context => {
          assert.deepEqual(context.args, {
            id: "identity"
          })
        }
      })
      return {
        page: xstream.of({
          action: action.push,
          location: {
            path: "/test/identity"
          }
        })
      }
    }
    run(main2, {
      page: makePageDriver({
        hash: true,
        patterns: {
          test: "/test/:id"
        }
      })
    })
  })

  it("should capture link clicks when option.click === true", () => {

    // option.click defaults to true...
    run(main, {
      page: makePageDriver({
        hash: true
      })
    })

    const node = document.createElement("a")
    node.href = "/aa"
    document.body.appendChild(node)
    node.click()

    assert.strictEqual(location.hash, "#/aa")
  })
})