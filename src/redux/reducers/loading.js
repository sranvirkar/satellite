// https://medium.com/stashaway-engineering/react-redux-tips-better-way-to-handle-loading-flags-in-your-reducers-afda42a804c6

/*
  Every network request should dispatch "*_REQUEST", "*_SUCCESS" AND "*_ERROR" actions which will get stored here and the error reducer
  This will allow you to use the loadingSelector (in redux/selectors) and pass in the "*" (e.g. CREATE_QUOTE) to determine whether a certain
  network request is currently in progress
*/
export const initialState = {
  global: false
}

// List of REQUEST/SUCCESS/ERROR actions that will cause a global loading state
const globalScopes = [
  'PROCESS_UNDERWRITING', 
  'CREATE_FORM', 
  'SUBMIT_FORM', 
  'GET_QUOTE_PRICE',
  'GET_POLICYHOLDERS_FOR_POLICY'
];

const loading = (state = initialState, action) => {
  // Check for any action ending in REQUEST, SUCCESS, ERROR  or CLEAR and ignore any others
  const matches = /(.*)_(REQUEST|SUCCESS|ERROR|CLEAR)/.exec(action.type);
  if (!matches) return state;

  // If action ends in REQUEST, loading is true else false
  const [, actionName, actionState] = matches;
  let newState = Object.assign({}, state, {
    [actionName]: actionState === "REQUEST"
  })

  // If any actions in the globalScopes array has loading is true, then global loading state is true
  // newState.global = globalScopes.some(scope => newState[scope]);

  // For now, every network request (which dispatches a REQUEST action) will be a global loading state
  newState.global = Object.keys(newState).some(scope => scope !== "global" && newState[scope]);
  return newState;
}

export default loading;
