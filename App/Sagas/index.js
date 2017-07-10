import { takeLatest } from 'redux-saga/effects'
import API from '../Services/Api'
import FixtureAPI from '../Services/FixtureApi'
import DebugConfig from '../Config/DebugConfig'

/* ------------- Types ------------- */

import { exampleTypes } from '../Redux/example'
import { GithubTypes } from '../Redux/GithubRedux'
import { LoginTypes } from '../Redux/LoginRedux'
import { StartupTypes } from '../Redux/StartupRedux'

/* ------------- Sagas ------------- */

import { countdownSaga, pingSaga } from '../Sagas/example'
import { getUserAvatar } from './GithubSagas'
import { login } from './LoginSagas'
import { startup } from './StartupSagas'

/* ------------- API ------------- */

// The API we use is only used from Sagas, so we create it here and pass along
// to the sagas which need it.
const api = DebugConfig.useFixtures ? FixtureAPI : API.create()

/* ------------- Connect Types To Sagas ------------- */

export default function * root () {
  yield [
    // some sagas only receive an action
    takeLatest(StartupTypes.STARTUP, startup),
    takeLatest(LoginTypes.LOGIN_REQUEST, login),
    takeLatest(exampleTypes.START_COUNTDOWN_SAGA, countdownSaga),
    takeLatest(exampleTypes.START_PING_SAGA, pingSaga),

    // some sagas receive extra parameters in addition to an action
    takeLatest(GithubTypes.USER_REQUEST, getUserAvatar, api)
  ]
}
