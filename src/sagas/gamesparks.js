import GameSparks from 'gamesparks-sdk';
import { eventChannel } from 'redux-saga';
import { take, call, put, fork, race } from 'redux-saga/effects';
// import auth from '../auth';

function* externalListener(channel) {
  while (true) {
    let message = yield take(channel);
    put(message);
  }
}

function* internalListener(sdk) {
  while (true) {
    let action = yield take('LOGIN_REQUEST');
    let {username, password} = action.data;
    yield call([sdk, sdk.sendWithData], 'AuthenticationRequest', {password: password, userName: username}, data => {
throw data;
      if (data.error) {
        put({ type: 'SDK_ERROR', error: data.error });
      } else {
        put({ type: 'SET_AUTH', data });
      }
    });
  }
}

function gamesparksSubscribe(sdk, env) {
  const init = env => env === 'LIVE' ? sdk.initLive : sdk.initPreview;
  return eventChannel(emit => {
    const secret = 'bv7XLbgfeKWviKsfw4Uu2rUc64ncn61S';

    init({
      key: 'h313710gdMs0',
      onNonce: n => CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(n, secret)),
      onInit: emit('STOP_WEBSOCKET'),
    });

    return () => {
      sdk.webSocket.close();
    };
  });
}

function* gamesparksSaga() {
  const sdk = new GameSparks();
  let action = yield take('START_WEBSOCKET');
  let channel = yield call(gamesparksSubscribe, sdk, action.env);
  while (true) {
    let { end } = yield race({
      run: [call(externalListener, channel), call(internalListener, sdk)],
      end: take('STOP_WEBSOCKET')
    });
    if (end) {
      channel.close();
    }
  }
}

// export default function* root() {
//   yield fork(wsHandling);
// }

// /**
//  * Effect to handle authorization
//  * @param  {string} username               The username of the user
//  * @param  {string} password               The password of the user
//  * @param  {object} options                Options
//  * @param  {boolean} options.isRegistering Is this a register request?
//  */
// export function * authorize ({username, password, isRegistering}) {
//   // We send an action that tells Redux we're sending a request
//   yield put({type: 'SENDING_REQUEST', sending: true})

//   // We then try to register or log in the user, depending on the request
//   try {
//     let salt = genSalt(username)
//     let hash = hashSync(password, salt)
//     let response

//     // For either log in or registering, we call the proper function in the `auth`
//     // module, which is asynchronous. Because we're using generators, we can work
//     // as if it's synchronous because we pause execution until the call is done
//     // with `yield`!
//     if (isRegistering) {
//       response = yield call(auth.register, username, hash)
//     } else {
//       response = yield call(auth.login, username, hash)
//     }

//     return response
//   } catch (error) {
//     console.log('hi')
//     // If we get an error we send Redux the appropiate action and return
//     yield put({type: 'REQUEST_ERROR', error: error.message})

//     return false
//   } finally {
//     // When done, we tell Redux we're not in the middle of a request any more
//     yield put({type: 'SENDING_REQUEST', sending: false})
//   }
// }

// /**
//  * Effect to handle logging out
//  */
// export function * logout () {
//   // We tell Redux we're in the middle of a request
//   yield put({type: 'SENDING_REQUEST', sending: true})

//   // Similar to above, we try to log out by calling the `logout` function in the
//   // `auth` module. If we get an error, we send an appropiate action. If we don't,
//   // we return the response.
//   try {
//     let response = yield call(auth.logout)
//     yield put({type: 'SENDING_REQUEST', sending: false})

//     return response
//   } catch (error) {
//     yield put({type: 'REQUEST_ERROR', error: error.message})
//   }
// }

// /**
//  * Log in saga
//  */
// export function * loginFlow () {
//   // Because sagas are generators, doing `while (true)` doesn't block our program
//   // Basically here we say "this saga is always listening for actions"
//   while (true) {
//     // And we're listening for `LOGIN_REQUEST` actions and destructuring its payload
//     let request = yield take('LOGIN_REQUEST')
//     let {username, password} = request.data

//     // A `LOGOUT` action may happen while the `authorize` effect is going on, which may
//     // lead to a race condition. This is unlikely, but just in case, we call `race` which
//     // returns the "winner", i.e. the one that finished first
//     let winner = yield race({
//       auth: call(authorize, {username, password, isRegistering: false}),
//       logout: take('LOGOUT')
//     })

//     // If `authorize` was the winner...
//     if (winner.auth) {
//       // ...we send Redux appropiate actions
//       yield put({type: 'SET_AUTH', newAuthState: true}) // User is logged in (authorized)
//       yield put({type: 'CHANGE_FORM', newFormState: {username: '', password: ''}}) // Clear form
//       // browserHistory.push('/dashboard') // Go to dashboard page
//     }
//   }
// }

// /**
//  * Log out saga
//  * This is basically the same as the `if (winner.logout)` of above, just written
//  * as a saga that is always listening to `LOGOUT` actions
//  */
// export function * logoutFlow () {
//   while (true) {
//     yield take('LOGOUT')
//     yield put({type: 'SET_AUTH', newAuthState: false})

//     yield call(logout)
//     // browserHistory.push('/')
//   }
// }

// /**
//  * Register saga
//  * Very similar to log in saga!
//  */
// export function * registerFlow () {
//   while (true) {
//     // We always listen to `REGISTER_REQUEST` actions
//     let request = yield take('REGISTER_REQUEST')
//     let {username, password} = request.data

//     // We call the `authorize` task with the data, telling it that we are registering a user
//     // This returns `true` if the registering was successful, `false` if not
//     let wasSuccessful = yield call(authorize, {username, password, isRegistering: true})

//     // If we could register a user, we send the appropiate actions
//     if (wasSuccessful) {
//       yield put({type: 'SET_AUTH', newAuthState: true}) // User is logged in (authorized) after being registered
//       yield put({type: 'CHANGE_FORM', newFormState: {username: '', password: ''}}) // Clear form
//       // browserHistory.push('/dashboard') // Go to dashboard page
//     }
//   }
// }

// // The root saga is what we actually send to Redux's middleware. In here we fork
// // each saga so that they are all "active" and listening.
// // Sagas are fired once at the start of an app and can be thought of as processes running
// // in the background, watching actions dispatched to the store.
// export default function * root () {
//   yield fork(loginFlow)
//   yield fork(logoutFlow)
//   yield fork(registerFlow)
// }
