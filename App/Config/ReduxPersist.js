import immutablePersistenceTransform from '../Services/ImmutablePersistenceTransform'
import { AsyncStorage } from 'react-native'
import { INITIAL_STATE as SDK_DEFAULT } from '../Redux/GamesparksRedux.js'
import { INITIAL_STATE as USER_DEFAULT } from '../Redux/LoginRedux.js'

const ignoreGamesparksTransmitState = {
  in: raw => raw,
  out: state => {
    if ('environment' in state) {
      // only rehydrates endpoint information
      state.initializing = SDK_DEFAULT.initializing
      state.connected = SDK_DEFAULT.connected
    } else if ('username' in state) {
      // rehydrates user profile information
      state.error = USER_DEFAULT.error
      state.fetching = USER_DEFAULT.fetching
      // @todo forces login after rehydrate?
      // state.authToken = USER_DEFAULT.authToken
    }
    return state
  }
}

// More info here:  https://shift.infinite.red/shipping-persistant-reducers-7341691232b1
const REDUX_PERSIST = {
  active: true,
  reducerVersion: '1.0',
  storeConfig: {
    storage: AsyncStorage,
    blacklist: ['search', 'navigation', 'appState'],
    transforms: [
      immutablePersistenceTransform,
      ignoreGamesparksTransmitState
    ]
  }
}

export default REDUX_PERSIST
