import { EventEmitter } from 'events'
import { runSaga, eventChannel, END, delay } from 'redux-saga'
import { take, call, cancelled, fork, apply } from 'redux-saga/effects'
import WebSocket from 'ws'
let { describe, it } = global
/*
 * Examples of sagas using channels
 *
 * @see https://github.com/redux-saga/redux-saga/blob/master/docs/advanced/Channels.md
 */
describe('a suite of example sagas', () => {
  /*
   * Sets up environment to run sagas without connection to redux store actions
   */
  const state = {}
  const emitter = new EventEmitter()
  const resolver = () => state
  const bindSaga = (emitter, resolver) => ({
    getState: resolver,
    subscribe: (callback) => {
      emitter.on('action', callback)
      return () => { emitter.removeListener('action', callback) }
    },
    dispatch: (output) => {
      emitter.emit('action', output)
    }
  })
  /*
   * Displays a countdown in console.log
   */
  it('uses the eventChannel factory to connect to external events', () => {
    // creates an event channel from an interval of seconds
    function countdownSubscribe (secs) {
      // takes a subscriber function with emit method to put messages onto the channel
      return eventChannel(emit => {
        const iv = setInterval(() => {
          // emitting END causes the channel to close
          emit((--secs > 0) ? secs : END)
        }, 1000)
        // subscriber must return an unsubscribe function invoked on channel.close()
        return () => {
          clearInterval(iv)
        }
      })
    }
    // blocked until a message is put on the channel
    function * countdownSaga () {
      const channel = yield call(countdownSubscribe, 4)
      try {
        while (true) {
          // take(END) causes the saga to jump to the finally block
          let seconds = yield take(channel)
          console.log(`countdown: ${seconds}`)
        }
      } finally {
        if (yield cancelled()) {
          channel.close()
          console.log('countdown cancelled')
        }
      }
    }
    // starts saga outside the redux middleware environment
    runSaga(countdownSaga(), bindSaga(emitter, resolver))
  })
  /*
   * Displays messages passed between local server and saga client in console.log
   */
  it('uses event channels to pass WebSocket events', () => {
    function createWebSocketClient () {
      return new WebSocket('ws://127.0.0.1:8080')
    }
    // sets up subscription to incoming ping events
    function pingSubscribe (socket) {
      return eventChannel(emit => {
        // puts message into the channel
        const pingHandler = (message) => {
          console.log('client received: %s', message)
          emit(message)
        }
        // sets up the subscription
        socket.on('message', pingHandler)
        // returns an unsubscribe function
        return () => {
          socket.off('message', pingHandler)
        }
      })
    }
    // replies with a pong message on socket
    function * pingListener (socket) {
      yield call(delay, 5000)
      // calls send as a method with socket as context
      yield apply(socket, socket.send, ['pong'])
      console.log('client sent: pong')
    }
    function * pingSaga () {
      const socket = yield call(createWebSocketClient)
      const channel = yield call(pingSubscribe, socket)
      while (true) {
        yield take(channel)
        yield fork(pingListener, socket)
      }
    }
    // starts saga outside the redux middleware environment
    runSaga(pingSaga(), bindSaga(emitter, resolver))
    // creates a local server for saga socket client
    const server = new WebSocket.Server({ port: 8080 })
    server.on('connection', (ws) => {
      ws.on('message', (message) => {
        console.log('server received: %s', message)
        server.close()
      })
      // sends ping to client
      ws.send('ping')
      console.log('server sent: ping')
    })
  })
})
