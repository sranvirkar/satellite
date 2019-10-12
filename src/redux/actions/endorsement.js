import {
  endorsementIdSelector,
  policyIdSelector,
  policyholderIdSelector,
  creditCardTokenSelector,
  answerGroupByEntitySelector,
  answerByFieldNameAndAnswerGroup } from "redux/selectors";

import { policyChangesSelector } from "redux/selectors/Policy";

import {
  apexRequest,
  apexRequestPromise,
  apexActionPromise,
  clearPolicyChanges } from "redux/actions";
import {
  CREATE_ENDORSEMENT_REQUEST,
  CREATE_ENDORSEMENT_SUCCESS,
  UPDATE_ENDORSEMENT_REQUEST,
  UPDATE_ENDORSEMENT_SUCCESS,
  FINALISE_ENDORSEMENT_REQUEST,
  FINALISE_ENDORSEMENT_SUCCESS,
  PREPOPULATED_SUCCESS } from "redux/actionTypes";
import { constructPolicyChangesPayload } from "helpers/mulesoft";
import { getRef } from "redux/utils";
import moment from 'moment-timezone';

export function createEndorsement() {
  return async (dispatch, getState) => {

    const policyChanges = policyChangesSelector(getState());
    const policyChangesPayload = constructPolicyChangesPayload(policyChanges, getState);
    const createEndorsementPayload = constructCreateEndorsementPayload(policyChangesPayload);

    const headers = {
      policyId: policyIdSelector(getState())
    }

    dispatch(createEndorsementRequest());

    try {
      const result = await apexRequestPromise('Endorsement', 'POST', headers, JSON.stringify(createEndorsementPayload));
      dispatch(clearPolicyChanges()); // TODO: if this returns too slowly, it may clear update changes
      dispatch(createEndorsementSuccess(result));
    } catch (error) {
      // TODO: error
      dispatch({ type: 'CREATE_ENDORSEMENT_ERROR' });
    }
  }
}

function constructCreateEndorsementPayload(policyChangesPayload) {
  return {
    "endorsementName": "generic",
    ...policyChangesPayload
  }
}

function createEndorsementRequest() {
  return {
    type: CREATE_ENDORSEMENT_REQUEST
  }
}

function createEndorsementSuccess(payload) {
  return {
    type: CREATE_ENDORSEMENT_SUCCESS,
    payload
  }
}

export function updateEndorsement() {
  return async (dispatch, getState) => {

    const policyChanges = policyChangesSelector(getState());
    const policyChangesPayload = constructPolicyChangesPayload(policyChanges, getState);
    const startTimestamp = answerByFieldNameAndAnswerGroup(getState(), { fieldName: 'endorsementEffectiveDate', answerGroup: undefined });

    moment.tz.add("Australia/Sydney|AEST AEDT|-a0 -b0|0101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101|-293lX xcX 10jd0 yL0 1cN0 1cL0 1fB0 19X0 17c10 LA0 1C00 Oo0 1zc0 Oo0 1zc0 Oo0 1zc0 Rc0 1zc0 Oo0 1zc0 Oo0 1zc0 Oo0 1zc0 Oo0 1zc0 Oo0 1zc0 14o0 1o00 Oo0 1zc0 Oo0 1zc0 Oo0 1zc0 U00 1qM0 WM0 1tA0 WM0 1tA0 U00 1tA0 Oo0 1zc0 Oo0 1zc0 Oo0 1zc0 Rc0 1zc0 Oo0 1zc0 Oo0 1zc0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 11A0 1o00 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 11A0 1o00 WM0 1qM0 14o0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0|40e5");

    const updateEndorsementPayload = constructUpdateEndorsementPayload(policyChangesPayload, moment(startTimestamp.value).tz("Australia/Sydney").format('x'));

    const headers = {
      policyId: policyIdSelector(getState()),
      endorsementId: endorsementIdSelector(getState())
    }

    dispatch(updateEndorsementRequest());

    try {
      const result = await apexRequestPromise('Endorsement Update', 'PUT', headers, JSON.stringify(updateEndorsementPayload));
      dispatch(updateEndorsementSuccess(result));
    } catch (error) {
      // TODO: error
      dispatch({ type: 'UPDATE_ENDORSEMENT_ERROR' });
    }
  }
}

function constructUpdateEndorsementPayload(policyChangesPayload, startTimestamp) {
  return {
    "endorsementUpdate": {
      ...policyChangesPayload,
      startTimestamp
    }
  }
}

function updateEndorsementRequest() {
  return {
    type: UPDATE_ENDORSEMENT_REQUEST
  }
}

function updateEndorsementSuccess(payload) {
  return {
    type: UPDATE_ENDORSEMENT_SUCCESS,
    payload
  }
}

export function finaliseEndorsement() {
  return async (dispatch, getState) => {

    const finaliseEndorsementPayload = constructFinaliseEndorsementPayload();

    const headers = {
      policyId: policyIdSelector(getState()),
      endorsementId: endorsementIdSelector(getState())
    }

    dispatch(finaliseEndorsementRequest());

    try {
      const result = await apexRequestPromise('Endorsement Update', 'PUT', headers, JSON.stringify(finaliseEndorsementPayload));
      dispatch(finaliseEndorsementSuccess(result.invoice));
    } catch (error) {
      dispatch({ type: 'FINALISE_ENDORSEMENT_ERROR' });
      return Promise.reject('Error finalising endorsement');
    }
    return Promise.resolve();
  }
}

function constructFinaliseEndorsementPayload() {
  return {
    action: "accept"
  }
}

function finaliseEndorsementRequest() {
  return {
    type: FINALISE_ENDORSEMENT_REQUEST
  }
}

function finaliseEndorsementSuccess(payload) {
  return {
    type: FINALISE_ENDORSEMENT_SUCCESS,
    payload
  }
}

export function finaliseEndorsementAndProcessPayment() {
  return async (dispatch, getState) => {
    const policyId = policyIdSelector(getState());
    const endorsementId = endorsementIdSelector(getState());
    const policyholderId = policyholderIdSelector(getState());
    const userId = ''; // policyholder contact id
    const policyholderInfo = ''; // policyholder changes
    const creditCardToken = creditCardTokenSelector(getState());

    // Grab lead ids to convert
    const policyholders = answerGroupByEntitySelector(getState(), "policyholder");
    let leadIds = [];
    policyholders.forEach(policyholder => {
      if (getRef(policyholder).leadId) {
        leadIds.push(getRef(policyholder).leadId);
      }
    });

    await apexActionPromise(
      'finaliseEndorsementAndProcessPayment',
      policyId,
      endorsementId,
      policyholderId,
      userId,
      policyholderInfo,
      creditCardToken,
      leadIds
    );

    // { // needs to result in MS getting a payload that looks like
    //   "externalCustomerId":"a1fb098b-eec9-48be-9eb9-525f50b76c96",
    //   "externalReference": "d66bc11a-b0ea-4ddb-b2e5-e4ec5592f9ca",
    //   "isRenewal": false,
    //   "isAdditionalCreditCard": false,
    //   "amount": {   "value": 56.28,   "currency": "AUD"},
    //   "transactionType": "Endorsement"
    // }


    // if (error.statusCode === 402) {
    //   return Promise.reject(error);
    // } else {
    //   dispatch(finaliseQuoteError());
    //   return Promise.reject('Error: Finalise Quote: ' + JSON.stringify(error));
    // }
  }
}
