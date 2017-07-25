/* global WebSocket */
import CryptoJS from 'crypto-js'
import { END, eventChannel } from 'redux-saga'
import { call, put, select, take } from 'redux-saga/effects'
import GamesparksActions from '../Redux/GamesparksRedux.js'
import LoginActions from '../Redux/LoginRedux.js'

export const hasWebsocket = (state) => state.gamesparks.connected
export const hasSocketUrl = (state) => state.gamesparks.url

// attempts to login
export function * login ({ username, password }) {
  const isConnected = yield select(hasWebsocket)
  if (!isConnected) {
    let url = yield select(hasSocketUrl)
    const env = 'preview'
    const key = 'h313710gdMs0'
    if (!url) {
      url = `wss://${env}.gamesparks.net/ws/${key}`
    }
    const secret = 'bv7XLbgfeKWviKsfw4Uu2rUc64ncn61S'
    const channel = yield call(initSdk, url, secret)
    let redirect
    try {
      let msg
      while (true) {
        msg = yield take(channel)
        if (typeof msg === 'object' && msg['redirect']) {
          redirect = msg['redirect']
          return
        }
        yield put(GamesparksActions.startWebsocket(env, key, msg))
      }
    } finally {
      if (redirect) {
        yield put(GamesparksActions.redirectWebsocket(env, key, redirect))
      } else if (password === '') {
        // dispatch failure
        yield put(LoginActions.loginFailure('WRONG'))
      } else {
        // dispatch successful logins
        yield put(LoginActions.loginSuccess(username))
      }
    }
  }
}

function initSdk (url, secret) {
  return eventChannel(emit => {
    let authToken, redirectUrl, sessionId
    const socket = new WebSocket(url)
    socket.onopen = (event) => {
      emit('WebSocket onOpen')
    }
    socket.onclose = (event) => {
      if (redirectUrl) {
        emit({ redirect: redirectUrl })
      } else {
        emit('WebSocket onClose')
      }
    }
    socket.onerror = (event) => {
      emit('WebSocket onError')
    }
    socket.onmessage = (event) => {
      let msg
      try {
        msg = JSON.parse(event.data)
      } catch (e) {
        emit(END)
        return
      }
      if (msg['authToken']) {
        authToken = msg['authToken']
      }
      if (msg['connectUrl']) {
        redirectUrl = msg['connectUrl']
      }
      if (msg['@class'] === '.AuthenticatedConnectResponse') {
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
          socket.send(JSON.stringify(reply))
        } else if (msg['sessionId']) {
          sessionId = msg['sessionId']
          emit(msg)
        }
      }
    }
    return () => {
      socket.close()
    }
  })
}
