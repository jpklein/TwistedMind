function skipLogin(): Action {
  return {
    type: 'SKIPPED_LOGIN',
  };
}

function logIn(credentials): Action {
  return {
    type: 'APPLY_TOPICS_FILTER',
    credentials: credentials,
  };
}

function logOut(): ThunkAction {
  return (dispatch) => {
    // Parse.User.logOut();
    // FacebookSDK.logout();

    return dispatch({
      type: 'LOGGED_OUT',
    });
  };
}
