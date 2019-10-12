import { answer, answerByFieldNameAndAnswerGroup, fieldByName, isUWDeclined, answerByIdSelector } from "redux/selectors";
import { getNextAnswerId, getRef } from "redux/utils";
import { UPSERT_ANSWER } from "redux/actionTypes";
import { shouldUpdateVehicleDistance, shouldUpdateVehicleTotalValue } from "redux/actions/vehicle";
import { shouldUpdateLinkedPolicyholder } from "redux/actions/policyholder";
import { underwritingDecline } from "redux/actions/underwriting";
import moment from "moment";

const getSubfieldRefs = (field, arr) => {
  arr.push(field.ref);
  field.subfields.toModelArray().map(subfield => getSubfieldRefs(subfield, arr));
  return arr;
}

// TODO: maybe we should be creating all the answers for an answer group when the answer group is created...
export function upsertAnswer(payload, disableClear) {
  return (dispatch, getState) => {
    dispatch({
      type: UPSERT_ANSWER,
      payload: payload
    });

    // check for instant underwriting declines (rules in question set payload)
    // const declineMessage = isUWDeclined(getState(), payload)
    // if (declineMessage) {
    //   dispatch(underwritingDecline());
    // }

    if (disableClear) return Promise.resolve();

    // TODO: make this better because this is updating more than once for driverClaims...
    // If answer is for the field driverClaims and the value is 0, set the answer for driverClaimsExcessPaid to 0 as well
    if (payload.fieldName === "driverClaims" && payload.value === "0") {
      dispatch(upsertAnswerForFieldName("driverClaimsExcessPaid", payload.answerGroup, { value: "0" }));
    }

    dispatch(shouldUpdateVehicleDistance(payload));
    dispatch(shouldUpdateVehicleTotalValue(payload));
    dispatch(shouldUpdateLinkedPolicyholder(payload));
    return Promise.resolve();
  }
}

export function upsertAnswerForFieldName(fieldName, answerGroupId, updatedValues) {
  return (dispatch, getState) => {
    // Get answer if it already exists
    let answer = answerByFieldNameAndAnswerGroup(getState(), {
      fieldName,
      answerGroup: answerGroupId
    });
    // Else create answer
    if (!answer) {
      const field = fieldByName(getState(), fieldName);
      answer = createAnswer(getRef(field), answerGroupId);
    }
    // Now update answer
    const updatedAnswer = Object.assign({}, answer, updatedValues);
    // console.log('upserting with ', updatedAnswer);
    dispatch(upsertAnswer(updatedAnswer));
  }
}

export function createAnswer(field, answerGroupId) {
  return {
    answerGroup: answerGroupId,
    id: getNextAnswerId(),
    field: field.id,
    fieldName: field.name,
    value: field.defaultValue || (field.exampleValues && window.location.href.includes('sandbox') ? field.exampleValues[0].replace(/RANDOM/g, Date.now()).replace(/TODAY/g, moment().format("YYYY-MM-DD")) : ''),
    excludeFromResponsePayload: field.excludeFromResponsePayload,
    dataSource: field.dataSource,
    dataSourceFieldname: field.dataSourceFieldname
  };
}

export function clearAnswer(answerId) {
  return (dispatch, getState) => {
    const answerModel = answerByIdSelector(getState(), answerId);
    const answerWithClearedValue = Object.assign({}, answerModel.ref, { value: "", disabled: false });
    dispatch(upsertAnswer(answerWithClearedValue));
  }
}
