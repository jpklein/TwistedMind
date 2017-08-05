import Actions, { reducer, INITIAL_STATE, isLoggedIn } from '../../App/Redux/LoginRedux'

const mock = {
  username: 'info@twistedmind.com',
  // password: 'pa55word',
  error: null,
  fetching: false,
  authToken: '1234567-8901-2345-6789-0123456789012',
  userId: '123456789012345678901234',
  displayName: 'info'
}

test('attempt', () => {
  const state = reducer(INITIAL_STATE, Actions.loginRequest(mock.username, 'password'))

  expect(state.username).toBe(mock.username)
  expect(state.fetching).toBe(true)
})

test('success', () => {
  const { authToken, userId, displayName } = mock
  const state = reducer(INITIAL_STATE, Actions.loginSuccess(authToken, userId, displayName))

  expect(state.username).toBe(null)
  expect(state.authToken).toBe(authToken)
  expect(state.userId).toBe(userId)
  expect(state.displayName).toBe(displayName)
})

test('autoLogin', () => {
  const state = reducer(INITIAL_STATE, Actions.autoLogin())

  expect(state.username).toBe(INITIAL_STATE.username)
})

test('failure', () => {
  const state = reducer(INITIAL_STATE, Actions.loginFailure(69))

  expect(state.fetching).toBe(false)
  expect(state.error).toBe(69)
})

test('logout', () => {
  const loginState = reducer(INITIAL_STATE, Actions.loginSuccess('hi'))
  const state = reducer(loginState, Actions.logout())

  expect(state.username).toBeFalsy()
})

test('isLoggedIn', () => {
  const { authToken, userId, displayName } = mock
  const state = reducer(INITIAL_STATE, Actions.loginSuccess(authToken, userId, displayName))

  expect(isLoggedIn(state)).toBe(true)
})
