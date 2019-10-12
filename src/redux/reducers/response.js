import {
  CREATE_QUOTE_SUCCESS,
  CREATE_ENDORSEMENT_SUCCESS,
  FINALISE_QUOTE_SUCCESS,
  FINALISE_ENDORSEMENT_SUCCESS,
  SET_CREDIT_CARD_TOKEN,
  PROCESS_UNDERWRITING_SUCCESS,
  UNDERWRITING_DECLINE,
  SUBMIT_CLAIM_SUCCESS,
  CREATE_CLAIMS_FORM,
  SUBMIT_CONTACT_US_SUCCESS,
  CREATE_CONTACT_FORM,
  RESET_FORM,
  SET_FORM_TYPE,
  GET_CUSTOMER_CLIENT_TOKEN_SUCCESS
} from "redux/actionTypes";

const initialState = {
  leadId: null,
  policyId: null,
  policyholderId: null,
  accountId: null,
  quoteCreated: false,
  creditCardToken: null,
  policyFinalised: false,
  invoice: null,
  type: 'Quote', // 'Endorsement', 'Claims', 'Contact'
  endorsementCreated: false,
  endorsementId: null,
  endorsementFinalised: false,
  underwriting: {
    declined: false
  },
  claimSubmitted: false,
  contactUsSubmitted: false,
  customerClientToken: null
};

const quoteAndBuyNavigation = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_QUOTE_SUCCESS:
      return Object.assign({}, state, {
        leadId: action.payload.leadId,
        policyId: action.payload.policyId,
        policyholderId: action.payload.policyholderId,
        quoteCreated: true
      });

    case FINALISE_QUOTE_SUCCESS:
      return Object.assign({}, state, {
        policyFinalised: true
      })

    case SET_CREDIT_CARD_TOKEN:
      return Object.assign({}, state, {
        creditCardToken: action.payload
      })

    case CREATE_ENDORSEMENT_SUCCESS:
      return Object.assign({}, state, {
        endorsementId: action.payload.locator,
        endorsementCreated: true
      })

    case SET_FORM_TYPE:
      return Object.assign({}, state, {
        type: action.payload
      })

    case RESET_FORM:
      return initialState;

    case FINALISE_ENDORSEMENT_SUCCESS:
      return Object.assign({}, state, {
        endorsementFinalised: true,
        invoice: {
          id: action.payload.locator,
          amount: action.payload.totalDue,
          currency: action.payload.totalDueCurrency
        }
      })

    case PROCESS_UNDERWRITING_SUCCESS:
      return Object.assign({}, state, {
        underwriting: {
          declined: action.payload.decision === "reject" || state.underwriting.declined ? true : false
        }
      })

    case UNDERWRITING_DECLINE:
      return Object.assign({}, state, {
        underwriting: {
          declined: true,
          header: action.payload.header,
          message: action.payload.message
        }
      })

    case SUBMIT_CLAIM_SUCCESS:
      return Object.assign({}, state, {
        claimSubmitted: true
      })

    case SUBMIT_CONTACT_US_SUCCESS:
      return Object.assign({}, state, {
        contactUsSubmitted: true
      })

    case CREATE_CLAIMS_FORM:
      return Object.assign({}, state, {
        claimSubmitted: false
      })

    case CREATE_CONTACT_FORM:
      return Object.assign({}, state, {
        contactUsSubmitted: false
      })

    case GET_CUSTOMER_CLIENT_TOKEN_SUCCESS:
      return Object.assign({}, state, {
        customerClientToken: action.payload.clientToken
      })

    default:
      return state;
  }
}

export default quoteAndBuyNavigation;
