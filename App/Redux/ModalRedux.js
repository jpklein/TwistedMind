import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'

/* Types and Action Creators ------------- */

const { Types, Creators } = createActions({
  showModal: ['msg'],
  hideModal: null
  // @todo implements actions to handle responses?
  // confirmYes: null,
  // confirmNo: null
})
export const ModalTypes = Types
export default Creators

/* Initial State ------------------------- */

export const INITIAL_STATE = Immutable({
  curr: 0,
  msgs: {}
})

/* Reducers ------------------------------ */

// @todo handles stacked modals
export const push = (state, { msg }) => {
  const c = ++state.curr
  return state.merge({
    curr: c,
    msgs: Object.assign({}, state.msgs, { [c]: msg })
  })
}

export const pop = state => {
  let stack = Object.assign({}, state.msgs)
  let c = state.curr
  delete stack[c]
  return state.merge({
    curr: --c,
    msgs: stack
  })
}

export const reducer = createReducer(INITIAL_STATE, {
  [Types.SHOW_MODAL]: push,
  [Types.HIDE_MODAL]: pop
})
