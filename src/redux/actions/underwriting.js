import { apexRequest, apexRequestPromise } from "redux/actions";
import {
  editPolicySelector,
  policyIdSelector,
  formTypeSelector,
  endorsementIdSelector,
  policyholderIdSelector,
  underwritingSelector } from "redux/selectors";
import {
  PROCESS_UNDERWRITING_REQUEST,
  PROCESS_UNDERWRITING_SUCCESS,
  PROCESS_UNDERWRITING_ERROR,
  UNDERWRITING_DECLINE } from "redux/actionTypes";

export function processUnderwriting() {
  return async (dispatch, getState) => {
    const formType = formTypeSelector(getState());
    let headers;
    let result;

    try {
      dispatch(processUnderwritingRequest());
      switch (formType) {
        case "Quote":
          headers = {
            policyId: policyIdSelector(getState())
          }
          result = await apexRequestPromise("Underwriting", "GET", headers, "");
          break;

        case "Endorsement":
          headers = {
            endorsementId: endorsementIdSelector(getState()),
            policyId: policyIdSelector(getState()),
            policyholderId: policyholderIdSelector(getState())
          }
          result = await apexRequestPromise("Endorsement Underwriting", "GET", headers, "");
          break;
      }
      dispatch(processUnderwritingSuccess(result));

      const underwriting = underwritingSelector(getState());
      if (underwriting.declined) {
        return Promise.reject("Underwriting Rejection");
      } else {
        return Promise.resolve();
      }
    } catch (error) {
      dispatch(processUnderwritingError());
      return Promise.reject("Error: Underwriting: " + JSON.stringify(error));
    }
  }
}

export function processUnderwritingRequest() {
  return {
    type: PROCESS_UNDERWRITING_REQUEST
  }
}

export function processUnderwritingSuccess(payload) {
  return {
    type: PROCESS_UNDERWRITING_SUCCESS,
    payload
  }
}

export function processUnderwritingError() {
  return {
    type: PROCESS_UNDERWRITING_ERROR
  }
}

export function underwritingDecline(payload) {
  return {
    type: UNDERWRITING_DECLINE,
    payload
  }
}
