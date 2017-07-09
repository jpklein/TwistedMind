const initialState = {
  isLoggedIn: false,
  hasSkippedLogin: false,
  id: null,
  name: null,
  token: null,
};

export default function user(state: State = initialState, action: Action): State {
  if (action.type === 'LOGGED_IN') {
    let {id, name, token} = action.data;
    return {
      isLoggedIn: true,
      hasSkippedLogin: false,
      token,
      id,
      name,
    };
  }
  if (action.type === 'SKIPPED_LOGIN') {
    return {
      isLoggedIn: false,
      hasSkippedLogin: true,
      token: null,
      id: null,
      name: null,
    };
  }
  if (action.type === 'LOGGED_OUT') {
    return initialState;
  }
  if (action.type === 'GOT_TOKEN') {
    return {
      ...state,
      token: action.token,
    };
  }
  if (action.type === 'LOST_TOKEN') {
    return {
      ...state,
      token: null,
    };
  }
  return state;
}
