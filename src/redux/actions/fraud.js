import { apexActionPromise } from "redux/actions";
import {
  accountIdSelector,
  answerByFieldNameAndAnswerGroup,
  answerGroupByEntitySelector
} from "redux/selectors";
import {
  FRAUD_CHECK_REQUEST,
  FRAUD_CHECK_SUCCESS,
  FRAUD_CHECK_ERROR } from "redux/actionTypes";
import { underwritingDecline } from "redux/actions/underwriting";

export function fraudCheck() {
  return async (dispatch, getState) => {
    const phAnswerGroups = answerGroupByEntitySelector(getState(), "policyholder");
    const driverAnswerGroups = answerGroupByEntitySelector(getState(), "person");
    const firstVehicleAnswerGroupId = answerGroupByEntitySelector(getState(), "exposure")[0].id;

    let fraudPayloads = [];

    fraudPayloads.push(...phAnswerGroups.map(ph => {

      const isBusinessPh = answerByFieldNameAndAnswerGroup(getState(), {fieldName: "phType", answerGroup: ph.ref.id}).value === "Business";

      return {
        "Id": ph.ref.leadId || "", // JSON.stringify will remove any properties that have value undefined
        "LastName": answerByFieldNameAndAnswerGroup(getState(), {fieldName: isBusinessPh ? "phBusinessContactLastName" : "phLastName", answerGroup: ph.ref.id}).value,
        "FirstName": answerByFieldNameAndAnswerGroup(getState(), {fieldName: isBusinessPh ? "phBusinessContactFirstName" : "phFirstName", answerGroup: ph.ref.id}).value,
        "Date_Of_Birth__c": answerByFieldNameAndAnswerGroup(getState(), {fieldName: isBusinessPh ? "phBusinessContactDob":  "phDob", answerGroup: ph.ref.id}).value.replace(/-/g, ""),
        "StreetNumber": answerByFieldNameAndAnswerGroup(getState(), {fieldName: "vehicleStreetNumber", answerGroup: firstVehicleAnswerGroupId}).value,
        "Street": answerByFieldNameAndAnswerGroup(getState(), {fieldName: "vehicleStreetName", answerGroup: firstVehicleAnswerGroupId}).value,
        "City": answerByFieldNameAndAnswerGroup(getState(), {fieldName: "vehicleSuburb", answerGroup: firstVehicleAnswerGroupId}).value,
        "PostalCode": answerByFieldNameAndAnswerGroup(getState(), {fieldName: "vehiclePostcode", answerGroup: firstVehicleAnswerGroupId}).value,
        "Phone": "",
        "MobilePhone": answerByFieldNameAndAnswerGroup(getState(), {fieldName: "phPhone", answerGroup: ph.ref.id}).value
      };
    }));

    fraudPayloads.push(...driverAnswerGroups.map(driver => {
      return {
        "Id": "",
        "LastName": answerByFieldNameAndAnswerGroup(getState(), {fieldName: "driverLastName", answerGroup: driver.ref.id}).value,
        "FirstName": answerByFieldNameAndAnswerGroup(getState(), {fieldName: "driverFirstName", answerGroup: driver.ref.id}).value,
        "Date_Of_Birth__c": answerByFieldNameAndAnswerGroup(getState(), {fieldName: "driverDob", answerGroup: driver.ref.id}).value.replace(/-/g, ""),
        "StreetNumber": answerByFieldNameAndAnswerGroup(getState(), {fieldName: "vehicleStreetNumber", answerGroup: firstVehicleAnswerGroupId}).value,
        "Street": answerByFieldNameAndAnswerGroup(getState(), {fieldName: "vehicleStreetName", answerGroup: firstVehicleAnswerGroupId}).value,
        "City": answerByFieldNameAndAnswerGroup(getState(), {fieldName: "vehicleSuburb", answerGroup: firstVehicleAnswerGroupId}).value,
        "PostalCode": answerByFieldNameAndAnswerGroup(getState(), {fieldName: "vehiclePostcode", answerGroup: firstVehicleAnswerGroupId}).value,
        "Phone": "",
        "MobilePhone": ""
      };
    }));

    console.log('fraud payload: ', fraudPayloads);

    try {
      dispatch(fraudCheckRequest());
      const result = await apexActionPromise('runFraudCheck', JSON.stringify(fraudPayloads));
      const fraudulentUsers = result.find(user => user.resultStatus !== "Accept");
      console.log('inverse check', result.filter(user => user.resultStatus == "Accept"));
      console.log('are there fraudulent users?', fraudulentUsers);

      if (fraudulentUsers) {
        dispatch(underwritingDecline());
        return Promise.reject("Fraud Check Rejection");
      } else {
        console.log('no fraudulent users here');
      }
      dispatch(fraudCheckSuccess());
      return Promise.resolve();
    } catch (error) {
      dispatch(fraudCheckError());
      return Promise.reject("Error: Fraud Check: " + JSON.stringify(error));
    }
  }
}

function fraudCheckRequest() {
  return {
    type: FRAUD_CHECK_REQUEST
  }
}

function fraudCheckSuccess() {
  return {
    type: FRAUD_CHECK_SUCCESS
  }
}

function fraudCheckError() {
  return {
    type: FRAUD_CHECK_ERROR
  }
}
