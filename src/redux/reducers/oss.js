import { GET_POLICIES_AND_POLICYHOLDERS_SUCCESS } from "redux/actionTypes";

const initialState = {
  editPolicy: null,
  policyAndPolicyholderIds: [],
  policies: [],
  policyholdersByPolicyId: null,
  renewalsByPolicyId: null
};

const oss = (state = initialState, action) => {
  switch (action.type) {
    case 'EDIT_POLICY':
      return Object.assign({}, state, {
        editPolicy: action.payload
      })

    case 'CREATE_QUOTE_AND_BUY_FORM':
      return Object.assign({}, state, {
        editPolicy: null
      })

    case GET_POLICIES_AND_POLICYHOLDERS_SUCCESS:
      return Object.assign({}, state, {
        policyAndPolicyholderIds: action.payload.policyAndPolicyholderIds,
        policies: action.payload.policies,
        policyholdersByPolicyId: action.payload.policyholders,
        renewalsByPolicyId: action.payload.renewals // store renewals on the top level of Redux instead
      })

    default:
      return state;
  }
}

export default oss;
