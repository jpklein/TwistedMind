/* global WebSocket */
import CryptoJS from 'crypto-js'
import { eventChannel } from 'redux-saga'
import { call, put, race, select, take } from 'redux-saga/effects'
import Actions, { INITIAL_STATE } from '../Redux/GamesparksRedux.js'

// @todo define connectionFlow() to manage network connection/reconnection/error reporting

export const sdkConfig = state => ({
  endpoints: state.gamesparks.endpoints,
  secret: state.gamesparks.secret
})

// attempts to login
export function * connect ({ env }) {
  const sdk = yield select(sdkConfig)
  const url = sdk.endpoints[env] || INITIAL_STATE.endpoints[env]
  let shouldReconnect
  try {
    const socket = new WebSocket(url)
    const channel = yield call(initSdk, socket, sdk.secret)
    while (true) {
      // @todo add internal listener to invalidate connection (request close)
      const { event } = yield race({
        send: call(transmit, socket),
        event: take(channel)
      })
      if (typeof event === 'object' && event.type) {
        const handle = getHandler(event.type)
        const { type } = yield handle({ env: env, ...event })
        shouldReconnect = type === 'SET_ENDPOINT'
      }
    }
  } finally {
    yield put(Actions.websocketClosed())
    if (shouldReconnect === true) {
      yield put(Actions.startWebsocket(env))
    }
  }
}

function initSdk (socket, secret) {
  return eventChannel(emit => {
    let authToken,
      redirectUrl,
      sessionId
    socket.onclose = (event) => {
      if (redirectUrl) {
        emit({ type: 'redirected', url: redirectUrl })
      }
      emit({ type: 'closed' })
    }
    socket.onerror = (event) => {
      emit({ type: 'errored', event })
    }
    socket.onmessage = (event) => {
      let msg
      try {
        msg = JSON.parse(event.data)
      } catch (e) {
        emit({ type: 'errored', event })
        return
      }
      if (msg['authToken']) {
        authToken = msg['authToken']
      }
      if (msg['connectUrl']) {
        redirectUrl = msg['connectUrl']
      }
      if (msg['@class'] === '.AuthenticatedConnectResponse') {
        // handshaking
        if (msg['nonce']) {
          const reply = {
            '@class': '.AuthenticatedConnectRequest',
            hmac: CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(msg['nonce'], secret))
          }
          if (authToken) {
            reply.authToken = authToken
          }
          if (sessionId) {
            reply.sessionId = sessionId
          }
          // @todo send platform/os data
          socket.send(JSON.stringify(reply))
        } else if (msg['sessionId']) {
          sessionId = msg['sessionId']
          emit({ type: 'connected', sessionId: sessionId })
          // @todo set keepalive interval?
        }
      }
    }
    return () => {
      socket.close()
    }
  })
}

function * transmit (socket) {
  let requestCounter = 0
  while (true) {
    const { data } = yield take('WEBSOCKET_SEND')
    const requestId = (new Date()).getTime() + '_' + (++requestCounter)
    socket.send(JSON.stringify({ requestId: requestId, ...data }))
  }
}

function getHandler (type) {
  const handlers = {
    log: function * (event) {
      return yield put(Actions.log(event))
    },
    redirected: function * ({ env, url }) {
      return yield put(Actions.setEndpoint(env, url))
    },
    connected: function * ({ sessionId }) {
      return yield put(Actions.gamesparksConnected(sessionId))
    },
    closed: () => {
      // @todo returning undefined throws an error?
    }
  }
  const fn = handlers[type] || handlers.log
  return fn
}
