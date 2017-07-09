import GameSparks from 'gamesparks-sdk';
import { EventEmitter } from 'events'
import { runSaga, eventChannel, END } from 'redux-saga'
import { take, put, call, cancelled, race } from 'redux-saga/effects'

// creates an event Channel from an interval of seconds
function gamesparksSubscribe(gsdk, secs) {
  let chan = eventChannel(emit => {
    // const iv = setTimeout(() => emit('STOP_WEBSOCKET'), 1500);
    const  v = setTimeout(() => emit(END), 1500);
    return () => {}
  });
  return chan;
}

function* gamesparksListener(chan) {
  try {
    let msg = yield take(chan);
    let heard = {
      'STOP_WEBSOCKET': () => { console.log(msg); return msg; }
    }[msg];
    if (heard) return heard();
  } finally {
    console.log('subscribe cancelled')
    // if (yield cancelled()) {
      chan.close()
    // }
  }
}

export function* gamesparksSaga() {
  const gsdk = new GameSparks()
  let action = yield take('START_WEBSOCKET'),
        chan = yield call(gamesparksSubscribe, gsdk, 4)
  try {
    while (true) {
      // let { end } = yield race({
      //   run: gamesparksListener(chan),
      //   end: take('STOP_WEBSOCKET')
      // });
      let end = yield gamesparksListener(chan)
      console.log(`countdown to ${end}`)
    }
  } finally {
    console.log('countdown cancelled')
    // if (yield cancelled()) {
      chan.close()
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
  dispatch: (output) => { emitter.emit('action', output) },
  getState: resolver
}))(emitter, () => state));

it('runs a saga', () => {
  emitter.emit('action', { type: 'START_WEBSOCKET' });
});
