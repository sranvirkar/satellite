import {
  SET_CREDIT_CARD_TOKEN,
  GET_CUSTOMER_CLIENT_TOKEN_REQUEST,
  GET_CUSTOMER_CLIENT_TOKEN_SUCCESS,
  GET_CUSTOMER_CLIENT_TOKEN_ERROR,
  GET_RENEWALS_REQUEST,
  GET_RENEWALS_SUCCESS,
  GET_RENEWALS_ERROR
} from "redux/actionTypes";
import {
  creditCardTokenSelector,
  policyholderIdSelector,
  policyholderIdByPolicySelector,
} from "redux/selectors";
import {
  renewalsByPolicyIdSelector
} from "redux/selectors/Renewal";
import {
  apexRequestPromise,
} from "redux/actions";

export function setCreditCardToken(creditCardToken) {
  return {
    type: SET_CREDIT_CARD_TOKEN,
    payload: creditCardToken
  }
}

// Get client token for Braintree drop-in UI to show customer's previous payment methods
export function getCustomerClientToken(policyId) {
  return async (dispatch, getState) => {
    try {
      let policyholderId;

      // policyId is only passed for one time payments, else assume it is for endorsements
      if (!policyId) {
        policyholderId = policyholderIdSelector(getState());
      } else {
        policyholderId = policyholderIdByPolicySelector(getState(), policyId);
      }

      const headers = {
        Id: policyholderId
      }

      dispatch(getCustomerClientTokenRequest());
      const payload = await apexRequestPromise('Customer Client Token', 'GET', headers, '');
      dispatch(getCustomerClientTokenSuccess(payload));
      return Promise.resolve(payload.clientToken);
    } catch (error) {
      dispatch(getCustomerClientTokenError());
      return Promise.reject("Error: Get Customer Client Token: " + JSON.stringify(error));
    }
  }
}

function getCustomerClientTokenRequest() {
  return {
    type: GET_CUSTOMER_CLIENT_TOKEN_REQUEST
  }
}

function getCustomerClientTokenSuccess(payload) {
  return {
    type: GET_CUSTOMER_CLIENT_TOKEN_SUCCESS,
    payload
  }
}

function getCustomerClientTokenError() {
  return {
    type: GET_CUSTOMER_CLIENT_TOKEN_ERROR
  }
}

export function getRenewals(policyId) {
  return async (dispatch, getState) => {
    try {
      dispatch(getRenewalsRequest());
      const headers = {
        policyId
      }
      const results = await apexRequestPromise('Get Renewals', 'GET', headers, '');
      dispatch(getRenewalsSuccess());
      return Promise.resolve(results);
    } catch (error) {
      dispatch(getRenewalsError());
      return Promise.reject("Error: Get Renewals: " + JSON.stringify(error));
    }
  }
}

function getRenewalsRequest() {
  return {
    type: GET_RENEWALS_REQUEST
  }
}

function getRenewalsSuccess() {
  return {
    type: GET_RENEWALS_SUCCESS
  }
}

function getRenewalsError() {
  return {
    type: GET_RENEWALS_ERROR
  }
}

// TODO: dispatch actions
export function processRenewalPayment(policyId, invoice) {
  return async (dispatch, getState) => {
    const creditCardToken = creditCardTokenSelector(getState());
    const policyholderId = policyholderIdByPolicySelector(getState(), policyId);
    const renewals = renewalsByPolicyIdSelector(getState(), policyId);
    const matchingRenewal = renewals.find(renewal => renewal.invoice.locator === invoice.locator);
    if (!matchingRenewal) return Promise.reject("No overdue renewal found");
    const renewalId = matchingRenewal.locator;

    const payload = constructProcessRenewalPayload(creditCardToken, policyholderId, invoice, renewalId);

    try {
      const headers = {
        policyId
      }
      await apexRequestPromise('Quote Payment', 'POST', headers, JSON.stringify(payload));
      return Promise.resolve();
    } catch (error) {
      if (error.statusCode === 402) {
        return Promise.reject("Renewal Payment Error: Allow User Retry: " + JSON.stringify(error));
      } else {
        return Promise.reject("Error: Renewal Payment: " + JSON.stringify(error));
      }
    }
  }
}

function constructProcessRenewalPayload(creditCardToken, policyholderId, invoice, renewalId) {
  return {
    creditCardToken,
    externalCustomerId: policyholderId,
    externalReference: invoice.locator,
    isRenewal: true,
    isOTP: true,
    isAdditionalCreditCard: true,
    amount: {
      value: invoice.totalDue,
      currency: invoice.totalDueCurrency
    },
    transactionType: "Renewal",
    renewalId
  }
}

// Currently unused
export function getPaymentTransactions(policyId) {
  return (dispatch, getState) => {
    const policyholderId = policyholderIdByPolicySelector(getState(), policyId);
    const headers = {
      Id: policyholderId
    }
    return apexRequestPromise('Customer Transactions', 'GET', headers, '');
  }
}
