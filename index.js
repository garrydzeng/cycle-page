import xstream from "xstream"
import domEvents from "dom-events"
import {useQueries, createHashHistory, createHistory, useBasename} from "history"
import pathToRegexp from "path-to-regexp"
import global from "global-object"
import {createLocation} from "history/lib/LocationUtils"

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
  const patterns = options.patterns || {}

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
      maps[directive.action]({
        query: queryString,
        pathname: path,
        state: state
      })
    }
  }

  function removeBaseName(baseName, path) {
    return path.indexOf(baseName) === 0 ? path.substring(baseName.length) : path
  }

  function match(routes, location) {

    const orginal = global.location
    const {query, pathname, state} = location
    const context = {
      args: {},
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
        keys.forEach(key => context.args[key.name] = matches[1])
        context.name = id
        break
      }
    }

    return context
  }

  function origin() {
    let location = global.location, result = `${location.protocol}//${location.hostname}`
    return location.port ?
      result + `:${location.port}`:
      result
    ;
  }

  function isSameOrigin(url) {
    return url && url.indexOf(origin()) === 0
  }

  function which(event) {
    return event.which === null ? event.button : event.which
  }

  function onClick(event) {

    if (which(event) !== 1) return
    if (event.metaKey || event.ctrlKey || event.shiftKey) return
    if (event.defaultPrevented) return

    let node = event.target
    while (node && node.nodeName !== 'A') {
      node = node.parentNode
    }

    if (node == null) return
    if (node.nodeName !== 'A') return
    if (node.getAttribute("rel") === "external") return
    if (node.hasAttribute("download")) return
    if (node.target) return
    if (!isSameOrigin(node.href)) return

    let path = node.pathname + node.search
    if (node.hash) {
      path += node.hash
    }

    event.preventDefault()
    history.push(path)
  }

  return function PageDriver(directive$, runStreamAdapter) {

    let unsubscibe = null

    click && domEvents.on(document, "click", onClick)

    // listen to stream if user provided...
    if (directive$) {
      directive$.addListener({
        next: next,
        complete: noop,
        error: noop
      })
    }

    return xstream.create({
      start: function startPageStream(listener) {
        if (!running) {
          running = true
          unsubscibe = history.listen(location => {
            location.action == "PUSH" && listener.next(match(patterns, location))
          })
        }
        // if user not provided initial directive, we emit current location to user also.
        if (!directive$) {
          const location = global.location
          listener.next(match(patterns, createLocation({
            search: location.search,
            hash: location.hash,
            pathname: location.pathname
          })))
        }
      },
      stop: function stopPageStream() {
        if (running) {
          running = false
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