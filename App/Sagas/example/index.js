import { eventChannel, END, delay } from 'redux-saga'
import { take, call, cancelled, fork, apply } from 'redux-saga/effects'
let { WebSocket } = global
/*
 * Examples of sagas using channels
 *
 * @see https://github.com/redux-saga/redux-saga/blob/master/docs/advanced/Channels.md
 */

/*
 * Displays a countdown
 */
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
export function * countdownSaga () {
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

/*
 * Displays messages passed between local server and saga client
 */
// creates a socket connection
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
export function * pingSaga () {
  const socket = yield call(createWebSocketClient)
  const channel = yield call(pingSubscribe, socket)
  while (true) {
    yield take(channel)
    yield fork(pingListener, socket)
  }
}
