import {run} from "@cycle/xstream-run"
import {makePageDriver, action} from "../index"
import xstream from "xstream"
import {makeDOMDriver, a} from "@cycle/dom"

const index = "/"

function main({ dom, page }) {
  return {
    dom: xstream.of(a({ props:{ href: "/test" }}, "CLICK ME!")),
    page: xstream.of({
      action: action.push,
      location: {
        path: index
      }
    })
  }
}

run(main, {
  dom: makeDOMDriver(document.body),
  page: makePageDriver({
    hash: true
  })
})