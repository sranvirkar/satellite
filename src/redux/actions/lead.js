import { 
  CREATE_LEAD_REQUEST, 
  CREATE_LEAD_SUCCESS,
  CREATE_LEAD_ERROR,
  UPDATE_LEAD_REQUEST,
  UPDATE_LEAD_SUCCESS,
  UPDATE_LEAD_ERROR,
  DELETE_LEAD_REQUEST, 
  DELETE_LEAD_SUCCESS,
  DELETE_LEAD_ERROR } from "redux/actionTypes";
import { 
  answerGroupDataSelector,
  answerGroupByIdSelector, 
  answerGroupByEntitySelector,
  policyIdSelector, 
  policyholderIdSelector } from "redux/selectors";
import { getRef } from "redux/utils";
import { apexActionPromise } from "redux/actions";

// Parameter "answerGroupId" refers to a policyholder answer group (AnswerGroup where entity is "policyholder")
export function createLead() {
  return async (dispatch, getState) => {

    const policyId = policyIdSelector(getState());
    const policyholderId = policyholderIdSelector(getState());

    const createLeadPayload = constructCreateLeadPayload(policyId, policyholderId);

    try {
      dispatch(createLeadRequest());
      const result = await apexActionPromise('createLead', JSON.stringify(createLeadPayload));
      const leadId = JSON.parse(result.payload).Id;
      dispatch(createLeadSuccess(leadId));
      return Promise.resolve();
    } catch (error) {
      dispatch(createLeadError());
      return Promise.reject("Error: Create Lead: " + JSON.stringify(error));
    }
  }
}

function constructCreateLeadPayload(policyId, policyholderId) {
  return {
    FirstName: "Additional",
    LastName: "Policyholder",
    Policy_Holder_ID__c: policyholderId,
    Policy_ID__c: policyId
  };
}

function createLeadRequest() {
  return {
    type: CREATE_LEAD_REQUEST
  }
}

function createLeadSuccess(payload) {
  return {
    type: CREATE_LEAD_SUCCESS,
    payload
  }
}

function createLeadError() {
  return {
    type: CREATE_LEAD_ERROR
  }
}

export function deletePolicyholderLead(policyholderAnswerGroupId) {
  return (dispatch, getState) => {
    const policyholder = getRef(answerGroupByIdSelector(getState(), policyholderAnswerGroupId));
    const leadId = policyholder.leadId;

    if (!leadId) return Promise.resolve();

    const policyholderId = policyholderIdSelector(getState());
    
    return dispatch(deleteLead(leadId, policyholderId));
  }
}

export function deleteLead(leadId, policyholderId) {
  return async dispatch => {
    try {
      dispatch(deleteLeadRequest());
      await apexActionPromise('deleteLead', leadId, policyholderId);
      dispatch(deleteLeadSuccess());
      return Promise.resolve();
    } catch (error) {
      dispatch(deleteLeadError());
      return Promise.reject("Error: Delete Lead: " + JSON.stringify(error));
    }
  }
}

function deleteLeadRequest() {
  return {
    type: DELETE_LEAD_REQUEST
  }
}

function deleteLeadSuccess() {
  return {
    type: DELETE_LEAD_SUCCESS
  }
}

function deleteLeadError() {
  return {
    type: DELETE_LEAD_ERROR
  }
}

export function updateLeads() {
  return (dispatch, getState) => {
    const policyholders = answerGroupByEntitySelector(getState(), "policyholder");
    return Promise.all(policyholders.map(policyholder => dispatch(updatePolicyholderLead(policyholder.id))));
  }
}

function updatePolicyholderLead(answerGroupId) {
  return async (dispatch, getState) => {
    const policyholderModel = answerGroupByIdSelector(getState(), answerGroupId);

    const leadId = getRef(policyholderModel).leadId;
    if (!leadId) return Promise.resolve();

    const policyholderData = answerGroupDataSelector(getState(), {
      answerGroupId,
      options: {
        showExcludeFromResponsePayload: true,
        dataSource: "customer",
        useDataSourceFieldnames: true
      }
    })
    if (!policyholderData) return Promise.resolve();

    const policyId = policyIdSelector(getState());
    const policyholderId = policyholderIdSelector(getState());

    const updateLeadPayload = constructUpdateLeadPayload(leadId, policyId, policyholderId, policyholderData);

    // Only update lead if lead payload has changed
    const previousUpdateLeadPayload = getRef(policyholderModel).previousUpdateLeadPayload;
    if (previousUpdateLeadPayload === JSON.stringify(updateLeadPayload)) return Promise.resolve();

    await dispatch(updateLead(JSON.stringify(updateLeadPayload)));
    dispatch(updateLeadSuccess(answerGroupId, JSON.stringify(updateLeadPayload)));
    return Promise.resolve();
  }
}

function updateLead(updateLeadPayloadJSONString) {
  return async dispatch => {
    try {
      dispatch(updateLeadRequest());
      await apexActionPromise('updateLead', updateLeadPayloadJSONString);
      return Promise.resolve();
    } catch (error) {
      dispatch(updateLeadError());
      return Promise.reject("Error: Update Lead: " + JSON.stringify(error));
    }
  }
}

function constructUpdateLeadPayload(leadId, policyId, policyholderId, policyholderData) {
  let data = Object.assign({}, policyholderData);

  // Business Contact is FirstName2/LastName2/Date_of_Birth__c2
  if (data.FirstName2 && data.FirstName2 !== "" && data.LastName2 && data.LastName2 !== "") {
    data.FirstName = data.FirstName2;
    data.LastName = data.LastName2;
    data.Date_of_Birth__c = data.Date_of_Birth__c2;
  }
  delete data.FirstName2;
  delete data.LastName2;
  delete data.Date_of_Birth__c2;

  data.BusinessLead__c = data.BusinessLead__c === "Business" ? true : false;

  // Concatenate unit number/street number and street name for Street field in Salesforce
  if (data.phPostalStreetNumber && data.Street) {
    if (data.phPostalAptNumber !== "") {
      data.Street = `${data.phPostalAptNumber}/${data.phPostalStreetNumber} ${data.Street}`;
    } else {
      data.Street = `${data.phPostalStreetNumber} ${data.Street}`;
    }
  }
  delete data.phPostalAptNumber;
  delete data.phPostalStreetNumber;

  data.Id = leadId;
  data.Policy_ID__c = policyId;
  data.Policy_Holder_ID__c = policyholderId;
  
  return data;
}

function updateLeadRequest() {
  return {
    type: UPDATE_LEAD_REQUEST
  }
}

function updateLeadSuccess(answerGroupId, leadPayload) {
  return {
    type: UPDATE_LEAD_SUCCESS,
    payload: {
      answerGroupId,
      leadPayload
    }
  }
}

function updateLeadError() {
  return {
    type: UPDATE_LEAD_ERROR
  }
}