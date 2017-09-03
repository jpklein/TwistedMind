import Actions, { reducer, INITIAL_STATE } from '../../App/Redux/GamesparksRedux.js'

const MOCK_STATE = {
  environment: 'preview',
  initializing: false,
  connected: false,
  endpoints: {
    preview: 'wss://preview.gamesparks.net/ws/012345678901',
    live: 'wss://live.gamesparks.net/ws/012345678901'
  },
  secret: '12345678901234567890123456789012',
  session: '12345678-9012-3456-7890-123456789012'
}

// test('logger', () => {
//   const store = reducer(INITIAL_STATE, Actions.log('MESSAGE'))

//   // @todo get latest message pushed to Reactotron
//   expect(Reactotron.next()).toBe('MESSAGE')
// })

test('resetter', () => {
  const store = reducer(MOCK_STATE, Actions.resetGamesparksConfig())

  // @todo? deep comparison of state objects
  expect(store).toBe(INITIAL_STATE)
})

test('start', () => {
  const store = reducer(INITIAL_STATE, Actions.startWebsocket(MOCK_STATE.environment))

  expect(store.environment).toBe(MOCK_STATE.environment)
  expect(store.initializing).toBe(true)
})

test('connected', () => {
  const store = reducer(INITIAL_STATE, Actions.gamesparksConnected(MOCK_STATE.session))

  expect(store.initializing).toBe(false)
  expect(store.connected).toBe(true)
  expect(store.session).toBe(MOCK_STATE.session)
})

test('disconnected', () => {
  const store = reducer(INITIAL_STATE, Actions.websocketClosed())

  expect(store.initializing).toBe(false)
  expect(store.connected).toBe(false)
  expect(store.session).toBe(null)
})

test('setUri', () => {
  const testUri = 'wss://test.gamesparks.net/ws/012345678901'
  const store = reducer(INITIAL_STATE, Actions.setEndpoint('test', testUri))

  expect(store.endpoints.test).toBe(testUri)
})
