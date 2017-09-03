/* global beforeEach */
/* global WebSocket */
// import { path } from 'ramda'
import { Server } from 'mock-socket'
import { call, select } from 'redux-saga/effects'
import { connectSaga, initSdk } from '../../App/Sagas/GamesparksSagas.js'
import Actions, { sdkConfig } from '../../App/Redux/GamesparksRedux.js'

const stepper = (fn) => (mock) => fn.next(mock).value
const mockSess = '12345678-9012-3456-7890-123456789012'
const mockEnv = Actions.startWebsocket('test')
const mockUri = 'wss://localhost:8080'
const mockCfg = { endpoints: { test: mockUri }, secret: '' }
const mockServer = new Server(mockUri)
let mockSocket = {}
let step = () => {}
let testChannel = {}

beforeEach(() => {
  // configures our test server
  mockServer.on('connection', server => {
    mockServer.send({
      '@class': '.AuthenticatedConnectResponse',
      sessionId: mockSess
    })
  })

  mockSocket = new WebSocket(mockUri)
  step = stepper(connectSaga())

  step() // take(GamesparksTypes.START_WEBSOCKET))
  expect(step(mockEnv)).toEqual(select(sdkConfig))

  testChannel = call(initSdk, mockSocket, mockCfg.secret)
  expect(step(mockCfg)).toEqual(testChannel)
})

test('websocket connected', () => {
  // @todo why does call to initSdk in connectSaga fail in try/catch?
  expect(step(testChannel)).toEqual(
    { '@@redux-saga/IO': true, TAKE: {pattern: 'START_WEBSOCKET'} }
  )
})
