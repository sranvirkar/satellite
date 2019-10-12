import {
  policyholderIdByPolicySelector,
  linkedPolicyholdersSelector } from "redux/selectors";
import { getPolicies } from "redux/actions/policy";
import { populateWithAnswers } from "redux/actions";
import { linkedPolicyholderFieldsMapping } from "redux/mappings";
import { apexRequestPromise, apexActionPromise } from "../actions";
import { answerByFieldNameAndAnswerGroup } from "../selectors";
import { clearAnswer } from "redux/actions/orm/Answer";

export function parsePolicyholder(policyholderFromSalesforce) {
  // Need to manually parse for street number/apt number as there is no separate field in SF (it is all concatenated in Street)
  const addressRegex = "^(|[A-Za-z0-9 ]*)\\/?(\\d+) ([A-Za-z' ]+)$";
  const match = policyholderFromSalesforce.MailingStreet.match(addressRegex);

  const { IsBusinessAccount__c, ABN__c, Date_of_Birth__c, BusinessName__c, FirstName, LastName, ...otherProperties } = policyholderFromSalesforce;
  const policyholder = {
    phType: IsBusinessAccount__c ? "Business" : "Person",
    ...IsBusinessAccount__c ? {
                                phBusinessContactFirstName: FirstName,
                                phBusinessContactLastName: LastName,
                                phBusinessContactDob: Date_of_Birth__c,
                                phBusinessAbn: ABN__c,
                                phBusinessName: BusinessName__c
                              } :
                              {
                                phFirstName: FirstName,
                                phLastName: LastName,
                                phDob: Date_of_Birth__c
                              },
    ...otherProperties,
    ...match[1] === "" ? {} : { phPostalAptNumber: match[1] },
    ...{
      phPostalStreetNumber: match[2],
      phPostalStreetName: match[3],
      phPostalState: policyholderFromSalesforce.MailingState,
      phPostalSuburb: policyholderFromSalesforce.MailingCity,
      phPostalPostcode: policyholderFromSalesforce.MailingPostalCode
    } // address fields don't map correctly... e.g. we pass street name as Street but it is returned as MailingStreet so populate manually for now
  }
  return policyholder;
}

export const shouldUpdateLinkedPolicyholder = (answer) => {
  return dispatch => {
    Object.keys(linkedPolicyholderFieldsMapping).forEach(key => {
      const mapping = linkedPolicyholderFieldsMapping[key];
      const fieldsToTriggerUpdate = Object.keys(mapping);
      if (fieldsToTriggerUpdate.includes(answer.fieldName)) {
        dispatch(updateLinkedPolicyholder(key, answer.answerGroup, mapping));
      } else if (key === answer.fieldName) {
        if (answer.value === "") {
          dispatch(clearLinkedPolicyholder(answer.answerGroup, mapping));
        } else {
          // if driverPolicyholder is populated, then update policyholder from driver (which is the value of that answer)
          dispatch(updateLinkedPolicyholder(key, answer.value, mapping));
        }
      }
    });
  }
}

export const updateLinkedPolicyholder = (fieldName, answerGroupId, mapping) => {
  return (dispatch, getState) => {
    const linkedPolicyholders = linkedPolicyholdersSelector(getState(), { fieldName, answerGroupId });
    // console.log('updateLinkedPolicyholder', linkedPolicyholders);
    linkedPolicyholders.forEach(policyholderAnswerGroupId => dispatch(populateWithAnswers(answerGroupId, policyholderAnswerGroupId, mapping)));
  }
}

export const clearLinkedPolicyholder = (answerGroupId, mapping) => {
  return (dispatch, getState) => {
    const fieldsToClear = Object.values(mapping);
    fieldsToClear.forEach(fieldToClear => {
      const answer = answerByFieldNameAndAnswerGroup(getState(), { fieldName: fieldToClear, answerGroup: answerGroupId });
      if (answer) dispatch(clearAnswer(answer.id));
    });
  }
}
