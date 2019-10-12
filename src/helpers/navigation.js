import { createQuote } from "redux/actions/quote";
import { deleteLead } from "redux/actions/lead";
import { createClaimsForm, createContactForm } from "redux/actions.js";
import { upsertAnswerForFieldName } from "redux/actions/orm/Answer";
import { createAnswerGroupFromField, updateAnswerGroup } from "redux/actions/orm/AnswerGroup";
import { 
  answerByFieldNameAndAnswerGroup, 
  fieldByName, 
  leadIdSelector, 
  policyholderIdSelector } from "redux/selectors";

export function initialiseQuote() {
  return async (dispatch, getState) => {
    try {
      await dispatch(createQuote());

      // Populate first driver and policyholder from answers in the form start modal
      const answerGroupID = dispatch(upsertDriverAnswers());
      dispatch(upsertPolicyholder(answerGroupID));
    } catch (error) {
      throw error;
    }
  }
}

function upsertDriverAnswers() {
  return (dispatch, getState) => {
    const driverFirstName = answerByFieldNameAndAnswerGroup(getState(), { fieldName: 'policyStartFirstName', answerGroup: undefined });
    const driverLastName = answerByFieldNameAndAnswerGroup(getState(), { fieldName: 'policyStartLastName', answerGroup: undefined });
    const driverDOB = answerByFieldNameAndAnswerGroup(getState(), { fieldName: 'policyStartDob', answerGroup: undefined });
    const driverField = fieldByName(getState(), 'driver');

    const answerGroupID = dispatch(createAnswerGroupFromField(driverField));

    dispatch(upsertAnswerForFieldName("driverFirstName", answerGroupID, { value: driverFirstName.value }));
    dispatch(upsertAnswerForFieldName("driverLastName", answerGroupID, { value: driverLastName.value }));
    dispatch(upsertAnswerForFieldName("driverDob", answerGroupID, { value: driverDOB.value }));

    return answerGroupID;
  }
}

function upsertPolicyholder(driverAnswerGroupID) {
  return (dispatch, getState) => {
    const policyholderEmail = answerByFieldNameAndAnswerGroup(getState(), { fieldName: 'policyStartEmail', answerGroup: undefined });
    const policyholderField = fieldByName(getState(), 'policyHolder');

    // Don't create a lead for this policyholder - use the leadId that comes in createQuote response (which is why 2nd parameter is true)
    const answerGroupID = dispatch(createAnswerGroupFromField(policyholderField, true));

    // Update policyholder with this leadId
    const initialLeadId = leadIdSelector(getState());
    dispatch(updateAnswerGroup({
      id: answerGroupID,
      leadId: initialLeadId
    }));

    dispatch(upsertAnswerForFieldName("driverPolicyholder", answerGroupID, { value: driverAnswerGroupID }));
    dispatch(upsertAnswerForFieldName("phEmail", answerGroupID, { value: policyholderEmail.value }));
    dispatch(upsertAnswerForFieldName("phType", answerGroupID, { value: "Person" }));
    dispatch(upsertAnswerForFieldName("driverPolicyholders", undefined, { value: [driverAnswerGroupID] }));
  }
}

export function initialiseClaim() {
  return async (dispatch, getState) => {
    try {
      await dispatch(createClaimsForm());
      const claimEmail = dispatch(upsertAnswerForFieldName("email", undefined, { value: userModel.email, disabled: true }));
    } catch (error) {
      throw error
    }
  }
}
export function initialiseContact() {
  return async (dispatch, getState) => {
    try {
      await dispatch(createContactForm());
      const contactEmail = dispatch(upsertAnswerForFieldName("email", undefined, { value: userModel.email, disabled: true }));
    } catch (error) {
      throw error
    }
  }
}