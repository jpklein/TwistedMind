import { takeLatest } from 'redux-saga/effects'
import API from '../Services/Api'
import DebugConfig from '../Config/DebugConfig'
import FixtureAPI from '../Services/FixtureApi'

/* ------------- Types ------------- */

import { GithubTypes } from '../Redux/GithubRedux.js'
import { LoginTypes } from '../Redux/LoginRedux.js'
import { StartupTypes } from '../Redux/StartupRedux.js'

/* ------------- Sagas ------------- */

import { getUserAvatar } from '../Sagas/GithubSagas.js'
import { login } from '../Sagas/LoginSagas.js'
import { startup } from '../Sagas/StartupSagas.js'

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

    // some sagas receive extra parameters in addition to an action
    takeLatest(GithubTypes.USER_REQUEST, getUserAvatar, api)
  ]
}
