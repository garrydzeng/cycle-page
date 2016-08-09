import {run} from "@cycle/xstream-run"
import xstream from "xstream"
import {makePageDriver, action} from "./index"
import assert from "assert"

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
  
  // it("should nagivate url by hash fragment, if option.hash == true.", () => {
  //   const page = makePageDriver({ hash: true })
  //   run(main, { page })
  //   assert.strictEqual(location.hash, "#/")
  // })

  // it("should contains basename.", () => {
  //   const page = makePageDriver({ hash: true, baseName: "cycle" })
  //   run(main, { page })
  //   assert.strictEqual(location.hash, "#cycle/")
  // })

  // it("should receive a Context with specified properties.", () => {
  //   const main2 = ({ page }) => {
  //     page.addListener({
  //       error: noop,
  //       complete: noop,
  //       next: context => {
  //         assert.deepEqual(context, {
  //           location: {
  //             host: location.host,
  //             protocol: location.protocol,
  //             path: "/",
  //             canonicalPath: "/",
  //             queryString: {},
  //             state: undefined,
  //             baseName: undefined
  //           }
  //         })
  //       }
  //     })
  //     return main({
  //       page
  //     })
  //   }
  //   run(main2, {
  //     page: makePageDriver({
  //       hash: true
  //     })
  //   })
  // })

  it("should pass url arguments.", () => {
    const main2 = ({ page }) => {
      page.addListener({
        error: noop,
        complete: noop,
        next: context => {
          // assert.deepEqual(context.args, {
          //   id: "identity"
          // })
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

  })
})