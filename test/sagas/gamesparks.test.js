import CryptoJS from 'crypto-js'
import GameSparks from 'gamesparks-sdk'
import { EventEmitter } from 'events'
import { runSaga, eventChannel, END } from 'redux-saga'
import { take, put, call, cancelled, race, delay } from 'redux-saga/effects'

function gamesparksSubscribe(sdk, env) {
  let channel = eventChannel(emit => {

    const initHandler = e => {
      // sdk.sendWithData('AuthenticationRequest', { password: 'admin', userName: 'admin' }, handler)
      // setTimeout(() => emit('STOP_WEBSOCKET'), 1500)
console.log('INITIALIZED')
      emit({ type: 'INITIALIZED' })
    }

    const handler = e => {
      console.log(e)
      // setTimeout(() => console.log(e), 1500)
    }

    sdk[`init${env}`]({
      key: 'h313710gdMs0',
      onNonce: n => CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(n, 'bv7XLbgfeKWviKsfw4Uu2rUc64ncn61S')),
      onMessage: handler,
      onInit: initHandler,
    });

    return () => {
      sdk.disconnect()
    }
  });

  return channel;
}

function* gamesparksListener(channel) {
    const message = yield take(channel);
    const heard = {
      'STOP_WEBSOCKET': () => { return message; }
    }[message];
    return heard ? heard() : message;
}

function* loginListener(sdk) {
// console.log('LOGIN_REQUEST')
//   const action = yield take('INITIALIZED')
  while (true) {
    yield call(delay, 1000)
    if (!sdk.isConnected()) {
      console.log('AWAITING_CONNECTION')
      continue
    }
    const action = yield take('LOGIN_REQUEST')
    const credentials = { password: 'admin', userName: 'admin' }
    sdk.sendWithData('AuthenticationRequest', credentials, e => {
      setTimeout(() => console.log(e), 1500)
    })
  }
}

export function* gamesparksSaga() {
  const sdk = new GameSparks(),
     action = yield take('START_WEBSOCKET'),
    channel = yield call(gamesparksSubscribe, sdk, 'Preview')
  try {
    while (true) {
      let { end } = yield race({
        // run: [gamesparksListener(channel), call(loginListener, sdk)],
        run: loginListener(sdk),
        end: take('STOP_WEBSOCKET')
      })
      // let end = yield gamesparksListener(gchannel)
      console.log(`caught ${end}`)
    }
  } finally {
    console.log('countdown cancelled')
    // if (yield cancelled()) {
      channel.close()
    // }
  }
}

let emitter = new EventEmitter();
const state = {};

runSaga(gamesparksSaga(), ((emitter, resolver) => ({
  subscribe: (callback) => {
    emitter.on('action', callback);
    return () => { emitter.removeListener('action', callback); }
  },
  dispatch: (output) => {
    // console.log(output)
    emitter.emit('action', output)
  },
  getState: resolver
}))(emitter, () => state));

it('runs a saga', () => {
  emitter.emit('action', { type: 'START_WEBSOCKET' });
});

it('attempts a login', () => {
  emitter.emit('action', { type: 'LOGIN_REQUEST' });
});
