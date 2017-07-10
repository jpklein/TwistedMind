import { createActions } from 'reduxsauce'

// exports actions
const { Types, Creators } = createActions({
  startCountdownSaga: null,
  stopCountdownSaga: null,
  startPingSaga: null,
  stopPingSaga: null
})
export const exampleTypes = Types
export default Creators
