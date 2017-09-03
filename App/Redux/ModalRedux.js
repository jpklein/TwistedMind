import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'

/* Types and Action Creators ------------- */

const { Types, Creators } = createActions({
  showModal: ['data']
  // @todo implements actions to handle responses
  // confirmYes: null,
  // confirmNo: null
})
export const ModalTypes = Types
export default Creators

/* Initial State ------------------------- */

export const INITIAL_STATE = Immutable({
  data: {}
})

/* Reducers ------------------------------ */

// @todo handles stacked modals
export const renderer = (state, { data }) => state.merge({
  data: data
})

export const reducer = createReducer(INITIAL_STATE, {
  [Types.SHOW_MODAL]: renderer
})
