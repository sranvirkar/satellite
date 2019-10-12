import {
  CREATE_ANSWER_GROUP,
  UPDATE_ANSWER_GROUP,
  DELETE_ANSWER_GROUP,
  CREATE_RELATIONSHIP,
  DELETE_RELATIONSHIP,
  DELETE_GROUP } from "redux/actionTypes";
import {
  answerGroups,
  leadIdSelector,
  answerGroupById,
  answersByAnswerGroup,
  selectedAnswerGroups,
  formTypeSelector,
  includedPerilsSelector,
  perilsByAnswerGroupSelector,
  answerByMatchSelector } from "redux/selectors";
import { createLead, deletePolicyholderLead } from "redux/actions/lead";
import { addPeril, removePeril } from "redux/actions/orm/Peril";
import { clearFieldsInAnswerGroup } from "redux/actions";
import { upsertAnswerForFieldName } from "redux/actions/orm/Answer";
import uuid from "uuid";
import { getNextAnswerGroupId } from "redux/utils";
import { getFlatSubfields, getFieldModelById } from "redux/selectors/Field";

// isCreateOnly - used when populating endorsement form to stop creating new leads/perils (as they are already created in quote and buy)
export function createAnswerGroupFromField(field, isCreateOnly) {
  return dispatch => {
    let additionalProps;
    switch (field.entity) {
      case "exposure":
        additionalProps = {
          exposureLocator: null
        };
        break;

      case "policyholder":
        additionalProps = {
          leadId: null,
          accountId: null,
          previousUpdateLeadPayload: null
        }
        break;

      default:
        additionalProps = {
          [`${field.name}Locator`]: {},
          [`${field.name}Id`]: uuid.v4()
        }
    }

    const newAnswerGroupId = getNextAnswerGroupId();
    const payload = {
      id: newAnswerGroupId,
      field: field.id,
      fieldName: field.name,
      entity: field.entity,
      ...additionalProps
    };

    dispatch(createAnswerGroup(payload, isCreateOnly));

    return newAnswerGroupId;
  }
}

// isCreateOnly - used when populating endorsement form to stop creating new leads/perils (as they are already created in quote and buy)
export function createAnswerGroup(payload, isCreateOnly) {
  return (dispatch, getState) => {
    const numPolicyholders = answerGroups(getState(), "policyHolder").length;

    dispatch({
      type: CREATE_ANSWER_GROUP,
      payload: payload
    });

    if (!isCreateOnly) {
      // Create answers for answer group
      const fieldModel = getFieldModelById(getState(), payload.field);
      // console.log('fieldModel', fieldModel);
      const fieldModelsInAnswerGroup = getFlatSubfields(fieldModel);
      // console.log('fieldModelsInAnswerGroup', fieldModelsInAnswerGroup);
      fieldModelsInAnswerGroup.forEach(fieldModel => {
        dispatch(upsertAnswerForFieldName(fieldModel.name, payload.id));
      });

      // Create leads for additional policyholders
      // const formType = formTypeSelector(getState());
      if (payload.entity === "policyholder") {
        dispatch(createLead());
      }

      // Add all included perils to vehicle upon creation
      if (payload.entity === "exposure" && payload.fieldName === "vehicle") {
        // TODO: create new Peril action to do below
        const perils = includedPerilsSelector(getState());
        perils.forEach(peril => dispatch(addPeril(payload.id, peril.name)));

        // Create excess value (hidden)
        dispatch(upsertAnswerForFieldName("excess", payload.id, {}));
      }
    // }
    }

  }
}

// Delete policyholder where driverPolicyholder is equal to driverAnswerGroupId
export function deletePolicyholderLinkedToDriver(driverAnswerGroupId) {
  return (dispatch, getState) => {
    const matchingDriverPolicyholderAnswer = answerByMatchSelector(getState(), { fieldName: "driverPolicyholder", value: driverAnswerGroupId });
    console.log('matchingDriverPolicyholderAnswer', matchingDriverPolicyholderAnswer);
    const policyholderAnswerGroupId = matchingDriverPolicyholderAnswer.answerGroup;
    dispatch(deleteAnswerGroup(policyholderAnswerGroupId));
  }
}

// TODO: use better parameter names i.e. rename this to answerGroupId
export function deleteAnswerGroup(payload) {
  return (dispatch, getState) => {
    // if deleting a driver, delete any policyholders that have driverPolicyholder === driver.id
    // if first policyholder, just clear fields
    // else, delete policyholder answer group
    const answerGroup = answerGroupById(getState(), payload);

    if (answerGroup.entity === "person") {
      const policyholders = answerGroups(getState(), "policyHolder");
      const matchingPolicyholder = policyholders.find(policyholder => policyholder.answers.driverPolicyholder === answerGroup.id);
      if (matchingPolicyholder) {
        // delete answer group
        dispatch(deleteAnswerGroup(matchingPolicyholder.id));
      }
    }

    if (answerGroup.entity === "policyholder") {
      dispatch(deletePolicyholderLead(payload));
    }

    // Remove all perils when vehicle is deleted
    if (answerGroup.entity === "exposure" && answerGroup.fieldName === "vehicle") {
      // TODO: create new Peril action to do below
       const perils = perilsByAnswerGroupSelector(getState(), answerGroup.id);
      perils.forEach(peril => dispatch(removePeril(answerGroup.id, peril.name)));
    }

    // Keep track of deleted answer groups in policyChanges state (updateQuote/updateEndorsement callouts)
    let relationships = [];
    if (answerGroup.entity === "person") {
      console.log('answerGroup.js', answerGroup.id);
      relationships = selectedAnswerGroups(getState(), answerGroup.id);
    }
    // TODO: Rename this action
    dispatch({
      type: DELETE_GROUP,
      payload: {
        answerGroup,
        relationships
      }
    })

    dispatch({
      type: DELETE_ANSWER_GROUP,
      payload: payload
    })
  }
}

export function updateAnswerGroup(payload) {
  return {
    type: UPDATE_ANSWER_GROUP,
    payload
  }
}

export function createRelationship(payload) {
  return async (dispatch, getState) => {
    dispatch({
      type: CREATE_RELATIONSHIP,
      payload: payload
    })
  }
}

export function deleteRelationship(payload) {
  return async (dispatch, getState) => {
    dispatch({
      type: DELETE_RELATIONSHIP,
      payload: payload
    })
  }
}
