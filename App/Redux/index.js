import { combineReducers } from 'redux'
import configureStore from '../Redux/CreateStore.js'
import rootSaga from '../Sagas/'

export default () => {
  const rootReducer = combineReducers({
    navigation: require('../Redux/NavigationRedux.js').reducer,
    appState: require('../Redux/AppStateRedux.js').reducer,
    github: require('../Redux/GithubRedux.js').reducer,
    login: require('../Redux/LoginRedux.js').reducer,
    search: require('../Redux/SearchRedux.js').reducer,
    gamesparks: require('../Redux/GamesparksRedux.js').reducer,
    modal: require('../Redux/ModalRedux.js').reducer
  })

  return configureStore(rootReducer, rootSaga)
}
