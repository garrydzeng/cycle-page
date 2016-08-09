import xstream from "xstream"
import {useQueries, createHashHistory, createHistory, createLocation, useBasename} from "history"
import pathToRegexp from "path-to-regexp"
import global from "global-object"
import {relative} from "path"

const document = global.document
const click = document && document.ontouchstart ? "touchstart" : "click"
const history1 = global.history
const supportsHistory = history1 && "pushState" in history1

const action = {
  push: "PUSH",
  replace: "REPLACE",
  forward: "FORWARD",
  back: "BACK"
}

let running = false

function noop(){}

function makePageDriver(options = {}) {

  const hash = options.hash || false
  const baseName = options.baseName || undefined
  const click = options.click || true

  // history
  const historyCreator = useQueries(supportsHistory && !hash ? createHistory : createHashHistory)
  const history = typeof baseName == "undefined" ?
    historyCreator():
    useBasename(historyCreator)({
      basename: baseName
    })

  const maps = {
    PUSH: history.push,
    REPLACE: history.replace,
    FORWARD: history.goForward,
    BACK: history.goBack
  }

  function next(directive) {
    if (!(directive.action in maps))
      throw new TypeError('Expected action enumeration, bot got "' + directive.action + '"')
    else {
      const { path, queryString, state } = directive.location
      maps[ directive.action ]({
        query: queryString,
        pathname: path,
        state: state
      })
    }
  }

  function decode(value) {
    return typeof value == "string" ? decodeURIComponent(value.replace(/\+/g, ' ')) : value
  }

  function removeBaseName(baseName, path) {
    return path.indexOf(baseName) === 0 ? path.substring(baseName.length) : path
  }

  function match(location, routes) {

    const orginal = global.location
    const {query, pathname, state} = location
    const context = {
      location: {
        host: orginal.host,
        protocol: orginal.protocol,
        path: pathname,
        canonicalPath: removeBaseName(baseName, pathname),
        baseName: baseName,
        state: state,
        queryString: query
      }
    }

    for (let id in routes) {
      const keys = [], regex = pathToRegexp(routes[id], keys), matches = regex.exec(pathname)      
      if (matches) {
        context.args = {}
        keys.forEach(key => context.args[key.name] = decode(matches[1]))
        context.name = id
        break
      }
    }

    return context
  }

  function onClick(event) {

  }

  return function PageDriver(directive$, runStreamAdapter) {

    let unsubscibe = null

    directive$.addListener({
      next: next,
      complete: noop,
      error: noop
    })

    return xstream.create({
      start: function startPageStream(listener) {
        if (!running) {
          running = true
          click && document.addEventListener("click", onClick, false)
          unsubscibe = history.listen(location => {
            location.action == "PUSH" && listener.next(match(location, options.patterns || {}))
          })
        }
      },
      stop: function stopPageStream() {
        if (running) {
          running = false
          click && document.removeEventListener("click", onClick, false)
          unsubscibe()
        }
      }
    })
  }
}

export {
  makePageDriver,
  action
}