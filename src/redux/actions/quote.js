import {
  CREATE_QUOTE_REQUEST,
  CREATE_QUOTE_SUCCESS,
  CREATE_QUOTE_ERROR,
  UPDATE_QUOTE_REQUEST,
  UPDATE_QUOTE_SUCCESS,
  UPDATE_QUOTE_ERROR,
  FINALISE_QUOTE_REQUEST,
  FINALISE_QUOTE_SUCCESS,
  FINALISE_QUOTE_ERROR } from "redux/actionTypes";
import { policyIdSelector, answerGroupByEntitySelector, creditCardTokenSelector, leadIdSelector, policyholderIdSelector } from "redux/selectors";
import {
  apexActionPromise,
  apexRequestPromise,
  clearPolicyChanges } from "redux/actions";
import { getLocatorsFromResponse } from "helpers/mulesoft";
import { getRef } from "redux/utils";

export function createQuote() {
  return async dispatch => {
    try {
      dispatch(createQuoteRequest());
      const result = await apexRequestPromise("Quote Initialise", "POST", {}, "{}");

      Object.keys(result).forEach(key => {
        window.dataLayer = window.dataLayer.filter(d => d.name !== key);

        window.dataLayer.push({
          event: 'insightech-cid',
          name: key,
          value: result[key]
        });
      })

      dispatch(createQuoteSuccess(result));
      return Promise.resolve();
    } catch (error) {
      // force proceed hack
      if (window.confirm("Quote Initialise failed, do you want to force proceed?")) {
        const result = {
          leadId: "00Q5O000000tgEkUAI",
          policyId: "100165928",
          policyholderId: "8e69edf2-8e33-4f76-8e8e-199748a935bd"
        };

        Object.keys(result).forEach(key => {
          window.dataLayer = window.dataLayer.filter(d => d.name !== key);

          window.dataLayer.push({
            event: 'insightech-cid',
            name: key,
            value: result[key]
          });
        })

        dispatch(createQuoteSuccess(result));
        return Promise.resolve();

      } else {
        //normal functionality
        dispatch(createQuoteError());
        return Promise.reject("Error: Create Quote: " + JSON.stringify(error));
      }
    }
  }
}

function createQuoteRequest() {
  return {
    type: CREATE_QUOTE_REQUEST
  }
}

function createQuoteSuccess(payload) {
  return {
    type: CREATE_QUOTE_SUCCESS,
    payload
  }
}

function createQuoteError() {
  return {
    type: CREATE_QUOTE_ERROR
  }
}

export function updateQuote(updateQuotePayload) {
  return async (dispatch, getState) => {
    try {
      dispatch(clearPolicyChanges());

      const headers = {
        policyId: policyIdSelector(getState())
      }

      dispatch(updateQuoteRequest());
      const result = await apexRequestPromise('Quote Update', 'PUT', headers, JSON.stringify(updateQuotePayload));
      dispatch(getLocatorsFromResponse(result));
      dispatch(updateQuoteSuccess());
      return Promise.resolve();

    } catch (error) {
      // force proceed
      if (window.confirm("Quote Initialise failed, do you want to force proceed?")) {
        return Promise.resolve();

      } else {
        // normal functionality
        dispatch(updateQuoteError());
        return Promise.reject("Error: Update Quote: " + JSON.stringify(error));
      }
    }
  }
}

export function constructUpdateQuotePayload(policyChangesPayload, policyId) {
  policyChangesPayload.finalize = false;
  policyChangesPayload.policyLocator = policyId;
  return policyChangesPayload;
}

function updateQuoteRequest() {
  return {
    type: UPDATE_QUOTE_REQUEST
  }
}

function updateQuoteSuccess() {
  return {
    type: UPDATE_QUOTE_SUCCESS
  }
}

function updateQuoteError() {
  return {
    type: UPDATE_QUOTE_ERROR
  }
}

export function finaliseQuoteAndProcessPayment() {
  return async (dispatch, getState) => {
    const policyId = policyIdSelector(getState());

    const policyholders = answerGroupByEntitySelector(getState(), "policyholder");
    let leadIds = [];
    policyholders.forEach(policyholder => {
      if (getRef(policyholder).leadId) {
        leadIds.push(getRef(policyholder).leadId);
      }
    });
    console.log('leads', leadIds);

    const creditCardToken = creditCardTokenSelector(getState());

    try {
      dispatch(finaliseQuoteRequest());
      await apexActionPromise('finalisePolicyAndProcessPayment', policyId, leadIds, creditCardToken);
      dispatch(finaliseQuoteSuccess());
      return Promise.resolve();
    } catch (error) {
      // force proceed
      if (window.confirm("Quote Initialise failed, do you want to force proceed?")) {
        dispatch(finaliseQuoteSuccess());
        return Promise.resolve();

      } else {
        // normal functionality
        if (error.statusCode === 402) {
          dispatch({ type: "FINALISE_QUOTE_CLEAR" })
          return Promise.reject(error);
        } else {
          dispatch(finaliseQuoteError());
          return Promise.reject('Error: Finalise Quote: ' + JSON.stringify(error));
        }
      }
    }
  }
}

function finaliseQuoteRequest() {
  return {
    type: FINALISE_QUOTE_REQUEST
  }
}

function finaliseQuoteSuccess() {
  return {
    type: FINALISE_QUOTE_SUCCESS
  }
}

function finaliseQuoteError() {
  return {
    type: FINALISE_QUOTE_ERROR
  }
}
