import xstream from "xstream"
import domEvents from "dom-events"
import {useQueries, createHashHistory, createHistory, useBasename} from "history"
import pathToRegexp from "path-to-regexp"
import global from "global-object"

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

function noop(){}

function removeBaseName(baseName, path) {
  return path.indexOf(baseName) === 0 ? path.substring(baseName.length) : path
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

function makePageDriver(options = {}) {

  const hash = options.hash || false
  const baseName = options.baseName || undefined
  const click = options.click || true
  const patterns = options.patterns || {}

  // history
  const buildHistory = useQueries(supportsHistory && !hash ? createHistory : createHashHistory)
  const history = typeof baseName == "undefined" ?
    buildHistory():
    useBasename(buildHistory)({
      basename: baseName
    })

  const map = {
    [action.push]: history.push,
    [action.replace]: history.replace,
    [action.forward]: history.goForward,
    [action.back]: history.goBack
  }

  function next(directive) {
    if (!(directive.action in map))
      throw new TypeError('Expected action enumeration, bot got "' + directive.action + '"')
    else {
      const { path, queryString, state } = directive.location
      map[directive.action]({
        query: queryString,
        pathname: path,
        state: state
      })
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

    return xstream.create({
      start: function startPageStream(listener) {
        
        // hack??
        unsubscrbe = history.listen(location => {
          location.action == "PUSH" && listener.next(match(location, patterns))
        })

        // if user not provided initial directive, we emit current location alternative.
        if (!directive$) {
          const location = global.location
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
  }
}

export {
  makePageDriver,
  action
}