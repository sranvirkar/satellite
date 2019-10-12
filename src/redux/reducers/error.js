// https://medium.com/stashaway-engineering/react-redux-tips-better-way-to-handle-loading-flags-in-your-reducers-afda42a804c6

export const initialState = {
  global: false
}

// Assumption: any ERROR action will cause a global error state
// const globalScopes = [
//   'PROCESS_UNDERWRITING',
//   'CREATE_FORM',
//   'SUBMIT_FORM',
//   'GET_QUOTE_PRICE',
//   'GET_POLICYHOLDERS_FOR_POLICY'
// ];

const error = (state = initialState, action) => {
  // Check for any action ending in REQUEST, SUCCESS or ERROR and ignore any others
  const matches = /(.*)_(REQUEST|SUCCESS|ERROR|CLEAR)/.exec(action.type);
  if (!matches) return state;

  // Clear error message if action is REQUEST or SUCCESS or CLEAR
  const [, actionName, actionState] = matches;
  const clearError = actionState === "REQUEST" || actionState === "SUCCESS" || actionState === "CLEAR";
  const errorMessage = action.payload || 'An error has occurred';
  let newState = Object.assign({}, state, {
    [actionName]: clearError ? null : errorMessage
  })

  // If any actions in the globalScopes array has error, then global error state is true
  // newState.global = globalScopes.some(scope => newState[scope]);
  newState.global = Object.keys(newState).some(key => key !== "global" && newState[key]);
  return newState;
}

export default error;
