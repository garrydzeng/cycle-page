import xstream from "xstream"
import {adapt} from '@cycle/run/lib/adapt'
import domEvents from "dom-events"
import {supportsHistory} from "history/lib/DOMUtils"
import {useQueries, createHashHistory, createHistory, useBasename} from "history"
import {createPath} from "history/lib/PathUtils"
import qs from "querystring"
import pathToRegexp from "path-to-regexp"
import global from "global-object"

const Action = {
  push: "PUSH",
  replace: "REPLACE",
  forward: "FORWARD",
  back: "BACK"
}

const document = global.document
const click = document && document.ontouchstart ? "touchstart" : "click"
const enabledHistory = supportsHistory()

function noop(){}

function removeBaseName(baseName, path) {
  return path.indexOf(baseName) === 0 ? path.substring(baseName.length) : path
}

function origin() {
  let location = global.location, result = location.protocol + "//" + location.hostname
  return location.port ?
    result + ":" + location.port :
    result
  ;
}

function isSameOrigin(url) {
  return url && url.indexOf(origin()) === 0
}

function which(event) {
  return event.which === null ? event.button : event.which
}

function build(pathname, queryString, hash = undefined) {
  return createPath({
    search: "?" + qs.stringify(queryString),
    pathname: pathname,
    hash: hash
  })
}

function makePageDriver(options = {}) {

  const hash = options.hash || false
  const baseName = options.baseName || undefined
  const click = options.click || true
  const patterns = options.patterns || {}

  // history
  const buildHistory = useQueries(enabledHistory && !hash ? createHistory : createHashHistory)
  const history = typeof baseName == "undefined" ?
    buildHistory():
    useBasename(buildHistory)({
      basename: baseName
    })

  function next(directive) {
    const action = directive.action
    switch (action) {

      /** Bellow action does not neeed location information... */
      case Action.back:
      case Action.forward: {
        action == Action.forward ? history.goForward() : history.goBack()
        break
      }

      case Action.push:
      case Action.replace: {
        
        // foreign domain
        const {host, protocol, path, queryString, state, hash} = directive.location
        if (host) {
          let url = (protocol || "http") + "://" + host, location = window.location
          if (!isSameOrigin(url)) {
            url += build(path, queryString, hash)
            action == Action.push ? location.href = url : location.replace(url)
            break
          }
        }

        const callback = action == Action.push ? history.push : history.replace
        callback({
          hash: hash,
          query: queryString,
          pathname: path,
          state: state
        })

        break
      }

      default: throw new TypeError(
        'Expected action enumeration, but got "' + typeof action + '"'
      )
    }
  }

  function handleClick(event) {

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

    event.preventDefault()
    history.push(node.pathname + node.search + node.hash)
  }

  function match(location, routes) {

    const orginal = global.location
    const {query, pathname, state, hash} = location
    const context = {
      args: {},
      location: {
        host: orginal.host,
        protocol: orginal.protocol,
        path: pathname,
        canonicalPath: removeBaseName(baseName, pathname),
        hash: hash,
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

  return function PageDriver(directive$, runStreamAdapter) {

    click && domEvents.on(document, "click", handleClick)

    // listen to stream if user provided...
    if (directive$) {
      directive$.addListener({
        next: next,
        complete: noop,
        error: noop
      })
    }

    let unsubscrbe

    const page$ = xstream.create({
      start: function startPageStream(listener) {
        
        // hack??
        unsubscrbe = history.listen(location => {
          location.action == "PUSH" && listener.next(match(location, patterns))
        })

        // if user not provided initial directive, we emit current location alternative.
        if (!directive$) {
          listener.next(match(
            history.getCurrentLocation(),
            patterns
          ))
        }
      },
      stop: function stopPageStream() {
        click && domEvents.off(document, "click", handleClick)
        unsubscrbe()
      }
    })

    return adapt(page$)
  }
}

export {
  makePageDriver,
  Action
}
